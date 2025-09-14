import React from 'react';
import { Check } from 'lucide-react';

export default function AssessmentStepper({ steps, currentStep }) {
  // Create mobile-friendly step names
  const getMobileStepName = (step) => {
    const mobileNames = {
      'Select Job': 'Select',
      'Event Details': 'Event',
      'Damage Areas': 'Damage',
      'Attachments': 'Files',
      'Review': 'Review',
      'Policy Check': 'Policy',
      'Additional Info': 'Info',
      'Scope of Works': 'Scope',
      'Generate Report': 'Report',
      'Submit': 'Submit'
    };
    return mobileNames[step] || step;
  };

  return (
    <nav aria-label="Progress" className="mb-8">
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
              box-shadow: 0 0 0 0 rgba(51, 65, 85, 0.4);
            }
            50% {
              transform: scale(1.08);
              box-shadow: 0 0 0 10px rgba(51, 65, 85, 0);
            }
          }

          @keyframes checkmarkGrow {
            0% {
              transform: scale(0);
              opacity: 0;
            }
            50% {
              transform: scale(1.2);
              opacity: 1;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }

          @keyframes completedBounce {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.1);
            }
            100% {
              transform: scale(1);
            }
          }

          .step-container {
            animation: stepAppear 0.6s ease-out forwards;
          }

          .progress-line {
            transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }

          .step-circle {
            transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }

          .step-circle.current {
            animation: pulseStep 1.8s infinite ease-in-out;
          }

          .step-circle.completed {
            background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
            animation: completedBounce 0.5s ease-out;
          }

          .step-circle.completed .check-icon {
            animation: checkmarkGrow 0.6s ease-out forwards;
          }

          .progress-line.completed {
            background: linear-gradient(90deg, #16a34a 0%, #15803d 100%);
            transform: scaleX(1);
          }

          /* Mobile optimizations */
          @media (max-width: 768px) {
            .step-circle.current {
              animation: pulseStep 2.5s infinite ease-in-out;
            }
          }
        `}
      </style>
      
      {/* Mobile Layout */}
      <div className="block md:hidden">
        <div className="overflow-x-auto pb-2">
          <div className="flex items-center gap-2 min-w-max px-4">
            {steps.map((step, stepIdx) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center gap-1 min-w-[60px]">
                  {stepIdx < currentStep ? (
                    <>
                      <div className="step-circle completed w-8 h-8 flex items-center justify-center rounded-full shadow-lg border-2 border-green-600">
                        <Check className="w-4 h-4 text-white font-bold" strokeWidth={3} />
                      </div>
                      <span className="text-xs font-semibold text-green-600 text-center leading-tight">
                        {getMobileStepName(step)}
                      </span>
                    </>
                  ) : stepIdx === currentStep ? (
                    <>
                      <div className="step-circle current w-8 h-8 flex items-center justify-center border-2 border-slate-700 rounded-full bg-white shadow-lg">
                        <span className="h-2 w-2 bg-slate-700 rounded-full" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 text-center leading-tight">
                        {getMobileStepName(step)}
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="step-circle w-8 h-8 flex items-center justify-center border-2 border-slate-300 rounded-full bg-white shadow-sm">
                        <span className="h-2 w-2 bg-slate-300 rounded-full" />
                      </div>
                      <span className="text-xs font-medium text-slate-500 text-center leading-tight">
                        {getMobileStepName(step)}
                      </span>
                    </>
                  )}
                </div>
                
                {stepIdx < steps.length - 1 && (
                  <div className="flex-1 min-w-[20px] h-0.5 bg-slate-200 rounded-full overflow-hidden mt-4">
                    <div 
                      className={`progress-line h-full rounded-full transition-all duration-1000 ease-out ${
                        stepIdx < currentStep ? 'completed' : 'w-0'
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
      <div className="hidden md:block">
        <ol role="list" className="flex items-center justify-between max-w-4xl mx-auto">
          {steps.map((step, stepIdx) => (
            <React.Fragment key={step}>
              <li className="step-container relative flex-shrink-0 flex flex-col items-center group">
                <div className="flex flex-col items-center gap-3 w-24">
                  {stepIdx < currentStep ? (
                    <>
                      <div className="step-circle completed relative w-10 h-10 flex items-center justify-center rounded-full shadow-lg border-2 border-green-600">
                        <Check 
                          className="check-icon w-5 h-5 text-white font-bold" 
                          strokeWidth={3}
                          aria-hidden="true" 
                        />
                      </div>
                      <span className="step-label text-xs font-semibold text-green-600 text-center leading-tight px-1">
                        {step}
                      </span>
                    </>
                  ) : stepIdx === currentStep ? (
                    <>
                      <div className="step-circle current relative w-10 h-10 flex items-center justify-center border-3 border-slate-700 rounded-full bg-white shadow-lg">
                        <span className="h-3 w-3 bg-slate-700 rounded-full" />
                      </div>
                      <span className="step-label text-xs font-bold text-slate-800 text-center leading-tight px-1">
                        {step}
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="step-circle relative w-10 h-10 flex items-center justify-center border-2 border-slate-300 rounded-full bg-white shadow-sm transition-all duration-300 group-hover:border-slate-400">
                        <span className="h-2.5 w-2.5 bg-slate-300 rounded-full transition-all duration-300 group-hover:bg-slate-400" />
                      </div>
                      <span className="step-label text-xs font-medium text-slate-500 text-center leading-tight px-1 transition-colors duration-300 group-hover:text-slate-600">
                        {step}
                      </span>
                    </>
                  )}
                </div>
              </li>
              
              {stepIdx < steps.length - 1 && (
                <div className="flex-1 flex items-center justify-center mt-5 mx-3">
                  <div className="h-0.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`progress-line h-full rounded-full transition-all duration-1000 ease-out ${
                        stepIdx < currentStep 
                          ? 'completed' 
                          : stepIdx === currentStep 
                            ? 'in-progress w-0' 
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