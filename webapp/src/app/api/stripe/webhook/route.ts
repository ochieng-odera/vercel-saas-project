import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const supabase = await createClient();

  try {
    if (event.type === "checkout.session.completed") {
      const stripeSub = await stripe.subscriptions.retrieve(
        session.subscription as string
      ) as any;

      if (!session?.metadata?.userId) {
        return new NextResponse("User ID is required in metadata", { status: 400 });
      }

      await supabase.from("subscriptions").insert({
        user_id: session.metadata.userId,
        stripe_subscription_id: stripeSub.id,
        stripe_customer_id: stripeSub.customer as string,
        plan: "PRO",
        status: "ACTIVE",
        payment_method: "STRIPE",
        current_period_start: new Date(stripeSub.current_period_start * 1000).toISOString(),
        current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString(),
      });

      await supabase.from("payment_events").insert({
        user_id: session.metadata.userId,
        provider: "STRIPE",
        event_type: event.type,
        amount: session.amount_total ? session.amount_total / 100 : 0,
        currency: session.currency || "kes",
        reference: session.id,
        raw_payload: JSON.parse(body),
      });
    }

    if (event.type === "invoice.payment_succeeded") {
      const stripeSub = await stripe.subscriptions.retrieve(
        session.subscription as string
      ) as any;

      await supabase
        .from("subscriptions")
        .update({
          status: "ACTIVE",
          current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString(),
        })
        .eq("stripe_subscription_id", stripeSub.id);
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("[STRIPE_WEBHOOK_ERROR]", error);
    return new NextResponse("Webhook handler failed", { status: 500 });
  }
}
