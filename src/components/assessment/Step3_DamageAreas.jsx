import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Camera, Home } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { UploadFile } from "@/api/integrations";
import { Badge } from '@/components/ui/badge';

function DamageAreaCard({ area, index, updateArea, removeArea }) {
  const [isUploading, setIsUploading] = useState(false);
  
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      const newPhotos = [...(area.photos || []), file_url];
      updateArea(index, { ...area, photos: newPhotos });
    } catch (error) {
      console.error("Error uploading photo:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = (photoIndex) => {
    const newPhotos = area.photos.filter((_, i) => i !== photoIndex);
    updateArea(index, { ...area, photos: newPhotos });
  };

  return (
    <Card className="card-tactile bg-white border border-gray-200">
      <CardContent className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <Home className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900">Area {index + 1}</h3>
            {(area.photos?.length > 0) && (
              <Badge variant="secondary">
                {area.photos.length} photo{area.photos.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => removeArea(index)} 
            className="text-red-600 hover:text-red-700 hover:bg-red-50 mobile-touch"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-gray-900 font-medium">Area Name</Label>
            <Input 
              value={area.area || ''}
              onChange={(e) => updateArea(index, { ...area, area: e.target.value })}
              placeholder="e.g., Living Room Ceiling"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-900 font-medium">Damage Type</Label>
            <Input 
              value={area.damage_type || ''}
              onChange={(e) => updateArea(index, { ...area, damage_type: e.target.value })}
              placeholder="e.g., Water Stain, Crack"
              className="h-11"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label className="text-gray-900 font-medium">Description</Label>
          <Textarea 
            value={area.description || ''}
            onChange={(e) => updateArea(index, { ...area, description: e.target.value })}
            placeholder="Detailed description of the damage in this area..."
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Photos Section */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2 text-gray-900 font-medium">
            <Camera className="w-4 h-4" />
            Area Photos
          </Label>
          
          {/* Photo Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {(area.photos || []).map((photoUrl, photoIdx) => (
              <div key={photoIdx} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
                <img 
                  src={photoUrl} 
                  alt={`Area ${index+1} photo ${photoIdx+1}`} 
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removePhoto(photoIdx)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
            
            {/* Upload Button */}
            <label className="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
              {isUploading ? (
                <div className="text-center">
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin mx-auto mb-1"></div>
                  <span className="text-xs text-gray-600">Uploading</span>
                </div>
              ) : (
                <div className="text-center">
                  <Camera className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  <span className="text-xs text-gray-600 font-medium">Add Photo</span>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handlePhotoUpload} 
                disabled={isUploading} 
              />
            </label>
          </div>
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Damaged Areas</h1>
        <p className="text-gray-600">Document each area of damage with photos and descriptions</p>
      </div>
      
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
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">No damage areas added yet</h3>
            <p className="text-gray-600">Start by adding your first damage area below</p>
          </div>
        )}
      </div>

      {/* Add Button */}
      <Button 
        onClick={addArea} 
        className="btn-clean w-full h-12 bg-gray-900 hover:bg-gray-800 text-white"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Damage Area
      </Button>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
        <Button 
          onClick={onBack} 
          variant="outline" 
          className="btn-clean mobile-touch"
        >
          Back
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!hasValidAreas}
          className="btn-clean mobile-touch bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300"
        >
          Continue to Attachments
        </Button>
      </div>
    </div>
  );
}