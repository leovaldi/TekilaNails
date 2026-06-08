import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Usamos service_role key para tener permisos de escritura totales en la BD
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SERVICE_ROLE_KEY! // IMPORTANTE: Debes tener esta key en tus variables de entorno
);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const signature = request.headers.get('x-signature');
        const requestId = request.headers.get('x-request-id');

        console.log(`[WEBHOOK_LOG] Recibida notificación de MP. Evento: ${body.action}, ID Pago: ${body.data?.id}`);

        // 1. Solo procesamos pagos exitosos
        if (body.action !== 'payment.updated' && body.action !== 'payment.created') {
            return NextResponse.json({ message: "Evento ignorado" }, { status: 200 });
        }

        // 2. Obtener detalles del pago
        const paymentId = body.data.id;
        const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` }
        });

        const paymentData = await paymentResponse.json();

        // 3. Verificamos si ya está aprobado
        if (paymentData.status !== 'approved') {
            console.log(`[WEBHOOK_LOG] Pago ${paymentId} no aprobado aún. Estado: ${paymentData.status}`);
            return NextResponse.json({ message: "Pago no aprobado" }, { status: 200 });
        }

        const reservaId = paymentData.external_reference;

        // 4. Idempotencia: Verificar si ya procesamos esta reserva
        const { data: reserva } = await supabaseAdmin
            .from('reservas')
            .select('estado_pago')
            .eq('id', reservaId)
            .single();

        if (reserva?.estado_pago === 'aprobado') {
            console.log(`[WEBHOOK_LOG] Reserva ${reservaId} ya estaba confirmada. Ignorando.`);
            return NextResponse.json({ message: "Ya procesado" }, { status: 200 });
        }

        // 5. Si todo está OK, disparamos la lógica de confirmación
        // NOTA: Como la lógica ya existe en tu /api/calendar, puedes reutilizarla 
        // llamándola internamente o moviendo la lógica a una función compartida en /lib.
        console.log(`[WEBHOOK_LOG] Confirmando reserva ${reservaId} vía Webhook`);

        // Aquí dispararías la misma lógica de actualización de BD y notificaciones
        // (Te recomiendo mover la lógica del /api/calendar a una función en /lib/actions.ts 
        // para poder llamarla desde el Webhook y desde el page.tsx)

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error) {
        console.error("[TEKILA_WEBHOOK_ERROR]", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}