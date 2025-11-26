import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://backend:8000';
  const body = await req.json();
  try {
    const response = await fetch(`${apiUrl}/create_task`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json(); 
    return NextResponse.json(data, { status: response.status });
  } catch  {
    return NextResponse.json({ error: 'Could not create task' }, { status: 500 });
  }
}
