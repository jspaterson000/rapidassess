import React, { useState, useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import AssessorColumn from './AssessorColumn';
import UnassignedColumn from './UnassignedColumn';
import { Job } from '@/api/entities';
import { Assessment } from '@/api/entities';

export default function TeamWorkflowBoard({ assessors, initialJobs, company }) {
  const [columns, setColumns] = useState({});
  const [assessmentsToday, setAssessmentsToday] = useState({});

  useEffect(() => {
    const fetchAssessments = async () => {
      const today = new Date().toISOString().split('T')[0];
      const assessments = await Assessment.filter({ 
        assessment_date: { 
          $gte: `${today}T00:00:00.000Z`, 
          $lt: `${today}T23:59:59.999Z` 
        } 
      });
      
      const counts = assessors.reduce((acc, assessor) => {
        acc[assessor.id] = assessments.filter(a => a.assessor_id === assessor.id).length;
        return acc;
      }, {});
      setAssessmentsToday(counts);
    };
    fetchAssessments();
  }, [assessors]);

  useEffect(() => {
    const unassigned = initialJobs.filter(job => !job.assigned_to);
    const newColumns = {
      unassigned: {
        id: 'unassigned',
        title: 'Unassigned Jobs',
        jobs: unassigned,
      },
    };

    assessors.forEach(assessor => {
      newColumns[assessor.id] = {
        id: assessor.id,
        title: assessor.full_name,
        jobs: initialJobs.filter(job => job.assigned_to === assessor.id),
      };
    });

    setColumns(newColumns);
  }, [initialJobs, assessors]);

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const startCol = columns[source.droppableId];
    const endCol = columns[destination.droppableId];
    const jobToMove = startCol.jobs.find(j => j.id === draggableId);

    // Optimistic UI update
    const newStartJobs = Array.from(startCol.jobs);
    newStartJobs.splice(source.index, 1);
    
    const newEndJobs = Array.from(endCol.jobs);
    newEndJobs.splice(destination.index, 0, jobToMove);

    setColumns(prev => ({
      ...prev,
      [startCol.id]: { ...startCol, jobs: newStartJobs },
      [endCol.id]: { ...endCol, jobs: newEndJobs },
    }));

    // API Call
    try {
      const newAssignedTo = destination.droppableId === 'unassigned' ? null : destination.droppableId;
      await Job.update(draggableId, { 
        assigned_to: newAssignedTo,
        time_assigned: newAssignedTo ? new Date().toISOString() : null,
        status: newAssignedTo ? 'awaiting_booking' : 'new_job',
      });
    } catch (error) {
      console.error("Failed to update job assignment:", error);
      // Revert on error
      setColumns(prev => ({
        ...prev,
        [startCol.id]: startCol,
        [endCol.id]: endCol,
      }));
      alert("Failed to move job. Please try again.");
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
        <UnassignedColumn column={columns.unassigned} />
        <div className="flex gap-6">
          {assessors.map(assessor => (
            <AssessorColumn 
              key={assessor.id} 
              assessor={assessor} 
              column={columns[assessor.id]}
              jobsToday={assessmentsToday[assessor.id] || 0}
              company={company}
            />
          ))}
        </div>
      </div>
    </DragDropContext>
  );
}