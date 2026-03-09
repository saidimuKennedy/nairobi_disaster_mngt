
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { StepIndicator } from '@/components/common/StepIndicator';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Constituency, Ward } from '@/lib/models/Location';

interface LocationStepProps {
  onNext: (data: { constituency: string; ward: string; landmark?: string }) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

export function LocationStep({
  onNext,
  onBack,
  currentStep,
  totalSteps,
}: LocationStepProps) {
  const [constituencies, setConstituencies] = useState<Constituency[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedConstituency, setSelectedConstituency] = useState<string>('');
  const [selectedWard, setSelectedWard] = useState<string>('');
  const [manualConstituency, setManualConstituency] = useState<string>('');
  const [manualWard, setManualWard] = useState<string>('');
  const [landmark, setLandmark] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isManual, setIsManual] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchConstituencies();
  }, []);

  useEffect(() => {
    if (selectedConstituency && !isManual) {
      const constituency = constituencies.find((c) => c.name === selectedConstituency);
      if (constituency) {
        fetchWards(constituency.id);
      }
    }
  }, [selectedConstituency, isManual, constituencies]);

  const fetchConstituencies = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/locations/constituencies');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setConstituencies(data.constituencies);
      if (data.constituencies.length === 0) setIsManual(true);
    } catch (err) {
      console.error('API Error:', err);
      setIsManual(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchWards = async (constituencyId: number) => {
    try {
      const res = await fetch(`/api/locations/wards?constituency_id=${constituencyId}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setWards(data.wards);
      setSelectedWard('');
    } catch (err) {
      console.error('API Error:', err);
    }
  };

  const handleSubmit = () => {
    const finalConstituency = isManual ? manualConstituency : selectedConstituency;
    const finalWard = isManual ? manualWard : selectedWard;

    if (!finalConstituency || !finalWard) {
      setError('Please provide constituency and ward');
      return;
    }
    onNext({
      constituency: finalConstituency,
      ward: finalWard,
      landmark: landmark || undefined,
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-md mx-auto p-6">
      <Card className="p-6 border-gray-200">
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

        <h2 className="text-xl font-bold mb-6 text-black">Location Details</h2>

        <div className="space-y-4">
          {!isManual ? (
            <>
              <div>
                <Label htmlFor="constituency" className="text-black font-semibold">
                  Constituency
                </Label>
                <Select value={selectedConstituency} onValueChange={setSelectedConstituency}>
                  <SelectTrigger id="constituency" className="border-gray-300 text-black py-6 rounded-xl">
                    <SelectValue placeholder="Select constituency" />
                  </SelectTrigger>
                  <SelectContent>
                    {constituencies.map((c) => (
                      <SelectItem key={c.id} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedConstituency && (
                <div>
                  <Label htmlFor="ward" className="text-black font-semibold">
                    Ward
                  </Label>
                  {wards.length > 0 ? (
                    <Select value={selectedWard} onValueChange={setSelectedWard}>
                      <SelectTrigger id="ward" className="border-gray-300 text-black py-6 rounded-xl">
                        <SelectValue placeholder="Select ward" />
                      </SelectTrigger>
                      <SelectContent>
                        {wards.map((w) => (
                          <SelectItem key={w.id} value={w.name}>
                            {w.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      placeholder="Type ward name"
                      value={selectedWard}
                      onChange={(e) => setSelectedWard(e.target.value)}
                      className="border-gray-300 text-black py-6 rounded-xl"
                    />
                  )}
                </div>
              )}
              
              <Button 
                variant="link" 
                onClick={() => setIsManual(true)}
                className="text-xs text-gray-500 p-0 h-auto"
              >
                Can't find your location? Click here to type manually
              </Button>
            </>
          ) : (
            <>
              <div>
                <Label htmlFor="manual-constituency" className="text-black font-semibold">
                  Constituency
                </Label>
                <Input
                  id="manual-constituency"
                  placeholder="e.g. Westlands"
                  value={manualConstituency}
                  onChange={(e) => setManualConstituency(e.target.value)}
                  className="border-gray-300 text-black py-6 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="manual-ward" className="text-black font-semibold">
                  Ward
                </Label>
                <Input
                  id="manual-ward"
                  placeholder="e.g. Parklands"
                  value={manualWard}
                  onChange={(e) => setManualWard(e.target.value)}
                  className="border-gray-300 text-black py-6 rounded-xl"
                />
              </div>
              <Button 
                variant="link" 
                onClick={() => setIsManual(false)}
                className="text-xs text-gray-500 p-0 h-auto"
              >
                Switch back to list
              </Button>
            </>
          )}

          <div>
            <Label htmlFor="landmark" className="text-black font-semibold">
              Landmark / Road (optional)
            </Label>
            <Input
              id="landmark"
              placeholder="e.g., near Kayole Market"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              className="border-gray-300 text-black py-6 rounded-xl"
            />
          </div>

          {error && <p className="text-red-600 text-xs font-bold">{error}</p>}

          <div className="flex gap-3 mt-8">
            <Button
              variant="outline"
              onClick={onBack}
              className="flex-1 border-black text-black py-6 rounded-xl font-bold"
            >
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-black text-white py-6 rounded-xl font-bold shadow-lg"
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
