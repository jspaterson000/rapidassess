
import React, { useState, useEffect } from "react";
import { Job } from "@/api/entities";
import { User } from "@/api/entities";
import { auditLogger, AUDIT_ACTIONS } from "@/lib/audit";
import { notifications } from "@/lib/notifications";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import DataTable from "@/components/ui/data-table";
import {
  Plus,
  Search,
  Calendar,
  MapPin,
  User as UserIcon,
  Phone,
  Mail,
  FileText,
  ClipboardCheck,
  Archive,
  Users,
  Clock,
  X,
  FileSearch // Added FileSearch
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import CreateJobDialog from "../components/jobs/CreateJobDialog";
import JobFilters from "../components/jobs/JobFilters";
import AssignJobDialog from "../components/jobs/AssignJobDialog";
import BookAppointmentDialog from "../components/jobs/BookAppointmentDialog";
import DeclineJobDialog from "../components/jobs/DeclineJobDialog";
import { format, formatDistanceToNow } from 'date-fns';

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedJobForAssignment, setSelectedJobForAssignment] = useState(null);
  const [jobToBook, setJobToBook] = useState(null);
  const [jobToDecline, setJobToDecline] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

  useEffect(() => {
    const init = async () => {
        await loadUserAndJobs();
    };
    init();
  }, []);

  const loadUserAndJobs = async () => {
    try {
      setLoading(true);
      const userData = await User.me();
      setUser(userData);

      // Load jobs and users in parallel
      const [jobsData, usersData] = await Promise.all([
        userData.user_role === 'user'
          ? Job.filter({ assigned_to: userData.id, status: { $ne: 'archived' } }, '-created_date')
          : Job.filter({ status: { $ne: 'archived' } }, '-created_date'),
        User.list() // Load all users to get assignee names
      ]);

      setJobs(jobsData);
      setFilteredJobs(jobsData);
      setUsers(usersData); // Set users data
    } catch (error) {
      console.error("Error loading user and jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadJobs = async () => {
    // This function can be simplified now, but we'll keep it for the create callback
    await loadUserAndJobs();
  };

  const handleCreateJob = async (jobData) => {
    try {
      const newJob = await Job.create({
        ...jobData,
        company_id: user?.company_id
      });
      
      // Log audit trail
      await auditLogger.logJobAction(AUDIT_ACTIONS.JOB_CREATED, newJob.id, user.id, jobData);
      
      // Show success notification
      notifications.success('Job created successfully');
      
      await loadJobs();
      setShowCreateDialog(false);
    } catch (error) {
      console.error("Error creating job:", error);
      notifications.error('Failed to create job');
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    const filtered = jobs.filter(job =>
      job.claim_number.toLowerCase().includes(term.toLowerCase()) ||
      job.customer_name.toLowerCase().includes(term.toLowerCase()) ||
      job.property_address.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredJobs(filtered);
  };

  const handleFilterChange = (filters) => {
    let filtered = jobs;

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(job => job.status === filters.status);
    }

    if (filters.priority && filters.priority !== 'all') {
      filtered = filtered.filter(job => job.priority === filters.priority);
    }

    if (filters.eventType && filters.eventType !== 'all') {
      filtered = filtered.filter(job => job.event_type === filters.eventType);
    }

    setFilteredJobs(filtered);
  };

  const handleAssignJob = (job) => {
    setSelectedJobForAssignment(job);
    setShowAssignDialog(true);
  };

  const handleAssignmentComplete = async () => {
    await loadJobs(); // Refresh jobs list
    notifications.success('Job assignment updated');
    setShowAssignDialog(false); // Close dialog
    setSelectedJobForAssignment(null); // Clear selected job
  };

  const handleBookingComplete = async () => {
    await loadJobs();
    notifications.success('Appointment booked successfully');
    setJobToBook(null);
  };

  const handleDeclineComplete = async () => {
    await loadJobs(); // Refresh jobs list
    notifications.info('Job declined and returned to pool');
    setJobToDecline(null); // Close dialog
  };

  const getStatusColor = (status) => {
    const colors = {
      new_job: 'bg-slate-50 text-slate-600 border-slate-200',
      awaiting_booking: 'bg-blue-50 text-blue-700 border-blue-200',
      awaiting_attendance: 'bg-amber-50 text-amber-700 border-amber-200',
      assessed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      pending_completion: 'bg-orange-50 text-orange-700 border-orange-200',
      awaiting_insurer: 'bg-purple-50 text-purple-700 border-purple-200',
      completed: 'bg-green-50 text-green-700 border-green-200',
      on_hold: 'bg-red-50 text-red-700 border-red-200'
    };
    return colors[status] || 'bg-slate-50 text-slate-600 border-slate-200';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-slate-50 text-slate-600 border-slate-200',
      medium: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      high: 'bg-orange-50 text-orange-600 border-orange-200',
      urgent: 'bg-red-50 text-red-200 border-red-200'
    };
    return colors[priority] || 'bg-slate-50 text-slate-600 border-slate-200';
  };

  // Helper function to get assignee name
  const getAssigneeName = (assignedTo) => {
    if (!assignedTo) return null;
    const assignee = users.find(u => u.id === assignedTo);
    return assignee ? assignee.full_name : 'Unknown User';
  };

  const getAssignedTimeText = (timeAssigned) => {
    if (!timeAssigned) return null;
    try {
      return `Assigned ${formatDistanceToNow(new Date(timeAssigned), { addSuffix: true })}`;
    } catch (error) {
      return 'Recently assigned';
    }
  };

  const getStatusDisplayText = (status) => {
    const statusTexts = {
      new_job: 'New Job',
      awaiting_booking: 'Awaiting Booking',
      awaiting_attendance: 'Awaiting Attendance',
      assessed: 'Assessed',
      pending_completion: 'Pending Completion',
      awaiting_insurer: 'Awaiting Insurer',
      completed: 'Completed',
      on_hold: 'On Hold'
    };
    return statusTexts[status] || status;
  };

  const canManageJobs = user && (user.user_role === 'company_admin' || user.user_role === 'manager' || user.user_role === 'platform_admin');

  // Table columns for data table view
  const tableColumns = [
    {
      key: 'claim_number',
      header: 'Claim Number',
      sortable: true,
      render: (value) => <span className="font-medium">{value}</span>
    },
    {
      key: 'customer_name',
      header: 'Customer',
      sortable: true
    },
    {
      key: 'property_address',
      header: 'Address',
      sortable: true,
      render: (value) => <span className="truncate max-w-xs">{value}</span>
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value) => (
        <Badge className={getStatusColor(value)}>
          {getStatusDisplayText(value)}
        </Badge>
      )
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      render: (value) => (
        <Badge className={getPriorityColor(value)}>
          {value}
        </Badge>
      )
    },
    {
      key: 'created_date',
      header: 'Created',
      sortable: true,
      render: (value) => format(new Date(value), 'MMM d, yyyy')
    }
  ];

  const renderPrimaryAction = (job) => {
    if (job.status === 'awaiting_insurer') {
        return (
            <Button size="sm" disabled className="w-full bg-purple-100 text-purple-700 py-2 text-sm font-medium">
                Referred for Policy Review
            </Button>
        );
    }
    if (job.status === 'pending_completion') {
        return (
            <Button size="sm" disabled className="w-full bg-orange-100 text-orange-700 py-2 text-sm font-medium">
                Pending Completion
            </Button>
        );
    }
    if (job.status === 'assessed' || job.status === 'completed' || job.status === 'on_hold') {
        return (
             <Link to={createPageUrl(`JobDetails?id=${job.id}`)} className="w-full">
                <Button variant="outline" size="sm" className="interactive-button w-full text-slate-600 hover:text-slate-800 hover:bg-slate-50 py-2 text-sm font-medium">
                    <FileSearch className="w-4 h-4 mr-2" />
                    View Details
                </Button>
            </Link>
        );
    }
    if (job.appointment_date) {
        return (
            <Button
                size="sm"
                onClick={() => navigate(createPageUrl(`StartAssessment?jobId=${job.id}`))}
                className="interactive-button w-full bg-slate-700 hover:bg-slate-800 text-white py-2 text-sm font-medium"
            >
                <ClipboardCheck className="w-4 h-4 mr-2" />
                Start Assessment
            </Button>
        );
    }
    // Default for awaiting_booking, new_job
    return (
        <Button
            size="sm"
            onClick={() => setJobToBook(job)}
            className="interactive-button w-full bg-slate-700 hover:bg-slate-800 text-white py-2 text-sm font-medium"
        >
            <Calendar className="w-4 h-4 mr-2" />
            Book Customer
        </Button>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Assignments</h1>
          <p className="text-slate-500 mt-1">Manage insurance assessment jobs and assignments</p>
        </div>

        <div className="flex items-center gap-2">
            {canManageJobs && (
                 <Link to={createPageUrl("ArchivedJobs")}>
                    <Button variant="outline">
                        <Archive className="w-4 h-4 mr-2" />
                        View Archived
                    </Button>
                </Link>
            )}
            <div className="flex rounded-lg border border-slate-200 p-1">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('cards')}
              >
                Cards
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                Table
              </Button>
            </div>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="interactive-button bg-slate-800 hover:bg-slate-900 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Job
            </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search jobs by claim number, customer, or address..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-white border-slate-200/90 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            />
          </div>
        </div>
        <JobFilters onFilterChange={handleFilterChange} />
      </div>

      {loading ? (
        viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-80 loading-shimmer"></div>
            ))}
          </div>
        ) : (
          <div className="h-96 bg-white rounded-lg loading-shimmer"></div>
        )
      ) : (
        viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredJobs.map((job, index) => {
              const assignedTimeText = getAssignedTimeText(job.time_assigned);
              const isMyJob = user && job.assigned_to === user.id;
              return (
              <Card key={job.id} className={`interactive-card bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 flex flex-col justify-between animate-fade-in-up animate-stagger-${(index % 4) + 1}`}>
                <div>
                  <div className="flex justify-between items-start mb-3 flex-wrap gap-y-2">
                    <div className="flex flex-col gap-2 flex-grow min-w-[60%]">
                      <p className="text-lg font-bold text-slate-800 tracking-tight">{job.claim_number}</p>
                      {assignedTimeText && (
                        <Badge variant="outline" className="text-xs text-slate-600 bg-slate-100 border-slate-300 self-start">
                          <Clock className="w-3 h-3 mr-1" />
                          {assignedTimeText}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <Badge variant="outline" className={`${getStatusColor(job.status)} border font-medium text-xs px-2 py-0.5`}>
                        {getStatusDisplayText(job.status)}
                      </Badge>
                      <Badge variant="outline" className={`${getPriorityColor(job.priority)} border font-medium text-xs px-2 py-0.5`}>
                        {job.priority}
                      </Badge>
                      {isMyJob && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setJobToDecline(job)}
                          className="text-slate-400 hover:text-red-500 hover:bg-red-50 h-6 w-6 ml-1"
                          title="Decline this job"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2.5 text-sm text-slate-600">
                    <div className="flex items-center gap-3">
                      <UserIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="font-medium text-slate-700 truncate">{job.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{job.property_address}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{job.event_type} • {new Date(job.date_of_loss).toLocaleDateString()}</span>
                    </div>
                    {job.appointment_date && (
                      <div className="flex items-center gap-2 text-xs text-green-800 bg-green-50 p-1.5 rounded-md border border-green-200">
                          <Calendar className="w-3 h-3 flex-shrink-0" />
                          <span className="font-medium truncate">Booked: {format(new Date(job.appointment_date), 'd MMM, p')}</span>
                      </div>
                    )}
                    {job.customer_phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{job.customer_phone}</span>
                      </div>
                    )}
                    {job.customer_email && (
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{job.customer_email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2 pt-5">
                  {/* Primary Action - Full Width */}
                  {renderPrimaryAction(job)}

                  {/* Secondary Actions - Split Layout */}
                  <div className="flex gap-2">
                    <Link to={createPageUrl(`JobDetails?id=${job.id}`)} className="flex-1">
                      <Button variant="outline" size="sm" className="interactive-button w-full text-slate-600 hover:text-slate-800 hover:bg-slate-50 py-1.5 text-xs">
                        <FileText className="w-3 h-3 mr-1.5" />
                        Details
                      </Button>
                    </Link>
                  </div>
                   {canManageJobs && (
                      <div className="flex-1 group">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAssignJob(job)}
                          className="interactive-button w-full py-1.5 text-xs relative overflow-hidden border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                        >
                          {/* Show assignee name or "Assign" */}
                          <div className="flex items-center justify-center gap-1.5 group-hover:opacity-0 transition-opacity duration-200">
                            <UserIcon className="w-3 h-3" />
                            <span className="truncate">
                              {getAssigneeName(job.assigned_to) || 'Assign'}
                            </span>
                          </div>

                          {/* Show "Re-assign" on hover */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-100">
                            <UserIcon className="w-3 h-3 mr-1" />
                            <span>{job.assigned_to ? 'Re-assign' : 'Assign'}</span>
                          </div>
                        </Button>
                      </div>
                    )}
                </div>
              </Card>
              );
            })}
          </div>
        ) : (
          <DataTable
            data={filteredJobs}
            columns={tableColumns}
            onRowClick={(job) => navigate(createPageUrl(`JobDetails?id=${job.id}`))}
            searchable={false} // We have our own search
            filterable={false} // We have our own filters
          />
        )
      )}

      {!loading && filteredJobs.length === 0 && (
        <div className="text-center py-16 w-full col-span-full animate-fade-in-up">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-700 mb-1">No jobs found</h3>
          <p className="text-slate-500 mb-6">
            {searchTerm || jobs.length > 0 ? "Try adjusting your search or filters." : "Create your first job to get started."}
          </p>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="interactive-button bg-slate-800 hover:bg-slate-900 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Job
          </Button>
        </div>
      )}

      <CreateJobDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={handleCreateJob}
      />

      <AssignJobDialog
        open={showAssignDialog}
        onClose={() => {setShowAssignDialog(false); setSelectedJobForAssignment(null);}}
        job={selectedJobForAssignment}
        onAssignmentComplete={handleAssignmentComplete}
      />

      <BookAppointmentDialog
        open={!!jobToBook}
        onClose={() => setJobToBook(null)}
        job={jobToBook}
        onBookingComplete={handleBookingComplete}
      />

      <DeclineJobDialog
        open={!!jobToDecline}
        onClose={() => setJobToDecline(null)}
        job={jobToDecline}
        onDeclineComplete={handleDeclineComplete}
      />
    </div>
  );
}
