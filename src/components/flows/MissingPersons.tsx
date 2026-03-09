
'use client';

import { useState } from 'react';
import { LocationStep } from '@/components/steps/LocationStep';
import { MediaUploadStep } from '@/components/steps/MediaUploadStep';
import { ContactStep } from '@/components/steps/ContactStep';
import { ConfirmationStep } from '@/components/steps/ConfirmationStep';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface MissingPersonsProps {
  phoneNumber: string;
  onBack: () => void;
}

const MISSING_TYPES = [
  'Missing Person',
  'Found Person (Unidentified)',
  'Missing Property',
  'Found Property',
];

type Step = 'type' | 'location' | 'details' | 'media' | 'contact' | 'confirmation';

interface FormData {
  missing_type: string;
  constituency: string;
  ward: string;
  landmark?: string;
  name: string;
  age?: string;
  description: string;
  media_urls: string[];
  reporter_name?: string;
}

export function MissingPersons({ phoneNumber, onBack }: MissingPersonsProps) {
  const [step, setStep] = useState<Step>('type');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [caseId, setCaseId] = useState('');
  const [priority, setPriority] = useState('');

  const [formData, setFormData] = useState<FormData>({
    missing_type: '',
    constituency: '',
    ward: '',
    name: '',
    description: '',
    media_urls: [],
  });

  const handleTypeSelect = (type: string) => {
    setFormData((prev) => ({ ...prev, missing_type: type }));
    setStep('location');
  };

  const handleLocationNext = (data: {
    constituency: string;
    ward: string;
    landmark?: string;
  }) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep('details');
  };

  const handleDetailsNext = () => {
    if (!formData.name || !formData.description) {
      setError('Please provide a name and description');
      return;
    }
    setError('');
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
      const res = await fetch('/api/cases/missing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: phoneNumber,
          missing_type: formData.missing_type,
          constituency: formData.constituency,
          ward: formData.ward,
          landmark: formData.landmark,
          person_details: {
            name: formData.name,
            age: formData.age ? parseInt(formData.age) : undefined,
            description: formData.description,
          },
          media_urls: formData.media_urls,
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
            <h2 className="text-2xl font-bold mb-6 text-black">Missing Persons & Property</h2>
            <p className="text-gray-600 mb-6 font-medium">What are you reporting?</p>

            <div className="space-y-2 mb-8">
              {MISSING_TYPES.map((type) => (
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

      {step === 'details' && (
        <div className="max-w-md mx-auto p-6">
          <Card className="p-6 border-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-black">Report Details</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-black font-bold mb-2 block">
                  Name / Identifier
                </Label>
                <Input
                  id="name"
                  placeholder="Full name or description"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="rounded-xl py-6"
                />
              </div>

              <div>
                <Label htmlFor="age" className="text-black font-bold mb-2 block">
                  Approximate Age (Optional)
                </Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="e.g. 25"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  className="rounded-xl py-6"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-black font-bold mb-2 block">
                  Detailed Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Physical description, last seen wearing, location last seen..."
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="rounded-xl min-h-[120px]"
                />
              </div>

              <div className="flex gap-3 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setStep('location')}
                  className="flex-1 rounded-xl py-6 border-black text-black font-bold"
                >
                  Back
                </Button>
                <Button
                  onClick={handleDetailsNext}
                  className="flex-1 rounded-xl py-6 bg-black text-white font-bold"
                >
                  Next
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {step === 'media' && (
        <MediaUploadStep
          onNext={handleMediaNext}
          onBack={() => setStep('details')}
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
            setFormData({
              missing_type: '',
              constituency: '',
              ward: '',
              name: '',
              description: '',
              media_urls: [],
            });
          }}
        />
      )}
    </div>
  );
}
