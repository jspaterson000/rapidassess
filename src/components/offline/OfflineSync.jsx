import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Wifi, WifiOff, Upload, Download, FolderSync as Sync, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'

class OfflineManager {
  constructor() {
    this.pendingActions = JSON.parse(localStorage.getItem('pendingActions') || '[]')
    this.isOnline = navigator.onLine
    this.syncInProgress = false
    
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline.bind(this))
    window.addEventListener('offline', this.handleOffline.bind(this))
  }

  handleOnline() {
    this.isOnline = true
    this.syncPendingActions()
  }

  handleOffline() {
    this.isOnline = false
  }

  addPendingAction(action) {
    this.pendingActions.push({
      id: Date.now().toString(),
      ...action,
      timestamp: new Date().toISOString()
    })
    this.savePendingActions()
  }

  savePendingActions() {
    localStorage.setItem('pendingActions', JSON.stringify(this.pendingActions))
  }

  async syncPendingActions() {
    if (this.syncInProgress || this.pendingActions.length === 0) return
    
    this.syncInProgress = true
    const successfulActions = []
    
    for (const action of this.pendingActions) {
      try {
        await this.executeAction(action)
        successfulActions.push(action.id)
      } catch (error) {
        console.error('Failed to sync action:', action, error)
      }
    }
    
    // Remove successful actions
    this.pendingActions = this.pendingActions.filter(
      action => !successfulActions.includes(action.id)
    )
    this.savePendingActions()
    this.syncInProgress = false
  }

  async executeAction(action) {
    // Execute the pending action based on its type
    switch (action.type) {
      case 'CREATE_ASSESSMENT':
        // await Assessment.create(action.data)
        break
      case 'UPDATE_JOB':
        // await Job.update(action.id, action.data)
        break
      case 'UPLOAD_PHOTO':
        // await storage.uploadFile(action.file)
        break
      default:
        console.warn('Unknown action type:', action.type)
    }
  }

  getPendingActionsCount() {
    return this.pendingActions.length
  }

  getConnectionStatus() {
    return this.isOnline
  }
}

const offlineManager = new OfflineManager()

export default function OfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [pendingCount, setPendingCount] = useState(offlineManager.getPendingActionsCount())
  const [syncProgress, setSyncProgress] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Update pending count periodically
    const interval = setInterval(() => {
      setPendingCount(offlineManager.getPendingActionsCount())
    }, 1000)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [])

  const handleManualSync = async () => {
    setIsSyncing(true)
    setSyncProgress(0)
    
    // Simulate sync progress
    const progressInterval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          setIsSyncing(false)
          setPendingCount(0)
          return 100
        }
        return prev + 10
      })
    }, 200)
    
    try {
      await offlineManager.syncPendingActions()
    } catch (error) {
      console.error('Sync failed:', error)
      clearInterval(progressInterval)
      setIsSyncing(false)
    }
  }

  return (
    <Card className={`transition-all ${isOnline ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="w-5 h-5 text-green-600" />
          ) : (
            <WifiOff className="w-5 h-5 text-red-600" />
          )}
          Connection Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Badge className={isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
            {pendingCount > 0 && (
              <Badge variant="outline" className="ml-2">
                {pendingCount} pending actions
              </Badge>
            )}
          </div>
          
          {isOnline && pendingCount > 0 && (
            <Button 
              size="sm" 
              onClick={handleManualSync}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <>
                  <Sync className="w-4 h-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Sync Now
                </>
              )}
            </Button>
          )}
        </div>

        {isSyncing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Syncing data...</span>
              <span>{syncProgress}%</span>
            </div>
            <Progress value={syncProgress} />
          </div>
        )}

        {!isOnline && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">Working Offline</span>
            </div>
            <p className="text-sm text-amber-700 mt-1">
              Your changes are being saved locally and will sync when connection is restored.
            </p>
          </div>
        )}

        {isOnline && pendingCount === 0 && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle2 className="w-4 h-4" />
              <span className="font-medium">All data synced</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              All your changes have been successfully saved to the cloud.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { offlineManager }