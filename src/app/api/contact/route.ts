import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: Request) {
  const { name, email, type, message } = await request.json();

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: 'Name, email, and message are required.' },
      { status: 400 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Email service is not configured.' },
      { status: 500 }
    );
  }

  const resend = new Resend(apiKey);
  const label = type || 'General';

  try {
    await resend.emails.send({
      from: 'FFI Website <onboarding@resend.dev>',
      to: 'jeff@cobbscreek.org',
      replyTo: email,
      subject: `FFI ${label}: ${name}`,
      text: [
        `From: ${name}`,
        `Email: ${email}`,
        `Type: ${label}`,
        '',
        message,
      ].join('\n'),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 }
    );
  }
}
