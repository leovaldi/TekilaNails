import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

// Cliente administrativo para asegurar permisos de escritura en la DB
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { reserva } = await request.json();

    // 1. Configuración de Google Auth (OAuth2)
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({ 
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN 
    });
    
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // 2. Definir horarios del evento
    const startTime = new Date(reserva.horarios_disponibles.dia_hora);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hora de duración

    // 3. Insertar en Google Calendar
    try {
      await calendar.events.insert({
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
        requestBody: {
          summary: `${reserva.servicios.nombre} - ${reserva.nombre_cliente}`,
          description: `Cliente: ${reserva.nombre_cliente}\nWhatsApp: ${reserva.whatsapp_cliente}\nSeña: $${reserva.monto_senia}`,
          start: { 
            dateTime: startTime.toISOString(), 
            timeZone: 'America/Argentina/Buenos_Aires' 
          },
          end: { 
            dateTime: endTime.toISOString(), 
            timeZone: 'America/Argentina/Buenos_Aires' 
          },
        },
      });
      console.log('Evento agendado en Calendar');
    } catch (calErr) {
      console.error('Error agendando en Calendar:', calErr);
    }

    // 4. BLOQUEO DE HORARIO EN SUPABASE
    // Usamos 'horario_id' (de tu tabla reservas) y cambiamos 'estado' a 'reservado'
    if (reserva.horario_id) {
      const { error: dbError } = await supabaseAdmin
        .from('horarios_disponibles')
        .update({ estado: 'reservado' }) 
        .eq('id', reserva.horario_id);
      
      if (dbError) {
        console.error('Error bloqueando horario en DB:', dbError);
      } else {
        console.log('Horario bloqueado con exito');
      }
    }

    // 5. Notificación por Email vía Resend
    try {
      await resend.emails.send({
        from: 'Tekila Nails <onboarding@resend.dev>',
        to: process.env.EMAIL_ROCIO || '',
        subject: `Nueva Reserva: ${reserva.nombre_cliente}`,
        html: `
          <h1>Nuevo turno confirmado</h1>
          <p><strong>Cliente:</strong> ${reserva.nombre_cliente}</p>
          <p><strong>Servicio:</strong> ${reserva.servicios.nombre}</p>
          <p><strong>Fecha:</strong> ${startTime.toLocaleDateString('es-AR')} a las ${startTime.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}hs</p>
          <p><strong>WhatsApp:</strong> ${reserva.whatsapp_cliente}</p>
          <p><strong>Seña pagada:</strong> $${reserva.monto_senia}</p>
          <hr />
          <p>El turno ya fue agendado en Google Calendar y el horario se quito de la web.</p>
        `
      });
    } catch (mailErr) {
      console.error('Error enviando mail:', mailErr);
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error critico en la API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}