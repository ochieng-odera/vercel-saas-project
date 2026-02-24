import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

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

  try {
    if (event.type === "checkout.session.completed") {
      const stripeSub = await stripe.subscriptions.retrieve(
        session.subscription as string
      ) as any;

      if (!session?.metadata?.userId) {
        return new NextResponse("User ID is required in metadata", { status: 400 });
      }

      // Create subscription record
      await prisma.subscription.create({
        data: {
          userId: session.metadata.userId,
          stripeSubscriptionId: stripeSub.id,
          stripeCustomerId: stripeSub.customer as string,
          plan: "PRO",
          status: "ACTIVE",
          paymentMethod: "STRIPE",
          currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
        },
      });

      // Log payment event
      await prisma.paymentEvent.create({
        data: {
          userId: session.metadata.userId,
          provider: "STRIPE",
          eventType: event.type,
          amount: session.amount_total ? session.amount_total / 100 : 0,
          currency: session.currency || "kes",
          reference: session.id,
          rawPayload: JSON.parse(body),
        }
      });
    }

    if (event.type === "invoice.payment_succeeded") {
      const stripeSub = await stripe.subscriptions.retrieve(
        session.subscription as string
      ) as any;

      await prisma.subscription.updateMany({
        where: {
          stripeSubscriptionId: stripeSub.id,
        },
        data: {
          status: "ACTIVE",
          currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
        },
      });
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("[STRIPE_WEBHOOK_ERROR]", error);
    return new NextResponse("Webhook handler failed", { status: 500 });
  }
}
