import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Camera, Home, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadFile } from "@/api/integrations";
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

function DamageAreaCard({ area, index, updateArea, removeArea }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const uploadPromises = files.map(async (file, fileIndex) => {
        const { file_url } = await UploadFile({ file });
        setUploadProgress(((fileIndex + 1) / files.length) * 100);
        return file_url;
      });
      
      const newPhotoUrls = await Promise.all(uploadPromises);
      const newPhotos = [...(area.photos || []), ...newPhotoUrls];
      updateArea(index, { ...area, photos: newPhotos });
    } catch (error) {
      console.error("Error uploading photos:", error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removePhoto = (photoIndex) => {
    const newPhotos = area.photos.filter((_, i) => i !== photoIndex);
    updateArea(index, { ...area, photos: newPhotos });
  };

  const isAreaComplete = area.area?.trim() && area.description?.trim();

  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
      <CardContent className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
              isAreaComplete ? 'bg-emerald-100' : 'bg-slate-100'
            }`}>
              {isAreaComplete ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <Home className="w-5 h-5 text-slate-600" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Damage Area {index + 1}</h3>
              <p className="text-sm text-slate-500">
                {isAreaComplete ? 'Complete' : 'Fill in details below'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(area.photos?.length > 0) && (
              <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                <Camera className="w-3 h-3 mr-1" />
                {area.photos.length} photo{area.photos.length !== 1 ? 's' : ''}
              </Badge>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => removeArea(index)} 
              className="text-red-500 hover:text-red-700 hover:bg-red-50 h-10 w-10"
              title="Remove this damage area"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-slate-900 font-medium flex items-center gap-2">
              Area Name *
              {area.area?.trim() && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            </Label>
            <Input 
              value={area.area || ''}
              onChange={(e) => updateArea(index, { ...area, area: e.target.value })}
              placeholder="e.g., Living Room Ceiling"
              className="h-11 bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-900 font-medium">Damage Type</Label>
            <Input 
              value={area.damage_type || ''}
              onChange={(e) => updateArea(index, { ...area, damage_type: e.target.value })}
              placeholder="e.g., Water Stain, Structural Crack"
              className="h-11 bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label className="text-slate-900 font-medium flex items-center gap-2">
            Detailed Description *
            {area.description?.trim() && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          </Label>
          <Textarea 
            value={area.description || ''}
            onChange={(e) => updateArea(index, { ...area, description: e.target.value })}
            placeholder="Describe the damage in detail - size, severity, materials affected, etc."
            rows={3}
            className="resize-none bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          />
        </div>

        {/* Photos Section */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2 text-slate-900 font-medium">
            <Camera className="w-4 h-4" />
            Area Photos
            <span className="text-sm font-normal text-slate-500">(Recommended)</span>
          </Label>
          
          {/* Photo Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {(area.photos || []).map((photoUrl, photoIdx) => (
              <div key={photoIdx} className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden group border border-slate-200 hover:border-slate-300 transition-colors">
                <img 
                  src={photoUrl} 
                  alt={`${area.area || 'Area'} photo ${photoIdx + 1}`} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                <button
                  onClick={() => removePhoto(photoIdx)}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                  title="Remove photo"
                >
                  ×
                </button>
              </div>
            ))}
            
            {/* Upload Button */}
            <label className="aspect-square bg-slate-50 border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group">
              {isUploading ? (
                <div className="text-center space-y-2">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <div className="space-y-1">
                    <span className="text-xs text-blue-600 font-medium">Uploading...</span>
                    <Progress value={uploadProgress} className="w-16 h-1" />
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <div className="w-8 h-8 bg-slate-200 group-hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors">
                    <Camera className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-600 group-hover:text-blue-600 font-medium transition-colors block">Add Photos</span>
                    <span className="text-xs text-slate-400 block">Tap to upload</span>
                  </div>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                multiple
                className="hidden" 
                onChange={handlePhotoUpload} 
                disabled={isUploading} 
              />
            </label>
          </div>
          
          {area.photos?.length > 0 && (
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              {area.photos.length} photo{area.photos.length !== 1 ? 's' : ''} uploaded
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Step3_DamageAreas({ damageAreas, onUpdate, onNext, onBack }) {
  const addArea = () => {
    onUpdate([...damageAreas, { area: '', damage_type: '', description: '', photos: [] }]);
  };

  const removeArea = (indexToRemove) => {
    onUpdate(damageAreas.filter((_, index) => index !== indexToRemove));
  };

  const updateArea = (index, updatedArea) => {
    const newData = [...damageAreas];
    newData[index] = updatedArea;
    onUpdate(newData);
  };

  const hasValidAreas = damageAreas.length > 0 && damageAreas.some(area => area.area?.trim() && area.description?.trim());
  const completedAreas = damageAreas.filter(area => area.area?.trim() && area.description?.trim()).length;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-2 rounded-full text-sm font-medium">
          <Home className="w-4 h-4" />
          Step 3 of 10 • Damage Documentation
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Document the damaged areas</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Add each area where you can see damage. Include photos to support your assessment.
        </p>
      </div>

      {/* Progress Summary */}
      {damageAreas.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Areas Progress</h3>
            <Badge variant="outline" className="text-slate-600">
              {completedAreas} of {damageAreas.length} areas completed
            </Badge>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-700 ease-out"
              style={{ width: damageAreas.length > 0 ? `${(completedAreas / damageAreas.length) * 100}%` : '0%' }}
            />
          </div>
        </div>
      )}
      
      {/* Areas */}
      <div className="space-y-6">
        {damageAreas.map((area, index) => (
          <DamageAreaCard 
            key={index}
            index={index}
            area={area}
            updateArea={updateArea}
            removeArea={removeArea}
          />
        ))}

        {damageAreas.length === 0 && (
          <Card className="border-2 border-dashed border-slate-300 bg-slate-50">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="font-semibold text-slate-700 mb-2">No damage areas added yet</h3>
              <p className="text-slate-500 mb-6">Start by documenting your first area of damage</p>
              <Button 
                onClick={addArea} 
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Damage Area
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Button */}
      {damageAreas.length > 0 && (
        <Card className="border-dashed border-2 border-slate-300 hover:border-orange-400 hover:bg-orange-50 transition-all duration-200 cursor-pointer" onClick={addArea}>
          <CardContent className="text-center py-8">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Plus className="w-6 h-6 text-orange-600" />
            </div>
            <h4 className="font-medium text-slate-700 mb-1">Add Another Damage Area</h4>
            <p className="text-sm text-slate-500">Document additional areas if needed</p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6">
        <Button 
          onClick={onBack} 
          variant="outline" 
          className="sm:w-auto h-12 text-base font-medium"
        >
          ← Previous Step
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!hasValidAreas}
          className="sm:flex-1 h-12 text-base font-medium bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 disabled:text-slate-500"
        >
          Continue to Attachments →
          {hasValidAreas && <span className="ml-2">✓</span>}
        </Button>
      </div>

      {/* Validation Help */}
      {damageAreas.length > 0 && !hasValidAreas && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800 mb-2">Complete your damage areas:</h4>
              <ul className="space-y-1 text-sm text-amber-700">
                {damageAreas.map((area, idx) => {
                  const issues = [];
                  if (!area.area?.trim()) issues.push('area name');
                  if (!area.description?.trim()) issues.push('description');
                  
                  if (issues.length > 0) {
                    return (
                      <li key={idx}>• Area {idx + 1}: Add {issues.join(' and ')}</li>
                    );
                  }
                  return null;
                }).filter(Boolean)}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}