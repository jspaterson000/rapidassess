import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, FileText, DollarSign, Clock, ArrowLeft, Send, Award } from 'lucide-react';
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
      scope_of_works: assessmentData.scope_of_works || [],
      status: policyReviewResult?.recommendation === 'additional_info_needed' ? 'pending_review' : 'completed'
    };
    
    await onSubmit(enhancedAssessmentData);
  };

  return (
    <div className="space-y-6 md:space-y-8 max-w-4xl mx-auto">
      {/* Mobile-Optimized Header */}
      <div className="text-center space-y-4 px-4 md:px-0">
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm md:text-base font-medium">
          <Award className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden sm:inline">Step 10 of 10 • </span>Submit Assessment
        </div>
        <div className="w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 text-green-600" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Assessment Complete!</h1>
        <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
          Review the summary below and submit your assessment
        </p>
      </div>

      <div className="space-y-6 px-4 md:px-0">
        {/* Assessment Summary */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-600" />
              Assessment Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Policy Review Result */}
            {policyReviewResult && (
              <div className={`p-4 rounded-lg border ${getRecommendationColor(policyReviewResult.recommendation)}`}>
                <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  AI Policy Analysis Result
                </h4>
                <Badge className={`${getRecommendationColor(policyReviewResult.recommendation)} mb-3 text-sm`}>
                  {policyReviewResult.recommendation === 'proceed' && 'Proceed with Claim'}
                  {policyReviewResult.recommendation === 'additional_info_needed' && 'Additional Information Required'}
                  {policyReviewResult.recommendation === 'refer_to_insurer' && 'Refer to Insurer'}
                </Badge>
                {policyReviewResult.reasoning && (
                  <p className="text-sm text-slate-700">{policyReviewResult.reasoning}</p>
                )}
              </div>
            )}

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-slate-800">{assessmentData.damage_areas?.length || 0}</p>
                <p className="text-sm text-slate-500">Damage Areas</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-slate-800">{assessmentData.photos?.length || 0}</p>
                <p className="text-sm text-slate-500">Photos</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-slate-800">{assessmentData.documents?.length || 0}</p>
                <p className="text-sm text-slate-500">Documents</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-slate-800">{assessmentData.scope_of_works?.length || 0}</p>
                <p className="text-sm text-slate-500">Scope Items</p>
              </div>
            </div>

            {/* Total Estimate */}
            {totalEstimate > 0 && (
              <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">Total Estimated Cost</h4>
                      <p className="text-sm text-slate-600">Based on scope of works</p>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-green-600">{formatCurrency(totalEstimate)}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scope of Works Preview */}
        {assessmentData.scope_of_works?.length > 0 && (
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Scope of Works Summary
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
                  <div className="text-center py-2">
                    <Badge variant="outline" className="text-slate-500">
                      +{assessmentData.scope_of_works.length - 3} more items
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Mobile-Optimized Submit Section */}
      <div className="px-4 md:px-0">
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="text-center py-8 md:py-12">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 md:w-10 md:h-10 text-green-600" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-slate-800 mb-2">Ready to Submit</h3>
            <p className="text-base md:text-lg text-slate-600 mb-6 max-w-md mx-auto">
              Your assessment is complete and ready for submission
            </p>
            <Button
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="h-12 md:h-14 px-8 text-base font-medium bg-green-600 hover:bg-green-700 text-white min-w-[44px]"
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}