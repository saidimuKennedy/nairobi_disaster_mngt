import { NextResponse } from 'next/server';
import { LocationModel } from '@/lib/models/Location';

export async function GET() {
  try {
    const constituencies = await LocationModel.getConstituencies();
    return NextResponse.json({ constituencies });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
