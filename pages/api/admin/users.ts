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
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isStripeActivated: true,
          createdAt: true,
          _count: {
            select: {
              conversations: true,
              usageLogs: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return res.status(200).json({ users });
    } catch (error: any) {
      console.error("Error fetching users:", error);
      return res.status(500).json({ error: "Failed to fetch users" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}

