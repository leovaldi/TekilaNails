import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

export async function POST(request: Request) {
  try {
    const { nombreServicio, precioSenia, reservaId } = await request.json();
    const token = process.env.MP_ACCESS_TOKEN?.trim();
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
    baseUrl = baseUrl.split('#')[0].trim().replace(/\/$/, ""); // Limpia comentarios y slash final

    if (!token) return NextResponse.json({ error: 'Falta Token' }, { status: 500 });
    if (!baseUrl) return NextResponse.json({ error: 'Falta NEXT_PUBLIC_BASE_URL' }, { status: 500 });

    const client = new MercadoPagoConfig({ accessToken: token });
    const preference = new Preference(client);

    // Versión segura contra el bug de Mercado Pago con localhost y auto_return
    const isLocalhost = baseUrl.includes("localhost");
    const response = await preference.create({
      body: {
        items: [
          {
            id: String(reservaId),
            title: nombreServicio || "Servicio de Manicuría",
            quantity: 1,
            unit_price: Math.round(Number(precioSenia) * 1.076), // Recargo del 7.6%
            currency_id: 'ARS',
          }
        ],
        back_urls: {
          success: `${baseUrl}/reserva-confirmada`,
          failure: `${baseUrl}/`,
          pending: `${baseUrl}/`
        },
        external_reference: String(reservaId),
        payment_methods: {
          excluded_payment_types: [{ id: "ticket" }], // Solo pagos de acreditación inmediata
          installments: 1 // Solo 1 cuota para la seña
        },
        auto_return: "approved"
      }
    });

    console.log("¡ÉXITO MP!", response.init_point);
    return NextResponse.json({ init_point: response.init_point });

  } catch (error: any) {
    console.error('--- ERROR DETECTADO ---');
    console.log(JSON.stringify(error, null, 2)); // Esto nos dará el error completo
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}