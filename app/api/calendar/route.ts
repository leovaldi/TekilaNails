import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { nombreCliente, nombreServicio, diaHora, whatsapp } = await request.json();

    // 1. Configuramos la autenticación como un objeto único
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    const calendar = google.calendar({ version: 'v3', auth });

    // 2. Definimos inicio y fin del evento
    const startTime = new Date(diaHora);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Duración de 1 hora

    const event = {
      summary: `💅 ${nombreServicio} - ${nombreCliente}`,
      description: `Cliente: ${nombreCliente}\nWhatsApp: ${whatsapp}`,
      start: { 
        dateTime: startTime.toISOString(),
        timeZone: 'America/Argentina/Buenos_Aires' // Ajusta según tu zona horaria
      },
      end: { 
        dateTime: endTime.toISOString(),
        timeZone: 'America/Argentina/Buenos_Aires'
      },
    };

    // 3. Insertamos el evento en el calendario de Google
    await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      requestBody: event,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error Calendar:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear el evento en el calendario' }, 
      { status: 500 }
    );
  }
}