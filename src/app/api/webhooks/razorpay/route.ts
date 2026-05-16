import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/server';

// ── POST /api/webhooks/razorpay ───────────────────────────────
// Razorpay sends events here; verify HMAC signature then update invoice status

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature') ?? '';
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;

    // Verify HMAC-SHA256 signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Razorpay webhook: invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const admin = createAdminClient();

    switch (event.event) {

      case 'payment_link.paid': {
        const payload = event.payload.payment_link?.entity;
        const invoiceNumber = payload?.notes?.invoice_number;
        const razorpayPaymentId = payload?.payments?.items?.[0]?.entity?.id;

        if (invoiceNumber) {
          await admin
            .from('invoices')
            .update({
              status:              'paid',
              razorpay_payment_id: razorpayPaymentId,
              paid_at:             new Date().toISOString(),
            })
            .eq('invoice_number', invoiceNumber);
        }
        break;
      }

      case 'payment.captured': {
        const payment = event.payload.payment?.entity;
        const invoiceNumber = payment?.notes?.invoice_number;
        if (invoiceNumber) {
          await admin
            .from('invoices')
            .update({
              status:              'paid',
              razorpay_payment_id: payment.id,
              paid_at:             new Date().toISOString(),
            })
            .eq('invoice_number', invoiceNumber);
        }
        break;
      }

      default:
        // Acknowledge unhandled events
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    console.error('Razorpay webhook error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
