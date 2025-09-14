import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GripVertical, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function JobCard({ job, index }) {
  const priorityColors = {
    low: 'bg-blue-100 text-blue-800 border-blue-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    high: 'bg-orange-100 text-orange-800 border-orange-300',
    urgent: 'bg-red-100 text-red-800 border-red-300',
  };

  const statusColors = {
    new_job: 'bg-slate-100 text-slate-700',
    awaiting_booking: 'bg-blue-100 text-blue-700',
    awaiting_attendance: 'bg-amber-100 text-amber-700',
    assessed: 'bg-emerald-100 text-emerald-700',
    pending_completion: 'bg-orange-100 text-orange-700',
    awaiting_insurer: 'bg-purple-100 text-purple-700',
    completed: 'bg-green-100 text-green-700',
  };

  return (
    <Draggable draggableId={job.id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`p-4 bg-white shadow-sm hover:shadow-md transition-all duration-200 border-l-4 cursor-grab active:cursor-grabbing ${
            snapshot.isDragging ? 'shadow-lg scale-105 rotate-2' : ''
          } ${
            job.priority === 'urgent' ? 'border-red-500' : 
            job.priority === 'high' ? 'border-orange-500' : 
            job.priority === 'medium' ? 'border-yellow-500' :
            'border-slate-300'
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-slate-800 mb-1">{job.claim_number}</p>
              <p className="text-xs text-slate-600 truncate">{job.customer_name}</p>
              <p className="text-xs text-slate-500 truncate mb-2">{job.property_address}</p>
            </div>
            <div {...provided.dragHandleProps} className="flex-shrink-0 ml-2">
              <GripVertical className="w-4 h-4 text-slate-400 hover:text-slate-600 transition-colors" />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1">
              <Badge className={`text-xs px-2 py-0.5 ${priorityColors[job.priority]} border`}>
                {job.priority}
              </Badge>
              <Badge className={`text-xs px-2 py-0.5 ${statusColors[job.status]}`}>
                {job.status.replace(/_/g, ' ')}
              </Badge>
            </div>
            
            {job.appointment_date && (
              <div className="flex items-center gap-1 text-xs text-slate-600 bg-green-50 px-2 py-1 rounded border border-green-200">
                <Calendar className="w-3 h-3 text-green-600" />
                <span>{format(new Date(job.appointment_date), 'MMM d, h:mm a')}</span>
              </div>
            )}
            
            {job.time_assigned && (
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Clock className="w-3 h-3" />
                <span>Assigned {format(new Date(job.time_assigned), 'MMM d')}</span>
              </div>
            )}
          </div>
        </Card>
      )}
    </Draggable>
  );
}