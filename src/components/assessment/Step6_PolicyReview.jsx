
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { InvokeLLM, CreateFileSignedUrl } from "@/api/integrations";
import { PdsDocument } from '@/api/entities';
import { Loader2, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export default function Step6_PolicyReview({ data, onPolicyReview, onBack }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Added to support the 'disabled' prop on buttons as per outline

  const handlePolicyCheck = async () => {
    if (!data.pds_document_id) {
      setError("Please select a PDS document in the 'Event Details' step before proceeding.");
      return;
    }
    setError(null);
    setIsAnalyzing(true);
    
    try {
      console.log("Starting PDS analysis for document ID:", data.pds_document_id);
      
      // First, get the PDS document
      const pdsDoc = await PdsDocument.get(data.pds_document_id);
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
- Event Type: ${data.event_details.event_type || 'Not specified'}
- Damage Description: ${data.event_details.damage_description || 'Not provided'}
- Stated Cause: ${data.event_details.cause_description || 'Not provided'}
- Owner Maintenance Status: ${data.event_details.owner_maintenance_status || 'Not specified'}
- Damaged Areas: ${data.damage_areas?.length ? data.damage_areas.map((area, i) => `${area.area} (${area.damage_type}): ${area.description}`).join('; ') : 'None specified'}

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
        return 'Proceed (within DOA, covered by policy)';
      case 'additional_info_needed':
        return 'Additional Information Required';
      case 'refer_to_insurer':
        return 'Refer to Insurer (possible exclusion or decline)';
      default:
        return '';
    }
  };

  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case 'proceed':
        return 'text-green-600';
      case 'additional_info_needed':
        return 'text-yellow-600';
      case 'refer_to_insurer':
        return 'text-red-600';
      default:
        return 'text-neumorphic-dark';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-neumorphic-dark mb-2">Policy Review & Analysis</h2>
        <p className="text-neumorphic">AI analysis against Product Disclosure Statement (PDS) requirements.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Analysis Error</p>
            <p className="text-sm mt-1">{error}</p>
            <p className="text-xs mt-2 text-red-600">Check the console for more details, or try selecting a different PDS document.</p>
          </div>
        </div>
      )}

      {!analysisResult ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 neumorphic-button rounded-full flex items-center justify-center mx-auto mb-6">
            {isAnalyzing ? (
              <Loader2 className="w-12 h-12 text-slate-700 animate-spin" />
            ) : (
              <CheckCircle className="w-12 h-12 text-slate-700" />
            )}
          </div>
          
          {isAnalyzing ? (
            <div>
              <h3 className="text-lg font-semibold text-neumorphic-dark mb-2">Analyzing Claim Against Policy...</h3>
              <p className="text-neumorphic">This may take a few moments while we review the selected PDS</p>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold text-neumorphic-dark mb-2">Ready for Policy Check</h3>
              <p className="text-neumorphic mb-6">Click below to analyze this assessment against the selected PDS</p>
              <Button 
                onClick={handlePolicyCheck} 
                className="bg-slate-700 hover:bg-slate-800 text-white shadow-sm"
                disabled={isAnalyzing}
              >
                Check Against Policy
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Recommendation Result */}
          <div className="p-6 neumorphic-inset rounded-lg">
            <div className="flex items-center gap-4 mb-4">
              {getRecommendationIcon(analysisResult.recommendation)}
              <div>
                <h3 className={`text-xl font-semibold ${getRecommendationColor(analysisResult.recommendation)}`}>
                  {getRecommendationText(analysisResult.recommendation)}
                </h3>
                <p className="text-sm text-neumorphic">Confidence: {analysisResult.confidence_level}</p>
              </div>
            </div>
            
            <div className="p-4 neumorphic rounded-lg">
              <h4 className="font-medium text-neumorphic-dark mb-2">AI Reasoning:</h4>
              <p className="text-neumorphic text-sm leading-relaxed">{analysisResult.reasoning}</p>
            </div>
          </div>

          {/* PDS Citations */}
          {analysisResult.pds_citations && analysisResult.pds_citations.length > 0 && (
            <div className="p-4 neumorphic-inset rounded-lg">
              <h3 className="font-semibold text-neumorphic-dark mb-3">Relevant PDS Clauses</h3>
              <div className="space-y-3">
                {analysisResult.pds_citations.map((citation, index) => (
                  <div key={index} className="p-3 neumorphic rounded-md">
                    <p className="font-medium text-neumorphic-dark text-sm">{citation.clause}</p>
                    <p className="text-neumorphic text-sm mt-1">{citation.text}</p>
                    <p className="text-xs text-blue-600 mt-2">{citation.relevance}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Requirements */}
          {analysisResult.additional_requirements && analysisResult.additional_requirements.length > 0 && (
            <div className="p-4 neumorphic-inset rounded-lg">
              <h3 className="font-semibold text-neumorphic-dark mb-3">Additional Information Required</h3>
              <ul className="space-y-2">
                {analysisResult.additional_requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-2 text-neumorphic text-sm">
                    <span className="text-yellow-600 font-bold">•</span>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {analysisResult && (
        <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 mt-8">
          <Button onClick={onBack} className="bg-white hover:bg-gray-50 text-slate-700 border border-gray-200 shadow-sm" disabled={isSubmitting}>
            Back
          </Button>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="bg-white hover:bg-gray-50 text-slate-700 border border-gray-200 shadow-sm">
              Save & Return Later
            </Button>
            <Button 
              onClick={handleAcceptAndContinue}
              className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
            >
              Accept & Continue
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
