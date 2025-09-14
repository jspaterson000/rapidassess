import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import CustomerPortal from '@/components/customer/CustomerPortal'
import { Search, Shield } from 'lucide-react'

export default function CustomerPortalPage() {
  const [claimNumber, setClaimNumber] = useState('')
  const [showPortal, setShowPortal] = useState(false)
  const [accessCode, setAccessCode] = useState('')

  const handleAccess = () => {
    if (claimNumber.trim()) {
      setShowPortal(true)
    }
  }

  if (showPortal) {
    return <CustomerPortal claimNumber={claimNumber} onClose={() => setShowPortal(false)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Customer Portal</CardTitle>
          <p className="text-slate-500">Track your insurance claim status</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Claim Number</label>
            <Input
              value={claimNumber}
              onChange={(e) => setClaimNumber(e.target.value)}
              placeholder="Enter your claim number..."
              className="text-center font-mono"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Access Code (Optional)</label>
            <Input
              type="password"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="Enter access code if provided..."
            />
          </div>

          <Button 
            onClick={handleAccess}
            disabled={!claimNumber.trim()}
            className="w-full"
          >
            <Search className="w-4 h-4 mr-2" />
            Access Portal
          </Button>

          <div className="text-center text-xs text-slate-500 pt-4 border-t">
            <p>Need help? Contact your insurance company or assessment provider.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}