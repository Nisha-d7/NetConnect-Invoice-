import { NextResponse } from 'next/server';
import { sendDueDateNotifications } from '@/lib/email/sendDueDateNotifications';

export async function GET() {
  try {
    await sendDueDateNotifications();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 });
  }
}
