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

    // 1. Configuración OAuth2
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // 2. Definir horarios
    const fechaRaw = reserva.horarios_disponibles?.dia_hora || reserva.dia_hora;
    if (!fechaRaw) return NextResponse.json({ error: "Fecha no encontrada" }, { status: 400 });

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

    // 3. Insertar en Google Calendar
    try {
      await calendar.events.insert({
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
        requestBody: {
          summary: `💅 ${reserva.servicios?.nombre || 'Servicio'} - ${reserva.nombre_cliente}`,
          description: `Cliente: ${reserva.nombre_cliente}\nWhatsApp: ${reserva.whatsapp_cliente}\nSeña: $${reserva.monto_senia}\nNotas: ${reserva.notas || 'Sin notas'}`,
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
    } catch (calErr) {
      // Error silencioso en calendar para no trabar el flujo, pero podrías reportarlo a un servicio de monitoreo
    }

    // 4. Bloqueo de horario en Supabase
    const idHorario = reserva.horario_id || reserva.horarios_disponibles?.id || reserva.id_horario;
    if (idHorario) {
      await supabaseAdmin
        .from('horarios_disponibles')
        .update({ estado: 'reservado' })
        .eq('id', idHorario);
    }

    // 5. Notificación por Email Estilizada
    try {
      await resend.emails.send({
        from: 'Tekila Nails <onboarding@resend.dev>',
        to: process.env.EMAIL_ROCIO || '',
        subject: `✨ Turno Confirmado: ${reserva.nombre_cliente}`,
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #fafafa; padding: 40px 20px; color: #111;">
            <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 30px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #f0f0f0;">
              
              <div style="background-color: #000000; padding: 30px; text-align: center;">
                <h2 style="color: #ffffff; font-weight: 200; font-style: italic; letter-spacing: 4px; margin: 0; font-size: 18px; text-transform: uppercase;">Tekila Nails</h2>
              </div>

              <div style="padding: 40px 30px;">
                <h1 style="font-size: 22px; font-weight: 300; margin-bottom: 25px; border-bottom: 1px solid #f0f0f0; padding-bottom: 15px;">
                  ¡Nuevo turno confirmado!
                </h1>
                
                <div style="margin-bottom: 30px;">
                  <div style="margin-bottom: 15px;">
                    <p style="text-transform: uppercase; font-size: 10px; tracking: 2px; color: #a1a1aa; margin: 0 0 5px 0;">Cliente</p>
                    <p style="font-size: 16px; margin: 0; font-weight: 500;">${reserva.nombre_cliente}</p>
                  </div>

                  <div style="margin-bottom: 15px;">
                    <p style="text-transform: uppercase; font-size: 10px; tracking: 2px; color: #a1a1aa; margin: 0 0 5px 0;">Servicio</p>
                    <p style="font-size: 16px; margin: 0; font-weight: 500; color: #d946ef;">${reserva.servicios?.nombre || 'Consultar'}</p>
                  </div>

                  <div style="margin-bottom: 15px;">
                    <p style="text-transform: uppercase; font-size: 10px; tracking: 2px; color: #a1a1aa; margin: 0 0 5px 0;">Fecha y Hora</p>
                    <p style="font-size: 16px; margin: 0; font-weight: 500;">${fechaLegible} hs</p>
                  </div>

                  <div style="margin-bottom: 15px;">
                    <p style="text-transform: uppercase; font-size: 10px; tracking: 2px; color: #a1a1aa; margin: 0 0 5px 0;">WhatsApp</p>
                    <a href="https://wa.me/${reserva.whatsapp_cliente.replace(/\D/g, '')}" style="font-size: 16px; margin: 0; font-weight: 500; color: #111; text-decoration: underline;">${reserva.whatsapp_cliente}</a>
                  </div>

                  ${reserva.notas ? `
                  <div style="padding: 15px; background-color: #fff1f2; border-radius: 15px; border: 1px solid #ffe4e6; margin-top: 20px;">
                    <p style="text-transform: uppercase; font-size: 9px; font-weight: 900; color: #e11d48; margin: 0 0 5px 0;">Nota importante</p>
                    <p style="font-size: 12px; margin: 0; color: #e11d48;">${reserva.notas}</p>
                  </div>
                  ` : ''}
                </div>

                <div style="text-align: center; margin-top: 40px; border-top: 1px solid #f0f0f0; pt-20">
                  <p style="font-size: 11px; color: #a1a1aa; font-style: italic;">El turno ya fue agendado en tu Google Calendar y bloqueado en la web automáticamente.</p>
                </div>
              </div>
            </div>
            
            <p style="text-align: center; font-size: 10px; color: #d1d1d6; margin-top: 20px; text-transform: uppercase; letter-spacing: 2px;">
              © 2026 Tekila Nails • Maipú, Mendoza
            </p>
          </div>
        `
      });
    } catch (mailErr) {
      // Error silencioso
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}