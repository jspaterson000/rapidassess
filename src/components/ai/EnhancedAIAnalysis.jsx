import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Brain, 
  Eye, 
  Calculator, 
  FileSearch, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react'

class AIAnalysisEngine {
  async analyzeDamagePhotos(photos) {
    // Simulate AI image analysis
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    return {
      damageTypes: ['water_damage', 'structural_damage'],
      severity: 'moderate',
      estimatedCost: 15000,
      confidence: 0.85,
      recommendations: [
        'Immediate water extraction required',
        'Check for mold growth',
        'Assess structural integrity'
      ]
    }
  }

  async estimateCosts(damageAreas, scopeOfWorks) {
    // Simulate cost estimation AI
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const baseEstimate = scopeOfWorks.reduce((sum, item) => sum + (item.total || 0), 0)
    const aiAdjustment = baseEstimate * (0.9 + Math.random() * 0.2) // ±10% adjustment
    
    return {
      originalEstimate: baseEstimate,
      aiEstimate: aiAdjustment,
      confidence: 0.78,
      factors: [
        'Regional pricing variations',
        'Material availability',
        'Complexity of repairs'
      ],
      breakdown: {
        materials: aiAdjustment * 0.6,
        labor: aiAdjustment * 0.35,
        overhead: aiAdjustment * 0.05
      }
    }
  }

  async predictClaimOutcome(assessmentData) {
    // Simulate predictive analysis
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const outcomes = ['approved', 'partial_approval', 'requires_review', 'likely_denied']
    const probabilities = [0.65, 0.20, 0.10, 0.05]
    
    return {
      prediction: outcomes[0],
      confidence: probabilities[0],
      factors: [
        'Policy coverage matches damage type',
        'Damage consistent with stated cause',
        'No maintenance issues identified'
      ],
      riskFactors: [
        'High claim amount may require additional review'
      ]
    }
  }

  async generateQualityScore(assessmentData) {
    // Simulate quality scoring
    await new Promise(resolve => setTimeout(resolve, 800))
    
    let score = 100
    const issues = []

    // Check completeness
    if (!assessmentData.damage_areas?.length) {
      score -= 20
      issues.push('No damage areas documented')
    }
    
    if (!assessmentData.photos?.length) {
      score -= 15
      issues.push('Insufficient photo documentation')
    }

    if (!assessmentData.event_details?.damage_description) {
      score -= 10
      issues.push('Missing damage description')
    }

    return {
      score: Math.max(score, 0),
      grade: score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : 'D',
      issues,
      recommendations: [
        'Add more detailed damage descriptions',
        'Include photos from multiple angles',
        'Document all affected areas'
      ]
    }
  }
}

const aiEngine = new AIAnalysisEngine()

export default function EnhancedAIAnalysis({ assessmentData, onAnalysisComplete }) {
  const [analyses, setAnalyses] = useState({})
  const [loading, setLoading] = useState({})

  const runAnalysis = async (type) => {
    setLoading(prev => ({ ...prev, [type]: true }))
    
    try {
      let result
      switch (type) {
        case 'damage_photos':
          result = await aiEngine.analyzeDamagePhotos(assessmentData.photos)
          break
        case 'cost_estimation':
          result = await aiEngine.estimateCosts(assessmentData.damage_areas, assessmentData.scope_of_works)
          break
        case 'claim_prediction':
          result = await aiEngine.predictClaimOutcome(assessmentData)
          break
        case 'quality_score':
          result = await aiEngine.generateQualityScore(assessmentData)
          break
      }
      
      setAnalyses(prev => ({ ...prev, [type]: result }))
      onAnalysisComplete?.(type, result)
    } catch (error) {
      console.error(`Error running ${type} analysis:`, error)
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }))
    }
  }

  const AnalysisCard = ({ type, title, description, icon: Icon, result, isLoading }) => (
    <Card className="animate-fade-in-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="w-5 h-5" />
          {title}
        </CardTitle>
        <p className="text-sm text-slate-500">{description}</p>
      </CardHeader>
      <CardContent>
        {!result && !isLoading && (
          <Button onClick={() => runAnalysis(type)} className="w-full">
            Run Analysis
          </Button>
        )}
        
        {isLoading && (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-slate-400" />
            <p className="text-slate-600">Analyzing...</p>
          </div>
        )}
        
        {result && (
          <div className="space-y-4">
            {type === 'damage_photos' && (
              <>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Damage Severity</span>
                  <Badge className={
                    result.severity === 'severe' ? 'bg-red-100 text-red-800' :
                    result.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }>
                    {result.severity}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Estimated Cost</span>
                  <span className="font-bold text-green-600">
                    ${result.estimatedCost.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Confidence</span>
                  <Progress value={result.confidence * 100} className="mt-2" />
                </div>
              </>
            )}
            
            {type === 'cost_estimation' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-slate-500">Original Estimate</span>
                    <p className="font-bold">${result.originalEstimate.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">AI Estimate</span>
                    <p className="font-bold text-blue-600">${result.aiEstimate.toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <span className="font-medium">Confidence</span>
                  <Progress value={result.confidence * 100} className="mt-2" />
                </div>
              </>
            )}
            
            {type === 'claim_prediction' && (
              <>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Predicted Outcome</span>
                  <Badge className={
                    result.prediction === 'approved' ? 'bg-green-100 text-green-800' :
                    result.prediction === 'partial_approval' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {result.prediction.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Confidence</span>
                  <Progress value={result.confidence * 100} className="mt-2" />
                </div>
              </>
            )}
            
            {type === 'quality_score' && (
              <>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Quality Score</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{result.score}</span>
                    <Badge className={
                      result.grade === 'A' ? 'bg-green-100 text-green-800' :
                      result.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                      result.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }>
                      Grade {result.grade}
                    </Badge>
                  </div>
                </div>
                {result.issues.length > 0 && (
                  <div className="space-y-2">
                    <span className="font-medium text-red-600">Issues Found:</span>
                    <ul className="text-sm space-y-1">
                      {result.issues.map((issue, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <AlertTriangle className="w-3 h-3 text-red-500" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => runAnalysis(type)}
              className="w-full"
            >
              Re-run Analysis
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">AI Analysis Suite</h2>
        <p className="text-slate-500">Advanced AI-powered analysis tools for comprehensive assessments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnalysisCard
          type="damage_photos"
          title="Photo Analysis"
          description="AI analysis of damage photos for automatic damage detection"
          icon={Eye}
          result={analyses.damage_photos}
          isLoading={loading.damage_photos}
        />
        
        <AnalysisCard
          type="cost_estimation"
          title="Cost Estimation"
          description="AI-powered cost estimation based on damage assessment"
          icon={Calculator}
          result={analyses.cost_estimation}
          isLoading={loading.cost_estimation}
        />
        
        <AnalysisCard
          type="claim_prediction"
          title="Claim Outcome Prediction"
          description="Predict likely claim outcome based on assessment data"
          icon={TrendingUp}
          result={analyses.claim_prediction}
          isLoading={loading.claim_prediction}
        />
        
        <AnalysisCard
          type="quality_score"
          title="Assessment Quality Score"
          description="Evaluate completeness and quality of assessment documentation"
          icon={CheckCircle}
          result={analyses.quality_score}
          isLoading={loading.quality_score}
        />
      </div>
    </div>
  )
}