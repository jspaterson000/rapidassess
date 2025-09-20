import React, { useState, useEffect } from 'react';
import { Job } from '@/api/entities';
import { Assessment } from '@/api/entities';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Briefcase, MapPin, Calendar, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import MobileAssessmentHeader from './MobileAssessmentHeader';

export default function Step1_SelectJob({ onJobSelect }) {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadAvailableJobs = async () => {
      try {
        const [allJobs, allAssessments] = await Promise.all([
          Job.list(),
          Assessment.list()
        ]);
        const assessedJobIds = new Set(allAssessments.map(a => a.job_id));
        const availableJobs = allJobs.filter(job => 
          !assessedJobIds.has(job.id) && 
          !['completed', 'archived'].includes(job.status)
        );
        setJobs(availableJobs);
        setFilteredJobs(availableJobs);
      } catch (error) {
        console.error("Error loading jobs:", error);
      } finally {
        setLoading(false);
      }
    };
    loadAvailableJobs();
  }, []);

  const handleSearch = (term) => {
    setSearchTerm(term);
    const lowercasedTerm = term.toLowerCase();
    const filtered = jobs.filter(job => 
      job.claim_number.toLowerCase().includes(lowercasedTerm) ||
      job.customer_name.toLowerCase().includes(lowercasedTerm) ||
      job.property_address.toLowerCase().includes(lowercasedTerm)
    );
    setFilteredJobs(filtered);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-slate-100 text-slate-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700'
    };
    return colors[priority] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <MobileAssessmentHeader
        currentStep={0}
        totalSteps={10}
        stepTitle="Select Job"
        stepDescription="Choose a job to assess"
        estimatedTime={1}
        showBackButton={false}
      />

      <div className="px-4 py-6 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input
            placeholder="Search by claim number, customer, or address..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-12 h-14 bg-white border-slate-200 rounded-lg text-base"
          />
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-24 bg-white rounded-lg animate-pulse border border-slate-200"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.length > 0 ? filteredJobs.map(job => (
              <Card 
                key={job.id} 
                onClick={() => onJobSelect(job)}
                className="bg-white border-slate-200 cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98]"
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">{job.claim_number}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`text-xs ${getPriorityColor(job.priority)}`}>
                          {job.priority}
                        </Badge>
                        <span className="text-sm text-slate-500 capitalize">
                          {job.event_type?.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="font-medium">{job.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="truncate">{job.property_address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>Loss: {new Date(job.date_of_loss).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <Card className="bg-white border-slate-200">
                <CardContent className="text-center py-16">
                  <Briefcase className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">No Available Jobs</h3>
                  <p className="text-slate-500">
                    {searchTerm ? "No jobs match your search." : "All jobs have been assessed."}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}