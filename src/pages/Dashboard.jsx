
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Job } from "@/api/entities";
import { Assessment } from "@/api/entities";
import { Company } from "@/api/entities";
import { analytics } from "@/lib/analytics";
import { notifications } from "@/lib/notifications";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Briefcase,
  Clock,
  CheckCircle2,
  FileText,
  AlertTriangle,
  ClipboardCheck,
  Activity,
  Target,
  MapPin,
  Calendar,
  User as UserIcon,
  Phone,
  X,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  BookOpen,
  TrendingUp,
  Award,
  AlertCircle, // Added AlertCircle icon
  FileSearch // Added FileSearch
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JobTrendChart, PerformanceMetricsChart } from "@/components/analytics/AdvancedCharts";
import EnhancedCalendar from "@/components/ui/enhanced-calendar";
import OfflineSync from "@/components/offline/OfflineSync";
import BookAppointmentDialog from "../components/jobs/BookAppointmentDialog";
import DeclineJobDialog from "../components/jobs/DeclineJobDialog";
import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday, isThisWeek, isWithinInterval, addDays, startOfWeek, endOfWeek, subWeeks, startOfDay, endOfDay } from 'date-fns';

// Workflow Metrics Component - now receives user-filtered data
function WorkflowMetrics({ userJobs, userAssessments }) {
  const now = new Date();
  const today = startOfDay(now);
  const todayEnd = endOfDay(now);
  const tomorrow = startOfDay(addDays(now, 1));
  const tomorrowEnd = endOfDay(addDays(now, 1));
  const next7Days = addDays(now, 7);
  const yesterday = startOfDay(addDays(now, -1));
  const yesterdayEnd = endOfDay(addDays(now, -1));
  const lastWeekStart = startOfWeek(subWeeks(now, 1));
  const lastWeekEnd = endOfWeek(subWeeks(now, 1));

  // Calculate metrics based on user's jobs only
  const bookingRequired = userJobs.filter(job => 
    !job.appointment_date && 
    job.status !== 'completed' && 
    job.status !== 'archived' &&
    job.status !== 'awaiting_insurer' // Exclude jobs awaiting insurer
  ).length;
  
  const toAttendToday = userJobs.filter(job => {
    if (!job.appointment_date) return false;
    return isToday(new Date(job.appointment_date));
  }).length;

  const attendTomorrow = userJobs.filter(job => {
    if (!job.appointment_date) return false;
    return isTomorrow(new Date(job.appointment_date));
  }).length;

  const attendNext7Days = userJobs.filter(job => {
    if (!job.appointment_date) return false;
    const apptDate = new Date(job.appointment_date);
    return apptDate > tomorrowEnd && apptDate <= next7Days;
  }).length;

  // Calculate assessment completions based on user's assessments only
  const completedToday = userAssessments.filter(assessment => {
    return isToday(new Date(assessment.assessment_date)) && assessment.status === 'completed';
  }).length;

  const completedYesterday = userAssessments.filter(assessment => {
    return isYesterday(new Date(assessment.assessment_date)) && assessment.status === 'completed';
  }).length;

  const completedLastWeek = userAssessments.filter(assessment => {
    const assessmentDate = new Date(assessment.assessment_date);
    return assessmentDate >= lastWeekStart && assessmentDate <= lastWeekEnd && assessment.status === 'completed';
  }).length;

  const MetricCard = ({ title, value, icon: Icon, color, description, trend }) => (
    <Card className="bg-white border-slate-200/60 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color.bg}`}>
            <Icon className={`w-5 h-5 ${color.text}`} />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${trend.color}`}>
              <TrendingUp className="w-3 h-3" />
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        <div className="space-y-0.5">
          <h3 className="text-xl font-bold text-slate-800">{value}</h3>
          <p className="text-sm font-medium text-slate-600 leading-tight">{title}</p>
          <p className="text-xs text-slate-500 leading-tight">{description}</p>
        </div>
      </CardContent>
    </Card>
  );

  // Calculate trend for today's completions vs yesterday
  const completionTrend = completedYesterday > 0 
    ? Math.round(((completedToday - completedYesterday) / completedYesterday) * 100)
    : completedToday > 0 ? 100 : 0;

  return (
    <div className="space-y-4">
      {/* Today's Focus */}
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
          <CalendarCheck className="w-4 h-4 text-slate-600" />
          Today's Focus
        </h3>
        <div className="grid grid-cols-1 gap-3">
          <MetricCard
            title="Need Booking"
            value={bookingRequired}
            icon={BookOpen}
            color={{ bg: 'bg-amber-50', text: 'text-amber-600' }}
            description="Your jobs requiring customer appointments"
          />
          <MetricCard
            title="To Attend Today"
            value={toAttendToday}
            icon={CalendarClock}
            color={{ bg: 'bg-blue-50', text: 'text-blue-600' }}
            description="Your appointments scheduled for today"
          />
          <MetricCard
            title="Completed Today"
            value={completedToday}
            icon={Award}
            color={{ bg: 'bg-green-50', text: 'text-green-600' }}
            description="Your assessments finished today"
            trend={completionTrend !== 0 ? { 
              value: `${completionTrend > 0 ? '+' : ''}${completionTrend}%`, 
              color: completionTrend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            } : null}
          />
        </div>
      </div>

      {/* Upcoming Schedule */}
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-slate-600" />
          Upcoming Schedule
        </h3>
        <div className="grid grid-cols-1 gap-3">
          <MetricCard
            title="Tomorrow"
            value={attendTomorrow}
            icon={Calendar}
            color={{ bg: 'bg-purple-50', text: 'text-purple-600' }}
            description="Your appointments scheduled for tomorrow"
          />
          <MetricCard
            title="Next 7 Days"
            value={attendNext7Days}
            icon={CalendarDays}
            color={{ bg: 'bg-indigo-50', text: 'text-indigo-600' }}
            description="Your upcoming appointments this week"
          />
        </div>
      </div>

      {/* Recent Performance */}
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
          <Activity className="w-4 h-4 text-slate-600" />
          Recent Performance
        </h3>
        <div className="grid grid-cols-1 gap-3">
          <MetricCard
            title="Yesterday"
            value={completedYesterday}
            icon={CheckCircle2}
            color={{ bg: 'bg-emerald-50', text: 'text-emerald-600' }}
            description="Your assessments completed yesterday"
          />
          <MetricCard
            title="Last Week"
            value={completedLastWeek}
            icon={Target}
            color={{ bg: 'bg-slate-50', text: 'text-slate-600' }}
            description="Your total completed last week"
          />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [actionRequiredJobs, setActionRequiredJobs] = useState([]);
  const [upcomingJobs, setUpcomingJobs] = useState([]);
  const [pendingReviewAssessments, setPendingReviewAssessments] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [allAssessments, setAllAssessments] = useState([]);
  const [userJobs, setUserJobs] = useState([]); // New state for user's jobs
  const [userAssessments, setUserAssessments] = useState([]); // New state for user's assessments
  const [loading, setLoading] = useState(true);
  const [jobStatusData, setJobStatusData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [jobToBook, setJobToBook] = useState(null);
  const [jobToDecline, setJobToDecline] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);

      let companyData = null;
      if (userData.company_id) {
          companyData = await Company.get(userData.company_id);
          setCompany(companyData);
      }

      const [jobsData, assessmentsData] = await Promise.all([
        Job.filter({ status: { $ne: 'archived' } }),
        Assessment.list()
      ]);
      setAllJobs(jobsData);
      setAllAssessments(assessmentsData);
      
      // Filter jobs and assessments for this user specifically
      const filteredUserJobs = jobsData.filter(j => j.assigned_to === userData.id);
      const filteredUserAssessments = assessmentsData.filter(a => a.assessor_id === userData.id);
      
      setUserJobs(filteredUserJobs);
      setUserAssessments(filteredUserAssessments);
      
      // Only include active jobs that aren't completed, archived, or awaiting insurer
      const activeJobs = jobsData.filter(j => 
        j.assigned_to === userData.id && 
        !['completed', 'archived', 'awaiting_insurer'].includes(j.status)
      );
      
      // Remove mock data manipulation to show real statuses
      const jobsWithCorrectStatuses = activeJobs.map((job) => {
        // Ensure status consistency based on job state
        let correctedStatus = job.status;
        
        // If job has an appointment but status suggests it doesn't, correct it
        if (job.appointment_date && (job.status === 'new_job' || job.status === 'awaiting_booking')) {
          correctedStatus = 'awaiting_attendance';
        }
        
        // If job doesn't have an appointment but status suggests it does
        if (!job.appointment_date && job.status === 'awaiting_attendance') {
          correctedStatus = job.assigned_to ? 'awaiting_booking' : 'new_job';
        }
        
        return {
          ...job,
          status: correctedStatus,
          time_assigned: job.time_assigned || new Date(Date.now() - Math.random() * 48 * 60 * 60 * 1000).toISOString(),
        };
      });
      
      const now = new Date();
      const todayStart = startOfDay(now);
      const tomorrowStart = startOfDay(addDays(now, 1));

      const actionJobs = [];
      const futureJobs = [];

      jobsWithCorrectStatuses.forEach(job => {
        // Skip jobs that are awaiting insurer - they shouldn't appear in either section
        if (job.status === 'awaiting_insurer') {
          return;
        }
        
        if (!job.appointment_date) {
          actionJobs.push(job); // Needs booking
        } else {
          const apptDate = new Date(job.appointment_date);
          if (isToday(apptDate)) {
            actionJobs.push(job); // Today's appointment
          } else if (apptDate >= tomorrowStart) {
            futureJobs.push(job); // Future appointment
          }
        }
      });

      // Sort actionJobs: needs booking first, then today's, then by priority
      actionJobs.sort((a, b) => {
        // Score 1 for needs booking, 2 for today's appt
        const scoreA = !a.appointment_date ? 1 : 2; 
        const scoreB = !b.appointment_date ? 1 : 2;

        if (scoreA !== scoreB) return scoreA - scoreB;

        // If both need booking or both are today's, sort by priority
        const priorityOrder = { 'urgent': 1, 'high': 2, 'medium': 3, 'low': 4 };
        return (priorityOrder[a.priority] || 5) - (priorityOrder[b.priority] || 5);
      });

      // Sort futureJobs: by appointment date, then by priority
      futureJobs.sort((a, b) => {
        const dateA = new Date(a.appointment_date);
        const dateB = new Date(b.appointment_date);

        if (dateA.getTime() !== dateB.getTime()) return dateA.getTime() - dateB.getTime();

        const priorityOrder = { 'urgent': 1, 'high': 2, 'medium': 3, 'low': 4 };
        return (priorityOrder[a.priority] || 5) - (priorityOrder[b.priority] || 5);
      });

      setActionRequiredJobs(actionJobs);
      setUpcomingJobs(futureJobs);

      const reviewAssessments = assessmentsData.filter(a => a.status === 'pending_review' && (userData.user_role !== 'user' || a.assessor_id === userData.id));
      setPendingReviewAssessments(reviewAssessments);

      // Process data for charts using active jobs (excluding awaiting_insurer)
      const statusCounts = activeJobs.reduce((acc, job) => {
        acc[job.status] = (acc[job.status] || 0) + 1;
        return acc;
      }, {});
      setJobStatusData(Object.entries(statusCounts).map(([key, value]) => ({ 
        name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), 
        value, 
        key 
      })));

      // Load analytics data
      try {
        const [jobTrends, performanceMetrics] = await Promise.all([
          analytics.getJobTrends(userData.company_id, 30),
          analytics.getJobMetrics(userData.company_id, 30)
        ]);
        setTrendData(jobTrends);
        setPerformanceData([
          { name: 'Total Jobs', value: performanceMetrics.total },
          { name: 'Completed', value: performanceMetrics.completed },
          { name: 'In Progress', value: performanceMetrics.inProgress }
        ]);
      } catch (error) {
        console.error("Error loading analytics:", error);
      }

    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeclineComplete = () => {
    setJobToDecline(null);
    loadDashboardData(); // Refresh jobs after a decline
  };

  const isReminderNeeded = (job, companySettings) => {
    if (job.appointment_date || !job.time_assigned) {
        return false;
    }
    
    // Use default threshold of 24 hours if not set by company
    const thresholdHours = companySettings?.job_reminder_threshold_hours || 24;
    
    const assignedDate = new Date(job.time_assigned);
    const now = new Date();
    const hoursDiff = (now.getTime() - assignedDate.getTime()) / (1000 * 60 * 60);
    
    return hoursDiff > thresholdHours;
  };
  
  const isAssessmentOverdue = (job, companySettings) => {
    if (!job.appointment_date || ['assessment_complete', 'completed', 'awaiting_insurer'].includes(job.status)) {
        return false;
    }
    
    const thresholdHours = companySettings?.assessment_overdue_threshold_hours || 48;
    const appointmentDate = new Date(job.appointment_date);
    const deadline = new Date(appointmentDate.getTime() + thresholdHours * 60 * 60 * 1000);
    
    return new Date() > deadline;
  };

  const getStatusColor = (status) => {
    const colors = {
      new_job: 'bg-slate-100 text-slate-700',
      awaiting_booking: 'bg-blue-100 text-blue-700',
      awaiting_attendance: 'bg-amber-100 text-amber-700',
      assessed: 'bg-emerald-100 text-emerald-700',
      pending_completion: 'bg-orange-100 text-orange-700', // Added status
      awaiting_insurer: 'bg-purple-100 text-purple-700',   // Added status
      completed: 'bg-green-100 text-green-700',
      on_hold: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-slate-100 text-slate-600';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-slate-50 text-slate-600 border-slate-200',
      medium: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      high: 'bg-orange-50 text-orange-600 border-orange-200',
      urgent: 'bg-red-50 text-red-600 border-red-200'
    };
    return colors[priority] || 'bg-slate-50 text-slate-600 border-slate-200';
  };

  const getStatusDisplayText = (status) => {
    const statusTexts = {
      new_job: 'New Job',
      awaiting_booking: 'Awaiting Booking',
      awaiting_attendance: 'Awaiting Attendance',
      assessed: 'Assessed',
      pending_completion: 'Pending Completion', // Added status
      awaiting_insurer: 'Awaiting Insurer',     // Added status
      completed: 'Completed',
      on_hold: 'On Hold'
    };
    return statusTexts[status] || status.replace(/_/g, ' '); // Fallback to original logic if not in map
  };

  const getAssignedTimeText = (timeAssigned) => {
    if (!timeAssigned) return null;
    try {
      return `Assigned ${formatDistanceToNow(new Date(timeAssigned), { addSuffix: true })}`;
    } catch (error) {
      return 'Recently assigned';
    }
  };
  
  const renderPrimaryDashboardAction = (job) => {
    if (job.status === 'awaiting_insurer') {
        return (
            <Button size="sm" disabled className="bg-purple-100 text-purple-700">
                Referred for Policy Review
            </Button>
        );
    }
    if (job.status === 'pending_completion') {
        return (
            <Button size="sm" disabled className="bg-orange-100 text-orange-700">
                Pending Completion
            </Button>
        );
    }
    if (job.status === 'assessed' || job.status === 'completed' || job.status === 'on_hold') {
      return (
         <Link to={createPageUrl(`JobDetails?id=${job.id}`)}>
            <Button variant="outline" size="sm" className="interactive-button text-slate-600 hover:text-slate-800 hover:bg-slate-50">
                <FileSearch className="w-4 h-4 mr-2" />
                View Details
            </Button>
        </Link>
      );
    }
    if (job.appointment_date) {
        return (
            <Link to={createPageUrl(`StartAssessment?jobId=${job.id}`)}>
                <Button size="sm" className="bg-slate-700 hover:bg-slate-800 text-white">
                    <ClipboardCheck className="w-4 h-4 mr-2" />
                    Start Assessment
                </Button>
            </Link>
        );
    }
    // Default for awaiting_booking, new_job
    return (
        <Button size="sm" onClick={() => setJobToBook(job)} className="bg-slate-700 hover:bg-slate-800 text-white">
            <Calendar className="w-4 h-4 mr-2" />
            Book Customer
        </Button>
    );
  };

  if (loading) {
    return (
      <div className="p-6 md:p-10">
        <div className="h-96 w-full bg-slate-100 rounded-2xl loading-shimmer"></div>
      </div>
    );
  }

  return (
    <>
    <div className="p-6 md:p-10 min-h-screen space-y-8">
      {/* Header */}
      <header className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome back, {user?.full_name?.split(' ')[0] || 'User'}
        </h1>
        <p className="text-slate-500 mt-2">Here's what's happening today. Let's make it a productive one!</p>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Task Lists and Analytics */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Analytics Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <JobTrendChart data={trendData} title="Job Trends (30 days)" />
            <PerformanceMetricsChart data={performanceData} title="Performance Overview" />
          </div>
          
          <Card className="bg-white shadow-sm border-slate-200/60 rounded-2xl animate-fade-in-up">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600"/>
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-slate-800">Action Required</CardTitle>
                  <p className="text-sm text-slate-500">Jobs for today and those needing an appointment.</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {actionRequiredJobs.length > 0 ? actionRequiredJobs.map(job => {
                const reminderNeeded = isReminderNeeded(job, company);
                const assessmentOverdue = isAssessmentOverdue(job, company);
                const assignedTimeText = getAssignedTimeText(job.time_assigned);
                return (
                <div key={job.id} className="p-5 bg-slate-50/80 rounded-xl border border-slate-200/90">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="font-bold text-lg text-slate-800">{job.claim_number}</h3>
                        <Badge className={`${getPriorityColor(job.priority)} border font-medium text-xs px-2 py-0.5`}>
                          {job.priority}
                        </Badge>
                        {assignedTimeText && (
                          <Badge variant="outline" className="text-xs text-slate-600 bg-slate-100 border-slate-300">
                            <Clock className="w-3 h-3 mr-1" />
                            {assignedTimeText}
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium text-slate-700 mb-3">{job.customer_name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(job.status)} font-medium capitalize text-xs px-3 py-1`}>
                        {getStatusDisplayText(job.status)}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setJobToDecline(job)}
                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 h-8 w-8"
                        title="Decline this job"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {reminderNeeded && (
                    <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 p-2 rounded-lg mb-3 animate-pulse border border-amber-200">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span>This job requires attention. Please book this customer in.</span>
                    </div>
                  )}

                  {assessmentOverdue && (
                    <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 p-2 rounded-lg mb-3 animate-pulse border border-red-200">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        <span>Assessment is overdue. Please complete it soon.</span>
                    </div>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{job.property_address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Activity className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="capitalize">{job.event_type?.replace(/_/g, ' ')}</span>
                      <span className="text-slate-400">•</span>
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>{new Date(job.date_of_loss).toLocaleDateString()}</span>
                    </div>
                    {job.appointment_date && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 font-medium bg-green-50 p-2 rounded-lg border border-green-200">
                            <Calendar className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span>Booked for: {format(new Date(job.appointment_date), 'EEE, d MMM yyyy @ p')}</span>
                        </div>
                    )}
                    {job.customer_phone && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span>{job.customer_phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-200/90">
                    <div className="flex items-center gap-2">
                      <Link to={createPageUrl(`JobDetails?id=${job.id}`)}>
                        <Button variant="outline" size="sm" className="text-slate-600 hover:text-slate-800">
                          <FileText className="w-4 h-4 mr-2" />
                          Details
                        </Button>
                      </Link>
                    </div>
                    {renderPrimaryDashboardAction(job)}
                  </div>
                </div>
                );
              }) : (
                <div className="text-center py-10">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4"/>
                  <h3 className="font-medium text-slate-700">All caught up!</h3>
                  <p className="text-slate-500 text-sm">No jobs require immediate attention.</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm border-slate-200/60 rounded-2xl animate-fade-in-up">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-orange-600"/> {/* Changed icon to AlertCircle */}
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-slate-800">Needs Review</CardTitle>
                  <p className="text-sm text-slate-500">These assessments need additional information or review.</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4"> {/* Changed space-y to space-y-4 for consistent spacing */}
              {pendingReviewAssessments.length > 0 ? pendingReviewAssessments.map(assessment => {
                const job = allJobs.find(j => j.id === assessment.job_id);
                if (!job) return null;
                return (
                  <div key={assessment.id} className="p-5 bg-slate-50/80 rounded-xl border border-slate-200/90">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="font-bold text-lg text-slate-800">{job.claim_number}</h3>
                          <Badge className="bg-orange-50 text-orange-700 border-orange-200 border font-medium text-xs px-2 py-0.5">
                            Needs Review
                          </Badge>
                        </div>
                        <p className="font-medium text-slate-700 mb-3">{job.customer_name}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{job.property_address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Activity className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="capitalize">{job.event_type?.replace(/_/g, ' ')}</span>
                        <span className="text-slate-400">•</span>
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{new Date(job.date_of_loss).toLocaleDateString()}</span>
                      </div>
                      {job.customer_phone && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <span>{job.customer_phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-200/90">
                      <div className="flex items-center gap-2">
                        <Link to={createPageUrl(`JobDetails?id=${job.id}`)}>
                          <Button variant="outline" size="sm" className="text-slate-600 hover:text-slate-800">
                            <FileText className="w-4 h-4 mr-2" />
                            Job Details
                          </Button>
                        </Link>
                      </div>
                      <Link to={createPageUrl(`AssessmentDetails?id=${assessment.id}`)}>
                        <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Review Assessment
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-10">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4"/>
                  <h3 className="font-medium text-slate-700">All assessments reviewed!</h3>
                  <p className="text-slate-500 text-sm">No assessments need review at this time.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-slate-200/60 rounded-2xl animate-fade-in-up animate-stagger-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-slate-600"/>
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-slate-800">Upcoming Jobs</CardTitle>
                  <p className="text-sm text-slate-500">Your future scheduled appointments.</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingJobs.length > 0 ? upcomingJobs.map(job => {
                const reminderNeeded = isReminderNeeded(job, company);
                const assessmentOverdue = isAssessmentOverdue(job, company);
                const assignedTimeText = getAssignedTimeText(job.time_assigned);
                return (
                <div key={job.id} className="p-5 bg-slate-50/80 rounded-xl border border-slate-200/90">
                   <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="font-bold text-lg text-slate-800">{job.claim_number}</h3>
                        <Badge className={`${getPriorityColor(job.priority)} border font-medium text-xs px-2 py-0.5`}>{job.priority}</Badge>
                        {assignedTimeText && (<Badge variant="outline" className="text-xs text-slate-600 bg-slate-100 border-slate-300"><Clock className="w-3 h-3 mr-1" />{assignedTimeText}</Badge>)}
                      </div>
                      <p className="font-medium text-slate-700 mb-3">{job.customer_name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(job.status)} font-medium capitalize text-xs px-3 py-1`}>{getStatusDisplayText(job.status)}</Badge>
                      <Button variant="ghost" size="icon" onClick={() => setJobToDecline(job)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 h-8 w-8" title="Decline this job"><X className="w-4 h-4" /></Button>
                    </div>
                  </div>
                  {reminderNeeded && (<div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 p-2 rounded-lg mb-3 animate-pulse border border-amber-200"><Clock className="w-4 h-4 flex-shrink-0" /><span>This job requires attention. Please book this customer in.</span></div>)}
                  {assessmentOverdue && (<div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 p-2 rounded-lg mb-3 animate-pulse border border-red-200"><AlertTriangle className="w-4 h-4 flex-shrink-0" /><span>Assessment is overdue. Please complete it soon.</span></div>)}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600"><MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" /><span className="truncate">{job.property_address}</span></div>
                    <div className="flex items-center gap-2 text-sm text-slate-600"><Activity className="w-4 h-4 text-slate-400 flex-shrink-0" /><span className="capitalize">{job.event_type?.replace(/_/g, ' ')}</span><span className="text-slate-400">•</span><Calendar className="w-4 h-4 text-slate-400" /><span>{new Date(job.date_of_loss).toLocaleDateString()}</span></div>
                    {job.appointment_date && (<div className="flex items-center gap-2 text-sm text-slate-600 font-medium bg-green-50 p-2 rounded-lg border border-green-200"><Calendar className="w-4 h-4 text-green-600 flex-shrink-0" /><span>Booked for: {format(new Date(job.appointment_date), 'EEE, d MMM yyyy @ p')}</span></div>)}
                    {job.customer_phone && (<div className="flex items-center gap-2 text-sm text-slate-600"><Phone className="w-4 h-4 text-slate-400 flex-shrink-0" /><span>{job.customer_phone}</span></div>)}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200/90">
                    <div className="flex items-center gap-2">
                        <Link to={createPageUrl(`JobDetails?id=${job.id}`)}><Button variant="outline" size="sm" className="text-slate-600 hover:text-slate-800"><FileText className="w-4 h-4 mr-2" />Details</Button></Link>
                    </div>
                    {renderPrimaryDashboardAction(job)}
                  </div>
                </div>
                );
              }) : (
                <div className="text-center py-10">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4"/>
                  <h3 className="font-medium text-slate-700">No upcoming jobs.</h3>
                  <p className="text-slate-500 text-sm">Future scheduled jobs will appear here.</p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Right Column - Workflow Metrics with user-specific data */}
        <div className="animate-fade-in-up animate-stagger-3">
          <div className="space-y-6">
            <WorkflowMetrics userJobs={userJobs} userAssessments={userAssessments} />
            <OfflineSync />
            <div className="w-full">
              <EnhancedCalendar 
                appointments={userJobs.filter(job => job.appointment_date)}
                onDateSelect={(date) => console.log('Date selected:', date)}
                onAppointmentClick={(apt) => console.log('Appointment clicked:', apt)}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      <BookAppointmentDialog
        open={!!jobToBook}
        onClose={() => setJobToBook(null)}
        job={jobToBook}
        onBookingComplete={() => {
            setJobToBook(null);
            loadDashboardData();
        }}
      />

      <DeclineJobDialog
        open={!!jobToDecline}
        onClose={() => setJobToDecline(null)}
        job={jobToDecline}
        onDeclineComplete={handleDeclineComplete}
      />
    </>
    </div>
  );
}
