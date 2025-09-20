
import React, { useState, useEffect } from 'react';
import { Job } from '@/api/entities';
import { Assessment } from '@/api/entities';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Briefcase } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-1">Select a Job to Assess</h2>
        <p className="text-slate-500">Choose an open job to begin the assessment process.</p>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <Input
          placeholder="Search by claim number, customer, or address..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 bg-white border-slate-200/90 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
        />
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-slate-100 animate-pulse rounded-lg"></div>)}
        </div>
      ) : (
        <div className="space-y-3 max-h-[22rem] overflow-y-auto pr-2 -mr-2">
          {filteredJobs.length > 0 ? filteredJobs.map(job => (
            <Card 
              key={job.id} 
              onClick={() => onJobSelect(job)}
              className="bg-slate-50 border-slate-200/60 cursor-pointer hover:bg-slate-100 hover:border-slate-300 transition-all"
            >
              <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{job.claim_number}</p>
                  <p className="text-sm text-slate-600 truncate">{job.customer_name} - {job.property_address}</p>
                </div>
                <div className="text-sm text-slate-500 capitalize self-end sm:self-center">{job.event_type?.replace(/_/g, ' ')}</div>
              </CardContent>
            </Card>
          )) : (
            <div className="text-center py-10 bg-slate-50 rounded-lg">
              <Briefcase className="w-12 h-12 mx-auto text-slate-400 mb-4" />
              <p className="text-slate-700 font-medium">No Available Jobs</p>
              <p className="text-slate-500 text-sm">All jobs have been assessed or none match your search.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
