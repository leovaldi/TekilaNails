import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { nombreCliente, nombreServicio, diaHora, whatsapp, montoSena } = await request.json();

    // 1. Preparamos los tiempos
    const startTime = new Date(diaHora);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Duración 1h

    // 2. Intentamos la lógica de Google Calendar
    try {
      const auth = new google.auth.JWT({
        email: process.env.GOOGLE_CLIENT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/calendar'],
      });

      const calendar = google.calendar({ version: 'v3', auth });

      const event = {
        summary: `${nombreServicio} - ${nombreCliente}`,
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

      console.log('Evento creado exitosamente en Google Calendar');
      
    } catch (calendarError: any) {
      // Si el calendario falla (cuenta inhabilitada, etc.), logueamos el error 
      // pero NO lanzamos un error hacia afuera para no romper el flujo.
      console.error('Error en Google Calendar (Cuenta inhabilitada o mal configurada):', calendarError.message);
    }

    // 3. Devolvemos éxito SIEMPRE para que el frontend dispare el WhatsApp
    // Incluimos los datos formateados para que el cliente los reciba listos
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
    // Este catch solo atrapa errores graves de red o de parseo de JSON
    console.error('Error crítico en API Calendar:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' }, 
      { status: 500 }
    );
  }
}
