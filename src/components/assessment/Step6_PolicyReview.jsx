import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { InvokeLLM, CreateFileSignedUrl } from "@/api/integrations";
import { PdsDocument } from '@/api/entities';
import { Loader2, CheckCircle, AlertTriangle, XCircle, ArrowLeft, ArrowRight, Cpu, Shield, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Step6_PolicyReview({ assessmentData, onPolicyReview, onBack }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

  const handlePolicyCheck = async () => {
    if (!assessmentData.event_details?.pds_document_id) {
      setError("Please select a PDS document in the 'Event Details' step before proceeding.");
      return;
    }
    setError(null);
    setIsAnalyzing(true);
    
    try {
      console.log("Starting PDS analysis for document ID:", assessmentData.event_details.pds_document_id);
      
      // First, get the PDS document
      const pdsDoc = await PdsDocument.get(assessmentData.event_details.pds_document_id);
      console.log("PDS document loaded:", pdsDoc);
      
      if (!pdsDoc.file_uri) {
        throw new Error("PDS document does not have a valid file URI");
      }
      
      // Create signed URL for the file
      console.log("Creating signed URL for file:", pdsDoc.file_uri);
      const { signed_url } = await CreateFileSignedUrl({ file_uri: pdsDoc.file_uri });
      console.log("Signed URL created successfully");
      
      const prompt = `
You are an expert AI insurance assessor. Your task is to analyze a property damage claim against a specific Product Disclosure Statement (PDS).

First, you MUST access and thoroughly review the PDS document located at the following URL: ${signed_url}

Once you have understood the PDS, analyze the following claim details in the context of that document.

CLAIM DETAILS:
- Event Type: ${assessmentData.event_details.event_type || 'Not specified'}
- Damage Description: ${assessmentData.event_details.damage_description || 'Not provided'}
- Stated Cause: ${assessmentData.event_details.cause_description || 'Not provided'}
- Owner Maintenance Status: ${assessmentData.event_details.owner_maintenance_status || 'Not specified'}
- Damaged Areas: ${assessmentData.damage_areas?.length ? assessmentData.damage_areas.map((area, i) => `${area.area} (${area.damage_type}): ${area.description}`).join('; ') : 'None specified'}

Based on your analysis of the PDS and the claim details, provide your response in the specified JSON format. Your reasoning should be clear and directly reference the PDS where applicable.
`;

      console.log("Sending prompt to AI for internet-based analysis...");
      
      const result = await InvokeLLM({
        prompt,
        add_context_from_internet: true, // Use internet context to access the URL
        response_json_schema: {
          type: "object",
          properties: {
            recommendation: {
              type: "string",
              enum: ["proceed", "additional_info_needed", "refer_to_insurer"]
            },
            reasoning: { type: "string" },
            pds_citations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  clause: { type: "string" },
                  text: { type: "string" },
                  relevance: { type: "string" }
                }
              }
            },
            additional_requirements: {
              type: "array",
              items: { type: "string" }
            },
            confidence_level: {
              type: "string",
              enum: ["high", "medium", "low"]
            }
          }
        }
      });

      console.log("AI analysis completed successfully:", result);
      setAnalysisResult(result);
      
    } catch (error) {
      console.error("Detailed error during AI analysis:", error);
      
      let errorMessage = "An unexpected error occurred during AI analysis.";
      
      if (error.message?.includes('file_uri')) {
        errorMessage = "The PDS document file could not be accessed. Please contact support.";
      } else if (error.message?.includes('500')) {
        errorMessage = "Server error during analysis. Please try again in a moment.";
      } else if (error.response?.status === 500) {
        errorMessage = "AI service is temporarily unavailable. Please try again later.";
      } else if (error.message) {
        errorMessage = `Analysis failed: ${error.message}`;
      }
      
      setError(errorMessage);
      setAnalysisResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAcceptAndContinue = () => {
    onPolicyReview(analysisResult);
  };

  const getRecommendationIcon = (recommendation) => {
    switch (recommendation) {
      case 'proceed':
        return <CheckCircle className="w-8 h-8 text-green-600" />;
      case 'additional_info_needed':
        return <AlertTriangle className="w-8 h-8 text-yellow-600" />;
      case 'refer_to_insurer':
        return <XCircle className="w-8 h-8 text-red-600" />;
      default:
        return null;
    }
  };

  const getRecommendationText = (recommendation) => {
    switch (recommendation) {
      case 'proceed':
        return 'Proceed with Claim';
      case 'additional_info_needed':
        return 'Additional Information Required';
      case 'refer_to_insurer':
        return 'Refer to Insurer';
      default:
        return '';
    }
  };

  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case 'proceed':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'additional_info_needed':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'refer_to_insurer':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-slate-50 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 max-w-4xl mx-auto">
      {/* Mobile-Optimized Header */}
      <div className="text-center space-y-4 px-4 md:px-0">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm md:text-base font-medium">
          <Cpu className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden sm:inline">Step 6 of 10 • </span>AI Policy Review
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Policy Analysis</h1>
        <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
          Our AI will analyze your assessment against the policy terms to provide recommendations
        </p>
      </div>

      <div className="space-y-6 px-4 md:px-0">
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800 mb-1">Analysis Error</h4>
                  <p className="text-sm text-red-700">{error}</p>
                  <p className="text-xs text-red-600 mt-2">Check the console for more details, or try selecting a different PDS document.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!analysisResult ? (
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="text-center py-12 md:py-16">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                {isAnalyzing ? (
                  <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-indigo-600 animate-spin" />
                ) : (
                  <Shield className="w-10 h-10 md:w-12 md:h-12 text-indigo-600" />
                )}
              </div>
              
              {isAnalyzing ? (
                <div className="space-y-4">
                  <h3 className="text-lg md:text-xl font-semibold text-slate-800">Analyzing Claim Against Policy...</h3>
                  <p className="text-base md:text-lg text-slate-600 max-w-md mx-auto">
                    Our AI is reviewing the selected PDS document and comparing it with your assessment details
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-indigo-600">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <h3 className="text-lg md:text-xl font-semibold text-slate-800">Ready for Policy Analysis</h3>
                  <p className="text-base md:text-lg text-slate-600 max-w-md mx-auto">
                    Click below to analyze this assessment against the selected PDS document
                  </p>
                  <Button 
                    onClick={handlePolicyCheck} 
                    className="h-12 md:h-14 px-8 text-base font-medium bg-indigo-600 hover:bg-indigo-700 text-white min-w-[44px]"
                    disabled={isAnalyzing}
                  >
                    <Shield className="w-5 h-5 mr-2" />
                    Start Policy Analysis
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Recommendation Result */}
            <Card className={`border-2 ${getRecommendationColor(analysisResult.recommendation)}`}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  {getRecommendationIcon(analysisResult.recommendation)}
                  <div>
                    <h3 className="text-xl md:text-2xl font-semibold text-slate-800">
                      {getRecommendationText(analysisResult.recommendation)}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-sm">
                        Confidence: {analysisResult.confidence_level}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-white rounded-lg border border-slate-200">
                  <h4 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
                    <Cpu className="w-4 h-4" />
                    AI Analysis Summary
                  </h4>
                  <p className="text-slate-700 leading-relaxed">{analysisResult.reasoning}</p>
                </div>
              </CardContent>
            </Card>

            {/* PDS Citations */}
            {analysisResult.pds_citations && analysisResult.pds_citations.length > 0 && (
              <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Relevant Policy Clauses
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysisResult.pds_citations.map((citation, index) => (
                    <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h5 className="font-semibold text-blue-900 mb-2">{citation.clause}</h5>
                      <p className="text-blue-800 text-sm mb-2">{citation.text}</p>
                      <p className="text-xs text-blue-600 italic">{citation.relevance}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Additional Requirements */}
            {analysisResult.additional_requirements && analysisResult.additional_requirements.length > 0 && (
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-800">
                    <AlertTriangle className="w-5 h-5" />
                    Additional Information Required
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {analysisResult.additional_requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-3 text-amber-800">
                        <div className="w-6 h-6 bg-amber-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold">{index + 1}</span>
                        </div>
                        <span className="text-sm md:text-base">{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Mobile-Optimized Actions */}
      {analysisResult && (
        <div className="px-4 md:px-0">
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200">
            <Button 
              onClick={onBack} 
              variant="outline" 
              className="h-12 md:h-14 text-base font-medium min-w-[44px] flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Previous Step</span>
              <span className="sm:hidden">Back</span>
            </Button>
            <Button 
              onClick={handleAcceptAndContinue}
              className="flex-1 h-12 md:h-14 text-base font-medium bg-indigo-600 hover:bg-indigo-700 min-w-[44px] flex items-center justify-center gap-2"
            >
              <span>Accept & Continue</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}