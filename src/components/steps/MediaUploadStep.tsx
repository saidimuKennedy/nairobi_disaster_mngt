
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StepIndicator } from '@/components/common/StepIndicator';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Camera, Video, X, Upload } from 'lucide-react';

interface MediaUploadStepProps {
  onNext: (mediaUrls: string[]) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

export function MediaUploadStep({
  onNext,
  onBack,
  currentStep,
  totalSteps,
}: MediaUploadStepProps) {
  const [uploading, setLoading] = useState(false);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    setError('');

    const newUrls = [...mediaUrls];

    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);

        const res = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) throw new Error('Upload failed');

        const data = await res.json();
        newUrls.push(data.fileUrl);
      }
      setMediaUrls(newUrls);
    } catch (err) {
      setError('Failed to upload some files. Please try again.');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeMedia = (index: number) => {
    setMediaUrls(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <Card className="p-6 border-gray-200">
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

        <h2 className="text-xl font-bold mb-2 text-black">Add Photos or Video</h2>
        <p className="text-gray-500 text-sm mb-6">Upload visual evidence to help our rescue teams assess the situation better.</p>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="h-24 flex flex-col gap-2 rounded-xl border-dashed border-2 hover:border-black hover:bg-gray-50"
            >
              <Camera className="h-6 w-6" />
              <span className="text-xs font-bold">Add Photo</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="h-24 flex flex-col gap-2 rounded-xl border-dashed border-2 hover:border-black hover:bg-gray-50"
            >
              <Video className="h-6 w-6" />
              <span className="text-xs font-bold">Add Video</span>
            </Button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept="image/*,video/*"
            className="hidden"
          />

          {uploading && <LoadingSpinner />}

          {mediaUrls.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {mediaUrls.map((url, index) => (
                <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
                  {/* Since these are placeholder URLs, we'll just show an icon */}
                  <Upload className="text-gray-400 h-6 w-6" />
                  <button
                    onClick={() => removeMedia(index)}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {error && <p className="text-red-600 text-xs font-bold">{error}</p>}

          <div className="flex gap-3 mt-8">
            <Button
              variant="outline"
              onClick={onBack}
              className="flex-1 rounded-xl py-6 border-black text-black font-bold"
            >
              Back
            </Button>
            <Button
              onClick={() => onNext(mediaUrls)}
              className="flex-1 rounded-xl py-6 bg-black text-white font-bold shadow-lg"
            >
              {mediaUrls.length > 0 ? 'Next' : 'Skip for Now'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
