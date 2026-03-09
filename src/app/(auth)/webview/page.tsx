
'use client';

import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { ReportEmergency } from '@/components/flows/ReportEmergency';
import { RequestHelp } from '@/components/flows/RequestHelp';
import { MissingPersons } from '@/components/flows/MissingPersons';
import { ShelterRelief } from '@/components/flows/ShelterRelief';
import { CaseStatus } from '@/components/flows/CaseStatus';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Flow = 'menu' | 'report' | 'help' | 'missing' | 'shelter' | 'status';

function WebviewContent() {
  const searchParams = useSearchParams();
  const phoneNumber = searchParams.get('phone_number');
  const [flow, setFlow] = useState<Flow>('menu');

  if (!phoneNumber) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <Card className="p-8 border-gray-300 max-w-md w-full shadow-sm">
          <p className="text-center text-red-600 font-semibold text-lg">
            Access Denied
          </p>
          <p className="text-center text-gray-600 mt-2">
            Phone number not provided. Please access this page through the official WhatsApp link.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {flow === 'menu' && (
        <MainMenu phoneNumber={phoneNumber} onSelect={setFlow} />
      )}
      {flow === 'report' && (
        <ReportEmergency phoneNumber={phoneNumber} onBack={() => setFlow('menu')} />
      )}
      {flow === 'help' && (
        <RequestHelp phoneNumber={phoneNumber} onBack={() => setFlow('menu')} />
      )}
      {flow === 'missing' && (
        <MissingPersons phoneNumber={phoneNumber} onBack={() => setFlow('menu')} />
      )}
      {flow === 'shelter' && (
        <ShelterRelief phoneNumber={phoneNumber} onBack={() => setFlow('menu')} />
      )}
      {flow === 'status' && (
        <CaseStatus phoneNumber={phoneNumber} onBack={() => setFlow('menu')} />
      )}
    </div>
  );
}

export default function WebviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center font-bold">Loading...</div>}>
      <WebviewContent />
    </Suspense>
  );
}

function MainMenu({
  phoneNumber,
  onSelect,
}: {
  phoneNumber: string;
  onSelect: (flow: Flow) => void;
}) {
  return (
    <div className="max-w-md mx-auto p-6">
      <div className="mb-8 mt-4">
        <h1 className="text-3xl font-bold text-black tracking-tight">Nairobi Emergency</h1>
        <p className="text-gray-500 mt-1">County Disaster Response • {phoneNumber}</p>
      </div>

      <Card className="p-6 border-gray-200 shadow-none bg-gray-50/50">
        <h2 className="text-lg font-semibold mb-6 text-black">What do you need help with?</h2>

        <div className="space-y-4">
          <Button
            onClick={() => onSelect('report')}
            className="w-full bg-black text-white hover:bg-gray-800 font-bold py-8 text-lg rounded-xl shadow-lg shadow-black/10 flex items-center justify-center"
          >
            Report an Emergency
          </Button>
          
          <Button
            onClick={() => onSelect('help')}
            className="w-full bg-white text-black border-2 border-black hover:bg-gray-100 font-bold py-8 text-lg rounded-xl flex items-center justify-center"
          >
            Request Help or Rescue
          </Button>

          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => onSelect('missing')}
              variant="outline"
              className="h-24 border-gray-200 text-black hover:bg-gray-100 font-semibold rounded-xl flex flex-col items-center justify-center gap-2"
            >
              <span className="text-sm">Missing Persons</span>
            </Button>
            <Button
              onClick={() => onSelect('shelter')}
              variant="outline"
              className="h-24 border-gray-200 text-black hover:bg-gray-100 font-semibold rounded-xl flex flex-col items-center justify-center gap-2"
            >
              <span className="text-sm">Shelter & Safety</span>
            </Button>
          </div>

          <Button
            onClick={() => onSelect('status')}
            variant="ghost"
            className="w-full text-gray-600 hover:text-black hover:bg-gray-200/50 font-semibold py-4"
          >
            Check Case Status
          </Button>
        </div>
      </Card>
      
      <div className="mt-12 text-center">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">
          Nairobi City County Government
        </p>
      </div>
    </div>
  );
}
