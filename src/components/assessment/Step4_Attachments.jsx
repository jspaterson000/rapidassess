import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UploadFile } from "@/api/integrations";
import { Upload, FileText, ImageIcon, X, Loader2, ArrowLeft, ArrowRight, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Step4_Attachments({ photos, documents, onPhotosUpdate, onDocumentsUpdate, onNext, onBack }) {
  const hasFiles = photos.length > 0 || documents.length > 0;

  return (
    <div className="space-y-6 md:space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4 px-4 md:px-0">
        <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-sm md:text-base font-medium">
          <FileText className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden sm:inline">Step 4 of 10 • </span>Attachments
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">General Attachments</h1>
        <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">Upload additional photos and supporting documents for this assessment</p>
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
      
      {/* Actions */}
      <div className="px-4 md:px-0">
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
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