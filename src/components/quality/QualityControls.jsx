import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Shield, 
  CheckCircle2, 
  AlertTriangle, 
  X,
  Star,
  Camera,
  FileText,
  Clock
} from 'lucide-react'

const QUALITY_REQUIREMENTS = {
  STORM_DAMAGE: [
    { id: 'exterior_photos', label: 'Exterior damage photos (minimum 4)', required: true },
    { id: 'interior_photos', label: 'Interior damage photos', required: true },
    { id: 'roof_inspection', label: 'Roof inspection documentation', required: true },
    { id: 'weather_report', label: 'Weather report for date of loss', required: false },
    { id: 'repair_quotes', label: 'Contractor repair quotes', required: false }
  ],
  FIRE_DAMAGE: [
    { id: 'fire_origin_photos', label: 'Fire origin area photos', required: true },
    { id: 'smoke_damage_photos', label: 'Smoke damage documentation', required: true },
    { id: 'fire_report', label: 'Fire department report', required: true },
    { id: 'electrical_inspection', label: 'Electrical system inspection', required: false }
  ],
  WATER_DAMAGE: [
    { id: 'water_source_photos', label: 'Water source identification photos', required: true },
    { id: 'affected_areas_photos', label: 'All affected areas documented', required: true },
    { id: 'moisture_readings', label: 'Moisture meter readings', required: true },
    { id: 'plumbing_inspection', label: 'Plumbing inspection report', required: false }
  ]
}

export default function QualityControls({ 
  assessmentData, 
  onQualityCheck, 
  onApprove, 
  onReject 
}) {
  const [checkedItems, setCheckedItems] = useState(new Set())
  const [qualityScore, setQualityScore] = useState(null)
  const [isChecking, setIsChecking] = useState(false)

  const eventType = assessmentData?.event_details?.event_type?.toUpperCase()
  const requirements = QUALITY_REQUIREMENTS[eventType] || QUALITY_REQUIREMENTS.STORM_DAMAGE

  const calculateQualityScore = () => {
    setIsChecking(true)
    
    // Simulate quality analysis
    setTimeout(() => {
      const requiredItems = requirements.filter(req => req.required)
      const completedRequired = requiredItems.filter(req => checkedItems.has(req.id))
      const optionalItems = requirements.filter(req => !req.required)
      const completedOptional = optionalItems.filter(req => checkedItems.has(req.id))
      
      const requiredScore = (completedRequired.length / requiredItems.length) * 70
      const optionalScore = (completedOptional.length / optionalItems.length) * 30
      const totalScore = Math.round(requiredScore + optionalScore)
      
      const score = {
        total: totalScore,
        grade: totalScore >= 90 ? 'A' : totalScore >= 80 ? 'B' : totalScore >= 70 ? 'C' : 'D',
        requiredComplete: completedRequired.length,
        requiredTotal: requiredItems.length,
        optionalComplete: completedOptional.length,
        optionalTotal: optionalItems.length,
        issues: requiredItems.filter(req => !checkedItems.has(req.id)).map(req => req.label)
      }
      
      setQualityScore(score)
      onQualityCheck?.(score)
      setIsChecking(false)
    }, 2000)
  }

  const handleItemCheck = (itemId, checked) => {
    const newChecked = new Set(checkedItems)
    if (checked) {
      newChecked.add(itemId)
    } else {
      newChecked.delete(itemId)
    }
    setCheckedItems(newChecked)
  }

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800'
      case 'B': return 'bg-blue-100 text-blue-800'
      case 'C': return 'bg-yellow-100 text-yellow-800'
      case 'D': return 'bg-red-100 text-red-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Quality Control Checklist
          </CardTitle>
          <p className="text-sm text-slate-500">
            Ensure assessment meets quality standards for {eventType?.toLowerCase().replace(/_/g, ' ')} claims
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Requirements Checklist */}
          <div className="space-y-3">
            {requirements.map(requirement => (
              <div key={requirement.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <Checkbox
                  id={requirement.id}
                  checked={checkedItems.has(requirement.id)}
                  onCheckedChange={(checked) => handleItemCheck(requirement.id, checked)}
                />
                <div className="flex-1">
                  <label 
                    htmlFor={requirement.id}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {requirement.label}
                  </label>
                  {requirement.required && (
                    <Badge variant="outline" className="ml-2 text-xs">Required</Badge>
                  )}
                </div>
                {checkedItems.has(requirement.id) && (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                )}
              </div>
            ))}
          </div>

          {/* Quality Check Button */}
          <Button 
            onClick={calculateQualityScore}
            disabled={isChecking}
            className="w-full"
          >
            {isChecking ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Quality...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Run Quality Check
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Quality Score Results */}
      {qualityScore && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Quality Assessment Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className={`text-3xl font-bold ${getScoreColor(qualityScore.total)}`}>
                    {qualityScore.total}
                  </span>
                  <Badge className={getGradeColor(qualityScore.grade)}>
                    Grade {qualityScore.grade}
                  </Badge>
                </div>
                <p className="text-sm text-slate-500">Overall Quality Score</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Required Items</p>
                <p className="font-medium">
                  {qualityScore.requiredComplete}/{qualityScore.requiredTotal}
                </p>
              </div>
            </div>

            <Progress value={qualityScore.total} className="h-3" />

            {/* Issues */}
            {qualityScore.issues.length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="font-medium text-red-800">Missing Required Items</span>
                </div>
                <ul className="text-sm text-red-700 space-y-1">
                  {qualityScore.issues.map((issue, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <X className="w-3 h-3" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Approval Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button 
                variant="outline"
                onClick={() => onReject?.(qualityScore)}
                disabled={qualityScore.total >= 70}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Reject Assessment
              </Button>
              <Button 
                onClick={() => onApprove?.(qualityScore)}
                disabled={qualityScore.total < 70}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Approve Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}