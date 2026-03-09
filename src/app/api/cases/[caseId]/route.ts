
import { NextRequest, NextResponse } from 'next/server';
import { CaseService } from '@/lib/services/CaseService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params;
    const phoneNumber = request.nextUrl.searchParams.get('phone_number');
    if (!phoneNumber) return NextResponse.json({ error: 'phone_number required' }, { status: 400 });

    const details = await CaseService.getUserCaseDetails(caseId, phoneNumber);
    return NextResponse.json(details);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Case not found or unauthorized' },
      { status: 404 }
    );
  }
}
