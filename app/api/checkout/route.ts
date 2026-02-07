import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

export async function POST(request: Request) {
  try {
    const { nombreServicio, precioSenia, reservaId } = await request.json();
    const token = process.env.MP_ACCESS_TOKEN?.trim();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL; // Tu URL de Vercel

    if (!token) return NextResponse.json({ error: 'No token' }, { status: 500 });
    if (!baseUrl) return NextResponse.json({ error: 'Falta NEXT_PUBLIC_BASE_URL' }, { status: 500 });

    const client = new MercadoPagoConfig({ accessToken: token });
    const preference = new Preference(client);
    
    const result = await preference.create({
      body: {
        items: [
          {
            id: String(reservaId),
            title: `Seña: ${nombreServicio}`,
            quantity: 1,
            unit_price: Number(precioSenia),
            currency_id: 'ARS',
          }
        ],
        // 1. Configuramos las URLs dinámicas según el dominio (Vercel)
        back_urls: {
          success: `${baseUrl}/reserva-confirmada`,
          failure: `${baseUrl}/`,
          pending: `${baseUrl}/`,
        },
        // 2. Activamos el retorno automático para que vuelva solo a la web
        auto_return: "approved",
        // 3. Referencia externa para que la página de éxito sepa qué reserva procesar
        external_reference: String(reservaId),
        // 4. Evitamos que puedan pagar con métodos que tarden días (opcional, solo tarjetas/dinero MP)
        payment_methods: {
          excluded_payment_types: [{ id: "ticket" }], // Excluye Rapipago/Pagofácil si querés confirmación inmediata
          installments: 1 // Opcional: Limitar a 1 cuota para evitar líos con la seña
        }
      }
    });

    return NextResponse.json({ init_point: result.init_point });

  } catch (error: any) {
    console.error('❌ ERROR MP:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}