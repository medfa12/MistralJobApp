import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.email) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.stripeCustomerId) {
      return res.status(404).json({ error: "No customer found" });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.NEXTAUTH_URL}/my-plan`,
    });

    return res.status(200).json({
      url: portalSession.url,
    });
  } catch (error: any) {
    console.error("Error creating portal session:", error);

    if (error.code === undefined && error.message?.includes('No configuration provided')) {
      return res.status(503).json({
        error: "Portal not configured",
        message: "The customer portal is not yet configured. Please contact support or manage your subscription from the my-plan page.",
        configUrl: "https://dashboard.stripe.com/test/settings/billing/portal",
      });
    }

    return res.status(500).json({
      error: "Failed to create portal session",
      details: error.message,
    });
  }
}
