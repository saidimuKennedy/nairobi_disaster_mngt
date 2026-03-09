import { NextRequest, NextResponse } from 'next/server';
import { CaseService } from '@/lib/services/CaseService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await CaseService.submitEmergency(body.phone_number, body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to report emergency' },
      { status: 400 }
    );
  }
}
