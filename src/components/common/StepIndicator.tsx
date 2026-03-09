'use client';

import { Badge } from '@/components/ui/badge';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex-1">
        <div className="w-full bg-gray-200 h-1 rounded-full">
          <div
            className="bg-black h-1 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>
      <Badge variant="outline" className="ml-4 border-black text-black">
        {currentStep}/{totalSteps}
      </Badge>
    </div>
  );
}
