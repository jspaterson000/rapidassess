import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Job } from '@/api/entities';
import { ImageIcon, FileText, ArrowLeft, ArrowRight, CheckCircle, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
    <div className="space-y-6 md:space-y-8 max-w-4xl mx-auto">
      {/* Mobile-Optimized Header */}
      <div className="text-center space-y-4 px-4 md:px-0">
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm md:text-base font-medium">
          <Eye className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden sm:inline">Step 5 of 10 • </span>Review Assessment
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Review Your Assessment</h1>
        <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
          Please review all information before proceeding to policy analysis
        </p>
      </div>

      <div className="space-y-6 px-4 md:px-0">
        {/* Job & Event Details */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-lg md:text-xl">
              <FileText className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              Job & Event Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium text-slate-500 mb-2">Claim Number</p>
                <p className="text-base md:text-lg font-semibold text-slate-800">{job?.claim_number || 'Loading...'}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium text-slate-500 mb-2">Event Type</p>
                <p className="text-base md:text-lg text-slate-800 capitalize">
                  {assessmentData.event_details?.event_type?.replace(/_/g, ' ') || 'Not specified'}
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm font-medium text-slate-500 mb-3">Damage Description</p>
              <p className="text-base text-slate-800 leading-relaxed">
                {assessmentData.event_details?.damage_description || 'No description provided'}
              </p>
            </div>
            
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm font-medium text-slate-500 mb-3">Cause Description</p>
              <p className="text-base text-slate-800 leading-relaxed">
                {assessmentData.event_details?.cause_description || 'No cause specified'}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm font-medium text-slate-500 mb-2">Property Maintenance Status</p>
              <Badge variant="outline" className="capitalize">
                {assessmentData.event_details?.owner_maintenance_status?.replace(/_/g, ' ') || 'Not assessed'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Damage Areas */}
        {assessmentData.damage_areas && assessmentData.damage_areas.length > 0 && (
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg md:text-xl">
                <ImageIcon className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
                Damage Areas
                <Badge variant="secondary" className="bg-orange-50 text-orange-700">
                  {assessmentData.damage_areas.length} area{assessmentData.damage_areas.length !== 1 ? 's' : ''}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {assessmentData.damage_areas.map((area, index) => (
                <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2 mb-3">
                    <h4 className="font-semibold text-slate-800 text-base md:text-lg">{area.area}</h4>
                    {area.damage_type && (
                      <Badge variant="outline" className="text-xs">
                        {area.damage_type}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm md:text-base text-slate-600 mb-4 leading-relaxed">{area.description}</p>
                  {area.photos && area.photos.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {area.photos.map((photoUrl, pIndex) => (
                        <div key={pIndex} className="w-16 h-16 md:w-20 md:h-20 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 hover:border-slate-300 transition-colors">
                          <img src={photoUrl} alt={`${area.area} damage`} className="w-full h-full object-cover"/>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Attachments Summary */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-lg md:text-xl">
              <FileText className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
              Attachments Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-800">{assessmentData.photos?.length || 0}</p>
                  <p className="text-sm text-slate-500">General Photos</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
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
            className="flex-1 h-12 md:h-14 text-base font-medium bg-green-600 hover:bg-green-700 min-w-[44px] flex items-center justify-center gap-2"
          >
            <span>Continue to Policy Check</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}