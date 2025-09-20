import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UploadFile } from "@/api/integrations";
import { Upload, FileText, ImageIcon, X, Loader2, ArrowLeft, ArrowRight, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg md:text-xl">
          <Icon className="w-5 h-5 md:w-6 md:h-6 text-slate-600" />
          {title}
          {files.length > 0 && (
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-sm">
              {files.length} file{files.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </CardTitle>
        <p className="text-sm md:text-base text-slate-600">{description}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((fileUrl, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Icon className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span className="text-sm md:text-base text-slate-700 truncate">
                    {getFileName(fileUrl)}
                  </span>
                </div>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 flex-shrink-0"
                  title="Remove file"
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
                  <p className="text-base md:text-lg font-medium text-blue-700">Uploading files...</p>
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
                    Click to upload {title.toLowerCase()}
                  </p>
                  <p className="text-sm md:text-base text-slate-500">{fileTypes}</p>
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
      </CardContent>
    </Card>
  );
}

export default function Step4_Attachments({ photos, documents, onPhotosUpdate, onDocumentsUpdate, onNext, onBack }) {
  const hasFiles = photos.length > 0 || documents.length > 0;

  return (
    <div className="space-y-6 md:space-y-8 max-w-4xl mx-auto">
      {/* Mobile-Optimized Header */}
      <div className="text-center space-y-4 px-4 md:px-0">
        <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-sm md:text-base font-medium">
          <FileText className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden sm:inline">Step 4 of 10 • </span>Attachments
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">General Attachments</h1>
        <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
          Upload additional photos and supporting documents for this assessment
        </p>
      </div>

      {/* File Uploaders */}
      <div className="space-y-6 px-4 md:px-0">
        <FileUploader
          title="General Photos"
          description="Property overview, exterior shots, and additional context photos"
          icon={ImageIcon}
          fileTypes="PNG, JPG, GIF up to 10MB each"
          acceptedTypes="image/*"
          files={photos}
          updateFiles={onPhotosUpdate}
        />
        
        <FileUploader
          title="Supporting Documents"
          description="Reports, quotes, correspondence, and other relevant documentation"
          icon={FileText}
          fileTypes="PDF, DOCX, TXT up to 10MB each"
          acceptedTypes=".pdf,.doc,.docx,.txt"
          files={documents}
          updateFiles={onDocumentsUpdate}
        />
      </div>

      {!hasFiles && (
        <div className="text-center py-8 md:py-12 bg-amber-50 rounded-xl border border-amber-200 mx-4 md:mx-0">
          <Upload className="w-12 h-12 md:w-16 md:h-16 text-amber-600 mx-auto mb-4" />
          <h3 className="text-lg md:text-xl font-semibold text-amber-800 mb-2">No files uploaded yet</h3>
          <p className="text-base md:text-lg text-amber-700">You can skip this step or add files using the upload areas above</p>
        </div>
      )}
      
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
            onClick={onNext} 
            className="flex-1 h-12 md:h-14 text-base font-medium bg-purple-600 hover:bg-purple-700 min-w-[44px] flex items-center justify-center gap-2"
          >
            <span>Continue to Review</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}