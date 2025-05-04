// app/api/sendWhatsapp/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { Twilio } from 'twilio';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, message } = body;

    if (!to || !message) {
      return NextResponse.json(
        { message: 'Missing "to" or "message" field' },
        { status: 400 }
      );
    }

    const client = new Twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    );

    const result = await client.messages.create({
      body: message,
      from:'whatsapp:+14155238886',
      to: `whatsapp:+91${to}`
    });

    return NextResponse.json({ message: 'Message sent!', sid: result.sid }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
