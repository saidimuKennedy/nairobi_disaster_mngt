'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';

interface ConfirmationStepProps {
  caseId: string;
  priority: string;
  onCheckStatus: () => void;
  onReportAnother: () => void;
}

const priorityColors: Record<string, string> = {
  critical: 'bg-red-600 text-white',
  high: 'bg-orange-600 text-white',
  medium: 'bg-yellow-600 text-white',
  low: 'bg-gray-600 text-white',
};

export function ConfirmationStep({
  caseId,
  priority,
  onCheckStatus,
  onReportAnother,
}: ConfirmationStepProps) {
  return (
    <div className="max-w-md mx-auto p-6">
      <Card className="p-6 border-gray-200">
        <div className="text-center space-y-4">
          <CheckCircle2 className="h-12 w-12 mx-auto text-black" />

          <h2 className="text-2xl font-bold text-black">Report Received</h2>

          <p className="text-gray-600">Your emergency report has been received and is being reviewed.</p>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Case ID</p>
            <p className="text-lg font-mono font-bold text-black">{caseId}</p>
          </div>

          <div>
            <Badge className={`${priorityColors[priority] || priorityColors.medium} text-base px-4 py-2`}>
              {priority.toUpperCase()} Priority
            </Badge>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Safety Tip:</strong> If you are in immediate danger, call 999 emergency service.
            </p>
          </div>

          <div className="flex flex-col gap-3 mt-6">
            <Button
              onClick={onCheckStatus}
              className="w-full bg-black text-white hover:bg-gray-800"
            >
              Check Case Status
            </Button>
            <Button
              onClick={onReportAnother}
              variant="outline"
              className="w-full border-black text-black hover:bg-gray-100"
            >
              Report Another Issue
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
