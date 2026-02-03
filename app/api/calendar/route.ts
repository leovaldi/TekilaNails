import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { nombreCliente, nombreServicio, diaHora, whatsapp } = await request.json();

    const auth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      undefined,
      process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/calendar']
    );

    const calendar = google.calendar({ version: 'v3', auth });

    // Definimos fin del evento (ej: 1 hora después)
    const startTime = new Date(diaHora);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    const event = {
      summary: `💅 ${nombreServicio} - ${nombreCliente}`,
      description: `Cliente: ${nombreCliente}\nWhatsApp: ${whatsapp}`,
      start: { dateTime: startTime.toISOString() },
      end: { dateTime: endTime.toISOString() },
    };

    await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      requestBody: event,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error Calendar:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}