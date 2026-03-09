import { NextRequest, NextResponse } from 'next/server';
import { LocationModel } from '@/lib/models/Location';

export async function GET(request: NextRequest) {
  try {
    const constituencyId = request.nextUrl.searchParams.get('constituency_id');
    if (!constituencyId) return NextResponse.json({ error: 'constituency_id required' }, { status: 400 });

    const wards = await LocationModel.getWards(parseInt(constituencyId));
    return NextResponse.json({ wards });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
