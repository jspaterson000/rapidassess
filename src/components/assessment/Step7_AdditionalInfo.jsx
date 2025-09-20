import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { UploadFile } from "@/api/integrations";
import { Upload, FileText, ImageIcon, X, CheckCircle, Loader2, ArrowLeft, ArrowRight, AlertTriangle, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useEffect } from 'react';

export default function Step7_AdditionalInfo({ additionalInfoRequests, onUpdate, onComplete, onBack }) {
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [additionalPhotos, setAdditionalPhotos] = useState([]);
  const [additionalDocuments, setAdditionalDocuments] = useState([]);
  const [completedRequirements, setCompletedRequirements] = useState(new Set());
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [policyResult, setPolicyResult] = useState(null);

  // Get policy result from assessment data if available
  useEffect(() => {
    if (additionalInfoRequests?.policy_result) {
      setPolicyResult(additionalInfoRequests.policy_result);
    }
  }, [additionalInfoRequests]);

  const handleFileUpload = async (e, type) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const uploadPromises = files.map(async (file, index) => {
        const { file_url } = await UploadFile({ file });
        setUploadProgress(((index + 1) / files.length) * 100);
        return file_url;
      });
      
      const results = await Promise.all(uploadPromises);
      const newFileUrls = results.map(res => res.file_url);
      
      if (type === 'photos') {
        setAdditionalPhotos(prev => [...prev, ...newFileUrls]);
      } else {
        setAdditionalDocuments(prev => [...prev, ...newFileUrls]);
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Failed to upload files. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = (index, type) => {
    if (type === 'photos') {
      setAdditionalPhotos(prev => prev.filter((_, i) => i !== index));
    } else {
      setAdditionalDocuments(prev => prev.filter((_, i) => i !== index));
    }
  };

  const toggleRequirementComplete = (index) => {
    const newCompleted = new Set(completedRequirements);
    if (newCompleted.has(index)) {
      newCompleted.delete(index);
    } else {
      newCompleted.add(index);
    }
    setCompletedRequirements(newCompleted);
  };

  const handleContinue = () => {
    // Update the assessment data with additional info
    onUpdate({
      notes: additionalNotes,
      photos: additionalPhotos,
      documents: additionalDocuments,
      completed_requirements: Array.from(completedRequirements)
    });
    
    onComplete();
  };

  const getFileName = (url) => {
    try {
      return url.split('/').pop().split('?')[0] || 'Unknown file';
    } catch {
      return 'Unknown file';
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 max-w-4xl mx-auto">
      {/* Mobile-Optimized Header */}
      <div className="text-center space-y-4 px-4 md:px-0">
        <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-sm md:text-base font-medium">
          <AlertTriangle className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden sm:inline">Step 7 of 10 • </span>Additional Information
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Provide Additional Details</h1>
        <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
          Based on the policy analysis, please provide the following additional information
        </p>
      </div>

      <div className="space-y-6 px-4 md:px-0">
        {/* Requirements Checklist */}
        {policyResult?.additional_requirements && policyResult.additional_requirements.length > 0 && (
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800">
                <CheckCircle className="w-5 h-5" />
                Required Information Checklist
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-amber-800">Progress</span>
                <Badge variant="outline" className="text-amber-700 border-amber-300">
                  {completedRequirements.size} of {policyResult.additional_requirements.length} completed
                </Badge>
              </div>
              
              <Progress 
                value={(completedRequirements.size / policyResult.additional_requirements.length) * 100} 
                className="h-2 mb-4"
              />
              
              <div className="space-y-3">
                {policyResult.additional_requirements.map((requirement, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-white rounded-lg border border-amber-200">
                    <button
                      onClick={() => toggleRequirementComplete(index)}
                      className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all min-w-[44px] min-h-[44px] md:min-w-[24px] md:min-h-[24px] ${
                        completedRequirements.has(index)
                          ? 'border-green-600 bg-green-600'
                          : 'border-amber-400 hover:border-amber-500'
                      }`}
                    >
                      {completedRequirements.has(index) && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </button>
                    <div className="flex-1">
                      <p className={`text-sm md:text-base ${
                        completedRequirements.has(index) 
                          ? 'text-green-700 line-through' 
                          : 'text-amber-800'
                      }`}>
                        {requirement}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Notes */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-600" />
              Additional Notes & Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm md:text-base text-blue-800">
                <p className="font-medium mb-1">Writing tip:</p>
                <p>Provide any additional context, explanations, or information that addresses the requirements above.</p>
              </div>
            </div>
            <Textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Provide any additional context, explanations, or information requested..."
              rows={5}
              className="resize-none bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-base min-h-[120px]"
            />
            <div className="flex justify-between items-center text-sm text-slate-500">
              <span>Provide detailed explanations</span>
              <span>{additionalNotes.length} characters</span>
            </div>
          </CardContent>
        </Card>

        {/* Additional Photos */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-slate-600" />
              Additional Photos
              {additionalPhotos.length > 0 && (
                <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                  {additionalPhotos.length} photo{additionalPhotos.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Photo Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {additionalPhotos.map((photoUrl, index) => (
                <div key={index} className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden group border border-slate-200">
                  <img src={photoUrl} alt={`Additional photo ${index+1}`} className="w-full h-full object-cover"/>
                  <button
                    onClick={() => removeFile(index, 'photos')}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg min-w-[44px] min-h-[44px] md:w-6 md:h-6 md:min-w-0 md:min-h-0"
                    title="Remove photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {/* Upload Button */}
              <label className="aspect-square bg-slate-50 border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group min-h-[120px]">
                {isUploading ? (
                  <div className="text-center space-y-3">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                    <div className="space-y-2">
                      <span className="text-sm md:text-base text-blue-600 font-medium">Uploading...</span>
                      <Progress value={uploadProgress} className="w-20 h-2" />
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-3 p-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-200 group-hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors">
                      <ImageIcon className="w-5 h-5 md:w-6 md:h-6 text-slate-500 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <div>
                      <span className="text-sm md:text-base text-slate-600 group-hover:text-blue-600 font-medium transition-colors block">Add Photos</span>
                      <span className="text-xs md:text-sm text-slate-400 block">Tap to upload</span>
                    </div>
                  </div>
                )}
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => handleFileUpload(e, 'photos')} 
                  disabled={isUploading} 
                />
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Additional Documents */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-600" />
              Additional Documents
              {additionalDocuments.length > 0 && (
                <Badge variant="secondary" className="bg-green-50 text-green-700">
                  {additionalDocuments.length} document{additionalDocuments.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Document List */}
            {additionalDocuments.length > 0 && (
              <div className="space-y-2">
                {additionalDocuments.map((docUrl, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      <span className="text-sm md:text-base text-slate-700 truncate">
                        {getFileName(docUrl)}
                      </span>
                    </div>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => removeFile(index, 'documents')}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 flex-shrink-0 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0"
                      title="Remove document"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Upload Area */}
            <label className="block w-full cursor-pointer">
              <div className={`border-2 border-dashed rounded-lg p-6 md:p-8 text-center transition-all duration-200 ${
                isUploading 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
              }`}>
                {isUploading ? (
                  <div className="space-y-4">
                    <Loader2 className="w-8 h-8 md:w-10 md:h-10 text-blue-600 animate-spin mx-auto" />
                    <div className="space-y-2">
                      <p className="text-base md:text-lg font-medium text-blue-700">Uploading documents...</p>
                      <Progress value={uploadProgress} className="w-full max-w-xs mx-auto h-2" />
                      <p className="text-sm text-blue-600">{Math.round(uploadProgress)}% complete</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-200 rounded-lg flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6 md:w-8 md:h-8 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-base md:text-lg font-medium text-slate-700 mb-1">
                        Click to upload documents
                      </p>
                      <p className="text-sm md:text-base text-slate-500">PDF, DOCX, TXT up to 10MB each</p>
                    </div>
                  </div>
                )}
              </div>
              <input 
                type="file" 
                multiple 
                accept=".pdf,.doc,.docx,.txt" 
                className="hidden" 
                onChange={(e) => handleFileUpload(e, 'documents')} 
                disabled={isUploading} 
              />
            </label>
          </CardContent>
        </Card>
      </div>

      {/* Mobile-Optimized Actions */}
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
            onClick={handleContinue} 
            className="flex-1 h-12 md:h-14 text-base font-medium bg-amber-600 hover:bg-amber-700 min-w-[44px] flex items-center justify-center gap-2"
            disabled={isUploading}
          >
            <span>Continue to Scope of Works</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}