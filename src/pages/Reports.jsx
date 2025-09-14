
import React, { useState, useEffect } from 'react';
import { Assessment } from '@/api/entities';
import { Job } from '@/api/entities';
import { User } from '@/api/entities';
import AdvancedReports from '@/components/reports/AdvancedReports';
import { useNavigate, Link } from 'react-router-dom'; // Added Link here
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Calendar, User as UserIcon, Briefcase, BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ReportsPage() {
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
      const assessmentsData = await Assessment.filter({ status: { $in: ['completed', 'pending_review'] } }, '-created_date');
      const jobsData = await Job.list();
      const usersData = await User.list();
      
      setAssessments(assessmentsData);
      setJobs(jobsData);
      setUsers(usersData);
    } catch (error) {
      console.error("Error loading report data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getJob = (jobId) => jobs.find(j => j.id === jobId) || {};
  const getAssessor = (userId) => users.find(u => u.id === userId) || {};

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      pending_review: 'bg-slate-100 text-slate-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reports & Analytics</h1>
          <p className="text-slate-500 mt-1">View assessment reports and generate advanced analytics.</p>
        </div>
      </div>

      <Tabs defaultValue="assessments" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assessments">
            <FileText className="w-4 h-4 mr-2" />
            Assessment Reports
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="w-4 h-4 mr-2" />
            Advanced Analytics
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="assessments" className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-52 loading-shimmer"></div>
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
                          Report #{assessment.id.slice(-6)}
                        </CardTitle>
                        <Badge className={`${getStatusColor(assessment.status)} border-0 text-xs capitalize`}>
                          {assessment.status?.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Briefcase className="w-4 h-4" />
                        <span className="font-medium text-slate-700">{job?.claim_number}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <UserIcon className="w-4 h-4" />
                        <span>{assessor?.full_name || 'N/A'}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(assessment.assessment_date).toLocaleDateString()}</span>
                      </div>

                      <div className="flex pt-3">
                        <Link to={createPageUrl(`AssessmentDetails?id=${assessment.id}`)} className="w-full">
                          <Button 
                            size="sm" 
                            as="div" 
                            className="interactive-button w-full bg-slate-100 hover:bg-slate-200 text-slate-700"
                          >
                            <FileText className="w-3 h-3 mr-1.5" />
                            View Report
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
    </div>
  );
}

          {!loading && assessments.length === 0 && (
            <div className="text-center py-16 w-full col-span-full animate-fade-in-up">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-700 mb-2">No reports generated yet</h3>
              <p className="text-slate-500">Completed assessments will appear here as reports.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-6">
          <AdvancedReports />
        </TabsContent>
      </Tabs>