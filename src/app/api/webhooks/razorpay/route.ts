import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/server';

// ── POST /api/webhooks/razorpay ───────────────────────────────
// Razorpay sends all events here (invoice payments + subscription events).
// Verify HMAC signature first, then route by event type.

export async function POST(request: NextRequest) {
  try {
    const rawBody  = await request.text();
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
    const admin  = createAdminClient();

    switch (event.event) {

      // ── Existing: Invoice payment via Payment Links ──────────
      case 'payment_link.paid': {
        const payload         = event.payload.payment_link?.entity;
        const invoiceNumber   = payload?.notes?.invoice_number;
        const razorpayPaymentId = payload?.payments?.items?.[0]?.entity?.id;
        if (invoiceNumber) {
          await admin.from('invoices').update({
            status:              'paid',
            razorpay_payment_id: razorpayPaymentId,
            paid_at:             new Date().toISOString(),
          }).eq('invoice_number', invoiceNumber);
        }
        break;
      }

      case 'payment.captured': {
        const payment       = event.payload.payment?.entity;
        const invoiceNumber = payment?.notes?.invoice_number;
        if (invoiceNumber) {
          await admin.from('invoices').update({
            status:              'paid',
            razorpay_payment_id: payment.id,
            paid_at:             new Date().toISOString(),
          }).eq('invoice_number', invoiceNumber);
        }
        break;
      }

      // ── Subscription: first activation after successful payment ─
      case 'subscription.activated': {
        const sub          = event.payload.subscription?.entity;
        const freelancerId = sub?.notes?.freelancer_id;
        const plan         = sub?.notes?.plan as 'monthly' | 'annual' | undefined;
        if (!freelancerId) break;

        // Calculate next billing date from Razorpay's current_end timestamp
        const nextBillingDate = sub?.current_end
          ? new Date(sub.current_end * 1000).toISOString()
          : null;

        // Derive a safe display string for the payment method
        // Razorpay subscription entity has payment_method field ('upi' | 'card' etc.)
        const methodType    = sub?.payment_method ?? 'card';
        const methodDisplay = methodType === 'upi' ? 'UPI Autopay' : 'Card Autopay';

        await admin.from('users').update({
          subscription_status:      'active',
          payment_method_added:     true,
          payment_method:           methodType,
          payment_method_display:   methodDisplay,
          razorpay_subscription_id: sub.id,
          billing_plan:             plan ?? 'monthly',
          next_billing_date:        nextBillingDate,
        }).eq('id', freelancerId);

        console.log(`Subscription activated for user ${freelancerId}`);
        break;
      }

      // ── Subscription: every successful recurring charge ──────
      case 'subscription.charged': {
        const sub          = event.payload.subscription?.entity;
        const payment      = event.payload.payment?.entity;
        const freelancerId = sub?.notes?.freelancer_id;
        const plan         = sub?.notes?.plan as 'monthly' | 'annual' | undefined;
        if (!freelancerId) break;

        // Update next billing date
        const nextBillingDate = sub?.current_end
          ? new Date(sub.current_end * 1000).toISOString()
          : null;

        await admin.from('users').update({
          subscription_status: 'active',
          next_billing_date:   nextBillingDate,
        }).eq('id', freelancerId);

        // Insert billing history record
        const amount = (payment?.amount ?? 0) / 100; // paise → rupees
        await admin.from('billing_history').insert({
          freelancer_id:            freelancerId,
          razorpay_payment_id:      payment?.id ?? null,
          razorpay_subscription_id: sub.id,
          plan:                     plan ?? 'monthly',
          amount,
          status:                   'paid',
        });

        console.log(`Subscription charged for user ${freelancerId}: ₹${amount}`);
        break;
      }

      // ── Subscription: autopay exhausted/halted ───────────────
      case 'subscription.halted': {
        const sub          = event.payload.subscription?.entity;
        const payment      = event.payload.payment?.entity;
        const freelancerId = sub?.notes?.freelancer_id;
        const plan         = sub?.notes?.plan as 'monthly' | 'annual' | undefined;
        if (!freelancerId) break;

        await admin.from('users').update({
          subscription_status: 'expired',
        }).eq('id', freelancerId);

        // Record failed payment in billing history if payment details exist
        if (payment) {
          const amount = (payment.amount ?? 0) / 100;
          await admin.from('billing_history').insert({
            freelancer_id:            freelancerId,
            razorpay_payment_id:      payment.id ?? null,
            razorpay_subscription_id: sub.id,
            plan:                     plan ?? 'monthly',
            amount,
            status:                   'failed',
          });
        }

        console.warn(`Subscription halted for user ${freelancerId}`);
        break;
      }

      // ── Subscription: cancelled by user or via API ───────────
      case 'subscription.cancelled':
      case 'subscription.completed': {
        const sub          = event.payload.subscription?.entity;
        const freelancerId = sub?.notes?.freelancer_id;
        if (!freelancerId) break;

        await admin.from('users').update({
          subscription_status:      'cancelled',
          razorpay_subscription_id: null,
        }).eq('id', freelancerId);

        console.log(`Subscription cancelled/completed for user ${freelancerId}`);
        break;
      }

      default:
        // Acknowledge all other events silently
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    console.error('Razorpay webhook error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
