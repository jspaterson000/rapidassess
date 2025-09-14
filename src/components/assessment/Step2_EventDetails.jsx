import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PdsDocument } from '@/api/entities';
import { FileText, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Step2_EventDetails({ eventDetails, pdsDocumentId, updateData, onNext, onBack }) {
  const [pdsDocs, setPdsDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPds = async () => {
      try {
        const docs = await PdsDocument.list();
        setPdsDocs(docs);
      } catch (error) {
        console.error("Failed to load PDS documents:", error);
      } finally {
        setLoading(false);
      }
    };
    loadPds();
  }, []);

  const handleChange = (field, value) => {
    if (field === 'pds_document_id') {
      // Handle PDS document ID separately since it's stored at assessment level
      updateData('pds_document_id', value);
    } else {
      // Handle other event detail fields
      const updatedEventDetails = { ...eventDetails, [field]: value };
      updateData('event_details', updatedEventDetails);
    }
  };

  const isFormValid = () => {
    return (
      pdsDocumentId &&
      eventDetails.event_type &&
      eventDetails.damage_description?.trim() &&
      eventDetails.cause_description?.trim() &&
      eventDetails.owner_maintenance_status
    );
  };
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Event Details</h1>
        <p className="text-gray-600">Describe the cause and nature of the damage</p>
      </div>

      {/* Form Sections */}
      <div className="space-y-6">
        {/* PDS and Event Type */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-gray-900 font-medium">
              <FileText className="w-4 h-4 text-blue-600" />
              PDS Document for Analysis
              {eventDetails.pds_document_id && <CheckCircle2 className="w-4 h-4 text-green-600" />}
            </Label>
            {loading ? (
              <div className="h-11 bg-gray-100 rounded-lg animate-pulse"></div>
            ) : (
              <Select
                value={pdsDocumentId || ''}
                onValueChange={(value) => handleChange('pds_document_id', value)}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select PDS document..." />
                </SelectTrigger>
                <SelectContent>
                   {pdsDocs.map(doc => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.name} ({doc.insurer} v{doc.version})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-gray-900 font-medium">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Event Type
              {eventDetails.event_type && <CheckCircle2 className="w-4 h-4 text-green-600" />}
            </Label>
            <Select
              value={eventDetails.event_type || ''}
              onValueChange={(value) => handleChange('event_type', value)}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="storm">🌪️ Storm</SelectItem>
                <SelectItem value="fire">🔥 Fire</SelectItem>
                <SelectItem value="escape_of_liquid">💧 Escape of Liquid</SelectItem>
                <SelectItem value="impact">💥 Impact</SelectItem>
                <SelectItem value="other">📋 Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Damage Description */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-gray-900 font-medium">
            Description of Damage
            {eventDetails.damage_description?.trim() && <CheckCircle2 className="w-4 h-4 text-green-600" />}
          </Label>
          <Textarea
            value={eventDetails.damage_description || ''}
            onChange={(e) => handleChange('damage_description', e.target.value)}
            placeholder="e.g., Water damage to ceiling and walls in the living room, with visible staining and potential structural damage..."
            rows={4}
            className="resize-none"
          />
        </div>

        {/* Cause Description */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-gray-900 font-medium">
            Cause of Damage
            {eventDetails.cause_description?.trim() && <CheckCircle2 className="w-4 h-4 text-green-600" />}
          </Label>
          <Textarea
            value={eventDetails.cause_description || ''}
            onChange={(e) => handleChange('cause_description', e.target.value)}
            placeholder="e.g., Hole in the roof from fallen tree branch during storm, allowing water ingress for several hours before temporary repairs..."
            rows={4}
            className="resize-none"
          />
        </div>

        {/* Owner Maintenance */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-gray-900 font-medium">
            Was Owner Maintenance Completed Appropriately?
            {eventDetails.owner_maintenance_status && <CheckCircle2 className="w-4 h-4 text-green-600" />}
          </Label>
          <Select
            value={eventDetails.owner_maintenance_status || ''}
            onValueChange={(value) => handleChange('owner_maintenance_status', value)}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select maintenance status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">✅ Yes - Properly maintained</SelectItem>
              <SelectItem value="no">❌ No - Poor maintenance</SelectItem>
              <SelectItem value="partial">🟡 Partial - Some maintenance issues</SelectItem>
              <SelectItem value="na">➖ Not Applicable</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

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
          disabled={!isFormValid()}
          className="btn-clean mobile-touch bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300"
        >
          Continue to Damage Areas
        </Button>
      </div>
    </div>
  );
}