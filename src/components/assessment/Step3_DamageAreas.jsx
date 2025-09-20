import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Camera, Home, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
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
      <CardContent className="p-4 md:p-6 space-y-6">
        {/* Mobile-Optimized Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
              isAreaComplete ? 'bg-emerald-100' : 'bg-slate-100'
            }`}>
              {isAreaComplete ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              ) : (
                <Home className="w-6 h-6 text-slate-600" />
              )}
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-slate-900">Area {index + 1}</h3>
              <p className="text-sm md:text-base text-slate-500">
                {isAreaComplete ? 'Complete' : 'Fill in details below'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(area.photos?.length > 0) && (
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-sm">
                <Camera className="w-3 h-3 mr-1" />
                {area.photos.length}
              </Badge>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => removeArea(index)} 
              className="text-red-500 hover:text-red-700 hover:bg-red-50 h-12 w-12 min-w-[44px]"
              title="Remove this damage area"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        {/* Mobile-Optimized Form Fields */}
        <div className="space-y-6">
          <div className="space-y-3">
            <Label className="text-slate-900 font-medium text-base flex items-center gap-2">
              Area Name *
              {area.area?.trim() && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            </Label>
            <Input 
              value={area.area || ''}
              onChange={(e) => updateArea(index, { ...area, area: e.target.value })}
              placeholder="e.g., Living Room Ceiling"
              className="h-12 md:h-14 bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-base"
            />
          </div>
          
          <div className="space-y-3">
            <Label className="text-slate-900 font-medium text-base">Damage Type</Label>
            <Input 
              value={area.damage_type || ''}
              onChange={(e) => updateArea(index, { ...area, damage_type: e.target.value })}
              placeholder="e.g., Water Stain, Structural Crack"
              className="h-12 md:h-14 bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-base"
            />
          </div>
          
          <div className="space-y-3">
            <Label className="text-slate-900 font-medium text-base flex items-center gap-2">
              Detailed Description *
              {area.description?.trim() && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            </Label>
            <Textarea 
              value={area.description || ''}
              onChange={(e) => updateArea(index, { ...area, description: e.target.value })}
              placeholder="Describe the damage in detail - size, severity, materials affected, etc."
              rows={4}
              className="resize-none bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-base min-h-[100px]"
            />
          </div>
        </div>

        {/* Mobile-Optimized Photos Section */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2 text-slate-900 font-medium text-base">
            <Camera className="w-5 h-5" />
            Area Photos
            <span className="text-sm font-normal text-slate-500">(Recommended)</span>
          </Label>
          
          {/* Photo Grid - Mobile Optimized */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
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
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-all shadow-lg min-w-[44px] min-h-[44px] md:w-6 md:h-6 md:min-w-0 md:min-h-0"
                  title="Remove photo"
                >
                  ×
                </button>
              </div>
            ))}
            
            {/* Mobile-Optimized Upload Button */}
            <label className="aspect-square bg-slate-50 border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group min-h-[120px]">
              {isUploading ? (
                <div className="text-center space-y-3">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <div className="space-y-2">
                    <span className="text-sm md:text-base text-blue-600 font-medium">Uploading...</span>
                    <Progress value={uploadProgress} className="w-20 h-2" />
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-3 p-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-200 group-hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors">
                    <Camera className="w-5 h-5 md:w-6 md:h-6 text-slate-500 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <div>
                    <span className="text-sm md:text-base text-slate-600 group-hover:text-blue-600 font-medium transition-colors block">Add Photos</span>
                    <span className="text-xs md:text-sm text-slate-400 block">Tap to upload</span>
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
            <p className="text-sm md:text-base text-slate-500 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
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
    <div className="space-y-6 md:space-y-8 max-w-4xl mx-auto">
      {/* Mobile-Optimized Header */}
      <div className="text-center space-y-4 px-4 md:px-0">
        <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-2 rounded-full text-sm md:text-base font-medium">
          <Home className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden sm:inline">Step 3 of 10 • </span>Damage Documentation
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Document the damaged areas</h1>
        <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
          Add each area where you can see damage. Include photos to support your assessment.
        </p>
      </div>

      {/* Mobile-Optimized Progress Summary */}
      {damageAreas.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-6 shadow-sm mx-4 md:mx-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base md:text-lg font-semibold text-slate-800">Areas Progress</h3>
            <Badge variant="outline" className="text-slate-600 text-sm">
              {completedAreas} of {damageAreas.length} completed
            </Badge>
          </div>
          <Progress 
            value={damageAreas.length > 0 ? (completedAreas / damageAreas.length) * 100 : 0} 
            className="h-2 md:h-3"
          />
          <div className="flex justify-between text-xs md:text-sm text-slate-500 mt-2">
            <span>Started</span>
            <span>{damageAreas.length - completedAreas} areas remaining</span>
            <span>Complete</span>
          </div>
        </div>
      )}
      
      {/* Areas */}
      <div className="space-y-6 px-4 md:px-0">
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
          <Card className="border-2 border-dashed border-slate-300 bg-slate-50 mx-4 md:mx-0">
            <CardContent className="text-center py-12 md:py-16">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="w-8 h-8 md:w-10 md:h-10 text-slate-400" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-slate-700 mb-2">No damage areas added yet</h3>
              <p className="text-base md:text-lg text-slate-500 mb-6">Start by documenting your first area of damage</p>
              <Button 
                onClick={addArea} 
                className="bg-orange-600 hover:bg-orange-700 text-white h-12 md:h-14 px-6 text-base font-medium min-w-[44px]"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Damage Area
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Mobile-Optimized Add Button */}
      {damageAreas.length > 0 && (
        <div className="px-4 md:px-0">
          <Card className="border-dashed border-2 border-slate-300 hover:border-orange-400 hover:bg-orange-50 transition-all duration-200 cursor-pointer" onClick={addArea}>
            <CardContent className="text-center py-8 md:py-12">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Plus className="w-6 h-6 md:w-8 md:h-8 text-orange-600" />
              </div>
              <h4 className="text-base md:text-lg font-medium text-slate-700 mb-1">Add Another Damage Area</h4>
              <p className="text-sm md:text-base text-slate-500">Document additional areas if needed</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mobile-Optimized Actions */}
      <div className="px-4 md:px-0">
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
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
            disabled={!hasValidAreas}
            className="flex-1 h-12 md:h-14 text-base font-medium bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 disabled:text-slate-500 min-w-[44px] flex items-center justify-center gap-2"
          >
            <span>Continue to Attachments</span>
            <ArrowRight className="w-5 h-5" />
            {hasValidAreas && <span className="ml-2">✓</span>}
          </Button>
        </div>
      </div>

      {/* Mobile-Optimized Validation Help */}
      {damageAreas.length > 0 && !hasValidAreas && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mx-4 md:mx-0">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800 mb-2 text-base">Complete your damage areas:</h4>
              <ul className="space-y-2 text-sm md:text-base text-amber-700">
                {damageAreas.map((area, idx) => {
                  const issues = [];
                  if (!area.area?.trim()) issues.push('area name');
                  if (!area.description?.trim()) issues.push('description');
                  
                  if (issues.length > 0) {
                    return (
                      <li key={idx} className="flex items-start gap-2">
                        <span>•</span>
                        <span>Area {idx + 1}: Add {issues.join(' and ')}</span>
                      </li>
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