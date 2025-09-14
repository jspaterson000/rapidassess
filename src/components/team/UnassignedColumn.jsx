import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import JobCard from './JobCard';
import { Inbox } from 'lucide-react';

export default function UnassignedColumn({ column }) {
  return (
    <div className="w-80 flex-shrink-0 bg-white rounded-xl shadow-sm border border-slate-200/80 flex flex-col">
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <Inbox className="w-5 h-5 text-slate-500" />
          <h3 className="font-semibold text-slate-800">Unassigned Jobs</h3>
        </div>
      </div>
      <Droppable droppableId="unassigned">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-4 space-y-3 overflow-y-auto transition-colors duration-200 ${
              snapshot.isDraggingOver ? 'bg-red-50' : 'bg-slate-50/70'
            }`}
          >
            {column?.jobs?.map((job, index) => (
              <JobCard key={job.id} job={job} index={index} />
            ))}
            {provided.placeholder}
            {!column?.jobs?.length && !snapshot.isDraggingOver && (
              <div className="text-center py-10 text-sm text-slate-400">
                No unassigned jobs
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}