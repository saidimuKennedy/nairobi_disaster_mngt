'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { StepIndicator } from '@/components/common/StepIndicator';

interface SeverityStepProps {
  onNext: (data: { dangerous: boolean; trapped: boolean; worsening: boolean; people_affected: number }) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

export function SeverityStep({
  onNext,
  onBack,
  currentStep,
  totalSteps,
}: SeverityStepProps) {
  const [dangerous, setDangerous] = useState(false);
  const [trapped, setTrapped] = useState(false);
  const [worsening, setWorsening] = useState(false);
  const [peopleAffected, setPeopleAffected] = useState('0');

  const handleSubmit = () => {
    onNext({
      dangerous,
      trapped,
      worsening,
      people_affected: parseInt(peopleAffected) || 0,
    });
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <Card className="p-6 border-gray-200">
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

        <h2 className="text-xl font-bold mb-6 text-black">Severity Assessment</h2>

        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="dangerous"
              checked={dangerous}
              onCheckedChange={(checked) => setDangerous(checked as boolean)}
              className="border-black"
            />
            <Label htmlFor="dangerous" className="text-black font-medium cursor-pointer">
              Is anyone in immediate danger?
            </Label>
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox
              id="trapped"
              checked={trapped}
              onCheckedChange={(checked) => setTrapped(checked as boolean)}
              className="border-black"
            />
            <Label htmlFor="trapped" className="text-black font-medium cursor-pointer">
              Are people trapped?
            </Label>
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox
              id="worsening"
              checked={worsening}
              onCheckedChange={(checked) => setWorsening(checked as boolean)}
              className="border-black"
            />
            <Label htmlFor="worsening" className="text-black font-medium cursor-pointer">
              Is the situation getting worse?
            </Label>
          </div>

          <div>
            <Label htmlFor="people" className="text-black font-semibold">
              Number of people affected
            </Label>
            <Input
              id="people"
              type="number"
              min="0"
              value={peopleAffected}
              onChange={(e) => setPeopleAffected(e.target.value)}
              className="border-gray-300 text-black"
            />
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={onBack}
              className="flex-1 border-black text-black hover:bg-gray-100"
            >
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-black text-white hover:bg-gray-800"
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
