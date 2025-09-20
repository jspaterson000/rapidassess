import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function MobileStepContainer({ 
  children, 
  onNext, 
  onBack,
  nextLabel = "Continue",
  nextDisabled = false,
  showNext = true,
  showBack = true,
  nextVariant = "default",
  isComplete = false
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Content Area */}
      <div className="flex-1 px-4 py-6">
        {children}
      </div>

      {/* Fixed Bottom Actions */}
      <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 shadow-lg">
        <div className="flex gap-3">
          {showBack && (
            <Button
              variant="outline"
              onClick={onBack}
              className="flex-1 h-12 text-base font-medium"
            >
              Back
            </Button>
          )}
          
          {showNext && (
            <Button
              onClick={onNext}
              disabled={nextDisabled}
              variant={nextVariant}
              className={`flex-1 h-12 text-base font-medium ${
                nextVariant === "default" ? "bg-slate-800 hover:bg-slate-900 text-white" : ""
              }`}
            >
              <span>{nextLabel}</span>
              {isComplete ? (
                <CheckCircle2 className="w-5 h-5 ml-2" />
              ) : (
                <ArrowRight className="w-5 h-5 ml-2" />
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}