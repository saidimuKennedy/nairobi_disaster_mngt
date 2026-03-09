
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface CaseStatusProps {
  phoneNumber: string;
  onBack: () => void;
}

interface CaseDetails {
  case_id: string;
  status: string;
  priority: string;
  assigned_department: string;
  updates: Array<{ update_message: string; created_at: string }>;
}

const statusIcons: Record<string, React.ReactNode> = {
  submitted: <Clock className="h-5 w-5 text-gray-600" />,
  assigned: <AlertCircle className="h-5 w-5 text-blue-600" />,
  in_progress: <AlertCircle className="h-5 w-5 text-orange-600" />,
  resolved: <CheckCircle2 className="h-5 w-5 text-green-600" />,
};

export function CaseStatus({ phoneNumber, onBack }: CaseStatusProps) {
  const [caseIdInput, setCaseIdInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [caseDetails, setCaseDetails] = useState<CaseDetails | null>(null);

  const handleCheckStatus = async () => {
    if (!caseIdInput.trim()) {
      setError('Please enter a case ID');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/cases/${caseIdInput}?phone_number=${encodeURIComponent(phoneNumber)}`);

      if (!res.ok) {
        throw new Error('Case not found or unauthorized access');
      }

      const details = await res.json();
      setCaseDetails(details);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch case status');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (caseDetails) {
    return (
      <div className="max-w-md mx-auto p-6">
        <Card className="p-6 border-gray-200">
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-500 font-medium">Case ID</p>
              <p className="text-xl font-mono font-bold text-black">{caseDetails.case_id}</p>
            </div>

            <div className="flex items-center justify-between py-2 border-y border-gray-100">
              <span className="text-gray-600 font-medium">Current Status</span>
              <div className="flex items-center gap-2">
                {statusIcons[caseDetails.status] || <Clock className="h-5 w-5" />}
                <span className="text-black font-bold capitalize">{caseDetails.status.replace('_', ' ')}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">Priority</span>
              <Badge className={`${getPriorityBadgeClass(caseDetails.priority)} px-3 py-1 rounded-full text-xs font-bold`}>
                {caseDetails.priority.toUpperCase()}
              </Badge>
            </div>

            <div>
              <span className="text-gray-600 font-medium">Assigned To</span>
              <p className="text-black font-bold mt-1">{caseDetails.assigned_department || 'Not yet assigned'}</p>
            </div>

            {caseDetails.updates.length > 0 && (
              <div className="pt-4">
                <h3 className="font-bold text-black mb-4 flex items-center gap-2">
                  <div className="w-1 h-4 bg-black"></div>
                  Latest Updates
                </h3>
                <div className="space-y-3">
                  {caseDetails.updates.map((update, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100 relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-300"></div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        {new Date(update.created_at).toLocaleString()}
                      </p>
                      <p className="text-black text-sm mt-1 leading-relaxed">{update.update_message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 mt-8">
              <Button
                onClick={() => {
                  setCaseDetails(null);
                  setCaseIdInput('');
                }}
                className="w-full bg-black text-white hover:bg-gray-800 font-bold py-6 rounded-xl"
              >
                Check Another Case
              </Button>
              <Button
                onClick={onBack}
                variant="ghost"
                className="w-full text-gray-500 hover:text-black font-semibold"
              >
                Back to Menu
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <Card className="p-6 border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-black">Check Case Status</h2>
        <p className="text-gray-600 mb-6 font-medium">Enter your case ID to see the latest updates.</p>

        <div className="space-y-4">
          <div>
            <Label htmlFor="caseId" className="text-black font-bold mb-2 block">
              Case ID
            </Label>
            <Input
              id="caseId"
              placeholder="e.g., EMERG-20250309-ABC123"
              value={caseIdInput}
              onChange={(e) => setCaseIdInput(e.target.value.toUpperCase())}
              className="border-gray-200 text-black placeholder-gray-400 font-mono py-6 rounded-xl text-lg focus:ring-black focus:border-black"
            />
          </div>

          {error && <ErrorAlert message={error} />}

          <div className="flex flex-col gap-3 mt-8">
            <Button
              onClick={handleCheckStatus}
              className="w-full bg-black text-white hover:bg-gray-800 font-bold py-6 rounded-xl text-lg shadow-lg shadow-black/10"
            >
              Check Status
            </Button>
            <Button
              onClick={onBack}
              variant="ghost"
              className="w-full text-gray-500 hover:text-black font-semibold"
            >
              Back
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function getPriorityBadgeClass(priority: string): string {
  const classes: Record<string, string> = {
    critical: 'bg-red-600 text-white',
    high: 'bg-orange-600 text-white',
    medium: 'bg-yellow-600 text-white',
    low: 'bg-gray-600 text-white',
  };
  return classes[priority.toLowerCase()] || classes.medium;
}
