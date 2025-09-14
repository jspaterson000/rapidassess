import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Mail, MessageSquare, Phone, Send, BookTemplate as Template, Clock, CheckCircle2, AlertCircle } from 'lucide-react'

const MESSAGE_TEMPLATES = {
  APPOINTMENT_CONFIRMATION: {
    subject: 'Assessment Appointment Confirmed - Claim {{claimNumber}}',
    body: `Dear {{customerName}},

Your property assessment has been scheduled for {{appointmentDate}} at {{appointmentTime}}.

Assessor: {{assessorName}}
Phone: {{assessorPhone}}

Please ensure someone is available at the property during this time.

Best regards,
{{companyName}}`
  },
  APPOINTMENT_REMINDER: {
    subject: 'Reminder: Assessment Tomorrow - Claim {{claimNumber}}',
    body: `Dear {{customerName}},

This is a reminder that your property assessment is scheduled for tomorrow at {{appointmentTime}}.

If you need to reschedule, please contact us immediately.

Best regards,
{{companyName}}`
  },
  ASSESSMENT_COMPLETE: {
    subject: 'Assessment Complete - Claim {{claimNumber}}',
    body: `Dear {{customerName}},

Your property assessment has been completed. The report has been sent to your insurer for review.

You should hear back within 5-7 business days.

Best regards,
{{companyName}}`
  }
}

export default function CommunicationHub({ job, onMessageSent }) {
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [messageType, setMessageType] = useState('email')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sentMessages, setSentMessages] = useState([])

  const loadTemplate = (templateKey) => {
    const template = MESSAGE_TEMPLATES[templateKey]
    if (!template) return

    const variables = {
      claimNumber: job?.claim_number || '',
      customerName: job?.customer_name || '',
      appointmentDate: job?.appointment_date ? new Date(job.appointment_date).toLocaleDateString() : '',
      appointmentTime: job?.appointment_date ? new Date(job.appointment_date).toLocaleTimeString() : '',
      assessorName: 'Mike Assessor', // Would come from actual assessor data
      assessorPhone: '+61 434 567 890',
      companyName: 'RapidAssess Insurance Services'
    }

    let processedSubject = template.subject
    let processedBody = template.body

    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`
      processedSubject = processedSubject.replace(new RegExp(placeholder, 'g'), value)
      processedBody = processedBody.replace(new RegExp(placeholder, 'g'), value)
    })

    setSubject(processedSubject)
    setMessage(processedBody)
  }

  const sendMessage = async () => {
    setIsSending(true)
    
    try {
      // Simulate sending message
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const newMessage = {
        id: Date.now().toString(),
        type: messageType,
        subject: messageType === 'email' ? subject : null,
        content: message,
        recipient: messageType === 'email' ? job?.customer_email : job?.customer_phone,
        timestamp: new Date().toISOString(),
        status: 'sent'
      }
      
      setSentMessages(prev => [newMessage, ...prev])
      onMessageSent?.(newMessage)
      
      // Clear form
      setSubject('')
      setMessage('')
      setSelectedTemplate('')
      
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsSending(false)
    }
  }

  const getMessageIcon = (type) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />
      case 'sms': return <MessageSquare className="w-4 h-4" />
      case 'call': return <Phone className="w-4 h-4" />
      default: return <MessageSquare className="w-4 h-4" />
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent': return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-600" />
      default: return <Clock className="w-4 h-4 text-slate-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Send Message */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Send Message
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Message Type</label>
              <Select value={messageType} onValueChange={setMessageType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">📧 Email</SelectItem>
                  <SelectItem value="sms">📱 SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Template</label>
              <Select value={selectedTemplate} onValueChange={(value) => {
                setSelectedTemplate(value)
                loadTemplate(value)
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose template..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APPOINTMENT_CONFIRMATION">Appointment Confirmation</SelectItem>
                  <SelectItem value="APPOINTMENT_REMINDER">Appointment Reminder</SelectItem>
                  <SelectItem value="ASSESSMENT_COMPLETE">Assessment Complete</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {messageType === 'email' && (
            <div>
              <label className="text-sm font-medium mb-2 block">Subject</label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject..."
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-2 block">Message</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={messageType === 'email' ? 'Email content...' : 'SMS message...'}
              rows={messageType === 'email' ? 8 : 4}
            />
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-slate-500">
              Recipient: {messageType === 'email' ? job?.customer_email : job?.customer_phone}
            </div>
            <Button 
              onClick={sendMessage}
              disabled={isSending || !message.trim()}
            >
              {isSending ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send {messageType === 'email' ? 'Email' : 'SMS'}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Message History */}
      <Card>
        <CardHeader>
          <CardTitle>Communication History</CardTitle>
        </CardHeader>
        <CardContent>
          {sentMessages.length > 0 ? (
            <div className="space-y-3">
              {sentMessages.map(msg => (
                <div key={msg.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {getMessageIcon(msg.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {msg.subject && (
                        <span className="font-medium text-slate-800 truncate">{msg.subject}</span>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {msg.type.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2">{msg.content}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                      <span>{new Date(msg.timestamp).toLocaleString()}</span>
                      <span>•</span>
                      <span>{msg.recipient}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {getStatusIcon(msg.status)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No messages sent yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}