import React from 'react';
import { Check, Clock, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function AssessmentStepper({ steps, currentStep, onStepClick }) {
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

  // Create mobile-friendly step names
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

  const canNavigateToStep = (stepIndex) => {
    // Allow navigation to completed steps and current step
    return stepIndex <= currentStep;
  };

  return (
    <nav aria-label="Assessment Progress" className="mb-6 md:mb-8">
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
            min-width: 44px;
            min-height: 44px;
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

          /* Mobile optimizations */
          @media (max-width: 768px) {
            .step-circle {
              min-width: 48px;
              min-height: 48px;
            }
            
            .step-text {
              font-size: 16px;
              line-height: 1.4;
            }
            
            .step-description {
              font-size: 14px;
              line-height: 1.3;
            }
          }
        `}
      </style>
      
      {/* Mobile-First Progress Summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-6 mb-4 md:mb-6 shadow-sm">
        <div className="flex flex-col space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-slate-800">Assessment Progress</h3>
              <p className="text-sm md:text-base text-slate-600 mt-1">
                Step {currentStep + 1} of {steps.length}: {steps[currentStep]}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-sm md:text-base text-slate-600">
                <Clock className="w-4 h-4 md:w-5 md:h-5" />
                <span className="font-medium">~{getRemainingTime()} min left</span>
              </div>
              <div className="text-xs md:text-sm text-slate-500 mt-1">
                {Math.round(((currentStep) / steps.length) * 100)}% complete
              </div>
            </div>
          </div>
          
          {/* Overall Progress Bar */}
          <div className="space-y-2">
            <Progress 
              value={(currentStep / steps.length) * 100} 
              className="h-3 md:h-4 bg-slate-100"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>Started</span>
              <span>{steps.length - currentStep} steps remaining</span>
              <span>Complete</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Stepper - Horizontal Scroll */}
      <div className="block lg:hidden mb-6">
        <div className="relative">
          {/* Navigation Arrows for Mobile */}
          {currentStep > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full w-10 h-10"
              onClick={() => onStepClick && onStepClick(Math.max(0, currentStep - 1))}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}
          
          {currentStep < steps.length - 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full w-10 h-10"
              disabled
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          )}

          <div className="overflow-x-auto pb-4 px-8">
            <div className="flex items-start gap-4 min-w-max">
              {steps.map((step, stepIdx) => (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center gap-3 min-w-[80px]">
                    <button
                      onClick={() => canNavigateToStep(stepIdx) && onStepClick && onStepClick(stepIdx)}
                      disabled={!canNavigateToStep(stepIdx)}
                      className={`step-circle flex items-center justify-center rounded-full border-3 shadow-lg transition-all duration-300 ${
                        stepIdx < currentStep
                          ? 'completed border-emerald-500 bg-emerald-500 cursor-pointer hover:scale-105'
                          : stepIdx === currentStep
                            ? 'current border-blue-500 bg-white cursor-default'
                            : 'border-slate-300 bg-white cursor-not-allowed opacity-60'
                      }`}
                    >
                      {stepIdx < currentStep ? (
                        <Check className="check-icon w-6 h-6 text-white font-bold" strokeWidth={3} />
                      ) : stepIdx === currentStep ? (
                        <span className="h-4 w-4 bg-blue-500 rounded-full" />
                      ) : (
                        <span className="h-3 w-3 bg-slate-300 rounded-full" />
                      )}
                    </button>
                    
                    <div className="text-center">
                      <span className={`step-text font-medium leading-tight block ${
                        stepIdx < currentStep
                          ? 'text-emerald-600'
                          : stepIdx === currentStep
                            ? 'text-blue-600 font-bold'
                            : 'text-slate-500'
                      }`}>
                        {getMobileStepName(step)}
                      </span>
                      <span className={`step-description text-xs leading-tight block mt-1 ${
                        stepIdx < currentStep
                          ? 'text-emerald-500'
                          : stepIdx === currentStep
                            ? 'text-blue-500'
                            : 'text-slate-400'
                      }`}>
                        {stepIdx < currentStep ? '✓ Done' : 
                         stepIdx === currentStep ? `~${stepTimes[step] || 0}m` : 
                         `${stepTimes[step] || 0}m`}
                      </span>
                    </div>
                  </div>
                  
                  {stepIdx < steps.length - 1 && (
                    <div className="flex-1 min-w-[32px] h-1 bg-slate-200 rounded-full overflow-hidden mt-6">
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
      </div>

      {/* Desktop Layout - Unchanged but with click navigation */}
      <div className="hidden lg:block">
        <ol role="list" className="flex items-start justify-between max-w-6xl mx-auto">
          {steps.map((step, stepIdx) => (
            <React.Fragment key={step}>
              <li className="step-container relative flex-shrink-0 flex flex-col items-center group max-w-[160px]">
                <div className="flex flex-col items-center gap-3 w-full">
                  <button
                    onClick={() => canNavigateToStep(stepIdx) && onStepClick && onStepClick(stepIdx)}
                    disabled={!canNavigateToStep(stepIdx)}
                    className={`step-circle relative flex items-center justify-center rounded-full border-3 shadow-lg transition-all duration-300 ${
                      stepIdx < currentStep
                        ? 'completed border-emerald-500 bg-emerald-500 cursor-pointer hover:scale-105'
                        : stepIdx === currentStep
                          ? 'current border-blue-500 bg-white cursor-default'
                          : 'border-slate-300 bg-white cursor-not-allowed opacity-60'
                    }`}
                  >
                    {stepIdx < currentStep ? (
                      <Check className="check-icon w-6 h-6 text-white font-bold" strokeWidth={3} />
                    ) : stepIdx === currentStep ? (
                      <span className="h-4 w-4 bg-blue-500 rounded-full" />
                    ) : (
                      <span className="h-3 w-3 bg-slate-300 rounded-full" />
                    )}
                  </button>
                  
                  <div className="text-center">
                    <span className={`text-sm font-medium leading-tight block transition-colors duration-300 ${
                      stepIdx < currentStep
                        ? 'text-emerald-600'
                        : stepIdx === currentStep
                          ? 'text-blue-600 font-bold'
                          : 'text-slate-500 group-hover:text-slate-600'
                    }`}>
                      {step}
                    </span>
                    <span className={`text-xs leading-tight block mt-1 ${
                      stepIdx < currentStep
                        ? 'text-emerald-500'
                        : stepIdx === currentStep
                          ? 'text-blue-500'
                          : 'text-slate-400'
                    }`}>
                      {stepIdx < currentStep ? 'Completed' : 
                       stepIdx === currentStep ? `Current • ~${stepTimes[step] || 0} min` : 
                       `~${stepTimes[step] || 0} minutes`}
                    </span>
                    {stepIdx === currentStep && (
                      <span className="text-xs text-slate-500 leading-tight block mt-1">
                        {getStepDescription(step)}
                      </span>
                    )}
                  </div>
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