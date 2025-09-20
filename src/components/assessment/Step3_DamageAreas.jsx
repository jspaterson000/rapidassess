import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Camera, CheckCircle2, Home } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { UploadFile } from "@/api/integrations";
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import MobileAssessmentHeader from './MobileAssessmentHeader';
import MobileStepContainer from './MobileStepContainer';
import MobileFormField from './MobileFormField';

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
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              isAreaComplete ? 'bg-green-100' : 'bg-slate-100'
            }`}>
              {isAreaComplete ? (
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              ) : (
                <Home className="w-6 h-6 text-slate-600" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Area {index + 1}</h3>
              <p className="text-sm text-slate-500">
                {isAreaComplete ? 'Complete' : 'Fill in details'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {area.photos?.length > 0 && (
              <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                <Camera className="w-3 h-3 mr-1" />
                {area.photos.length}
              </Badge>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => removeArea(index)} 
              className="text-red-500 hover:text-red-700 hover:bg-red-50 h-12 w-12"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        {/* Form Fields */}
        <div className="space-y-6">
          <MobileFormField
            label="Area Name"
            required
            completed={!!area.area?.trim()}
          >
            <Input 
              value={area.area || ''}
              onChange={(e) => updateArea(index, { ...area, area: e.target.value })}
              placeholder="e.g., Living Room Ceiling"
              className="h-14 bg-slate-50 border-slate-200 text-base"
            />
          </MobileFormField>
          
          <MobileFormField
            label="Damage Type"
            completed={!!area.damage_type?.trim()}
          >
            <Input 
              value={area.damage_type || ''}
              onChange={(e) => updateArea(index, { ...area, damage_type: e.target.value })}
              placeholder="e.g., Water Stain, Structural Crack"
              className="h-14 bg-slate-50 border-slate-200 text-base"
            />
          </MobileFormField>
          
          <MobileFormField
            label="Detailed Description"
            required
            completed={!!area.description?.trim()}
            helpText="Describe size, severity, materials affected, etc."
          >
            <Textarea 
              value={area.description || ''}
              onChange={(e) => updateArea(index, { ...area, description: e.target.value })}
              placeholder="Describe the damage in detail..."
              rows={4}
              className="resize-none bg-slate-50 border-slate-200 text-base min-h-[100px]"
            />
          </MobileFormField>
        </div>

        {/* Photos Section */}
        <div className="space-y-4">
          <MobileFormField
            label="Area Photos"
            helpText="Photos help support your assessment"
          >
            <div className="grid grid-cols-2 gap-3">
              {(area.photos || []).map((photoUrl, photoIdx) => (
                <div key={photoIdx} className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden group border border-slate-200">
                  <img 
                    src={photoUrl} 
                    alt={`${area.area || 'Area'} photo ${photoIdx + 1}`} 
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removePhoto(photoIdx)}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                  >
                    ×
                  </button>
                </div>
              ))}
              
              {/* Upload Button */}
              <label className="aspect-square bg-slate-50 border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all">
                {isUploading ? (
                  <div className="text-center space-y-2">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-blue-600">Uploading...</span>
                    <Progress value={uploadProgress} className="w-16 h-1" />
                  </div>
                ) : (
                  <div className="text-center space-y-2 p-4">
                    <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center">
                      <Camera className="w-5 h-5 text-slate-500" />
                    </div>
                    <span className="text-sm text-slate-600 font-medium">Add Photos</span>
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
          </MobileFormField>
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
    <div className="min-h-screen bg-slate-50">
      <MobileAssessmentHeader
        currentStep={2}
        totalSteps={10}
        stepTitle="Damage Areas"
        stepDescription="Document each damaged area"
        estimatedTime={10}
        onBack={onBack}
      />

      <MobileStepContainer
        onNext={onNext}
        onBack={onBack}
        nextDisabled={!hasValidAreas}
        nextLabel="Continue"
        isComplete={hasValidAreas}
      >
        <div className="space-y-6">
          {/* Progress Summary */}
          {damageAreas.length > 0 && (
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-800">Areas Progress</h3>
                  <Badge variant="outline" className="text-slate-600">
                    {completedAreas} of {damageAreas.length} completed
                  </Badge>
                </div>
                <Progress 
                  value={damageAreas.length > 0 ? (completedAreas / damageAreas.length) * 100 : 0} 
                  className="h-2"
                />
              </CardContent>
            </Card>
          )}
          
          {/* Areas */}
          {damageAreas.map((area, index) => (
            <DamageAreaCard 
              key={index}
              index={index}
              area={area}
              updateArea={updateArea}
              removeArea={removeArea}
            />
          ))}

          {/* Add First Area */}
          {damageAreas.length === 0 && (
            <Card className="border-2 border-dashed border-slate-300 bg-slate-50">
              <CardContent className="text-center py-16">
                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Home className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No damage areas added yet</h3>
                <p className="text-slate-500 mb-6">Start by documenting your first area of damage</p>
                <Button 
                  onClick={addArea} 
                  className="bg-orange-600 hover:bg-orange-700 text-white h-12 px-6"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Your First Area
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Add Another Area */}
          {damageAreas.length > 0 && (
            <Card 
              className="border-dashed border-2 border-slate-300 hover:border-orange-400 hover:bg-orange-50 transition-all cursor-pointer" 
              onClick={addArea}
            >
              <CardContent className="text-center py-12">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Plus className="w-6 h-6 text-orange-600" />
                </div>
                <h4 className="font-medium text-slate-700 mb-1">Add Another Area</h4>
                <p className="text-sm text-slate-500">Document additional damage</p>
              </CardContent>
            </Card>
          )}
        </div>
      </MobileStepContainer>
    </div>
  );
}