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
    
    // LOG DE DIAGNÓSTICO 1: Ver qué llega del frontend
    console.log('--- DIAGNÓSTICO RESERVA ---');
    console.log('Estructura completa:', JSON.stringify(reserva, null, 2));

    // 1. Configuración OAuth2
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // 2. Definir horarios con compatibilidad total
    const fechaRaw = reserva.horarios_disponibles?.dia_hora || reserva.dia_hora;
    
    if (!fechaRaw) {
        console.error("❌ ERROR: No hay fecha en el objeto");
        return NextResponse.json({ error: "Fecha no encontrada" }, { status: 400 });
    }

    const startTime = new Date(fechaRaw);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); 

    const fechaLegible = startTime.toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    // 3. Insertar en Google Calendar con REPORTE DE ERRORES DETALLADO
    try {
      console.log('--- INTENTANDO INSERTAR EN GOOGLE ---');
      const calRes = await calendar.events.insert({
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
        requestBody: {
          summary: `✨ ${reserva.servicios?.nombre || 'Servicio'} - ${reserva.nombre_cliente}`,
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
      console.log('✅ GOOGLE CALENDAR OK: ID del evento', calRes.data.id);
    } catch (calErr: any) {
      // ESTO NOS DARÁ LA RESPUESTA REAL DE GOOGLE (Permisos, ID de calendario mal, etc)
      console.error('❌ ERROR DETALLADO DE GOOGLE CALENDAR:');
      console.error('Status:', calErr.response?.status);
      console.error('Data:', JSON.stringify(calErr.response?.data, null, 2));
      console.error('Mensaje:', calErr.message);
    }

    // 4. Bloqueo de horario (Búsqueda de ID flexible)
    const idHorario = reserva.horario_id || reserva.horarios_disponibles?.id || reserva.id_horario;
    if (idHorario) {
      await supabaseAdmin
        .from('horarios_disponibles')
        .update({ estado: 'reservado' }) 
        .eq('id', idHorario);
      console.log('Base de datos: Horario bloqueado');
    }

    // 5. Notificación por Email
    try {
      await resend.emails.send({
        from: 'Tekila Nails <onboarding@resend.dev>',
        to: process.env.EMAIL_ROCIO || '',
        subject: `Nueva Reserva: ${reserva.nombre_cliente}`,
        html: `
          <div style="font-family: sans-serif; color: #333;">
            <h1 style="color: #d946ef;">¡Nuevo turno confirmado!</h1>
            <p><strong>Cliente:</strong> ${reserva.nombre_cliente}</p>
            <p><strong>Servicio:</strong> ${reserva.servicios?.nombre || 'Consultar'}</p>
            <p><strong>Fecha y Hora:</strong> ${fechaLegible} hs</p>
            <p><strong>WhatsApp:</strong> ${reserva.whatsapp_cliente}</p>
            <hr />
            <p style="font-size: 12px; color: #666;">El turno ya fue agendado y el horario se bloqueó en la web automáticamente.</p>
          </div>
        `
      });
      console.log('Email enviado');
    } catch (mailErr) {
      console.error('Error Mail:', mailErr);
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('--- ERROR CRÍTICO EN API ---');
    console.error(error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}