import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// ── POST /api/billing/create-subscription ─────────────────────
// Called from the billing page "Upgrade Plan" button.
// Creates a Razorpay Customer (if not exists) + Subscription,
// then returns the subscription_id and key for the client-side popup.

export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json() as { plan: 'monthly' | 'annual' };

    // Auth: get calling user via Supabase auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');
    const admin = createAdminClient();
    const { data: { user: authUser }, error: authErr } = await admin.auth.getUser(token);
    if (authErr || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user profile
    const { data: profile } = await admin
      .from('users')
      .select('name, email, phone, razorpay_customer_id, razorpay_subscription_id')
      .eq('id', authUser.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const keyId     = process.env.RAZORPAY_KEY_ID!;
    const keySecret = process.env.RAZORPAY_KEY_SECRET!;
    const authStr   = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    // ── Step 1: Create or reuse Razorpay Customer ──────────────
    let customerId = profile.razorpay_customer_id;
    if (!customerId) {
      const custRes = await fetch('https://api.razorpay.com/v1/customers', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authStr}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name:  profile.name,
          email: profile.email,
          contact: profile.phone ?? undefined,
          fail_existing: 0, // return existing customer if email matches
        }),
      });
      const cust = await custRes.json();
      if (!custRes.ok) {
        console.error('Razorpay customer error:', cust);
        return NextResponse.json({ error: 'Failed to create customer' }, { status: 502 });
      }
      customerId = cust.id;
      // Persist customer ID
      await admin
        .from('users')
        .update({ razorpay_customer_id: customerId })
        .eq('id', authUser.id);
    }

    // ── Step 2: Cancel existing active subscription if switching plans ──
    if (profile.razorpay_subscription_id) {
      await fetch(
        `https://api.razorpay.com/v1/subscriptions/${profile.razorpay_subscription_id}/cancel`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${authStr}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ cancel_at_cycle_end: 1 }),
        }
      );
    }

    // ── Step 3: Create Razorpay Subscription ───────────────────
    const planId = plan === 'annual'
      ? process.env.RAZORPAY_PLAN_ID_ANNUAL!
      : process.env.RAZORPAY_PLAN_ID_MONTHLY!;

    const subRes = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authStr}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan_id:        planId,
        customer_id:    customerId,
        total_count:    plan === 'annual' ? 12 : 120,   // 12 cycles (annual) or 10yrs (monthly)
        quantity:       1,
        customer_notify: 1,
        notes: {
          freelancer_id: authUser.id,
          plan,
        },
      }),
    });

    const sub = await subRes.json();
    if (!subRes.ok) {
      console.error('Razorpay subscription error:', sub);
      return NextResponse.json({ error: 'Failed to create subscription' }, { status: 502 });
    }

    return NextResponse.json({
      subscription_id: sub.id,
      razorpay_key:    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      customer_id:     customerId,
      plan,
    });
  } catch (err: any) {
    console.error('create-subscription error:', err);
    return NextResponse.json({ error: 'Internal server error', details: err?.message || String(err) }, { status: 500 });
  }
}
