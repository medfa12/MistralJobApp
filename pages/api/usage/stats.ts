import { NextApiRequest, NextApiResponse } from "next";
import { requireAuth } from "@/lib/admin";
import { prisma } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const auth = await requireAuth(req, res);
  if (!auth.authorized) {
    return res.status(401).json({ error: auth.error });
  }

  try {
    const { period = "month" } = req.query;

    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case "day":
        startDate.setDate(now.getDate() - 1);
        break;
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    const usageLogs = await prisma.usageLog.findMany({
      where: {
        userId: auth.user!.id,
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalTokens = usageLogs.reduce(
      (sum: number, log) => sum + log.totalTokens,
      0
    );
    const totalInputTokens = usageLogs.reduce(
      (sum: number, log) => sum + log.inputTokens,
      0
    );
    const totalOutputTokens = usageLogs.reduce(
      (sum: number, log) => sum + log.outputTokens,
      0
    );

    const byModel = usageLogs.reduce((acc: Record<string, { count: number; totalTokens: number; inputTokens: number; outputTokens: number }>, log) => {
      if (!acc[log.model]) {
        acc[log.model] = {
          count: 0,
          totalTokens: 0,
          inputTokens: 0,
          outputTokens: 0,
        };
      }
      acc[log.model].count++;
      acc[log.model].totalTokens += log.totalTokens;
      acc[log.model].inputTokens += log.inputTokens;
      acc[log.model].outputTokens += log.outputTokens;
      return acc;
    }, {});

    const dailyUsage = usageLogs.reduce((acc: Record<string, { totalTokens: number; count: number }>, log) => {
      const date = log.createdAt.toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = { totalTokens: 0, count: 0 };
      }
      acc[date].totalTokens += log.totalTokens;
      acc[date].count++;
      return acc;
    }, {});

    return res.status(200).json({
      period,
      startDate,
      endDate: now,
      summary: {
        totalRequests: usageLogs.length,
        totalTokens,
        totalInputTokens,
        totalOutputTokens,
      },
      byModel,
      dailyUsage,
      recentLogs: usageLogs.slice(0, 10),
    });
  } catch (error: any) {
    console.error("Error fetching usage stats:", error);
    return res.status(500).json({ error: "Failed to fetch usage stats" });
  }
}
