import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Assessment } from "@/api/entities";
import { User } from "@/api/entities";
import { Job } from "@/api/entities";
import { createPageUrl } from "@/utils";

import Step1_SelectJob from "../components/assessment/Step1_SelectJob";
import Step2_EventDetails from "../components/assessment/Step2_EventDetails";
import Step3_DamageAreas from "../components/assessment/Step3_DamageAreas";
import Step4_Attachments from "../components/assessment/Step4_Attachments";
import Step5_Review from "../components/assessment/Step5_Review";
import Step6_PolicyReview from "../components/assessment/Step6_PolicyReview";
import Step7_AdditionalInfo from "../components/assessment/Step7_AdditionalInfo";
import Step8_ScopeOfWorks from "../components/assessment/Step8_ScopeOfWorks";
import Step9_ReportGeneration from "../components/assessment/Step9_ReportGeneration";
import Step10_Submission from "../components/assessment/Step10_Submission";

const steps = [
  "Select Job", 
  "Event Details", 
  "Damage Areas", 
  "Attachments", 
  "Review", 
  "Policy Check",
  "Additional Info",
  "Scope of Works", 
  "Generate Report",
  "Submit"
];

export default function StartAssessment() {
  const navigate = useNavigate();
  const location = useLocation();
  const jobId = new URLSearchParams(location.search).get('jobId');
  
  // Start at step 1 if jobId provided (skip job selection), otherwise step 0
  const [currentStep, setCurrentStep] = useState(jobId ? 1 : 0);
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [policyReviewResult, setPolicyReviewResult] = useState(null);
  const [assessmentData, setAssessmentData] = useState({
    job_id: jobId || null,
    assessor_id: null,
    event_details: {},
    damage_areas: [],
    photos: [],
    documents: [],
    additional_info_requests: [],
    scope_of_works: [],
    ai_analysis: null,
    status: 'in_progress',
    assessment_date: new Date().toISOString(),
    total_estimate: 0,
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        setAssessmentData(prev => ({ ...prev, assessor_id: currentUser.id }));
        
        if (jobId) {
          try {
            const jobData = await Job.get(jobId);
            setAssessmentData(prev => ({
              ...prev,
              job_id: jobData.id,
              event_details: { 
                ...prev.event_details, 
                event_type: jobData.event_type,
                pds_document_id: jobData.pds_document_id
              }
            }));
          } catch (error) {
            console.error("Error loading job:", error);
            setCurrentStep(0);
          }
        }
      } catch (e) {
        console.error("User not found");
        navigate(createPageUrl("Dashboard"));
      }
    };
    loadUser();
  }, [navigate, jobId]);

  const updateAssessmentData = (field, value) => {
    setAssessmentData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };
  
  const handleBack = () => {
    if (currentStep === 0) {
      navigate(createPageUrl("Assessments"));
    } else {
      setCurrentStep(prev => Math.max(prev - 1, 0));
    }
  };

  const handleJobSelect = (job) => {
    updateAssessmentData('job_id', job.id);
    updateAssessmentData('event_details', { 
      ...assessmentData.event_details, 
      event_type: job.event_type,
      pds_document_id: job.pds_document_id
    });
    handleNext();
  };

  const handlePolicyReview = (result) => {
    setPolicyReviewResult(result);
    updateAssessmentData('ai_analysis', result);
    
    if (result.recommendation === 'additional_info_needed') {
      setCurrentStep(6); // Additional Info
    } else if (result.recommendation === 'proceed') {
      setCurrentStep(7); // Scope of Works
    } else {
      setCurrentStep(9); // Skip to Submission
    }
  };

  const handleAdditionalInfoComplete = () => {
    setCurrentStep(7); // Scope of Works
  };

  const handleScopeComplete = () => {
    setCurrentStep(8); // Report Generation
  };

  const handleReportComplete = () => {
    setCurrentStep(9); // Submission
  };

  const handleFinalSubmit = async (enhancedAssessmentData) => {
    setIsSubmitting(true);
    try {
      const assessmentStatus = policyReviewResult?.recommendation === 'additional_info_needed'
        ? 'pending_review'
        : 'completed';
      
      const finalAssessmentData = {
        ...enhancedAssessmentData,
        status: assessmentStatus
      };
      
      const createdAssessment = await Assessment.create(finalAssessmentData);
      
      let newJobStatus = 'assessed';
      if (policyReviewResult?.recommendation === 'additional_info_needed') {
        newJobStatus = 'pending_completion';
      } else if (policyReviewResult?.recommendation === 'refer_to_insurer') {
        newJobStatus = 'awaiting_insurer';
      }
      
      if (enhancedAssessmentData.job_id) {
        await Job.update(enhancedAssessmentData.job_id, { 
          status: newJobStatus,
          assessment_id: createdAssessment.id,
          total_estimate: enhancedAssessmentData.total_estimate || 0,
          scope_of_works: enhancedAssessmentData.scope_of_works || []
        });
      }
      
      navigate(createPageUrl("Dashboard"));
    } catch (error) {
      console.error("Error submitting assessment:", error);
      alert("Failed to submit assessment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <Step1_SelectJob onJobSelect={handleJobSelect} />;
      case 1:
        return (
          <Step2_EventDetails
            eventDetails={assessmentData.event_details}
            onUpdate={(eventDetails) => updateAssessmentData('event_details', eventDetails)}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <Step3_DamageAreas
            damageAreas={assessmentData.damage_areas}
            onUpdate={(damageAreas) => updateAssessmentData('damage_areas', damageAreas)}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <Step4_Attachments
            photos={assessmentData.photos}
            documents={assessmentData.documents}
            onPhotosUpdate={(photos) => updateAssessmentData('photos', photos)}
            onDocumentsUpdate={(documents) => updateAssessmentData('documents', documents)}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <Step5_Review
            assessmentData={assessmentData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 5:
        return (
          <Step6_PolicyReview
            assessmentData={assessmentData}
            onPolicyReview={handlePolicyReview}
            onBack={handleBack}
          />
        );
      case 6:
        return (
          <Step7_AdditionalInfo
            additionalInfoRequests={assessmentData.additional_info_requests}
            onUpdate={(additionalInfo) => updateAssessmentData('additional_info_requests', additionalInfo)}
            onComplete={handleAdditionalInfoComplete}
            onBack={handleBack}
          />
        );
      case 7:
        return (
          <Step8_ScopeOfWorks
            scopeOfWorks={assessmentData.scope_of_works}
            onUpdate={(scopeOfWorks) => updateAssessmentData('scope_of_works', scopeOfWorks)}
            onComplete={handleScopeComplete}
            onBack={handleBack}
          />
        );
      case 8:
        return (
          <Step9_ReportGeneration
            assessmentData={assessmentData}
            onComplete={handleReportComplete}
            onBack={handleBack}
          />
        );
      case 9:
        return (
          <Step10_Submission
            assessmentData={assessmentData}
            onSubmit={handleFinalSubmit}
            isSubmitting={isSubmitting}
            policyReviewResult={policyReviewResult}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {renderStep()}
    </div>
  );
}