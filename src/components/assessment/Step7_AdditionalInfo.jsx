
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { UploadFile } from "@/api/integrations";
import { Upload, FileText, ImageIcon, X, CheckCircle, Loader2 } from 'lucide-react';
import { useEffect } from 'react';

export default function Step7_AdditionalInfo({ additionalInfoRequests, onUpdate, onComplete, onBack }) {
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [additionalPhotos, setAdditionalPhotos] = useState([]);
  const [additionalDocuments, setAdditionalDocuments] = useState([]);
  const [completedRequirements, setCompletedRequirements] = useState(new Set());
  const [isUploading, setIsUploading] = useState(false);
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
    try {
      const uploadPromises = files.map(file => UploadFile({ file }));
      const results = await Promise.all(uploadPromises);
      const newFileUrls = results.map(res => res.file_url);
      
      if (type === 'photos') {
        setAdditionalPhotos(prev => [...prev, ...newFileUrls]);
      } else {
        setAdditionalDocuments(prev => [...prev, ...newFileUrls]);
      }
    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setIsUploading(false);
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

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-neumorphic-dark mb-2">Additional Information Required</h2>
        <p className="text-neumorphic">Please provide the following information to proceed with the assessment.</p>
      </div>

      {/* Requirements Checklist */}
      <div className="p-4 neumorphic-inset rounded-lg">
        <h3 className="font-semibold text-neumorphic-dark mb-4">Required Information</h3>
        <div className="space-y-3">
          {policyResult?.additional_requirements?.map((requirement, index) => (
            <div key={index} className="flex items-start gap-3 p-3 neumorphic rounded-md">
              <button
                onClick={() => toggleRequirementComplete(index)}
                className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  completedRequirements.has(index)
                    ? 'border-green-600 bg-green-600'
                    : 'border-neumorphic'
                }`}
              >
                {completedRequirements.has(index) && (
                  <CheckCircle className="w-3 h-3 text-white" />
                )}
              </button>
              <div className="flex-1">
                <p className={`text-sm ${
                  completedRequirements.has(index) 
                    ? 'text-green-600 line-through' 
                    : 'text-neumorphic-dark'
                }`}>
                  {requirement}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Notes */}
      <div className="space-y-2">
        <Label className="text-neumorphic-dark font-medium">Additional Notes & Information</Label>
        <Textarea
          value={additionalNotes}
          onChange={(e) => setAdditionalNotes(e.target.value)}
          placeholder="Provide any additional context, explanations, or information requested..."
          rows={4}
          className="neumorphic-inset border-0 bg-transparent text-neumorphic-dark resize-none"
        />
      </div>

      {/* Additional Photos */}
      <div className="space-y-3">
        <Label className="text-neumorphic-dark font-medium">Additional Photos</Label>
        <div className="neumorphic-inset p-4 rounded-lg">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mb-4">
            {additionalPhotos.map((photoUrl, index) => (
              <div key={index} className="relative aspect-square neumorphic-inset rounded-lg overflow-hidden">
                <img src={photoUrl} alt={`Additional photo ${index+1}`} className="w-full h-full object-cover"/>
                <button
                  onClick={() => removeFile(index, 'photos')}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          
          <label className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-100/10 transition-colors"
            style={{ borderColor: '#cacaca' }}
          >
            <div className="flex flex-col items-center justify-center pt-2 pb-2">
              {isUploading ? (
                <Loader2 className="w-6 h-6 mb-2 text-neumorphic-dark animate-spin" />
              ) : (
                <ImageIcon className="w-6 h-6 mb-2 text-neumorphic-dark" />
              )}
              <p className="text-sm text-neumorphic-dark">Add Photos</p>
            </div>
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
      </div>

      {/* Additional Documents */}
      <div className="space-y-3">
        <Label className="text-neumorphic-dark font-medium">Additional Documents</Label>
        <div className="neumorphic-inset p-4 rounded-lg">
          <div className="space-y-2 mb-4">
            {additionalDocuments.map((docUrl, index) => (
              <div key={index} className="flex items-center justify-between p-2 neumorphic rounded-md">
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-4 h-4 text-neumorphic" />
                  <span className="text-sm text-neumorphic-dark truncate">
                    {docUrl.split('/').pop().split('?')[0]}
                  </span>
                </div>
                <Button size="icon" variant="ghost" onClick={() => removeFile(index, 'documents')}>
                  <X className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
          
          <label className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-100/10 transition-colors"
            style={{ borderColor: '#cacaca' }}
          >
            <div className="flex flex-col items-center justify-center pt-2 pb-2">
              {isUploading ? (
                <Loader2 className="w-6 h-6 mb-2 text-neumorphic-dark animate-spin" />
              ) : (
                <Upload className="w-6 h-6 mb-2 text-neumorphic-dark" />
              )}
              <p className="text-sm text-neumorphic-dark">Add Documents</p>
            </div>
            <input 
              type="file" 
              multiple 
              accept=".pdf,.doc,.docx" 
              className="hidden" 
              onChange={(e) => handleFileUpload(e, 'documents')} 
              disabled={isUploading} 
            />
          </label>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 mt-8">
        <Button onClick={onBack} className="bg-white hover:bg-gray-50 text-slate-700 border border-gray-200 shadow-sm w-full sm:w-auto">
          Back
        </Button>
        <Button 
          onClick={handleContinue} 
          className="bg-slate-700 hover:bg-slate-800 text-white shadow-sm w-full sm:w-auto"
          disabled={isUploading}
        >
          Continue to Scope of Works
        </Button>
      </div>
    </div>
  );
}
