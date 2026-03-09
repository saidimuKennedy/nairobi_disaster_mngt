
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

interface ReportEmergencyProps {
  phoneNumber: string;
  onBack: () => void;
}

const EMERGENCY_TYPES = [
  'Flooding',
  'Fire',
  'Medical emergency',
  'Building collapse / unsafe building',
  'Road accident',
  'Blocked drainage',
  'Dangerous infrastructure',
  'Electrical hazard',
  'Fallen tree / obstruction',
  'Other emergency',
];

type Step = 'type' | 'location' | 'severity' | 'media' | 'contact' | 'confirmation';

interface FormData {
  emergency_type: string;
  constituency: string;
  ward: string;
  landmark?: string;
  dangerous: boolean;
  trapped: boolean;
  worsening: boolean;
  people_affected: number;
  media_urls: string[];
  name?: string;
  permission: boolean;
}

export function ReportEmergency({ phoneNumber, onBack }: ReportEmergencyProps) {
  const [step, setStep] = useState<Step>('type');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [caseId, setCaseId] = useState('');
  const [priority, setPriority] = useState('');

  const [formData, setFormData] = useState<FormData>({
    emergency_type: '',
    constituency: '',
    ward: '',
    dangerous: false,
    trapped: false,
    worsening: false,
    people_affected: 0,
    media_urls: [],
    permission: true,
  });

  const handleTypeSelect = (type: string) => {
    setFormData((prev) => ({ ...prev, emergency_type: type }));
    setStep('location');
  };

  const handleLocationNext = (data: {
    constituency: string;
    ward: string;
    landmark?: string;
  }) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep('severity');
  };

  const handleSeverityNext = (data: {
    dangerous: boolean;
    trapped: boolean;
    worsening: boolean;
    people_affected: number;
  }) => {
    setFormData((prev) => ({ ...prev, ...data }));
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
      const res = await fetch('/api/cases/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: phoneNumber,
          emergency_type: formData.emergency_type,
          constituency: formData.constituency,
          ward: formData.ward,
          landmark: formData.landmark,
          severity: {
            dangerous: formData.dangerous,
            trapped: formData.trapped,
            worsening: formData.worsening,
            people_affected: formData.people_affected,
          },
          media_urls: formData.media_urls,
          details: {},
          reporter_name: data.name,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to submit report');
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
            <h2 className="text-2xl font-bold mb-6 text-black">Report an Emergency</h2>
            <p className="text-gray-600 mb-6 font-medium">What type of emergency is it?</p>

            <div className="space-y-2 mb-8">
              {EMERGENCY_TYPES.map((type) => (
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

      {step === 'severity' && (
        <SeverityStep
          onNext={handleSeverityNext}
          onBack={() => setStep('location')}
          currentStep={3}
          totalSteps={6}
        />
      )}

      {step === 'media' && (
        <MediaUploadStep
          onNext={handleMediaNext}
          onBack={() => setStep('severity')}
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
