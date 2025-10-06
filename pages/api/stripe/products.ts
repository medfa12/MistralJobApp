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
    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price'],
    });

    return res.status(200).json({ products: products.data });
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return res.status(500).json({
      error: "Failed to fetch products",
      details: error.message,
    });
  }
}

