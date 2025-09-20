import React from 'react';
import { ArrowLeft, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function MobileAssessmentHeader({ 
  currentStep, 
  totalSteps, 
  stepTitle, 
  stepDescription,
  estimatedTime,
  onBack,
  showBackButton = true 
}) {
  const progress = ((currentStep + 1) / totalSteps) * 100;
  
  return (
    <div className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="px-4 py-3">
        {/* Top Row - Back Button and Progress */}
        <div className="flex items-center justify-between mb-3">
          {showBackButton ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="h-10 w-10 p-0 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          ) : (
            <div className="w-10" />
          )}
          
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="font-medium">{currentStep + 1}</span>
            <span className="text-slate-400">/</span>
            <span>{totalSteps}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock className="w-4 h-4" />
            <span>{estimatedTime}m</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>Started</span>
            <span>{Math.round(progress)}% complete</span>
            <span>Done</span>
          </div>
        </div>

        {/* Step Info */}
        <div className="text-center">
          <h1 className="text-xl font-bold text-slate-900 mb-1">{stepTitle}</h1>
          <p className="text-sm text-slate-600">{stepDescription}</p>
        </div>
      </div>
    </div>
  );
}