import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { 
  Zap, 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  Bell, 
  Mail,
  MessageSquare,
  UserCheck,
  AlertTriangle
} from 'lucide-react'

const TRIGGER_TYPES = {
  TIME_BASED: 'time_based',
  STATUS_CHANGE: 'status_change',
  ASSIGNMENT: 'assignment',
  OVERDUE: 'overdue'
}

const ACTION_TYPES = {
  SEND_EMAIL: 'send_email',
  SEND_SMS: 'send_sms',
  CREATE_NOTIFICATION: 'create_notification',
  ASSIGN_JOB: 'assign_job',
  UPDATE_STATUS: 'update_status',
  ESCALATE: 'escalate'
}

export default function AutomationRules() {
  const [rules, setRules] = useState([
    {
      id: '1',
      name: 'Job Assignment Reminder',
      description: 'Send reminder if job not assigned within 2 hours',
      trigger: {
        type: TRIGGER_TYPES.TIME_BASED,
        condition: 'job_created',
        delay: 120 // minutes
      },
      action: {
        type: ACTION_TYPES.CREATE_NOTIFICATION,
        target: 'managers',
        message: 'Job {{job.claim_number}} requires assignment'
      },
      enabled: true
    },
    {
      id: '2', 
      name: 'Assessment Overdue Alert',
      description: 'Alert when assessment is overdue',
      trigger: {
        type: TRIGGER_TYPES.OVERDUE,
        condition: 'assessment_due',
        threshold: 24 // hours
      },
      action: {
        type: ACTION_TYPES.SEND_EMAIL,
        target: 'assessor',
        template: 'overdue_assessment'
      },
      enabled: true
    }
  ])

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingRule, setEditingRule] = useState(null)

  const toggleRule = (ruleId) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ))
  }

  const deleteRule = (ruleId) => {
    setRules(prev => prev.filter(rule => rule.id !== ruleId))
  }

  const getTriggerIcon = (triggerType) => {
    switch (triggerType) {
      case TRIGGER_TYPES.TIME_BASED:
        return <Clock className="w-4 h-4 text-blue-500" />
      case TRIGGER_TYPES.STATUS_CHANGE:
        return <UserCheck className="w-4 h-4 text-green-500" />
      case TRIGGER_TYPES.OVERDUE:
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <Zap className="w-4 h-4 text-slate-500" />
    }
  }

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case ACTION_TYPES.SEND_EMAIL:
        return <Mail className="w-4 h-4 text-blue-500" />
      case ACTION_TYPES.SEND_SMS:
        return <MessageSquare className="w-4 h-4 text-green-500" />
      case ACTION_TYPES.CREATE_NOTIFICATION:
        return <Bell className="w-4 h-4 text-yellow-500" />
      default:
        return <Zap className="w-4 h-4 text-slate-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Automation Rules</h2>
          <p className="text-slate-500">Configure automated workflows and notifications</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Rule
        </Button>
      </div>

      <div className="grid gap-4">
        {rules.map(rule => (
          <Card key={rule.id} className={`transition-all ${rule.enabled ? 'border-green-200 bg-green-50/30' : 'border-slate-200'}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getTriggerIcon(rule.trigger.type)}
                    <span className="text-sm text-slate-500">→</span>
                    {getActionIcon(rule.action.type)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{rule.name}</CardTitle>
                    <p className="text-sm text-slate-500">{rule.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={() => toggleRule(rule.id)}
                  />
                  <Button variant="ghost" size="icon" onClick={() => setEditingRule(rule)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteRule(rule.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  Trigger: {rule.trigger.condition}
                </Badge>
                <Badge variant="outline">
                  Action: {rule.action.type.replace(/_/g, ' ')}
                </Badge>
                {rule.trigger.delay && (
                  <Badge variant="outline">
                    Delay: {rule.trigger.delay}min
                  </Badge>
                )}
                {rule.enabled ? (
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                ) : (
                  <Badge variant="outline">Inactive</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {rules.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <Zap className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-700 mb-2">No Automation Rules</h3>
            <p className="text-slate-500 mb-4">Create your first automation rule to streamline workflows</p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Rule
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}