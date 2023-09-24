import { del } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = await request.json();

  await new Promise((resolve) => setTimeout(resolve, 5000));

  if (!body || !body.url) {
    return NextResponse.json({ error: 'url is required' }, { status: 400 });
  }

  await del(body.url);

  return NextResponse.json({});
}
