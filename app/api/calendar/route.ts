import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { reserva } = await request.json();
    console.log('Datos recibidos en API:', reserva);

    // 1. Configuración OAuth2
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // 2. Definir horarios (Con ajuste de zona horaria para Argentina)
    const startTime = new Date(reserva.horarios_disponibles.dia_hora);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); 

    // 3. Insertar en Google Calendar
    try {
      await calendar.events.insert({
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
        requestBody: {
          summary: `${reserva.servicios.nombre} - ${reserva.nombre_cliente}`,
          description: `Cliente: ${reserva.nombre_cliente}\nWhatsApp: ${reserva.whatsapp_cliente}\nSeña: $${reserva.monto_senia}`,
          start: { dateTime: startTime.toISOString(), timeZone: 'America/Argentina/Buenos_Aires' },
          end: { dateTime: endTime.toISOString(), timeZone: 'America/Argentina/Buenos_Aires' },
        },
      });
      console.log('Calendar OK');
    } catch (calErr) {
      console.error('Error Calendar:', calErr);
    }

    // 4. URGENTE: BLOQUEO DE HORARIO EN SUPABASE
    // Buscamos el ID en todas las ubicaciones posibles del objeto reserva
    const idHorario = reserva.horario_id || reserva.id_horario || reserva.horarios_disponibles?.id;

    if (idHorario) {
      console.log('Intentando bloquear horario ID:', idHorario);
      const { error: dbError, data } = await supabaseAdmin
        .from('horarios_disponibles')
        .update({ estado: 'reservado' }) 
        .eq('id', idHorario)
        .select(); // El select nos confirma si realmente encontró la fila
      
      if (dbError) {
        console.error('Error de base de datos al bloquear:', dbError.message);
      } else if (data && data.length > 0) {
        console.log('Horario bloqueado con éxito en Supabase:', data);
      } else {
        console.warn('No se encontró el horario con ID:', idHorario, 'para bloquear.');
      }
    } else {
      console.error('No se encontró ID de horario en el objeto reserva para bloquear.');
    }

    // 5. Notificación por Email
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
          <hr />
          <p>El turno ya fue agendado y el horario se marcó como reservado.</p>
        `
      });
    } catch (mailErr) {
      console.error('Error Mail:', mailErr);
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error crítico en la API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}