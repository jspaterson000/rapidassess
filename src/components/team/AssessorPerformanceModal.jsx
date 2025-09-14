import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Assessment } from '@/api/entities';
import { Job } from '@/api/entities';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Calendar,
  MapPin,
  Briefcase,
  Activity,
  Target
} from 'lucide-react';
import { format, subDays, isWithinInterval } from 'date-fns';

export default function AssessorPerformanceModal({ open, onClose, assessor }) {
  const [assessments, setAssessments] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadPerformanceData = useCallback(async () => {
    if (!assessor) return;
    
    setLoading(true);
    try {
      const [assessmentsData, jobsData] = await Promise.all([
        Assessment.filter({ assessor_id: assessor.id }),
        Job.filter({ assigned_to: assessor.id })
      ]);
      
      setAssessments(assessmentsData);
      setJobs(jobsData);
    } catch (error) {
      console.error("Error loading performance data:", error);
    } finally {
      setLoading(false);
    }
  }, [assessor]);

  useEffect(() => {
    if (open && assessor) {
      loadPerformanceData();
    }
  }, [open, assessor, loadPerformanceData]);

  if (!assessor) return null;

  // Calculate metrics
  const now = new Date();
  const last7Days = subDays(now, 7);
  const last30Days = subDays(now, 30);

  const recentAssessments = assessments.filter(a => 
    isWithinInterval(new Date(a.assessment_date), { start: last30Days, end: now })
  );
  const last7DaysAssessments = assessments.filter(a =>
    isWithinInterval(new Date(a.assessment_date), { start: last7Days, end: now })
  );

  const completedAssessments = recentAssessments.filter(a => a.status === 'completed').length;
  const totalAssessments = recentAssessments.length;
  const completionRate = totalAssessments > 0 ? (completedAssessments / totalAssessments * 100).toFixed(1) : '0';

  const activeJobs = jobs.filter(j => !['completed', 'archived'].includes(j.status));
  const recentJobs = jobs.slice(0, 5); // Last 5 jobs

  const getStatusColor = (status) => {
    const colors = {
      new_job: 'bg-slate-100 text-slate-700',
      awaiting_booking: 'bg-blue-100 text-blue-700',
      awaiting_attendance: 'bg-amber-100 text-amber-700',
      assessed: 'bg-emerald-100 text-emerald-700',
      pending_completion: 'bg-orange-100 text-orange-700',
      awaiting_insurer: 'bg-purple-100 text-purple-700',
      completed: 'bg-green-100 text-green-700',
      on_hold: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-slate-100 text-slate-600';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center">
              <span className="font-semibold text-slate-700">{assessor.full_name.charAt(0)}</span>
            </div>
            <div>
              <span className="text-xl">{assessor.full_name}</span>
              <p className="text-sm text-slate-500 font-normal">{assessor.email}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto mb-4"></div>
              <p className="text-slate-500">Loading performance data...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold text-slate-800">{completedAssessments}</p>
                      <p className="text-xs text-slate-500">Completed (30d)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold text-slate-800">{completionRate}%</p>
                      <p className="text-xs text-slate-500">Completion Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="text-2xl font-bold text-slate-800">{last7DaysAssessments.length}</p>
                      <p className="text-xs text-slate-500">This Week</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold text-slate-800">{activeJobs.length}</p>
                      <p className="text-xs text-slate-500">Active Jobs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Jobs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="w-5 h-5" />
                  Recent Jobs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentJobs.length > 0 ? recentJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-semibold text-slate-800">{job.claim_number}</p>
                        <Badge className={`text-xs ${getStatusColor(job.status)}`}>
                          {job.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">{job.customer_name}</p>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{job.property_address}</span>
                      </div>
                    </div>
                    <div className="text-right text-xs text-slate-500">
                      {job.appointment_date ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(job.appointment_date), 'MMM d, h:mm a')}
                        </div>
                      ) : (
                        <span>Not scheduled</span>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-slate-500">
                    <Briefcase className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>No recent jobs found</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Assessments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle2 className="w-5 h-5" />
                  Recent Assessments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentAssessments.length > 0 ? recentAssessments.slice(0, 5).map((assessment) => {
                  const job = jobs.find(j => j.id === assessment.job_id);
                  return (
                    <div key={assessment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-semibold text-slate-800">{job?.claim_number || 'Unknown Job'}</p>
                          <Badge className={`text-xs ${
                            assessment.status === 'completed' ? 'bg-green-100 text-green-700' :
                            assessment.status === 'pending_review' ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {assessment.status.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">{job?.customer_name || 'Unknown Customer'}</p>
                      </div>
                      <div className="text-right text-xs text-slate-500">
                        {format(new Date(assessment.assessment_date), 'MMM d, yyyy')}
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center py-8 text-slate-500">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>No recent assessments found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}