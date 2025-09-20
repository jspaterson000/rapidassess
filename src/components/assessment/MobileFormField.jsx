import React from 'react';
import { Label } from '@/components/ui/label';
import { CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function MobileFormField({ 
  label, 
  required = false, 
  completed = false, 
  error = null,
  helpText = null,
  children 
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Label className="text-base font-medium text-slate-900">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        
        {completed && (
          <CheckCircle2 className="w-5 h-5 text-green-600" />
        )}
        
        {helpText && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="text-slate-400 hover:text-slate-600 p-1">
                  <HelpCircle className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">{helpText}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      {children}
      
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}