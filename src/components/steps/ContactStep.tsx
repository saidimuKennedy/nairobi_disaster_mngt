'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { StepIndicator } from '@/components/common/StepIndicator';

interface ContactStepProps {
  phoneNumber: string;
  onNext: (data: { name?: string; permission: boolean }) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

export function ContactStep({
  phoneNumber,
  onNext,
  onBack,
  currentStep,
  totalSteps,
}: ContactStepProps) {
  const [name, setName] = useState('');
  const [permission, setPermission] = useState(true);

  const handleSubmit = () => {
    onNext({
      name: name || undefined,
      permission,
    });
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <Card className="p-6 border-gray-200">
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

        <h2 className="text-xl font-bold mb-6 text-black">Your Details</h2>

        <div className="space-y-4">
          <div>
            <Label className="text-black font-semibold">Your Phone Number</Label>
            <div className="mt-2 p-3 bg-gray-100 rounded border border-gray-300 text-black font-medium">
              {phoneNumber}
            </div>
          </div>

          <div>
            <Label htmlFor="name" className="text-black font-semibold">
              Your Name (optional)
            </Label>
            <Input
              id="name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-gray-300 text-black"
            />
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox
              id="permission"
              checked={permission}
              onCheckedChange={(checked) => setPermission(checked as boolean)}
              className="border-black"
            />
            <Label htmlFor="permission" className="text-black font-medium cursor-pointer">
              County team may contact me for more information
            </Label>
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
