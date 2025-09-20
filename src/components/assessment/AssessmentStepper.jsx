import React from 'react';
import { Check, Clock, AlertCircle } from 'lucide-react';

export default function AssessmentStepper({ steps, currentStep }) {
  // Estimated time per step (in minutes)
  const stepTimes = {
    'Select Job': 1,
    'Event Details': 5,
    'Damage Areas': 10,
    'Attachments': 5,
    'Review': 3,
    'Policy Check': 2,
    'Additional Info': 8,
    'Scope of Works': 15,
    'Generate Report': 3,
    'Submit': 2
  };

  // Calculate total remaining time
  const getRemainingTime = () => {
    const remainingSteps = steps.slice(currentStep);
    return remainingSteps.reduce((total, step) => total + (stepTimes[step] || 0), 0);
  };

  // Create mobile-friendly step names with better UX
  const getMobileStepName = (step) => {
    const mobileNames = {
      'Select Job': 'Job',
      'Event Details': 'Event',
      'Damage Areas': 'Damage',
      'Attachments': 'Files',
      'Review': 'Review',
      'Policy Check': 'Policy',
      'Additional Info': 'Info',
      'Scope of Works': 'Quote',
      'Generate Report': 'Report',
      'Submit': 'Submit'
    };
    return mobileNames[step] || step;
  };

  const getStepDescription = (step) => {
    const descriptions = {
      'Select Job': 'Choose which job to assess',
      'Event Details': 'Describe the incident and damage',
      'Damage Areas': 'Document specific damage locations',
      'Attachments': 'Upload photos and documents',
      'Review': 'Check all information is correct',
      'Policy Check': 'AI analysis against policy terms',
      'Additional Info': 'Provide requested information',
      'Scope of Works': 'Create repair cost estimate',
      'Generate Report': 'Compile professional report',
      'Submit': 'Finalize and submit assessment'
    };
    return descriptions[step] || '';
  };

  return (
    <nav aria-label="Assessment Progress" className="mb-8">
      <style>
        {`
          @keyframes stepAppear {
            0% {
              opacity: 0;
              transform: translateY(-10px) scale(0.9);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes pulseStep {
            0%, 100% {
              transform: scale(1);
              box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
            }
            50% {
              transform: scale(1.05);
              box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
            }
          }

          @keyframes checkmarkGrow {
            0% {
              transform: scale(0) rotate(0deg);
              opacity: 0;
            }
            50% {
              transform: scale(1.2) rotate(180deg);
              opacity: 1;
            }
            100% {
              transform: scale(1) rotate(360deg);
              opacity: 1;
            }
          }

          @keyframes progressFill {
            0% {
              transform: scaleX(0);
            }
            100% {
              transform: scaleX(1);
            }
          }

          .step-container {
            animation: stepAppear 0.6s ease-out forwards;
          }

          .progress-line {
            transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            transform-origin: left;
          }

          .step-circle {
            transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }

          .step-circle.current {
            animation: pulseStep 2s infinite ease-in-out;
          }

          .step-circle.completed {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            border-color: #10b981;
          }

          .step-circle.completed .check-icon {
            animation: checkmarkGrow 0.8s ease-out forwards;
          }

          .progress-line.completed {
            background: linear-gradient(90deg, #10b981 0%, #059669 100%);
            animation: progressFill 0.8s ease-out forwards;
          }

          .progress-line.in-progress {
            background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 50%, #e5e7eb 50%, #e5e7eb 100%);
            animation: progressFill 0.8s ease-out forwards;
          }

          /* Improved mobile touch targets */
          @media (max-width: 768px) {
            .step-circle {
              min-width: 36px;
              min-height: 36px;
            }
            
            .step-circle.current {
              animation: pulseStep 2.5s infinite ease-in-out;
            }
          }
        `}
      </style>
      
      {/* Progress Summary Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-slate-800">Assessment Progress</h3>
            <p className="text-sm text-slate-500">
              Step {currentStep + 1} of {steps.length}: {steps[currentStep]}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock className="w-4 h-4" />
              <span>~{getRemainingTime()} min remaining</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {Math.round(((currentStep) / steps.length) * 100)}% complete
            </div>
          </div>
        </div>
        
        {/* Overall Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>
      
      {/* Mobile Layout */}
      <div className="block lg:hidden">
        <div className="overflow-x-auto pb-4">
          <div className="flex items-start gap-3 min-w-max px-2">
            {steps.map((step, stepIdx) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center gap-2 min-w-[80px]">
                  {stepIdx < currentStep ? (
                    <>
                      <div className="step-circle completed w-10 h-10 flex items-center justify-center rounded-full shadow-lg border-2 border-emerald-500 bg-emerald-500">
                        <Check className="check-icon w-5 h-5 text-white font-bold" strokeWidth={3} />
                      </div>
                      <div className="text-center">
                        <span className="text-xs font-semibold text-emerald-600 leading-tight block">
                          {getMobileStepName(step)}
                        </span>
                        <span className="text-xs text-emerald-500 leading-tight block">
                          ✓ Done
                        </span>
                      </div>
                    </>
                  ) : stepIdx === currentStep ? (
                    <>
                      <div className="step-circle current w-10 h-10 flex items-center justify-center border-3 border-blue-500 rounded-full bg-white shadow-lg">
                        <span className="h-3 w-3 bg-blue-500 rounded-full" />
                      </div>
                      <div className="text-center">
                        <span className="text-xs font-bold text-blue-600 leading-tight block">
                          {getMobileStepName(step)}
                        </span>
                        <span className="text-xs text-blue-500 leading-tight block">
                          ~{stepTimes[step] || 0}m
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="step-circle w-10 h-10 flex items-center justify-center border-2 border-slate-300 rounded-full bg-white shadow-sm">
                        <span className="h-2.5 w-2.5 bg-slate-300 rounded-full" />
                      </div>
                      <div className="text-center">
                        <span className="text-xs font-medium text-slate-500 leading-tight block">
                          {getMobileStepName(step)}
                        </span>
                        <span className="text-xs text-slate-400 leading-tight block">
                          {stepTimes[step] || 0}m
                        </span>
                      </div>
                    </>
                  )}
                </div>
                
                {stepIdx < steps.length - 1 && (
                  <div className="flex-1 min-w-[24px] h-0.5 bg-slate-200 rounded-full overflow-hidden mt-5">
                    <div 
                      className={`progress-line h-full rounded-full transition-all duration-1000 ease-out ${
                        stepIdx < currentStep ? 'completed' : 
                        stepIdx === currentStep ? 'in-progress w-1/2' : 'w-0'
                      }`}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <ol role="list" className="flex items-start justify-between max-w-5xl mx-auto">
          {steps.map((step, stepIdx) => (
            <React.Fragment key={step}>
              <li className="step-container relative flex-shrink-0 flex flex-col items-center group max-w-[140px]">
                <div className="flex flex-col items-center gap-3 w-full">
                  {stepIdx < currentStep ? (
                    <>
                      <div className="step-circle completed relative w-12 h-12 flex items-center justify-center rounded-full shadow-lg border-2 border-emerald-500 bg-emerald-500">
                        <Check 
                          className="check-icon w-6 h-6 text-white font-bold" 
                          strokeWidth={3}
                          aria-hidden="true" 
                        />
                      </div>
                      <div className="text-center">
                        <span className="text-sm font-semibold text-emerald-600 leading-tight block">
                          {step}
                        </span>
                        <span className="text-xs text-emerald-500 leading-tight block mt-1">
                          Completed
                        </span>
                      </div>
                    </>
                  ) : stepIdx === currentStep ? (
                    <>
                      <div className="step-circle current relative w-12 h-12 flex items-center justify-center border-3 border-blue-500 rounded-full bg-white shadow-lg">
                        <span className="h-4 w-4 bg-blue-500 rounded-full" />
                      </div>
                      <div className="text-center">
                        <span className="text-sm font-bold text-blue-600 leading-tight block">
                          {step}
                        </span>
                        <span className="text-xs text-blue-500 leading-tight block mt-1">
                          Current • ~{stepTimes[step] || 0} min
                        </span>
                        <span className="text-xs text-slate-500 leading-tight block mt-1">
                          {getStepDescription(step)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="step-circle relative w-12 h-12 flex items-center justify-center border-2 border-slate-300 rounded-full bg-white shadow-sm transition-all duration-300 group-hover:border-slate-400 group-hover:shadow-md">
                        <span className="h-3 w-3 bg-slate-300 rounded-full transition-all duration-300 group-hover:bg-slate-400" />
                      </div>
                      <div className="text-center">
                        <span className="text-sm font-medium text-slate-500 leading-tight block transition-colors duration-300 group-hover:text-slate-600">
                          {step}
                        </span>
                        <span className="text-xs text-slate-400 leading-tight block mt-1">
                          ~{stepTimes[step] || 0} minutes
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </li>
              
              {stepIdx < steps.length - 1 && (
                <div className="flex-1 flex items-center justify-center mt-6 mx-4">
                  <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`progress-line h-full rounded-full transition-all duration-1000 ease-out ${
                        stepIdx < currentStep 
                          ? 'completed' 
                          : stepIdx === currentStep 
                            ? 'in-progress w-1/3' 
                            : 'w-0'
                      }`}
                    />
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </ol>
      </div>
    </nav>
  );
}