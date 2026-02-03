import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

export async function POST(request: Request) {
  try {
    const { nombreServicio, precioSenia, reservaId } = await request.json();
    const token = process.env.MP_ACCESS_TOKEN?.trim();

    if (!token) return NextResponse.json({ error: 'No token' }, { status: 500 });

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
        // QUITAMOS el auto_return momentáneamente para que no de error 400
        // El usuario tendrá que hacer clic en "Volver al sitio" manualmente al terminar
        back_urls: {
          success: "http://localhost:3000/reserva-confirmada",
          failure: "http://localhost:3000/reserva-error",
          pending: "http://localhost:3000/reserva-error",
        },
        external_reference: String(reservaId),
      }
    });

    return NextResponse.json({ init_point: result.init_point });

  } catch (error: any) {
    console.error('❌ ERROR MP:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}