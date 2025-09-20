
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Job } from '@/api/entities';
import { User } from '@/api/entities';
import { Company } from '@/api/entities';
import { Assessment } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User as UserIcon,
  Phone,
  Mail,
  FileText,
  Briefcase,
  Building,
  ClipboardCheck,
  Edit,
  AlertTriangle,
  Trash2,
  UserPlus,
  FileSearch,
  DollarSign // Added DollarSign import
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import JobComments from '../components/jobs/JobComments';
import EditJobDialog from '../components/jobs/EditJobDialog';
import AssignJobDialog from '../components/jobs/AssignJobDialog';
import BookAppointmentDialog from '../components/jobs/BookAppointmentDialog';

export default function JobDetailsPage() {
    const [job, setJob] = useState(null);
    const [assignee, setAssignee] = useState(null);
    const [company, setCompany] = useState(null);
    const [assessment, setAssessment] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showAssignDialog, setShowAssignDialog] = useState(false);
    const [jobToBook, setJobToBook] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    
    // Helper function to check if an ID looks like a valid database ID
    const isValidId = (id) => {
        if (!id || typeof id !== 'string') return false;
        // Valid IDs should be alphanumeric and at least 8 characters (typical database ID length)
        // This will filter out obvious test IDs like "jacob-user-id" or "comp-sample-1"
        return /^[a-zA-Z0-9]{8,}$/.test(id);
    };
    
    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const jobId = new URLSearchParams(location.search).get('id');
            if (!jobId) {
                setError("No job ID provided in the URL.");
                setLoading(false);
                return;
            }

            // Load current user, job, and assessment data in parallel
            const [userData, jobData, assessmentData] = await Promise.all([
                User.me(),
                Job.get(jobId),
                Assessment.filter({ job_id: jobId }, '-created_date', 1) // Fetch most recent assessment
            ]);

            setCurrentUser(userData);

            if (assessmentData && assessmentData.length > 0) {
                setAssessment(assessmentData[0]);
            } else {
                setAssessment(null);
            }

            if (!jobData) {
                setError("Job not found.");
                setLoading(false);
                return;
            }
            setJob(jobData);

            // Safely load assignee data - only if ID looks valid
            let assigneeData = null;
            if (jobData.assigned_to) {
                if (isValidId(jobData.assigned_to)) {
                    try {
                        assigneeData = await User.get(jobData.assigned_to);
                        setAssignee(assigneeData);
                    } catch (e) {
                        console.warn(`Assignee with id ${jobData.assigned_to} not found. Job will show as unassigned.`);
                        setAssignee(null);
                    }
                } else {
                    console.warn(`Invalid assignee ID format: ${jobData.assigned_to}. Skipping fetch.`);
                    setAssignee(null);
                }
            } else {
                setAssignee(null);
            }

            // Safely load company data - only if ID looks valid
            let companyData = null;
            if (jobData.company_id) {
                if (isValidId(jobData.company_id)) {
                    try {
                        companyData = await Company.get(jobData.company_id);
                        setCompany(companyData);
                    } catch (e) {
                        console.warn(`Company with id ${jobData.company_id} not found. Company info will be unavailable.`);
                        setCompany(null);
                    }
                } else {
                    console.warn(`Invalid company ID format: ${jobData.company_id}. Skipping fetch.`);
                    setCompany(null);
                }
            } else {
                setCompany(null);
            }

        } catch (error) {
            console.error("Failed to load job details:", error);
            setError("Failed to load job details. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [location.search]);

    useEffect(() => {
        loadData();
    }, [loadData]);
    
    const handleDeleteJob = async () => {
        if (!job || !currentUser) return;
        
        setIsDeleting(true);
        try {
            await Job.delete(job.id);
            navigate(createPageUrl('Jobs'));
        } catch (error) {
            console.error("Error deleting job:", error);
            alert("Failed to delete job. Please try again.");
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    const handleEditJob = async (updatedJobData) => {
        try {
            await Job.update(job.id, updatedJobData);
            await loadData(); // Refresh the job details
            setShowEditDialog(false);
        } catch (error) {
            console.error("Error updating job:", error);
            alert("Failed to update job. Please try again.");
        }
    };

    const handleAssignmentComplete = async () => {
        setShowAssignDialog(false);
        await loadData(); // Refresh all job and assignee details
    };

    const handleBookingComplete = async () => {
        await loadData();
        setJobToBook(null);
    };

    // Check if current user can edit/delete jobs
    const canManageJob = currentUser && [
        'platform_admin',
        'company_admin', 
        'manager'
    ].includes(currentUser.user_role);

    // Check if current user is assigned to this job
    const isAssignedToMe = currentUser && job?.assigned_to === currentUser.id;

    // Primary action button logic (same as Jobs page)
    const renderPrimaryAction = () => {
        if (!job) return null;

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
            <Button variant="outline" size="sm" className="text-slate-600 hover:text-slate-800 hover:bg-slate-50">
              <FileSearch className="w-4 h-4 mr-2" />
              View Details
            </Button>
          );
        }
        if (job.appointment_date && isAssignedToMe) {
          return (
            <Link to={`/StartAssessment?jobId=${job.id}`}>
              <Button
                size="sm"
                className="bg-slate-700 hover:bg-slate-800 text-white"
              >
                <ClipboardCheck className="w-4 h-4 mr-2" />
                Start Assessment
              </Button>
            </Link>
          );
        }
        if (isAssignedToMe) {
          return (
            <Button
              size="sm"
              onClick={() => setJobToBook(job)}
              className="bg-slate-700 hover:bg-slate-800 text-white"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Book Customer
            </Button>
          );
        }
        return null;
    };

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
    
    const getPriorityColor = (priority) => {
        const colors = {
          low: 'bg-slate-100 text-slate-700',
          medium: 'bg-yellow-100 text-yellow-700',
          high: 'bg-orange-100 text-orange-700',
          urgent: 'bg-red-100 text-red-700'
        };
        return colors[priority] || 'bg-slate-100 text-slate-600';
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-AU', {
            style: 'currency',
            currency: 'AUD'
        }).format(amount || 0);
    };

    if (loading) {
        return (
            <div className="p-6 md:p-10">
                <div className="h-96 w-full bg-slate-100 rounded-2xl loading-shimmer"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 md:p-10 text-center">
                <h2 className="text-xl font-semibold text-red-600">Error</h2>
                <p className="text-slate-500 mt-2">{error}</p>
                <div className="mt-6 flex justify-center gap-4">
                    <Link to={createPageUrl('Jobs')}>
                        <Button variant="outline">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Jobs
                        </Button>
                    </Link>
                    <Button onClick={loadData}>
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="p-6 md:p-10 text-center">
                <h2 className="text-xl font-semibold text-slate-600">Job Not Found</h2>
                <p className="text-slate-500 mt-2">The requested job could not be found.</p>
                <div className="mt-6">
                    <Link to={createPageUrl('Jobs')}>
                        <Button variant="outline">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Jobs
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const DetailItem = ({ icon: Icon, label, value, children, warning }) => (
        <div className="flex items-start gap-4">
            <Icon className={`w-5 h-5 mt-1 flex-shrink-0 ${warning ? 'text-amber-500' : 'text-slate-400'}`} />
            <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-500">{label}</p>
                {children || (
                    <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-700 break-all">{value || 'N/A'}</p>
                        {warning && (
                            <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                <AlertTriangle className="w-3 h-3" />
                                <span>{warning}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
    
    return (
        <>
            <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6"> {/* Updated padding and spacing */}
                <div className="flex items-center justify-between">
                    <Link to={createPageUrl('Jobs')}>
                        <Button variant="outline" className="flex items-center gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to Jobs</span>
                        </Button>
                    </Link>
                    
                    <div className="flex items-center gap-2">
                        {/* Primary Action Button */}
                        {renderPrimaryAction()}
                        
                        {/* Assigned To Button */}
                        {canManageJob && (
                            <Button
                                variant="outline"
                                onClick={() => setShowAssignDialog(true)}
                                className="flex items-center gap-2"
                            >
                                <UserIcon className="w-4 h-4" />
                                <span>
                                    {assignee ? assignee.full_name : 'Assign'}
                                </span>
                            </Button>
                        )}
                        
                        {assessment && (
                            <Link to={createPageUrl(`AssessmentDetails?id=${assessment.id}`)}>
                                <Button variant="outline" className="flex items-center gap-2">
                                    <FileSearch className="w-4 h-4" />
                                    <span>View Assessment</span>
                                </Button>
                            </Link>
                        )}
                        
                        {canManageJob && (
                            <>
                                <Button 
                                    variant="outline"
                                    onClick={() => setShowEditDialog(true)}
                                    className="flex items-center gap-2"
                                >
                                    <Edit className="w-4 h-4" />
                                    <span>Edit Job</span>
                                </Button>
                                <Button 
                                    variant="destructive"
                                    onClick={() => setShowDeleteDialog(true)}
                                    className="flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Delete Job</span>
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                <header className="space-y-2">
                    <div className="flex items-center gap-4 flex-wrap">
                        <h1 className="text-3xl font-bold text-slate-900">{job.claim_number}</h1>
                        <Badge className={`${getStatusColor(job.status)} font-medium capitalize text-sm px-3 py-1`}>
                            {job.status.replace(/_/g, ' ')}
                        </Badge>
                        <Badge className={`${getPriorityColor(job.priority)} font-medium capitalize text-sm px-3 py-1`}>
                            {job.priority} Priority
                        </Badge>
                    </div>
                    <p className="text-slate-500 text-lg">{job.property_address}</p>
                </header>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6"> {/* Updated grid layout */}
                    {/* Left Column: Job Details */}
                    <div className="xl:col-span-2 space-y-6"> {/* Updated column span */}
                        <Card className="bg-white/80 backdrop-blur-sm shadow-md border-slate-200/60 rounded-2xl transition-all duration-300 hover:shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-xl">Job Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <DetailItem icon={Briefcase} label="Event Type" value={job.event_type?.replace(/_/g, ' ')} />
                                <DetailItem icon={Calendar} label="Date of Loss" value={new Date(job.date_of_loss).toLocaleDateString()} />
                                {job.appointment_date && (
                                    <DetailItem icon={ClipboardCheck} label="Appointment Date" value={new Date(job.appointment_date).toLocaleString()} />
                                )}
                                {job.insurer && <DetailItem icon={Building} label="Insurance Company" value={job.insurer} />}
                                {job.policy_number && <DetailItem icon={FileText} label="Policy Number" value={job.policy_number} />}
                                {job.notes && <DetailItem icon={FileText} label="Notes" value={job.notes} />}
                            </CardContent>
                        </Card>

                        <Card className="bg-white/80 backdrop-blur-sm shadow-md border-slate-200/60 rounded-2xl transition-all duration-300 hover:shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-xl">Customer & Assessment Company</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <DetailItem icon={UserIcon} label="Customer Name" value={job.customer_name} />
                                <DetailItem icon={Phone} label="Customer Phone" value={job.customer_phone} />
                                <DetailItem icon={Mail} label="Customer Email" value={job.customer_email} />
                                {currentUser?.user_role === 'platform_admin' && (
                                    <DetailItem 
                                        icon={Building} 
                                        label="Assessment Company" 
                                        value={company?.company_name || 'Assessment company information unavailable'} 
                                        warning={!company ? 'Data missing' : null}
                                    />
                                )}
                            </CardContent>
                        </Card>

                        {/* Assessment Quote/Scope Section */}
                        {job && (job.total_estimate > 0 || (job.scope_of_works && job.scope_of_works.length > 0)) && (
                            <Card className="bg-white/80 backdrop-blur-sm shadow-md border-slate-200/60 rounded-2xl transition-all duration-300 hover:shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <DollarSign className="w-5 h-5 text-green-600" />
                                        Assessment Quote
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Total Estimate */}
                                    {job.total_estimate > 0 && (
                                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                                        <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-semibold text-slate-800">Total Estimated Cost</h4>
                                            <p className="text-sm text-slate-600">Based on assessment scope of works</p>
                                        </div>
                                        <p className="text-2xl font-bold text-green-600">{formatCurrency(job.total_estimate)}</p>
                                        </div>
                                    </div>
                                    )}

                                    {/* Scope of Works */}
                                    {job.scope_of_works && job.scope_of_works.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-slate-800 mb-3">Scope of Works</h4>
                                        <div className="space-y-2">
                                        {job.scope_of_works.map((item, index) => (
                                            <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                            <div className="flex-1">
                                                <p className="font-medium text-slate-800">{item.description}</p>
                                                <p className="text-sm text-slate-500">
                                                {item.quantity} {item.unit} × {formatCurrency(item.rate)}
                                                </p>
                                            </div>
                                            <p className="font-semibold text-slate-800 ml-4">{formatCurrency(item.total)}</p>
                                            </div>
                                        ))}
                                        </div>
                                        
                                        {/* Total */}
                                        <div className="mt-3 pt-3 border-t border-slate-200">
                                        <div className="flex justify-between items-center">
                                            <p className="font-semibold text-slate-800">Total:</p>
                                            <p className="text-xl font-bold text-green-600">
                                            {formatCurrency(job.scope_of_works.reduce((sum, item) => sum + (item.total || 0), 0))}
                                            </p>
                                        </div>
                                        </div>
                                    </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                    
                    {/* Right Column: Notes & Communication */}
                    <div>
                         <Card className="bg-white/80 backdrop-blur-sm shadow-md border-slate-200/60 rounded-2xl h-full transition-all duration-300 hover:shadow-lg">
                            <CardContent className="p-6 h-full">
                               <JobComments job={job} />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Edit Job Dialog */}
            {job && (
                <EditJobDialog
                    open={showEditDialog}
                    onClose={() => setShowEditDialog(false)}
                    onSubmit={handleEditJob}
                    job={job}
                />
            )}

            {/* Assign Job Dialog */}
            {canManageJob && (
                <AssignJobDialog
                    open={showAssignDialog}
                    onClose={() => setShowAssignDialog(false)}
                    job={job}
                    onAssignmentComplete={handleAssignmentComplete}
                />
            )}

            {/* Book Appointment Dialog */}
            <BookAppointmentDialog
                open={!!jobToBook}
                onClose={() => setJobToBook(null)}
                job={jobToBook}
                onBookingComplete={handleBookingComplete}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <Trash2 className="w-5 h-5 text-red-600" />
                            Delete Job
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                            <p>Are you sure you want to permanently delete this job?</p>
                            <div className="bg-slate-50 p-3 rounded-lg">
                                <p className="font-medium text-slate-800">{job?.claim_number}</p>
                                <p className="text-sm text-slate-600">{job?.customer_name}</p>
                                <p className="text-sm text-slate-600">{job?.property_address}</p>
                            </div>
                            <p className="text-red-600 font-medium">This action cannot be undone.</p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteJob}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? (
                                <>
                                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Job
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
