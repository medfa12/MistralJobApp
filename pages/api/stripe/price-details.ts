import { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "@/lib/stripe";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { priceId } = req.query;

    if (!priceId || typeof priceId !== "string") {
      return res.status(400).json({ error: "Price ID required" });
    }

    const price = await stripe.prices.retrieve(priceId, {
      expand: ["product"],
    });

    const product = price.product as any;

    return res.status(200).json({
      priceId: price.id,
      amount: price.unit_amount,
      currency: price.currency,
      interval: price.recurring?.interval,
      productName: product.name,
      productDescription: product.description,
    });
  } catch (error: any) {
    console.error("Error fetching price details:", error);
    return res.status(500).json({
      error: "Failed to fetch price details",
      details: error.message,
    });
  }
}
