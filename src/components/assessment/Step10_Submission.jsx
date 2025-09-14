import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, FileText, DollarSign, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Step10_Submission({ 
  assessmentData, 
  onSubmit, 
  isSubmitting, 
  policyReviewResult 
}) {
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount || 0);
  };

  const totalEstimate = assessmentData.scope_of_works?.reduce((sum, item) => {
    return sum + (item.total || 0);
  }, 0) || 0;

  const getRecommendationColor = (recommendation) => {
    const colors = {
      proceed: 'bg-green-100 text-green-800 border-green-200',
      additional_info_needed: 'bg-amber-100 text-amber-800 border-amber-200',
      refer_to_insurer: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[recommendation] || 'bg-slate-100 text-slate-800 border-slate-200';
  };

  const handleFinalSubmit = async () => {
    // Attach scope of works and total estimate to the assessment data before submission
    const enhancedAssessmentData = {
      ...assessmentData,
      total_estimate: totalEstimate,
      scope_of_works: assessmentData.scope_of_works || []
    };
    
    await onSubmit(enhancedAssessmentData);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Assessment Complete</h2>
        <p className="text-slate-600">Review the summary below and submit your assessment.</p>
      </div>

      {/* Assessment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Assessment Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Policy Review Result */}
          {policyReviewResult && (
            <div className="p-4 rounded-lg border border-slate-200">
              <h4 className="font-semibold text-slate-800 mb-2">AI Policy Analysis</h4>
              <Badge className={`${getRecommendationColor(policyReviewResult.recommendation)} mb-3`}>
                {policyReviewResult.recommendation === 'proceed' && 'Proceed with Claim'}
                {policyReviewResult.recommendation === 'additional_info_needed' && 'Additional Information Required'}
                {policyReviewResult.recommendation === 'refer_to_insurer' && 'Refer to Insurer'}
              </Badge>
              {policyReviewResult.summary && (
                <p className="text-sm text-slate-600">{policyReviewResult.summary}</p>
              )}
            </div>
          )}

          {/* Damage Areas Count */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-800">{assessmentData.damage_areas?.length || 0}</p>
              <p className="text-sm text-slate-500">Damage Areas</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-800">{assessmentData.photos?.length || 0}</p>
              <p className="text-sm text-slate-500">Photos</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-800">{assessmentData.documents?.length || 0}</p>
              <p className="text-sm text-slate-500">Documents</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-800">{assessmentData.scope_of_works?.length || 0}</p>
              <p className="text-sm text-slate-500">Scope Items</p>
            </div>
          </div>

          {/* Total Estimate */}
          {totalEstimate > 0 && (
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <DollarSign className="w-6 h-6 text-green-600" />
                <div>
                  <h4 className="font-semibold text-slate-800">Total Estimated Cost</h4>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(totalEstimate)}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scope of Works Preview */}
      {assessmentData.scope_of_works?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Scope of Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assessmentData.scope_of_works.slice(0, 3).map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{item.description}</p>
                    <p className="text-sm text-slate-500">
                      {item.quantity} {item.unit} × {formatCurrency(item.rate)}
                    </p>
                  </div>
                  <p className="font-semibold text-slate-800">{formatCurrency(item.total)}</p>
                </div>
              ))}
              {assessmentData.scope_of_works.length > 3 && (
                <p className="text-sm text-slate-500 text-center">
                  +{assessmentData.scope_of_works.length - 3} more items
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <div className="text-center pt-6">
        <Button
          onClick={handleFinalSubmit}
          disabled={isSubmitting}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
        >
          {isSubmitting ? (
            <>
              <Clock className="w-5 h-5 mr-2 animate-spin" />
              Submitting Assessment...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Submit Assessment
            </>
          )}
        </Button>
      </div>
    </div>
  );
}