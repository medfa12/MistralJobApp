import { NextApiRequest, NextApiResponse } from "next";
import { requireAuth } from "@/lib/admin";
import { prisma } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const auth = await requireAuth(req, res);
  if (!auth.authorized) {
    return res.status(401).json({ error: auth.error });
  }

  try {
    const { model, inputTokens, outputTokens, requestType, conversationId } =
      req.body;

    if (!model || inputTokens === undefined || outputTokens === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const usageLog = await prisma.usageLog.create({
      data: {
        userId: auth.user!.id,
        model,
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
        requestType: requestType || "chat",
        conversationId: conversationId || null,
      },
    });

    return res.status(201).json({ success: true, usageLog });
  } catch (error: any) {
    console.error("Error logging usage:", error);
    return res.status(500).json({ error: "Failed to log usage" });
  }
}

