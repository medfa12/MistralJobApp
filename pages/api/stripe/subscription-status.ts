import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.email) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        isStripeActivated: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripePriceId: true,
        stripeCurrentPeriodEnd: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.stripeSubscriptionId) {
      return res.status(200).json({
        hasSubscription: false,
        user: {
          email: user.email,
          isActive: false,
        },
      });
    }

    const subscription = await stripe.subscriptions.retrieve(
      user.stripeSubscriptionId
    );

    const price = await stripe.prices.retrieve(subscription.items.data[0].price.id, {
      expand: ["product"],
    });

    const product = price.product as any;

    return res.status(200).json({
      hasSubscription: true,
      user: {
        email: user.email,
        isActive: user.isStripeActivated,
      },
      subscription: {
        id: subscription.id,
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        created: subscription.created,
      },
      plan: {
        priceId: price.id,
        productId: product.id,
        productName: product.name,
        description: product.description || '',
        amount: price.unit_amount || 0,
        currency: price.currency,
        interval: price.recurring?.interval || 'month',
      },
    });
  } catch (error: any) {
    console.error("Error getting subscription status:", error);
    return res.status(500).json({
      error: "Failed to get subscription status",
      details: error.message,
    });
  }
}
