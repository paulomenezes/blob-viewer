import { head } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = await request.json();

  if (!body || !body.url) {
    return NextResponse.json({ error: 'url is required' }, { status: 400 });
  }

  const detail = await head(body.url);

  return NextResponse.json(detail);
}
