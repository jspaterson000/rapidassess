import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PdsDocument } from '@/api/entities';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb, FileText, AlertCircle } from 'lucide-react';
import MobileAssessmentHeader from './MobileAssessmentHeader';
import MobileStepContainer from './MobileStepContainer';
import MobileFormField from './MobileFormField';

export default function Step2_EventDetails({ eventDetails, onUpdate, onNext, onBack }) {
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
    onUpdate({ ...eventDetails, [field]: value });
  };

  const isFormValid = () => {
    return (
      eventDetails.event_type &&
      eventDetails.damage_description?.trim() &&
      eventDetails.cause_description?.trim() &&
      eventDetails.owner_maintenance_status
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <MobileAssessmentHeader
        currentStep={1}
        totalSteps={10}
        stepTitle="Event Details"
        stepDescription="Tell us what happened"
        estimatedTime={5}
        onBack={onBack}
      />

      <MobileStepContainer
        onNext={onNext}
        onBack={onBack}
        nextDisabled={!isFormValid()}
        nextLabel="Continue"
        isComplete={isFormValid()}
      >
        <div className="space-y-8">
          {/* Policy Document */}
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <MobileFormField
                label="Policy Document (PDS)"
                helpText="Select the Product Disclosure Statement for coverage analysis"
                completed={!!eventDetails.pds_document_id}
              >
                {loading ? (
                  <div className="h-14 bg-slate-100 rounded-lg animate-pulse"></div>
                ) : (
                  <Select
                    value={eventDetails.pds_document_id || ''}
                    onValueChange={(value) => handleChange('pds_document_id', value)}
                  >
                    <SelectTrigger className="h-14 bg-slate-50 border-slate-200 text-base">
                      <SelectValue placeholder="Choose policy document..." />
                    </SelectTrigger>
                    <SelectContent>
                      {pdsDocs.map(doc => (
                        <SelectItem key={doc.id} value={doc.id}>
                          <div className="py-2">
                            <div className="font-medium">{doc.name}</div>
                            <div className="text-sm text-slate-500">{doc.insurer} • v{doc.version}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </MobileFormField>
            </CardContent>
          </Card>

          {/* Event Type */}
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <MobileFormField
                label="What type of event occurred?"
                required
                completed={!!eventDetails.event_type}
                helpText="Select the primary cause of damage"
              >
                <Select
                  value={eventDetails.event_type || ''}
                  onValueChange={(value) => handleChange('event_type', value)}
                >
                  <SelectTrigger className="h-14 bg-slate-50 border-slate-200 text-base">
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="storm">
                      <div className="flex items-center gap-3 py-2">
                        <span className="text-xl">🌪️</span>
                        <div>
                          <div className="font-medium">Storm</div>
                          <div className="text-sm text-slate-500">Wind, hail, lightning</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="fire">
                      <div className="flex items-center gap-3 py-2">
                        <span className="text-xl">🔥</span>
                        <div>
                          <div className="font-medium">Fire</div>
                          <div className="text-sm text-slate-500">Fire, smoke, explosion</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="escape_of_liquid">
                      <div className="flex items-center gap-3 py-2">
                        <span className="text-xl">💧</span>
                        <div>
                          <div className="font-medium">Water Damage</div>
                          <div className="text-sm text-slate-500">Burst pipes, leaks, flooding</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="impact">
                      <div className="flex items-center gap-3 py-2">
                        <span className="text-xl">💥</span>
                        <div>
                          <div className="font-medium">Impact</div>
                          <div className="text-sm text-slate-500">Vehicle, falling objects</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="other">
                      <div className="flex items-center gap-3 py-2">
                        <span className="text-xl">📋</span>
                        <div>
                          <div className="font-medium">Other</div>
                          <div className="text-sm text-slate-500">Specify in description</div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </MobileFormField>
            </CardContent>
          </Card>

          {/* Damage Description */}
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <MobileFormField
                label="What damage can you see?"
                required
                completed={!!eventDetails.damage_description?.trim()}
                helpText="Describe visible damage - be specific about locations and extent"
              >
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Writing tip:</p>
                      <p>Describe what you can see - water stains, cracks, missing materials, etc.</p>
                    </div>
                  </div>
                  <Textarea
                    value={eventDetails.damage_description || ''}
                    onChange={(e) => handleChange('damage_description', e.target.value)}
                    placeholder="Example: Water damage to ceiling and walls in living room, with visible brown staining across approximately 3m² of ceiling plaster..."
                    rows={5}
                    className="resize-none bg-slate-50 border-slate-200 text-base min-h-[120px]"
                  />
                  <div className="text-right text-sm text-slate-500">
                    {eventDetails.damage_description?.length || 0} characters
                  </div>
                </div>
              </MobileFormField>
            </CardContent>
          </Card>

          {/* Cause Description */}
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <MobileFormField
                label="How did this damage occur?"
                required
                completed={!!eventDetails.cause_description?.trim()}
                helpText="Explain the sequence of events that led to the damage"
              >
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium mb-1">Investigation tip:</p>
                      <p>Include timeline, weather conditions, and contributing factors.</p>
                    </div>
                  </div>
                  <Textarea
                    value={eventDetails.cause_description || ''}
                    onChange={(e) => handleChange('cause_description', e.target.value)}
                    placeholder="Example: During the storm on [date], a large tree branch fell onto the roof creating a hole. Rain entered for several hours..."
                    rows={5}
                    className="resize-none bg-slate-50 border-slate-200 text-base min-h-[120px]"
                  />
                  <div className="text-right text-sm text-slate-500">
                    {eventDetails.cause_description?.length || 0} characters
                  </div>
                </div>
              </MobileFormField>
            </CardContent>
          </Card>

          {/* Maintenance Status */}
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <MobileFormField
                label="Property maintenance status"
                required
                completed={!!eventDetails.owner_maintenance_status}
                helpText="This affects policy coverage - assess overall property condition"
              >
                <Select
                  value={eventDetails.owner_maintenance_status || ''}
                  onValueChange={(value) => handleChange('owner_maintenance_status', value)}
                >
                  <SelectTrigger className="h-14 bg-slate-50 border-slate-200 text-base">
                    <SelectValue placeholder="Assess maintenance standard" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">
                      <div className="flex items-center gap-3 py-2">
                        <span className="text-xl">✅</span>
                        <div>
                          <div className="font-medium">Well Maintained</div>
                          <div className="text-sm text-slate-500">Good care and upkeep</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="partial">
                      <div className="flex items-center gap-3 py-2">
                        <span className="text-xl">🟡</span>
                        <div>
                          <div className="font-medium">Some Issues</div>
                          <div className="text-sm text-slate-500">Minor maintenance problems</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="no">
                      <div className="flex items-center gap-3 py-2">
                        <span className="text-xl">❌</span>
                        <div>
                          <div className="font-medium">Poor Maintenance</div>
                          <div className="text-sm text-slate-500">Significant neglect</div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </MobileFormField>
            </CardContent>
          </Card>

          {/* Form Validation Summary */}
          {!isFormValid() && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800 mb-2">Complete these fields:</h4>
                    <ul className="space-y-1 text-sm text-amber-700">
                      {!eventDetails.event_type && <li>• Select event type</li>}
                      {!eventDetails.damage_description?.trim() && <li>• Describe the damage</li>}
                      {!eventDetails.cause_description?.trim() && <li>• Explain how damage occurred</li>}
                      {!eventDetails.owner_maintenance_status && <li>• Assess maintenance status</li>}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </MobileStepContainer>
    </div>
  );
}