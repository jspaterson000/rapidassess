
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Job } from '@/api/entities';
import { ImageIcon, FileText } from 'lucide-react';

export default function Step5_Review({ data, onNext, onBack }) {
  const [job, setJob] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      if(data.job_id) {
        const jobData = await Job.get(data.job_id);
        setJob(jobData);
      }
    };
    fetchJob();
  }, [data.job_id]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-neumorphic-dark mb-2">Review Assessment</h2>
        <p className="text-neumorphic">Please review all information before checking against the policy.</p>
      </div>

      <div className="space-y-6">
        {/* Job & Event Details */}
        <div className="p-4 neumorphic-inset rounded-lg">
          <h3 className="font-semibold text-neumorphic-dark mb-3 border-b border-gray-300 pb-2">Job & Event Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div className="font-medium text-neumorphic">Claim Number:</div>
            <div className="text-neumorphic-dark sm:text-right">{job?.claim_number || '...'}</div>
            
            <div className="font-medium text-neumorphic">Event Type:</div>
            <div className="text-neumorphic-dark sm:text-right">{data.event_details.event_type}</div>
            
            <div className="font-medium text-neumorphic col-span-1 sm:col-span-2 mt-2">Damage Description:</div>
            <div className="text-neumorphic-dark col-span-1 sm:col-span-2">{data.event_details.damage_description}</div>
            
            <div className="font-medium text-neumorphic col-span-1 sm:col-span-2 mt-2">Cause Description:</div>
            <div className="text-neumorphic-dark col-span-1 sm:col-span-2">{data.event_details.cause_description}</div>
          </div>
        </div>

        {/* Damage Areas */}
        <div className="p-4 neumorphic-inset rounded-lg">
          <h3 className="font-semibold text-neumorphic-dark mb-3 border-b border-gray-300 pb-2">Damage Areas</h3>
          <div className="space-y-4">
            {data.damage_areas.map((area, index) => (
              <div key={index} className="p-3 neumorphic rounded-md">
                <p className="font-medium text-neumorphic-dark">{area.area}</p>
                <p className="text-sm text-neumorphic">{area.description}</p>
                <div className="flex gap-2 mt-2">
                  {(area.photos || []).map((photoUrl, pIndex) => (
                    <div key={pIndex} className="w-12 h-12 neumorphic-inset rounded overflow-hidden">
                       <img src={photoUrl} alt="damage" className="w-full h-full object-cover"/>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attachments */}
        <div className="p-4 neumorphic-inset rounded-lg">
          <h3 className="font-semibold text-neumorphic-dark mb-3 border-b border-gray-300 pb-2">Attachments</h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-neumorphic-dark">
              <ImageIcon className="w-5 h-5" />
              <span>{data.photos.length} General Photos</span>
            </div>
            <div className="flex items-center gap-2 text-neumorphic-dark">
              <FileText className="w-5 h-5" />
              <span>{data.documents.length} Documents</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 mt-8">
        <Button onClick={onBack} className="bg-white hover:bg-gray-50 text-slate-700 border border-gray-200 shadow-sm w-full sm:w-auto">
          Back
        </Button>
        <Button onClick={onNext} className="bg-slate-700 hover:bg-slate-800 text-white shadow-sm w-full sm:w-auto">
          Continue to Policy Check
        </Button>
      </div>
    </div>
  );
}
