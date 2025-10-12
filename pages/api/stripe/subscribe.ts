import Stripe from "stripe";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { withRateLimit } from "@/lib/rate-limit";

const host = process.env.NEXTAUTH_URL;

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ 
      success: false,
      error: "Method Not Allowed" 
    });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.email) {
      return res.status(401).json({ 
        success: false,
        error: "Unauthorized - Please sign in" 
      });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        stripeCustomerId: true,
      },
    });

    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: "User not found" 
      });
    }

    const { priceId } = req.body;

    if (!priceId || typeof priceId !== "string") {
      return res.status(400).json({ 
        success: false,
        error: "Invalid price ID" 
      });
    }

    if (!priceId.startsWith('price_')) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid price ID format" 
      });
    }

    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customerName = [user.firstName, user.lastName]
        .filter(Boolean)
        .join(" ") || "User";

      const customer = await stripe.customers.create({
        email: user.email,
        name: customerName,
        metadata: {
          userId: user.id,
        },
      });

      customerId = customer.id;

      await db.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });

      console.log(`Created Stripe customer: ${customerId} for user: ${user.id}`);
    }

    const success_url = `${host}/my-plan?success=true&session_id={CHECKOUT_SESSION_ID}`;
    const cancel_url = `${host}/my-plan?canceled=true`;

    const checkoutSession = await stripe.checkout.sessions.create({
      success_url,
      cancel_url,
      payment_method_types: ["card"],
      billing_address_collection: "required",
      customer: customerId,
      customer_update: {
        address: "auto",
      },
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      metadata: {
        userId: user.id,
      },
      allow_promotion_codes: true,
    });

    console.log(`Created checkout session: ${checkoutSession.id} for user: ${user.id}`);

    return res.status(200).json({
      success: true,
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (err: any) {
    console.error("Error creating checkout session:", err);

    return res.status(500).json({
      success: false,
      error: "Failed to create checkout session",
      message: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
}

export default withRateLimit(handler, {
  limit: 10,
  windowMs: 3600000
});
