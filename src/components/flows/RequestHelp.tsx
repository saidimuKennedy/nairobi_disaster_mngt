
'use client';

import { useState } from 'react';
import { LocationStep } from '@/components/steps/LocationStep';
import { SeverityStep } from '@/components/steps/SeverityStep';
import { MediaUploadStep } from '@/components/steps/MediaUploadStep';
import { ContactStep } from '@/components/steps/ContactStep';
import { ConfirmationStep } from '@/components/steps/ConfirmationStep';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface RequestHelpProps {
  phoneNumber: string;
  onBack: () => void;
}

const HELP_TYPES = [
  'Urgent rescue',
  'Ambulance / medical help',
  'Evacuation help',
  'Help for trapped person',
  'Help for stranded person',
  'Help for child / elderly / person with disability',
];

type Step = 'type' | 'location' | 'urgency' | 'media' | 'contact' | 'confirmation';

interface FormData {
  help_type: string;
  constituency: string;
  ward: string;
  landmark?: string;
  life_threatening: boolean;
  people_affected: number;
  media_urls: string[];
  name?: string;
  permission: boolean;
}

export function RequestHelp({ phoneNumber, onBack }: RequestHelpProps) {
  const [step, setStep] = useState<Step>('type');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [caseId, setCaseId] = useState('');
  const [priority, setPriority] = useState('');

  const [formData, setFormData] = useState<FormData>({
    help_type: '',
    constituency: '',
    ward: '',
    life_threatening: false,
    people_affected: 0,
    media_urls: [],
    permission: true,
  });

  const handleTypeSelect = (type: string) => {
    setFormData((prev) => ({ ...prev, help_type: type }));
    setStep('location');
  };

  const handleLocationNext = (data: {
    constituency: string;
    ward: string;
    landmark?: string;
  }) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep('urgency');
  };

  const handleUrgencyNext = (data: {
    dangerous: boolean;
    trapped: boolean;
    worsening: boolean;
    people_affected: number;
  }) => {
    setFormData((prev) => ({
      ...prev,
      life_threatening: data.dangerous,
      people_affected: data.people_affected,
    }));
    setStep('media');
  };

  const handleMediaNext = (urls: string[]) => {
    setFormData((prev) => ({ ...prev, media_urls: urls }));
    setStep('contact');
  };

  const handleContactNext = async (data: { name?: string; permission: boolean }) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/cases/help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: phoneNumber,
          help_type: formData.help_type,
          constituency: formData.constituency,
          ward: formData.ward,
          landmark: formData.landmark,
          urgency: {
            life_threatening: formData.life_threatening,
            people_affected: formData.people_affected,
          },
          media_urls: formData.media_urls,
          reporter_name: data.name,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to submit request');
      }

      const result = await res.json();
      setCaseId(result.caseId);
      setPriority(result.priority);
      setStep('confirmation');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-white pb-12">
      {error && <div className="p-6"><ErrorAlert message={error} /></div>}

      {step === 'type' && (
        <div className="max-w-md mx-auto p-6">
          <Card className="p-6 border-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-black">Request Help or Rescue</h2>
            <p className="text-gray-600 mb-6 font-medium">What help do you need?</p>

            <div className="space-y-2 mb-8">
              {HELP_TYPES.map((type) => (
                <Button
                  key={type}
                  onClick={() => handleTypeSelect(type)}
                  variant="outline"
                  className="w-full justify-start border-gray-200 text-black hover:bg-gray-50 hover:border-black font-semibold py-6"
                >
                  {type}
                </Button>
              ))}
            </div>

            <Button
              onClick={onBack}
              variant="ghost"
              className="w-full text-gray-500 hover:text-black font-semibold"
            >
              Back to Main Menu
            </Button>
          </Card>
        </div>
      )}

      {step === 'location' && (
        <LocationStep
          onNext={handleLocationNext}
          onBack={() => setStep('type')}
          currentStep={2}
          totalSteps={6}
        />
      )}

      {step === 'urgency' && (
        <SeverityStep
          onNext={handleUrgencyNext}
          onBack={() => setStep('location')}
          currentStep={3}
          totalSteps={6}
        />
      )}

      {step === 'media' && (
        <MediaUploadStep
          onNext={handleMediaNext}
          onBack={() => setStep('urgency')}
          currentStep={4}
          totalSteps={6}
        />
      )}

      {step === 'contact' && (
        <ContactStep
          phoneNumber={phoneNumber}
          onNext={handleContactNext}
          onBack={() => setStep('media')}
          currentStep={5}
          totalSteps={6}
        />
      )}

      {step === 'confirmation' && (
        <ConfirmationStep
          caseId={caseId}
          priority={priority}
          onCheckStatus={() => onBack()}
          onReportAnother={() => {
            setStep('type');
            setCaseId('');
            setPriority('');
          }}
        />
      )}
    </div>
  );
}
