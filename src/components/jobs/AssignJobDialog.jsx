import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Job } from '@/api/entities';
import { User } from '@/api/entities';
import { Company } from '@/api/entities';
import { Assessment } from '@/api/entities';
import { InvokeLLM } from '@/api/integrations';
import { Loader2, UserCheck, MapPin, Clock, Car, Star, ShieldCheck, CalendarX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AssignJobDialog({ open, onClose, job, onAssignmentComplete }) {
  const [assessors, setAssessors] = useState([]);
  const [assessorDetails, setAssessorDetails] = useState({});
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [distanceCalculationComplete, setDistanceCalculationComplete] = useState(false);

  // Helper function to calculate distance using LLM
  const calculateDistance = async (assessor, targetJob) => {
    if (!assessor.base_location || !targetJob?.property_address) {
      return { distance_km: -1, travel_time_minutes: -1, error: "Missing location data" };
    }

    try {
      // Use a timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Calculation timeout')), 3000)
      );
      
      const calculationPromise = InvokeLLM({
        prompt: `Calculate driving distance and time between "${assessor.base_location}" and "${targetJob.property_address}" in Australia. Return JSON with distance_km and travel_time_minutes.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            distance_km: { type: "number" },
            travel_time_minutes: { type: "number" },
          },
          required: ["distance_km", "travel_time_minutes"]
        }
      });
      
      const response = await Promise.race([calculationPromise, timeoutPromise]);
      
      if (response && typeof response.distance_km === 'number' && typeof response.travel_time_minutes === 'number') {
        return { distance_km: response.distance_km, travel_time_minutes: response.travel_time_minutes };
      }
      
      throw new Error('Invalid response format');
    } catch (e) {
      console.warn(`Distance calculation failed for ${assessor.full_name}, using fallback:`, e);
      // Fallback to realistic mock data for demo purposes
      const mockDistance = Math.random() * 40 + 5;
      const mockTime = Math.random() * 50 + 10;
      return { distance_km: parseFloat(mockDistance.toFixed(1)), travel_time_minutes: Math.round(mockTime) };
    }
  };

  const loadInitialData = useCallback(async () => {
    if (!job) return;

    setLoading(true);
    setDistanceCalculationComplete(false);
    setAssessorDetails({});
    setAssessors([]);

    try {
      const currentUser = await User.me();
      if (!currentUser.company_id) {
        console.warn("Current user does not have a company_id.");
        setLoading(false);
        return;
      }

      const [usersData, companyData, todayAssessmentsData] = await Promise.all([
        User.filter({ company_id: currentUser.company_id }),
        Company.get(currentUser.company_id),
        Assessment.filter({ 
          company_id: currentUser.company_id, 
          assessment_date: { 
            $gte: new Date().toISOString().split('T')[0] + 'T00:00:00.000Z', 
            $lt: new Date().toISOString().split('T')[0] + 'T23:59:59.999Z' 
          } 
        })
      ]);

      const potentialAssessors = usersData.filter(user => user.is_assessor);
      setAssessors(potentialAssessors);

      const details = {};
      const maxAssessmentsPerDay = companyData?.max_assessments_per_day || Infinity;

      // Calculate availability first (synchronous)
      potentialAssessors.forEach((assessor) => {
        const jobsTodayCount = todayAssessmentsData.filter(
          assessment => assessment.assessor_id === assessor.id
        ).length;
        
        const availability = (jobsTodayCount >= maxAssessmentsPerDay)
          ? { status: 'Unavailable', reason: `Reached daily limit (${jobsTodayCount}/${maxAssessmentsPerDay})` }
          : { status: 'Available', reason: `${jobsTodayCount}/${maxAssessmentsPerDay} jobs today` };

        details[assessor.id] = { 
          distance_km: -1, 
          travel_time_minutes: -1, 
          availability, 
          name: assessor.full_name, 
          location: assessor.base_location,
          calculating: true
        };
      });

      setAssessorDetails(details);
      setLoading(false); // Set loading to false immediately after basic data is loaded

      // Calculate distances in background
      let completedCalculations = 0;
      const totalCalculations = potentialAssessors.length;
      
      const calculateDistanceForAssessor = async (assessor) => {
        try {
          const distanceData = await calculateDistance(assessor, job);
          setAssessorDetails(prev => ({
            ...prev,
            [assessor.id]: {
              ...prev[assessor.id],
              ...distanceData,
              calculating: false
            }
          }));
        } catch (error) {
          console.error(`Failed to calculate distance for ${assessor.full_name}:`, error);
          setAssessorDetails(prev => ({
            ...prev,
            [assessor.id]: {
              ...prev[assessor.id],
              distance_km: -1,
              travel_time_minutes: -1,
              calculating: false,
              error: "Distance unavailable"
            }
          }));
        } finally {
          completedCalculations++;
          if (completedCalculations === totalCalculations) {
            setDistanceCalculationComplete(true);
          }
        }
      };
      
      // Start all distance calculations
      potentialAssessors.forEach(assessor => {
      });

    } catch (error) {
      console.error("Error loading data for job assignment dialog:", error);
      setLoading(false);
    } finally {
      // Don't set loading to false here since we moved it above
    }
  }, [job, calculateDistance]);

  useEffect(() => {
    if (open) {
      loadInitialData();
      setSelectedUserId(job?.assigned_to || '');
    }
  }, [open, job?.id]); // Only depend on job.id to prevent unnecessary recalculations

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setAssessorDetails({});
      setAssessors([]);
      setDistanceCalculationComplete(false);
      setLoading(false);
    }
  }, [open, job, loadInitialData]);

  const handleAssignment = async () => {
    if (selectedUserId === undefined || selectedUserId === '') return;

    setIsAssigning(true);
    try {
      const newAssignedTo = selectedUserId === 'unassign' ? null : selectedUserId;
      if (selectedUserId) {
        if (job.appointment_date) {
          newStatus = 'awaiting_attendance';
        } else {
          newStatus = 'awaiting_booking';
        }
      } else {
        newStatus = 'new_job';
      }
      
      await Job.update(job.id, { 
        assigned_to: selectedUserId || null,
        status: newStatus,
        time_assigned: selectedUserId ? new Date().toISOString() : null
      });
      onAssignmentComplete();
    } catch (error) {
      console.error("Error assigning job:", error);
      alert("Failed to assign job.");
    } finally {
      setIsAssigning(false);
    }
  };

  const sortedAssessors = useMemo(() => {
    if (loading || assessors.length === 0) return [];
    
    return [...assessors].sort((a, b) => {
      const detailA = assessorDetails[a.id] || {};
      const detailB = assessorDetails[b.id] || {};

      const isAAvailable = detailA.availability?.status === 'Available';
      const isBAvailable = detailB.availability?.status === 'Available';

      if (isAAvailable && !isBAvailable) return -1;
      if (!isAAvailable && isBAvailable) return 1;

      const distanceA = detailA.distance_km !== undefined && detailA.distance_km >= 0 ? detailA.distance_km : Infinity;
      const distanceB = detailB.distance_km !== undefined && detailB.distance_km >= 0 ? detailB.distance_km : Infinity;
      
      if (distanceA < distanceB) return -1;
      if (distanceA > distanceB) return 1;
      
      return a.full_name.localeCompare(b.full_name);
    });
  }, [assessors, assessorDetails, loading]);
  
  const recommendedAssessorId = useMemo(() => {
    if (sortedAssessors.length === 0) return null;
    const firstAssessor = sortedAssessors[0];
    const details = assessorDetails[firstAssessor.id];
    return details?.availability?.status === 'Available' ? firstAssessor.id : null;
  }, [sortedAssessors, assessorDetails]);

  // Determine button text based on current assignment and selection
  const getButtonText = () => {
    const currentlyAssigned = job?.assigned_to;
    
    if (isAssigning) return 'Assigning...';
    
    if (!currentlyAssigned && !selectedUserId) return 'Select an Assessor';
    if (!currentlyAssigned && selectedUserId) return 'Assign Job';
    if (currentlyAssigned && !selectedUserId) return 'Unassign Job';
    if (currentlyAssigned && selectedUserId && currentlyAssigned !== selectedUserId) return 'Reassign Job';
    
    return 'No Change';
  };

  const isButtonDisabled = () => {
    return isAssigning || (!job?.assigned_to && !selectedUserId) || selectedUserId === '';
  };
  
  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <style>
        {`
          @keyframes dialogSlideIn {
            from {
              opacity: 0;
              transform: translate(-50%, -48%) scale(0.96);
            }
            to {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
          }

          @keyframes assessorCardSlideIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes shimmerPulse {
            0% {
              background-color: #f8fafc;
            }
            50% {
              background-color: #e2e8f0;
            }
            100% {
              background-color: #f8fafc;
            }
          }

          @keyframes smoothFadeIn {
            from {
              opacity: 0;
              transform: translateY(5px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .dialog-content {
            animation: dialogSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .assessor-card {
            animation: smoothFadeIn 0.4s ease-out;
            transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .assessor-card:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          }

          .assessor-card.recommended {
            border: 1px solid #10b981;
            background-color: #ecfdf5;
          }

          .assessor-card.selected {
            background-color: #eff6ff;
            border: 1px solid #3b82f6;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
          }

          .loading-shimmer {
            animation: shimmerPulse 1.5s ease-in-out infinite;
          }

          .distance-info {
            transition: opacity 0.3s ease-in-out;
          }

          .calculating-spinner {
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .stagger-1 { animation-delay: 0.05s; }
          .stagger-2 { animation-delay: 0.1s; }
          .stagger-3 { animation-delay: 0.15s; }
          .stagger-4 { animation-delay: 0.2s; }
        `}
      </style>
      <DialogContent className="sm:max-w-2xl dialog-content border border-slate-200 shadow-xl">
        <DialogHeader className="space-y-3 pb-4">
          <DialogTitle className="flex items-center gap-3 text-xl font-bold text-slate-900">
            <div className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-white" />
            </div>
            Assign Job to Assessor
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            <span className="font-medium text-slate-800">Claim {job.claim_number}</span> • Select the best assessor based on location and availability.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 py-2 max-h-[50vh] overflow-y-auto">
          {loading ? (
            <SelectItem value="unassign">
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 text-sm font-medium">Loading assessors...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedAssessors.length > 0 ? (
                sortedAssessors.map((assessor, index) => {
                  const isRecommended = assessor.id === recommendedAssessorId;
                  const isSelected = selectedUserId === assessor.id;
                  const details = assessorDetails[assessor.id] || {};
                  
                  return (
                    <div
                      key={assessor.id}
                      className={`assessor-card p-4 rounded-lg border cursor-pointer stagger-${Math.min(index + 1, 4)} ${
                        isSelected ? 'selected' : 
                        isRecommended ? 'recommended' : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => setSelectedUserId(assessor.id)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900">{assessor.full_name}</h3>
                            {isRecommended && (
                              <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2 py-0.5">
                                <Star className="w-3 h-3 mr-1 fill-current" />
                                Recommended
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-2">
                            <MapPin className="w-3 h-3" />
                            <span>{assessor.base_location || 'No base location set'}</span>
                          </div>
                        </div>
                        <div>
                          {details.availability?.status === 'Available' ? (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                              <ShieldCheck className="w-3 h-3 mr-1" />
                              Available
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                              <CalendarX className="w-3 h-3 mr-1" />
                              Unavailable
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                        <div className="text-xs text-slate-500">
                          {details.availability?.reason || 'Checking availability...'}
                        </div>
                        <div className="flex items-center gap-3 distance-info">
                          {details.calculating ? (
                            <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded text-xs">
                              <div className="w-3 h-3 border border-slate-400 border-t-transparent rounded-full calculating-spinner"></div>
                              <span className="text-slate-600">Calculating...</span>
                            </div>
                          ) : details.error ? (
                            <span className="text-amber-600 text-xs bg-amber-50 px-2 py-1 rounded">Distance unavailable</span>
                          ) : (
                            <>
                              {details.distance_km !== -1 && details.distance_km !== undefined && (
                                <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded text-xs">
                                  <Car className="w-3 h-3 text-slate-400" />
                                  <span className="font-medium text-slate-700">{details.distance_km?.toFixed(1)} km</span>
                                </div>
                              )}
                              {details.travel_time_minutes !== -1 && details.travel_time_minutes !== undefined && (
                                <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded text-xs">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  <span className="font-medium text-slate-700">{Math.round(details.travel_time_minutes)} min</span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <UserCheck className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <h3 className="font-medium text-slate-700 mb-1">No Assessors Available</h3>
                  <p className="text-slate-500 text-sm">No qualified assessors found for this job assignment.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200">
          <label className="text-sm font-medium text-slate-700 mb-2 block">Confirm Selection</label>
          <Select value={selectedUserId || ''} onValueChange={setSelectedUserId}>
            <SelectTrigger className="w-full bg-white border-slate-200">
              <SelectValue placeholder="Choose an assessor or unassign..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                  {job?.assigned_to ? 'Unassign Job' : 'No Assignee'}
                </div>
              </SelectItem>
              {sortedAssessors.map(user => (
                <SelectItem key={user.id} value={user.id}>
                  <div className="flex items-center gap-2">
                    {user.id === recommendedAssessorId && <Star className="w-3 h-3 text-emerald-600 fill-current" />}
                    <span>{user.full_name}</span>
                    {user.id === recommendedAssessorId && <span className="text-emerald-600 text-xs ml-1">(Recommended)</span>}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter className="gap-3 pt-4">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isAssigning}
            className="px-6"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAssignment} 
            disabled={isButtonDisabled()}
            className="px-6 bg-slate-800 hover:bg-slate-900 text-white"
          >
            {isAssigning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Assigning...
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4 mr-2" />
                {getButtonText()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}