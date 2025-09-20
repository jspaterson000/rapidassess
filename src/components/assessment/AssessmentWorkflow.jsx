import React, { useState, useEffect } from 'react';
import { Assessment, Job, User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Camera, 
  Upload,
  Save,
  Send
} from 'lucide-react';
import { logger } from '@/lib/logger';

/**
 * Complete assessment workflow component with progress tracking
 */
export default function AssessmentWorkflow({ jobId, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [assessmentData, setAssessmentData] = useState({
    job_id: jobId,
    assessor_id: null,
    company_id: null,
    status: 'in_progress',
    event_details: {},
    damage_areas: [],
    photos: [],
    documents: [],
    scope_of_works: [],
    total_estimate: 0,
    ai_analysis: null
  });
  
  const [job, setJob] = useState(null);
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const steps = [
    { 
      id: 'event_details', 
      title: 'Event Details', 
      description: 'Describe what happened',
      required: true,
      estimatedTime: 5
    },
    { 
      id: 'damage_assessment', 
      title: 'Damage Assessment', 
      description: 'Document damage areas',
      required: true,
      estimatedTime: 15
    },
    { 
      id: 'evidence_collection', 
      title: 'Evidence Collection', 
      description: 'Upload photos and documents',
      required: false,
      estimatedTime: 10
    },
    { 
      id: 'scope_of_works', 
      title: 'Scope of Works', 
      description: 'Create repair estimates',
      required: true,
      estimatedTime: 20
    },
    { 
      id: 'review_submit', 
      title: 'Review & Submit', 
      description: 'Final review and submission',
      required: true,
      estimatedTime: 5
    }
  ];

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [userData, jobData] = await Promise.all([
          User.me(),
          jobId ? Job.get(jobId) : null
        ]);

        setUser(userData);
        setJob(jobData);
        
        setAssessmentData(prev => ({
          ...prev,
          assessor_id: userData.id,
          company_id: userData.company_id,
          job_id: jobData?.id || null
        }));

        logger.info('Assessment workflow initialized', { 
          jobId, 
          assessorId: userData.id,
          companyId: userData.company_id 
        });
      } catch (error) {
        logger.error('Failed to load assessment data', { error: error.message, jobId });
      }
    };

    loadInitialData();
  }, [jobId]);

  const validateStep = (stepIndex) => {
    const step = steps[stepIndex];
    const newErrors = {};

    switch (step.id) {
      case 'event_details':
        if (!assessmentData.event_details.damage_description?.trim()) {
          newErrors.damage_description = 'Damage description is required';
        }
        if (!assessmentData.event_details.cause_description?.trim()) {
          newErrors.cause_description = 'Cause description is required';
        }
        if (!assessmentData.event_details.event_type) {
          newErrors.event_type = 'Event type is required';
        }
        break;
        
      case 'damage_assessment':
        if (assessmentData.damage_areas.length === 0) {
          newErrors.damage_areas = 'At least one damage area is required';
        }
        break;
        
      case 'scope_of_works':
        if (assessmentData.scope_of_works.length === 0) {
          newErrors.scope_of_works = 'At least one scope item is required';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
      logger.auditLog('assessment_step_completed', { 
        step: steps[currentStep].id,
        jobId: assessmentData.job_id 
      });
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleStepClick = (stepIndex) => {
    // Allow navigation to completed steps
    if (stepIndex <= currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  const updateAssessmentData = (field, value) => {
    setAssessmentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      const finalData = {
        ...assessmentData,
        status: 'completed',
        assessment_date: new Date().toISOString()
      };

      const assessment = await Assessment.submitAssessment(finalData);
      
      logger.auditLog('assessment_submitted', { 
        assessmentId: assessment.id,
        jobId: assessmentData.job_id,
        totalEstimate: assessmentData.total_estimate
      });

      onComplete?.(assessment);
    } catch (error) {
      logger.error('Assessment submission failed', { 
        error: error.message,
        jobId: assessmentData.job_id 
      });
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepStatus = (stepIndex) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'current';
    return 'pending';
  };

  const calculateProgress = () => {
    return ((currentStep + 1) / steps.length) * 100;
  };

  const getTotalEstimatedTime = () => {
    return steps.reduce((total, step) => total + step.estimatedTime, 0);
  };

  const getRemainingTime = () => {
    return steps.slice(currentStep).reduce((total, step) => total + step.estimatedTime, 0);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Progress Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                Assessment: {job?.claim_number || 'New Assessment'}
              </h1>
              <p className="text-sm text-slate-600">
                Step {currentStep + 1} of {steps.length} • ~{getRemainingTime()} minutes remaining
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600">
                {Math.round(calculateProgress())}% Complete
              </p>
              <p className="text-xs text-slate-500">
                Total time: ~{getTotalEstimatedTime()} minutes
              </p>
            </div>
          </div>
          
          <Progress value={calculateProgress()} className="h-2" />
          
          {/* Step Navigation */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2">
            {steps.map((step, index) => {
              const status = getStepStatus(index);
              return (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(index)}
                  disabled={index > currentStep}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    status === 'completed' 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : status === 'current'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  } ${index > currentStep ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {status === 'completed' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : status === 'current' ? (
                    <Clock className="w-4 h-4" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-current" />
                  )}
                  <span>{step.title}</span>
                  {step.required && (
                    <span className="text-red-500">*</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentStep === 0 && <FileText className="w-5 h-5 text-blue-600" />}
              {currentStep === 1 && <AlertTriangle className="w-5 h-5 text-orange-600" />}
              {currentStep === 2 && <Camera className="w-5 h-5 text-purple-600" />}
              {currentStep === 3 && <FileText className="w-5 h-5 text-green-600" />}
              {currentStep === 4 && <Send className="w-5 h-5 text-slate-600" />}
              {steps[currentStep].title}
            </CardTitle>
            <p className="text-slate-600">{steps[currentStep].description}</p>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span>Estimated time: {steps[currentStep].estimatedTime} minutes</span>
              {steps[currentStep].required && (
                <Badge variant="outline" className="text-red-600 border-red-200">
                  Required
                </Badge>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Render current step content */}
            {currentStep === 0 && (
              <EventDetailsStep 
                data={assessmentData.event_details}
                onChange={(data) => updateAssessmentData('event_details', data)}
                errors={errors}
                job={job}
              />
            )}
            
            {currentStep === 1 && (
              <DamageAssessmentStep 
                data={assessmentData.damage_areas}
                onChange={(data) => updateAssessmentData('damage_areas', data)}
                errors={errors}
              />
            )}
            
            {currentStep === 2 && (
              <EvidenceCollectionStep 
                photos={assessmentData.photos}
                documents={assessmentData.documents}
                onPhotosChange={(photos) => updateAssessmentData('photos', photos)}
                onDocumentsChange={(documents) => updateAssessmentData('documents', documents)}
              />
            )}
            
            {currentStep === 3 && (
              <ScopeOfWorksStep 
                data={assessmentData.scope_of_works}
                onChange={(data) => {
                  updateAssessmentData('scope_of_works', data);
                  const total = data.reduce((sum, item) => sum + (item.total || 0), 0);
                  updateAssessmentData('total_estimate', total);
                }}
                errors={errors}
              />
            )}
            
            {currentStep === 4 && (
              <ReviewSubmitStep 
                assessmentData={assessmentData}
                job={job}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                errors={errors}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Navigation Footer */}
      <div className="bg-white border-t border-slate-200 sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              {Object.keys(errors).length > 0 && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Please fix errors to continue</span>
                </div>
              )}
            </div>

            {currentStep < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={Object.keys(errors).length > 0}
                className="bg-slate-800 hover:bg-slate-900"
              >
                Next Step
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || Object.keys(errors).length > 0}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Assessment
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Individual step components would be implemented here
// For brevity, I'm including placeholder components

function EventDetailsStep({ data, onChange, errors, job }) {
  return (
    <div className="space-y-4">
      <p className="text-slate-600">Document the event details and initial observations.</p>
      {/* Event details form implementation */}
    </div>
  );
}

function DamageAssessmentStep({ data, onChange, errors }) {
  return (
    <div className="space-y-4">
      <p className="text-slate-600">Assess and document all areas of damage.</p>
      {/* Damage assessment form implementation */}
    </div>
  );
}

function EvidenceCollectionStep({ photos, documents, onPhotosChange, onDocumentsChange }) {
  return (
    <div className="space-y-4">
      <p className="text-slate-600">Upload supporting photos and documents.</p>
      {/* File upload implementation */}
    </div>
  );
}

function ScopeOfWorksStep({ data, onChange, errors }) {
  return (
    <div className="space-y-4">
      <p className="text-slate-600">Create detailed repair and replacement estimates.</p>
      {/* Scope of works form implementation */}
    </div>
  );
}

function ReviewSubmitStep({ assessmentData, job, onSubmit, isSubmitting, errors }) {
  return (
    <div className="space-y-6">
      <div className="bg-slate-50 p-4 rounded-lg">
        <h3 className="font-semibold text-slate-800 mb-2">Assessment Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-600">Damage Areas:</span>
            <span className="ml-2 font-medium">{assessmentData.damage_areas.length}</span>
          </div>
          <div>
            <span className="text-slate-600">Photos:</span>
            <span className="ml-2 font-medium">{assessmentData.photos.length}</span>
          </div>
          <div>
            <span className="text-slate-600">Documents:</span>
            <span className="ml-2 font-medium">{assessmentData.documents.length}</span>
          </div>
          <div>
            <span className="text-slate-600">Total Estimate:</span>
            <span className="ml-2 font-medium">${assessmentData.total_estimate.toLocaleString()}</span>
          </div>
        </div>
      </div>
      
      {errors.submit && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{errors.submit}</p>
        </div>
      )}
    </div>
  );
}