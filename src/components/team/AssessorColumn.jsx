import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import JobCard from './JobCard';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  BarChart3, 
  Clock,
  CheckCircle2,
  Calendar,
  Phone
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import AssessorPerformanceModal from './AssessorPerformanceModal';

export default function AssessorColumn({ assessor, column, jobsToday, company }) {
  const [showPerformance, setShowPerformance] = useState(false);
  const maxJobs = company?.max_assessments_per_day || 5;
  const progress = (jobsToday / maxJobs) * 100;

  // Get current status based on jobs
  const getCurrentStatus = () => {
    if (!column?.jobs?.length) return { status: 'Available', color: 'bg-green-100 text-green-700' };
    
    const todayJobs = column.jobs.filter(job => {
      if (job.appointment_date) {
        const apptDate = new Date(job.appointment_date);
        const today = new Date();
        return apptDate.toDateString() === today.toDateString();
      }
      return false;
    });

    if (todayJobs.length > 0) {
      const currentTime = new Date();
      const currentJob = todayJobs.find(job => {
        const apptTime = new Date(job.appointment_date);
        const timeDiff = Math.abs(currentTime - apptTime) / (1000 * 60); // minutes
        return timeDiff <= 120; // Within 2 hours
      });

      if (currentJob) {
        return { 
          status: 'On Assessment', 
          color: 'bg-blue-100 text-blue-700',
          location: currentJob.property_address
        };
      }
    }

    if (jobsToday >= maxJobs) {
      return { status: 'At Capacity', color: 'bg-amber-100 text-amber-700' };
    }

    return { status: 'Available', color: 'bg-green-100 text-green-700' };
  };

  const currentStatus = getCurrentStatus();

  return (
    <>
      <div className="w-80 flex-shrink-0 bg-white rounded-xl shadow-sm border border-slate-200/80 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center">
              <span className="font-semibold text-slate-700">{assessor.full_name.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-800 truncate">{assessor.full_name}</h3>
              <p className="text-xs text-slate-500 truncate">{assessor.email}</p>
            </div>
          </div>

          {/* Current Status */}
          <div className="mb-3">
            <Badge className={`text-xs font-medium ${currentStatus.color} mb-2`}>
              {currentStatus.status}
            </Badge>
            {currentStatus.location && (
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{currentStatus.location}</span>
              </div>
            )}
            {assessor.base_location && !currentStatus.location && (
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <MapPin className="w-3 h-3" />
                <span className="truncate">Base: {assessor.base_location}</span>
              </div>
            )}
          </div>

          {/* Contact Info */}
          {assessor.phone && (
            <div className="flex items-center gap-2 text-xs text-slate-600 mb-3">
              <Phone className="w-3 h-3" />
              <span>{assessor.phone}</span>
            </div>
          )}

          {/* Daily Capacity */}
          <div className="mb-3">
            <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
              <span>Daily Capacity</span>
              <span>{jobsToday}/{maxJobs}</span>
            </div>
            <Progress 
              value={progress} 
              className="h-2" 
              style={{
                background: progress >= 100 ? '#fef3c7' : progress >= 80 ? '#fef9c3' : '#f1f5f9'
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPerformance(true)}
              className="w-full text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-colors"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              View Performance
            </Button>
          </div>
        </div>

        {/* Jobs List */}
        <Droppable droppableId={assessor.id}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`flex-1 p-4 space-y-3 overflow-y-auto min-h-32 transition-colors duration-200 ${
                snapshot.isDraggingOver ? 'bg-green-50' : 'bg-slate-50/70'
              }`}
            >
              {column?.jobs?.map((job, index) => (
                <JobCard key={job.id} job={job} index={index} />
              ))}
              {provided.placeholder}
              {!column?.jobs?.length && !snapshot.isDraggingOver && (
                <div className="text-center py-10 text-sm text-slate-400">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  No jobs assigned
                </div>
              )}
              {snapshot.isDraggingOver && (
                <div className="text-center py-6 text-sm text-green-600 border-2 border-dashed border-green-300 rounded-lg bg-green-50/50">
                  Drop job here to assign
                </div>
              )}
            </div>
          )}
        </Droppable>
      </div>

      {/* Performance Modal */}
      <AssessorPerformanceModal
        open={showPerformance}
        onClose={() => setShowPerformance(false)}
        assessor={assessor}
      />
    </>
  );
}