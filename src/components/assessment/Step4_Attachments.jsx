import React, { useState } from 'react';
import { UploadFile } from "@/api/integrations";
import { Upload, FileText, ImageIcon, X, Loader2, Camera } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MobileAssessmentHeader from './MobileAssessmentHeader';
import MobileStepContainer from './MobileStepContainer';
import MobileFormField from './MobileFormField';

function FileUploader({ title, description, icon: Icon, fileTypes, files, updateFiles, acceptedTypes }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const uploadPromises = selectedFiles.map(async (file, index) => {
        const { file_url } = await UploadFile({ file });
        setUploadProgress(((index + 1) / selectedFiles.length) * 100);
        return file_url;
      });
      
      const newFileUrls = await Promise.all(uploadPromises);
      updateFiles([...files, ...newFileUrls]);
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Failed to upload files. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = (index) => {
    updateFiles(files.filter((_, i) => i !== index));
  };

  const getFileName = (url) => {
    try {
      return url.split('/').pop().split('?')[0] || 'Unknown file';
    } catch {
      return 'Unknown file';
    }
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-6">
        <MobileFormField
          label={title}
          helpText={description}
        >
          <div className="space-y-4">
            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-3">
                {files.map((fileUrl, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Icon className="w-5 h-5 text-slate-500 flex-shrink-0" />
                      <span className="text-base text-slate-700 truncate">
                        {getFileName(fileUrl)}
                      </span>
                    </div>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 h-10 w-10 flex-shrink-0"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Area */}
            <label className="block w-full cursor-pointer">
              <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                isUploading 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
              }`}>
                {isUploading ? (
                  <div className="space-y-4">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
                    <div className="space-y-2">
                      <p className="text-base font-medium text-blue-700">Uploading...</p>
                      <Progress value={uploadProgress} className="w-full max-w-xs mx-auto h-2" />
                      <p className="text-sm text-blue-600">{Math.round(uploadProgress)}% complete</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-slate-200 rounded-lg flex items-center justify-center mx-auto">
                      <Upload className="w-8 h-8 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-slate-700 mb-1">
                        Upload {title}
                      </p>
                      <p className="text-base text-slate-500">{fileTypes}</p>
                    </div>
                  </div>
                )}
              </div>
              <input 
                type="file" 
                multiple 
                accept={acceptedTypes}
                className="hidden" 
                onChange={handleFileUpload} 
                disabled={isUploading} 
              />
            </label>
          </div>
        </MobileFormField>
      </CardContent>
    </Card>
  );
}

export default function Step4_Attachments({ photos, documents, onPhotosUpdate, onDocumentsUpdate, onNext, onBack }) {
  const hasFiles = photos.length > 0 || documents.length > 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <MobileAssessmentHeader
        currentStep={3}
        totalSteps={10}
        stepTitle="Attachments"
        stepDescription="Upload supporting files"
        estimatedTime={5}
        onBack={onBack}
      />

      <MobileStepContainer
        onNext={onNext}
        onBack={onBack}
        nextLabel="Continue"
      >
        <div className="space-y-6">
          <FileUploader
            title="General Photos"
            description="Property overview and context photos"
            icon={ImageIcon}
            fileTypes="PNG, JPG, GIF up to 10MB"
            acceptedTypes="image/*"
            files={photos}
            updateFiles={onPhotosUpdate}
          />
          
          <FileUploader
            title="Supporting Documents"
            description="Reports, quotes, correspondence"
            icon={FileText}
            fileTypes="PDF, DOCX, TXT up to 10MB"
            acceptedTypes=".pdf,.doc,.docx,.txt"
            files={documents}
            updateFiles={onDocumentsUpdate}
          />

          {!hasFiles && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="text-center py-12">
                <Upload className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-amber-800 mb-2">No files uploaded yet</h3>
                <p className="text-amber-700">You can skip this step or add files above</p>
              </CardContent>
            </Card>
          )}
        </div>
      </MobileStepContainer>
    </div>
  );
}