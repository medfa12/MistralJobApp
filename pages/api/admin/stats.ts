import { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const auth = await requireAdmin(req, res);
  if (!auth.authorized) {
    return res.status(403).json({ error: auth.error });
  }

  if (req.method === "GET") {
    try {
      const [
        totalUsers,
        activeSubscribers,
        totalConversations,
        totalUsageLogs,
        recentUsers,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({
          where: { isStripeActivated: true },
        }),
        prisma.chatConversation.count(),
        prisma.usageLog.count(),
        prisma.user.findMany({
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            createdAt: true,
          },
        }),
      ]);

      const now = new Date();
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

      const usageLastMonth = await prisma.usageLog.aggregate({
        where: {
          createdAt: { gte: thirtyDaysAgo },
        },
        _sum: {
          totalTokens: true,
        },
        _count: {
          id: true,
        },
      });

      return res.status(200).json({
        totalUsers,
        activeSubscribers,
        totalConversations,
        totalApiCalls: totalUsageLogs,
        usageLastMonth: {
          totalTokens: usageLastMonth._sum.totalTokens || 0,
          requestCount: usageLastMonth._count.id || 0,
        },
        recentUsers,
      });
    } catch (error: any) {
      console.error("Error fetching admin stats:", error);
      return res.status(500).json({ error: "Failed to fetch stats" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}

