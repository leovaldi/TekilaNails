import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

// Inicializamos Supabase internamente para asegurar la conexion en el edge
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { reserva } = await request.json();

    // 1. Configuracion OAuth2
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // 2. Definir tiempos
    const startTime = new Date(reserva.horarios_disponibles.dia_hora);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); 

    // 3. Insertar en Google Calendar
    try {
      await calendar.events.insert({
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
        requestBody: {
          summary: `${reserva.servicios.nombre} - ${reserva.nombre_cliente}`,
          description: `Cliente: ${reserva.nombre_cliente}\nWhatsApp: ${reserva.whatsapp_cliente}\nSenia pagada: $${reserva.monto_senia}`,
          start: { dateTime: startTime.toISOString(), timeZone: 'America/Argentina/Buenos_Aires' },
          end: { dateTime: endTime.toISOString(), timeZone: 'America/Argentina/Buenos_Aires' },
        },
      });
      console.log('Evento agendado exitosamente');
    } catch (calErr: any) {
      console.error('Error detallado en Google Calendar:', calErr.response?.data || calErr.message);
    }

    // 4. Bloquear horario en Supabase para que no aparezca mas en la web
    if (reserva.horarios_disponibles?.id) {
      await supabaseAdmin
        .from('horarios_disponibles')
        .update({ disponible: false })
        .eq('id', reserva.horarios_disponibles.id);
      console.log('Horario bloqueado en base de datos');
    }

    // 5. Notificacion por Email a Rocio
    try {
      await resend.emails.send({
        from: 'Tekila Nails <onboarding@resend.dev>',
        to: process.env.EMAIL_ROCIO || '',
        subject: `Nueva Reserva: ${reserva.nombre_cliente}`,
        html: `
          <h1>Nuevo turno confirmado</h1>
          <p><strong>Cliente:</strong> ${reserva.nombre_cliente}</p>
          <p><strong>Servicio:</strong> ${reserva.servicios.nombre}</p>
          <p><strong>Fecha:</strong> ${startTime.toLocaleDateString('es-AR')} a las ${startTime.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs</p>
          <p><strong>WhatsApp:</strong> ${reserva.whatsapp_cliente}</p>
          <p><strong>Senia:</strong> $${reserva.monto_senia}</p>
          <hr />
          <p>El turno ya fue agendado en Google Calendar y el horario bloqueado en la web.</p>
        `
      });
    } catch (mailErr) {
      console.error('Error en Resend:', mailErr);
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error critico en API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}