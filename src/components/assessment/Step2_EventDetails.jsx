import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PdsDocument } from '@/api/entities';
import { FileText, AlertCircle, CheckCircle2, HelpCircle, Lightbulb, ArrowRight, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';

export default function Step2_EventDetails({ eventDetails, onUpdate, onNext, onBack }) {
  const [pdsDocs, setPdsDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completedSections, setCompletedSections] = useState(new Set());

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

  useEffect(() => {
    // Track completed sections for better UX feedback
    const completed = new Set();
    if (eventDetails.event_type) completed.add('event_type');
    if (eventDetails.damage_description?.trim()) completed.add('damage_description');
    if (eventDetails.cause_description?.trim()) completed.add('cause_description');
    if (eventDetails.owner_maintenance_status) completed.add('maintenance');
    if (eventDetails.pds_document_id) completed.add('pds');
    setCompletedSections(completed);
  }, [eventDetails]);

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

  const getCompletionIcon = (sectionKey) => {
    return completedSections.has(sectionKey) ? (
      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
    ) : (
      <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
    );
  };

  const HelpTooltip = ({ content }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className="text-slate-400 hover:text-slate-600 transition-colors p-1">
            <HelpCircle className="w-5 h-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
  
  return (
    <div className="space-y-6 md:space-y-8 max-w-4xl mx-auto">
      {/* Mobile-Optimized Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm md:text-base font-medium">
          <FileText className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden sm:inline">Step 2 of 10 • </span>Event Details
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 px-4">Tell us about the incident</h1>
        <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto px-4">
          Provide details about what happened and the damage that occurred.
        </p>
      </div>

      {/* Mobile-First Progress Indicator */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-6 shadow-sm mx-4 md:mx-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base md:text-lg font-semibold text-slate-800">Section Progress</h3>
          <Badge variant="outline" className="text-slate-600 text-sm">
            {completedSections.size} of 5 completed
          </Badge>
        </div>
        
        <Progress value={(completedSections.size / 5) * 100} className="h-2 md:h-3 mb-4" />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { key: 'pds', label: 'PDS Document' },
            { key: 'event_type', label: 'Event Type' },
            { key: 'damage_description', label: 'Damage Details' },
            { key: 'cause_description', label: 'Cause Details' },
            { key: 'maintenance', label: 'Maintenance' }
          ].map(section => (
            <div key={section.key} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
              {getCompletionIcon(section.key)}
              <span className={`text-sm md:text-base ${completedSections.has(section.key) ? 'text-emerald-600 font-medium' : 'text-slate-500'}`}>
                {section.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile-Optimized Form Sections */}
      <div className="space-y-6 px-4 md:px-0">
        {/* PDS and Event Type */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg md:text-xl">
              <FileText className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              Policy & Event Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="text-slate-900 font-medium text-base">
                    Policy Document (PDS)
                  </Label>
                  {completedSections.has('pds') && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                  <HelpTooltip content="Select the Product Disclosure Statement that applies to this claim. This helps our AI analyze coverage." />
                </div>
                {loading ? (
                  <div className="h-14 bg-slate-100 rounded-lg animate-pulse"></div>
                ) : (
                  <Select
                    value={eventDetails.pds_document_id || ''}
                    onValueChange={(value) => onUpdate({ ...eventDetails, pds_document_id: value })}
                  >
                    <SelectTrigger className="h-14 bg-slate-50 border-slate-200 hover:border-slate-300 transition-colors text-base">
                      <SelectValue placeholder="Choose the relevant PDS document..." />
                    </SelectTrigger>
                    <SelectContent>
                       {pdsDocs.map(doc => (
                        <SelectItem key={doc.id} value={doc.id}>
                          <div className="flex flex-col py-1">
                            <span className="font-medium text-base">{doc.name}</span>
                            <span className="text-sm text-slate-500">{doc.insurer} • Version {doc.version}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="text-slate-900 font-medium text-base">
                    What type of event occurred? *
                  </Label>
                  {completedSections.has('event_type') && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                  <HelpTooltip content="Select the primary cause of the damage. This affects policy coverage analysis." />
                </div>
                <Select
                  value={eventDetails.event_type || ''}
                  onValueChange={(value) => handleChange('event_type', value)}
                >
                  <SelectTrigger className="h-14 bg-slate-50 border-slate-200 hover:border-slate-300 transition-colors text-base">
                    <SelectValue placeholder="Select the type of incident" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="storm">
                      <div className="flex items-center gap-3 py-2">
                        <span className="text-xl">🌪️</span>
                        <div>
                          <div className="font-medium text-base">Storm</div>
                          <div className="text-sm text-slate-500">Wind, hail, lightning damage</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="fire">
                      <div className="flex items-center gap-3 py-2">
                        <span className="text-xl">🔥</span>
                        <div>
                          <div className="font-medium text-base">Fire</div>
                          <div className="text-sm text-slate-500">Fire, smoke, explosion damage</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="escape_of_liquid">
                      <div className="flex items-center gap-3 py-2">
                        <span className="text-xl">💧</span>
                        <div>
                          <div className="font-medium text-base">Water Damage</div>
                          <div className="text-sm text-slate-500">Burst pipes, leaks, flooding</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="impact">
                      <div className="flex items-center gap-3 py-2">
                        <span className="text-xl">💥</span>
                        <div>
                          <div className="font-medium text-base">Impact</div>
                          <div className="text-sm text-slate-500">Vehicle, falling objects</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="other">
                      <div className="flex items-center gap-3 py-2">
                        <span className="text-xl">📋</span>
                        <div>
                          <div className="font-medium text-base">Other</div>
                          <div className="text-sm text-slate-500">Specify in description</div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Damage Description */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg md:text-xl">
              <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-amber-600" />
              Damage Description
              {completedSections.has('damage_description') && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm md:text-base text-blue-800">
                <p className="font-medium mb-1">Writing tip:</p>
                <p>Describe what you can see - water stains, cracks, missing materials, etc. Be specific about locations and extent of damage.</p>
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-slate-900 font-medium text-base">
                What damage can you observe? *
              </Label>
              <Textarea
                value={eventDetails.damage_description || ''}
                onChange={(e) => handleChange('damage_description', e.target.value)}
                placeholder="Example: Water damage to ceiling and walls in the living room, with visible brown staining across approximately 3m² of ceiling plaster. Some plaster is soft to touch and may need replacement..."
                rows={5}
                className="resize-none bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-base min-h-[120px]"
              />
              <div className="flex justify-between items-center text-sm text-slate-500">
                <span>Be as detailed as possible</span>
                <span>{eventDetails.damage_description?.length || 0} characters</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cause Description */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg md:text-xl">
              <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
              Cause Analysis
              {completedSections.has('cause_description') && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm md:text-base text-amber-800">
                <p className="font-medium mb-1">Investigation tip:</p>
                <p>Explain how the damage occurred. Include timeline, weather conditions, and any contributing factors you can identify.</p>
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-slate-900 font-medium text-base">
                How did this damage occur? *
              </Label>
              <Textarea
                value={eventDetails.cause_description || ''}
                onChange={(e) => handleChange('cause_description', e.target.value)}
                placeholder="Example: During the storm on [date], a large tree branch fell onto the roof creating a hole approximately 1m in diameter. Rain entered through this opening for several hours before temporary repairs could be made..."
                rows={5}
                className="resize-none bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-base min-h-[120px]"
              />
              <div className="flex justify-between items-center text-sm text-slate-500">
                <span>Include timeline and contributing factors</span>
                <span>{eventDetails.cause_description?.length || 0} characters</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Owner Maintenance */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg md:text-xl">
              <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
              Property Maintenance Assessment
              {completedSections.has('maintenance') && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <Lightbulb className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm md:text-base text-green-800">
                <p className="font-medium mb-1">Assessment guide:</p>
                <p>Consider the overall condition of the property. Look for signs of neglect, deferred maintenance, or proper upkeep.</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label className="text-slate-900 font-medium text-base">
                  Was the property properly maintained? *
                </Label>
                <HelpTooltip content="This affects policy coverage. Poor maintenance may impact claim eligibility." />
              </div>
              <Select
                value={eventDetails.owner_maintenance_status || ''}
                onValueChange={(value) => handleChange('owner_maintenance_status', value)}
              >
                <SelectTrigger className="h-14 bg-slate-50 border-slate-200 hover:border-slate-300 transition-colors text-base">
                  <SelectValue placeholder="Assess the property maintenance standard" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">
                    <div className="flex items-center gap-3 py-2">
                      <span className="text-xl">✅</span>
                      <div>
                        <div className="font-medium text-base">Yes - Well Maintained</div>
                        <div className="text-sm text-slate-500">Property shows good care and upkeep</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="partial">
                    <div className="flex items-center gap-3 py-2">
                      <span className="text-xl">🟡</span>
                      <div>
                        <div className="font-medium text-base">Partial - Some Issues</div>
                        <div className="text-sm text-slate-500">Minor maintenance issues noted</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="no">
                    <div className="flex items-center gap-3 py-2">
                      <span className="text-xl">❌</span>
                      <div>
                        <div className="font-medium text-base">No - Poor Maintenance</div>
                        <div className="text-sm text-slate-500">Significant neglect or deferred maintenance</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="na">
                    <div className="flex items-center gap-3 py-2">
                      <span className="text-xl">➖</span>
                      <div>
                        <div className="font-medium text-base">Not Applicable</div>
                        <div className="text-sm text-slate-500">Cannot assess or not relevant</div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

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
            disabled={!isFormValid()}
            className="flex-1 h-12 md:h-14 text-base font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 min-w-[44px] flex items-center justify-center gap-2"
          >
            <span>Continue to Damage Areas</span>
            <ArrowRight className="w-5 h-5" />
            {isFormValid() && <span className="ml-2">✓</span>}
          </Button>
        </div>
      </div>

      {/* Mobile-Optimized Form Validation Summary */}
      {!isFormValid() && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mx-4 md:mx-0">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800 mb-2 text-base">Complete these required fields:</h4>
              <ul className="space-y-2 text-sm md:text-base text-amber-700">
                {!eventDetails.event_type && <li className="flex items-center gap-2">• Select the event type</li>}
                {!eventDetails.damage_description?.trim() && <li className="flex items-center gap-2">• Describe the damage you can see</li>}
                {!eventDetails.cause_description?.trim() && <li className="flex items-center gap-2">• Explain how the damage occurred</li>}
                {!eventDetails.owner_maintenance_status && <li className="flex items-center gap-2">• Assess property maintenance status</li>}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}