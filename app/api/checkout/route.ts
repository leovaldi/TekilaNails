import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

export async function POST(request: Request) {
  try {
    const { nombreServicio, precioSenia, reservaId } = await request.json();
    const token = process.env.MP_ACCESS_TOKEN?.trim();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL; // Tu URL de Vercel

    if (!token) return NextResponse.json({ error: 'No token' }, { status: 500 });
    if (!baseUrl) return NextResponse.json({ error: 'Falta NEXT_PUBLIC_BASE_URL' }, { status: 500 });

    // --- CÁLCULO DE RECARGO (7.6%) ---
    // Cubre el 6.29% de comisión de MP + el IVA sobre esa comisión.
    const porcentajeRecargo = 0.076; 
    const precioConRecargo = Math.round(Number(precioSenia) * (1 + porcentajeRecargo));

    const client = new MercadoPagoConfig({ accessToken: token });
    const preference = new Preference(client);
    
    const result = await preference.create({
      body: {
        items: [
          {
            id: String(reservaId),
            title: `Seña: ${nombreServicio}`,
            quantity: 1,
            unit_price: precioConRecargo, // Ahora con el recargo aplicado
            currency_id: 'ARS',
          }
        ],
        // URLs de retorno según el dominio (Vercel)
        back_urls: {
          success: `${baseUrl}/reserva-confirmada`,
          failure: `${baseUrl}/`,
          pending: `${baseUrl}/`,
        },
        // Retorno automático al aprobarse
        auto_return: "approved",
        // Referencia externa para identificar la reserva en la página de éxito
        external_reference: String(reservaId),
        // Configuración de métodos de pago
        payment_methods: {
          excluded_payment_types: [{ id: "ticket" }], // Solo pagos de acreditación inmediata
          installments: 1 // Solo 1 cuota para la seña
        }
      }
    });

    return NextResponse.json({ init_point: result.init_point });

  } catch (error: any) {
    console.error('ERROR MP:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}