import React, { useState, useEffect } from 'react';
import { Job } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Archive, Undo } from 'lucide-react';

export default function ArchivedJobsPage() {
    const [archivedJobs, setArchivedJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadArchivedJobs = async () => {
        try {
            setLoading(true);
            const jobsData = await Job.filter({ status: 'archived' }, '-updated_date');
            setArchivedJobs(jobsData);
        } catch (error) {
            console.error("Error loading archived jobs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadArchivedJobs();
    }, []);

    const handleRestore = async (job) => {
        try {
            await Job.update(job.id, {
                status: job.previous_status || 'unassigned', // Fallback to 'unassigned'
                previous_status: null
            });
            await loadArchivedJobs(); // Refresh the list
        } catch (error) {
            console.error("Error restoring job:", error);
            alert("Failed to restore job. Please try again.");
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 animate-fade-in-up">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                        <Archive className="w-6 h-6" />
                        Archived Jobs
                    </h1>
                    <p className="text-slate-500 mt-1">Jobs that have been archived. They can be restored at any time.</p>
                </div>
                <Link to={createPageUrl('Jobs')}>
                    <Button variant="outline">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Active Jobs
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="space-y-4">
                    <div className="h-20 bg-white rounded-lg loading-shimmer"></div>
                    <div className="h-20 bg-white rounded-lg loading-shimmer"></div>
                    <div className="h-20 bg-white rounded-lg loading-shimmer"></div>
                </div>
            ) : archivedJobs.length === 0 ? (
                <div className="text-center py-16 w-full col-span-full animate-fade-in-up">
                    <Archive className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-700 mb-1">No Archived Jobs</h3>
                    <p className="text-slate-500">When you archive a job, it will appear here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {archivedJobs.map(job => (
                        <Card key={job.id} className="animate-fade-in-up">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-slate-800">{job.claim_number}</p>
                                    <p className="text-sm text-slate-500">
                                        Customer: {job.customer_name} | Archived on: {new Date(job.updated_date).toLocaleDateString()}
                                    </p>
                                </div>
                                <Button size="sm" onClick={() => handleRestore(job)}>
                                    <Undo className="w-4 h-4 mr-2" />
                                    Restore
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}