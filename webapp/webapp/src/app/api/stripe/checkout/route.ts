import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, email } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const session = await stripe.checkout.sessions.create({
      success_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/dashboard/settings?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/dashboard/settings?canceled=true`,
      payment_method_types: ["card"],
      mode: "subscription",
      billing_address_collection: "auto",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "kes",
            product_data: {
              name: "LipaInsight Pro",
              description: "Unlimited uploads, predictive analytics, and bank-ready PDF reports.",
            },
            unit_amount: 50000, // KES 500.00 (in cents/lowest currency unit)
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[STRIPE_CHECKOUT_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
