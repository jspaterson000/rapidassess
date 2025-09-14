import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  FileText,
  Camera,
  CheckCircle2,
  AlertCircle,
  MessageSquare
} from 'lucide-react'
import { format } from 'date-fns'

export default function CustomerPortal({ claimNumber, onClose }) {
  const [claimData, setClaimData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading claim data
    const loadClaimData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setClaimData({
        claimNumber: claimNumber,
        status: 'awaiting_attendance',
        progress: 60,
        customerName: 'Sarah Johnson',
        propertyAddress: '123 Main Street, Sydney NSW 2000',
        eventType: 'Storm Damage',
        dateOfLoss: '2024-01-15',
        appointmentDate: '2024-01-20T14:00:00Z',
        assessorName: 'Mike Assessor',
        assessorPhone: '+61 434 567 890',
        estimatedCompletion: '2024-01-25',
        updates: [
          {
            date: '2024-01-16T09:00:00Z',
            title: 'Claim Received',
            description: 'Your claim has been received and is being processed',
            status: 'completed'
          },
          {
            date: '2024-01-17T10:30:00Z',
            title: 'Assessor Assigned',
            description: 'Mike Assessor has been assigned to your claim',
            status: 'completed'
          },
          {
            date: '2024-01-20T14:00:00Z',
            title: 'Assessment Scheduled',
            description: 'Property assessment scheduled for January 20th at 2:00 PM',
            status: 'pending'
          },
          {
            date: '2024-01-25T00:00:00Z',
            title: 'Report Generation',
            description: 'Assessment report will be generated and sent to insurer',
            status: 'upcoming'
          }
        ]
      })
      setLoading(false)
    }
    
    loadClaimData()
  }, [claimNumber])

  const getStatusColor = (status) => {
    const colors = {
      awaiting_booking: 'bg-blue-100 text-blue-800',
      awaiting_attendance: 'bg-amber-100 text-amber-800',
      assessed: 'bg-green-100 text-green-800',
      completed: 'bg-emerald-100 text-emerald-800'
    }
    return colors[status] || 'bg-slate-100 text-slate-800'
  }

  const getUpdateIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case 'pending':
        return <Clock className="w-5 h-5 text-amber-600" />
      case 'upcoming':
        return <AlertCircle className="w-5 h-5 text-slate-400" />
      default:
        return <Clock className="w-5 h-5 text-slate-400" />
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Claim Status Portal</CardTitle>
              <p className="text-slate-500 mt-1">Track your insurance claim progress in real-time</p>
            </div>
            <Button variant="outline" onClick={onClose}>
              Close Portal
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">Claim Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Claim Number:</span>
                    <span className="font-medium">{claimData.claimNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Event Type:</span>
                    <span className="font-medium">{claimData.eventType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date of Loss:</span>
                    <span className="font-medium">{format(new Date(claimData.dateOfLoss), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <Badge className={getStatusColor(claimData.status)}>
                      {claimData.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">Progress</h3>
                <Progress value={claimData.progress} className="mb-2" />
                <p className="text-sm text-slate-500">{claimData.progress}% Complete</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">Your Assessor</h3>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="font-medium">{claimData.assessorName}</p>
                  <div className="flex items-center gap-2 text-sm text-slate-600 mt-2">
                    <Phone className="w-4 h-4" />
                    <span>{claimData.assessorPhone}</span>
                  </div>
                </div>
              </div>

              {claimData.appointmentDate && (
                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">Next Appointment</h3>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 text-blue-800">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">
                        {format(new Date(claimData.appointmentDate), 'EEEE, MMMM d, yyyy @ h:mm a')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-600 mt-1">
                      <MapPin className="w-4 h-4" />
                      <span>{claimData.propertyAddress}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Claim Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {claimData.updates.map((update, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0">
                  {getUpdateIcon(update.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-slate-800">{update.title}</h4>
                    <span className="text-xs text-slate-500">
                      {format(new Date(update.date), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{update.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Available Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <MessageSquare className="w-6 h-6 mb-2" />
              <span>Contact Assessor</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Calendar className="w-6 h-6 mb-2" />
              <span>Reschedule Appointment</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <FileText className="w-6 h-6 mb-2" />
              <span>Upload Documents</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}