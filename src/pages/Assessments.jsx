
import React, { useState, useEffect } from "react";
import { Assessment } from "@/api/entities";
import { Job } from "@/api/entities";
import { User } from "@/api/entities";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus, 
  ClipboardCheck, 
  FileText, 
  Clock, 
  User as UserIcon,
  Briefcase
} from "lucide-react";

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [assessmentsData, jobsData, usersData] = await Promise.all([
        Assessment.list('-created_date'),
        Job.list(),
        User.list()
      ]);
      setAssessments(assessmentsData);
      setJobs(jobsData);
      setUsers(usersData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getJob = (jobId) => jobs.find(j => j.id === jobId) || {};
  const getAssessor = (userId) => users.find(u => u.id === userId) || {};

  const getStatusColor = (status) => {
    const colors = {
      in_progress: 'bg-yellow-50 text-yellow-800 border-yellow-200',
      completed: 'bg-green-50 text-green-800 border-green-200',
      pending_review: 'bg-slate-50 text-slate-800 border-slate-200'
    };
    return colors[status] || 'bg-gray-50 text-gray-800 border-gray-200';
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Assessments</h1>
          <p className="text-slate-500 mt-1">View and manage all property assessments.</p>
        </div>
        
        <Link to={createPageUrl("StartAssessment")}>
          <Button className="interactive-button bg-slate-800 hover:bg-slate-900 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Start New Assessment
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-56 loading-shimmer"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assessments.map((assessment, index) => {
            const job = getJob(assessment.job_id);
            const assessor = getAssessor(assessment.assessor_id);
            
            return (
              <Card key={assessment.id} className={`interactive-card bg-white rounded-2xl shadow-sm border-slate-200/80 animate-fade-in-up animate-stagger-${(index % 3) + 1}`}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold text-slate-800">
                      Assessment #{assessment.id.slice(-6)}
                    </CardTitle>
                    <Badge variant="outline" className={`${getStatusColor(assessment.status)} border text-xs font-medium px-2 py-0.5`}>
                      {assessment.status?.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500 pt-1 capitalize">
                    {assessment.event_details?.event_type?.replace(/_/g, ' ')}
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Briefcase className="w-4 h-4 text-slate-400" />
                    <span className="font-medium text-slate-700">{job.claim_number}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{new Date(assessment.assessment_date).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-600">Assessor:</span>
                      <span className="font-medium text-slate-800 bg-slate-50 px-2 py-0.5 rounded-full text-xs">
                        {assessor.full_name || 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3">
                    <Link to={createPageUrl(`AssessmentDetails?id=${assessment.id}`)} className="w-full">
                      <Button 
                        size="sm" 
                        as="div" 
                        className="interactive-button w-full bg-slate-100 hover:bg-slate-200 text-slate-700"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && assessments.length === 0 && (
        <div className="text-center py-16 w-full col-span-full animate-fade-in-up">
          <ClipboardCheck className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-700 mb-2">No assessments yet</h3>
          <p className="text-slate-500 mb-6">Start an assessment to begin the reporting process.</p>
          <Link to={createPageUrl("StartAssessment")}>
            <Button className="interactive-button bg-slate-800 hover:bg-slate-900 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Start New Assessment
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
