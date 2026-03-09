
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
import { Checkbox } from '@/components/ui/checkbox';

interface ShelterReliefProps {
  phoneNumber: string;
  onBack: () => void;
}

const SHELTER_TYPES = [
  'Need Shelter / Housing',
  'Need Food / Water',
  'Safety & Protection Concerns',
  'Displaced by Disaster',
];

type Step = 'type' | 'location' | 'needs' | 'media' | 'contact' | 'confirmation';

interface FormData {
  shelter_type: string;
  constituency: string;
  ward: string;
  landmark?: string;
  food: boolean;
  water: boolean;
  shelter: boolean;
  people_count: string;
  media_urls: string[];
  reporter_name?: string;
}

export function ShelterRelief({ phoneNumber, onBack }: ShelterReliefProps) {
  const [step, setStep] = useState<Step>('type');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [caseId, setCaseId] = useState('');
  const [priority, setPriority] = useState('');

  const [formData, setFormData] = useState<FormData>({
    shelter_type: '',
    constituency: '',
    ward: '',
    food: false,
    water: false,
    shelter: true,
    people_count: '1',
    media_urls: [],
  });

  const handleTypeSelect = (type: string) => {
    setFormData((prev) => ({ ...prev, shelter_type: type }));
    setStep('location');
  };

  const handleLocationNext = (data: {
    constituency: string;
    ward: string;
    landmark?: string;
  }) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep('needs');
  };

  const handleNeedsNext = () => {
    if (!formData.food && !formData.water && !formData.shelter) {
      setError('Please select at least one type of assistance needed');
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
      const res = await fetch('/api/cases/shelter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: phoneNumber,
          shelter_type: formData.shelter_type,
          constituency: formData.constituency,
          ward: formData.ward,
          landmark: formData.landmark,
          needs: {
            food: formData.food,
            water: formData.water,
            shelter: formData.shelter,
            people_count: parseInt(formData.people_count) || 1,
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
            <h2 className="text-2xl font-bold mb-6 text-black">Shelter, Relief & Safety</h2>
            <p className="text-gray-600 mb-6 font-medium">What kind of assistance is required?</p>

            <div className="space-y-2 mb-8">
              {SHELTER_TYPES.map((type) => (
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

      {step === 'needs' && (
        <div className="max-w-md mx-auto p-6">
          <Card className="p-6 border-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-black">What is needed?</h2>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="shelter"
                    checked={formData.shelter}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, shelter: !!checked }))}
                    className="size-6"
                  />
                  <Label htmlFor="shelter" className="text-black font-semibold text-base cursor-pointer">
                    Emergency Shelter
                  </Label>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="food"
                    checked={formData.food}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, food: !!checked }))}
                    className="size-6"
                  />
                  <Label htmlFor="food" className="text-black font-semibold text-base cursor-pointer">
                    Food Assistance
                  </Label>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="water"
                    checked={formData.water}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, water: !!checked }))}
                    className="size-6"
                  />
                  <Label htmlFor="water" className="text-black font-semibold text-base cursor-pointer">
                    Clean Water
                  </Label>
                </div>
              </div>

              <div>
                <Label htmlFor="people" className="text-black font-bold mb-2 block">
                  Total number of people
                </Label>
                <Input
                  id="people"
                  type="number"
                  min="1"
                  value={formData.people_count}
                  onChange={(e) => setFormData(prev => ({ ...prev, people_count: e.target.value }))}
                  className="rounded-xl py-6 text-lg"
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
                  onClick={handleNeedsNext}
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
          onBack={() => setStep('needs')}
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
              shelter_type: '',
              constituency: '',
              ward: '',
              food: false,
              water: false,
              shelter: true,
              people_count: '1',
              media_urls: [],
            });
          }}
        />
      )}
    </div>
  );
}
