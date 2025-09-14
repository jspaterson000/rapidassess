
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Assessment } from "@/api/entities";
import { User } from "@/api/entities";
import { Job } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { ArrowLeft } from "lucide-react";

import AssessmentStepper from "../components/assessment/AssessmentStepper";
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
  
  const [currentStep, setCurrentStep] = useState(0);
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [policyReviewResult, setPolicyReviewResult] = useState(null);
  const [assessmentData, setAssessmentData] = useState(() => ({
    job_id: new URLSearchParams(location.search).get('jobId') || null,
    pds_document_id: null,
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
    total_estimate: 0, // Initialize total_estimate
  }));

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        setAssessmentData(prev => ({ ...prev, assessor_id: currentUser.id }));
        if (new URLSearchParams(location.search).get('jobId')) {
          setCurrentStep(1); // Skip job selection if jobId is in URL
        }
      } catch (e) {
        console.error("User not found");
        navigate(createPageUrl("Dashboard"));
      }
    };
    loadUser();
  }, [navigate, location.search]);

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
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleJobSelect = (job) => {
    updateAssessmentData('job_id', job.id);
    updateAssessmentData('pds_document_id', job.pds_document_id); // Update pds_document_id
    updateAssessmentData('event_details', { ...assessmentData.event_details, event_type: job.event_type });
    handleNext();
  };

  const handlePolicyReview = (result) => {
    setPolicyReviewResult(result);
    updateAssessmentData('ai_analysis', result);
    
    // Navigate to appropriate next step based on result
    if (result.recommendation === 'additional_info_needed') {
      setCurrentStep(6); // Step7_AdditionalInfo
    } else if (result.recommendation === 'proceed') {
      setCurrentStep(7); // Step8_ScopeOfWorks
    } else {
      setCurrentStep(9); // Step10_Submission (skip scope and report gen)
    }
  };

  const handleAdditionalInfoComplete = () => {
    setCurrentStep(7); // Move to Scope of Works
  };

  const handleScopeComplete = () => {
    setCurrentStep(8); // Move to Report Generation
  };

  const handleReportComplete = () => {
    setCurrentStep(9); // Move to Final Submission
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
      
      // Create the assessment with the enhanced data including scope and total
      const createdAssessment = await Assessment.create(finalAssessmentData);
      
      let newJobStatus = 'assessed';
      if (policyReviewResult?.recommendation === 'additional_info_needed') {
        newJobStatus = 'pending_completion';
      } else if (policyReviewResult?.recommendation === 'refer_to_insurer') {
        newJobStatus = 'awaiting_insurer';
      }
      
      // Update the job with the assessment data and total estimate
      if (enhancedAssessmentData.job_id) {
        await Job.update(enhancedAssessmentData.job_id, { 
          status: newJobStatus,
          assessment_id: createdAssessment.id,
          total_estimate: enhancedAssessmentData.total_estimate || 0,
          scope_of_works: enhancedAssessmentData.scope_of_works || []
        });
      }
      
      navigate(createPageUrl("Dashboard")); // Navigate to Dashboard after successful submission
    } catch (error) {
      console.error("Error submitting assessment:", error);
      alert("Failed to submit assessment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getVisibleSteps = () => {
    // Show only relevant steps based on policy review result
    let visibleSteps = steps.slice(0, 6); 
    
    if (policyReviewResult?.recommendation === 'additional_info_needed') {
      visibleSteps.push('Additional Info');
      // If we are past the Additional Info step, show Scope of Works and Generate Report
      // This logic is for the stepper visibility, not for enabling navigation directly.
      // The currentStep value will drive which component is rendered.
      if (currentStep >= 7) { 
        visibleSteps.push('Scope of Works');
        if (currentStep >= 8) {
          visibleSteps.push('Generate Report');
        }
      }
    }
    
    if (policyReviewResult?.recommendation === 'proceed') {
      visibleSteps.push('Scope of Works', 'Generate Report');
    }
    
    // Ensure "Submit" is always the last visible step
    if (!visibleSteps.includes('Submit')) {
        visibleSteps.push('Submit');
    }
    return visibleSteps;
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
    <div className="min-h-screen bg-gray-50">
      <style>
        {`
          @keyframes slideInContent {
            from {
              opacity: 0;
              transform: translateY(12px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          .content-enter {
            animation: slideInContent 0.4s ease-out;
          }

          .fade-in {
            animation: fadeIn 0.3s ease-out;
          }

          /* Mobile optimized touch targets */
          @media (max-width: 768px) {
            .mobile-touch {
              min-height: 44px;
              min-width: 44px;
            }
          }

          /* Clean button interactions */
          .btn-clean {
            transition: all 0.2s ease;
          }

          .btn-clean:active {
            transform: scale(0.98);
          }

          /* Tactile card feel */
          .card-tactile {
            transition: all 0.2s ease;
            box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
          }

          .card-tactile:active {
            box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            transform: translateY(1px);
          }
        `}
      </style>

      <div className="p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Back Button */}
          <button
            onClick={() => navigate(createPageUrl("Assessments"))}
            className="fade-in inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back to Assessments</span>
          </button>

          {/* Main Assessment Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Progress Header */}
            <div className="px-6 py-4 border-b border-gray-100">
              <AssessmentStepper steps={getVisibleSteps()} currentStep={currentStep} />
            </div>

            {/* Content */}
            <div className="p-6 md:p-8">
              <div className="content-enter">
                {renderStep()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
