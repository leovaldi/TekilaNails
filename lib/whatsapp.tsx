// lib/whatsapp.ts

export async function notificarNuevaReserva(datos: {
    cliente: string;
    servicio: string;
    fecha: string;
    hora: string;
}) {
    const phone = process.env.CALLMEBOT_PHONE;
    const apiKey = process.env.CALLMEBOT_API_KEY;

    // Si no configuraste las variables, avisamos en la consola del servidor
    if (!phone || !apiKey) {
        console.warn("⚠️ WhatsApp no enviado: Faltan variables CALLMEBOT en .env");
        return;
    }

    // Armamos el mensaje con emojis y negritas para que Rocío lo lea fácil
    const mensaje =
        `💅 *¡Nueva Reserva en Tekila Nails!*\n\n` +
        `👤 *Cliente:* ${datos.cliente}\n` +
        `✨ *Servicio:* ${datos.servicio}\n` +
        `📅 *Fecha:* ${datos.fecha}\n` +
        `⏰ *Hora:* ${datos.hora}hs\n\n` +
        `✅ _Confirmada vía web_`;

    const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(mensaje)}&apikey=${apiKey}`;

    try {
        // Usamos { cache: 'no-store' } para que Next.js no guarde la respuesta
        const res = await fetch(url, { method: 'GET', cache: 'no-store' });

        if (res.ok) {
            console.log("🚀 WhatsApp enviado con éxito a Rocío");
        } else {
            console.error("❌ Error de CallMeBot:", await res.text());
        }
    } catch (error) {
        console.error("❌ Falló la conexión con CallMeBot:", error);
    }
}