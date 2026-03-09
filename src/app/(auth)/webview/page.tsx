
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
import { CldVideoPlayer } from 'next-cloudinary';
import 'next-cloudinary/dist/cld-video-player.css';

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

      {/* Cloudinary Video Player */}
      <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
        <CldVideoPlayer
          width={900}
          height={506}
          src="Video_Ready_After_Safety_Comment_ufu8vr" // User-provided public ID
          sourceTypes={['mp4']}
          colors={{
            accent: '#333333',
            base: '#000000',
            text: '#ffffff',
          }}
          className="rounded-xl"
        />
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
      
      <HotlineNumbers />

      <div className="mt-12 text-center">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">
          Nairobi City County Government
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Emergency Hotlines: Police (999/911/112) | Disaster Mgmt (1508)
        </p>
      </div>
    </div>
  );
}

function HotlineNumbers() {
  return (
    <Card className="p-6 border-gray-200 shadow-none bg-gray-50/50 mt-8">
      <h3 className="text-lg font-semibold mb-4 text-black">Emergency & Safety Hotlines (Nairobi)</h3>
      <div className="space-y-3 text-sm text-gray-700">
        <p><strong>Nairobi City County Disaster Management (24/7):</strong> 1508, 020-2222-181, 020-2344-599</p>
        <p><strong>Police General Emergency:</strong> 999, 911, or 112</p>
        <p><strong>Directorate of Criminal Investigations (DCI - Fichua Kwa DCI):</strong> 0800 722 203</p>
        <p><strong>E-Plus Ambulance Services:</strong> 0700 395 395 or 0738 395 395</p>
        <p><strong>Nairobi Hospital Ambulance:</strong> +254 702 200 200</p>
        <p><strong>National Child Helpline:</strong> 116</p>
        <p><strong>NACADA (Drug/Alcohol Abuse) Helpline:</strong> 1192</p>
      </div>

      <h3 className="text-lg font-semibold mt-6 mb-4 text-black">Key Area Fire/Police Stations (Direct Numbers)</h3>
      <div className="space-y-3 text-sm text-gray-700">
        <p><strong>Industrial Area:</strong> 0755714604</p>
        <p><strong>Ruaraka:</strong> 0777445563</p>
        <p><strong>Gigiri:</strong> 0771404044</p>
        <p><strong>Waithaka:</strong> 0777445562</p>
        <p><strong>Kangundo Road:</strong> 0777445561</p>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 text-sm text-gray-700">
        <p>For non-emergency, the main Nairobi County contact number is <strong>+254 725 624 489</strong>.</p>
      </div>
    </Card>
  );
}
