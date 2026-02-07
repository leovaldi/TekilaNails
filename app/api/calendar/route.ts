import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { nombreCliente, nombreServicio, diaHora, whatsapp, montoSena } = await request.json();

    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    const calendar = google.calendar({ version: 'v3', auth });

    const startTime = new Date(diaHora);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); 

    const event = {
      summary: `💅 ${nombreServicio} - ${nombreCliente}`,
      description: `Cliente: ${nombreCliente}\nWhatsApp: ${whatsapp}\nSeña: $${montoSena}`,
      start: { 
        dateTime: startTime.toISOString(),
        timeZone: 'America/Argentina/Buenos_Aires'
      },
      end: { 
        dateTime: endTime.toISOString(),
        timeZone: 'America/Argentina/Buenos_Aires'
      },
    };

    await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      requestBody: event,
    });

    // Devolvemos success y los datos para el mensaje de WhatsApp
    return NextResponse.json({ 
      success: true,
      dataForWA: {
        nombre: nombreCliente,
        servicio: nombreServicio,
        fecha: startTime.toLocaleDateString('es-AR'),
        hora: startTime.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
        whatsapp: whatsapp,
        monto: montoSena
      }
    });

  } catch (error: any) {
    console.error('Error Calendar:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear el evento' }, 
      { status: 500 }
    );
  }
}