import React, { useState, useEffect } from 'react';
import { Job } from '@/api/entities';
import { ImageIcon, FileText, Eye, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MobileAssessmentHeader from './MobileAssessmentHeader';
import MobileStepContainer from './MobileStepContainer';

export default function Step5_Review({ assessmentData, onNext, onBack }) {
  const [job, setJob] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      if (assessmentData.job_id) {
        try {
          const jobData = await Job.get(assessmentData.job_id);
          setJob(jobData);
        } catch (error) {
          console.error("Error loading job:", error);
        }
      }
    };
    fetchJob();
  }, [assessmentData.job_id]);

  return (
    <div className="min-h-screen bg-slate-50">
      <MobileAssessmentHeader
        currentStep={4}
        totalSteps={10}
        stepTitle="Review Assessment"
        stepDescription="Check all information"
        estimatedTime={3}
        onBack={onBack}
      />

      <MobileStepContainer
        onNext={onNext}
        onBack={onBack}
        nextLabel="Continue to Policy Check"
      >
        <div className="space-y-6">
          {/* Job Summary */}
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Job Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Claim Number</span>
                  <span className="font-medium text-slate-800">{job?.claim_number || 'Loading...'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Event Type</span>
                  <span className="font-medium text-slate-800 capitalize">
                    {assessmentData.event_details?.event_type?.replace(/_/g, ' ') || 'Not specified'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Customer</span>
                  <span className="font-medium text-slate-800">{job?.customer_name || 'Loading...'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Event Details */}
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Event Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-2">Damage Description</p>
                  <p className="text-base text-slate-800 leading-relaxed">
                    {assessmentData.event_details?.damage_description || 'No description provided'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-2">Cause Description</p>
                  <p className="text-base text-slate-800 leading-relaxed">
                    {assessmentData.event_details?.cause_description || 'No cause specified'}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-500 mb-2">Maintenance Status</p>
                  <Badge variant="outline" className="capitalize">
                    {assessmentData.event_details?.owner_maintenance_status?.replace(/_/g, ' ') || 'Not assessed'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Damage Areas */}
          {assessmentData.damage_areas && assessmentData.damage_areas.length > 0 && (
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">Damage Areas</h3>
                  <Badge variant="secondary" className="bg-orange-50 text-orange-700">
                    {assessmentData.damage_areas.length} area{assessmentData.damage_areas.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                <div className="space-y-4">
                  {assessmentData.damage_areas.map((area, index) => (
                    <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-slate-800">{area.area}</h4>
                        {area.damage_type && (
                          <Badge variant="outline" className="text-xs">
                            {area.damage_type}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{area.description}</p>
                      {area.photos && area.photos.length > 0 && (
                        <div className="flex gap-2">
                          {area.photos.slice(0, 3).map((photoUrl, pIndex) => (
                            <div key={pIndex} className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                              <img src={photoUrl} alt={`${area.area} damage`} className="w-full h-full object-cover"/>
                            </div>
                          ))}
                          {area.photos.length > 3 && (
                            <div className="w-16 h-16 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center">
                              <span className="text-xs text-slate-500">+{area.photos.length - 3}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Attachments Summary */}
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Attachments Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-slate-800">{assessmentData.photos?.length || 0}</p>
                    <p className="text-sm text-slate-500">Photos</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-slate-800">{assessmentData.documents?.length || 0}</p>
                    <p className="text-sm text-slate-500">Documents</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </MobileStepContainer>
    </div>
  );
}