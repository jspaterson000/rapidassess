import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Job } from '@/api/entities';
import { Company } from '@/api/entities';
import TeamWorkflowBoard from '../components/team/TeamWorkflowBoard';
import { Loader2 } from 'lucide-react';

export default function ManageTeam() {
  const [assessors, setAssessors] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await User.me();
        const companyId = currentUser.company_id;

        if (companyId) {
          const [usersData, jobsData, companyData] = await Promise.all([
            User.filter({ company_id: companyId }),
            Job.filter({ company_id: companyId }),
            Company.get(companyId),
          ]);
          
          setAssessors(usersData.filter(u => u.is_assessor));
          setJobs(jobsData);
          setCompany(companyData);
        }
      } catch (error) {
        console.error("Error fetching team data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-4 md:p-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Team Workflow</h1>
          <p className="text-slate-500 mt-1">Manage and assign jobs to your assessors. Drag and drop to re-assign.</p>
        </div>
      </div>
      
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-slate-400" />
            <p className="mt-4 text-slate-500">Loading team workflow...</p>
          </div>
        </div>
      ) : (
        <TeamWorkflowBoard 
          assessors={assessors} 
          initialJobs={jobs}
          company={company}
        />
      )}
    </div>
  );
}