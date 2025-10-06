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

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  if (req.method === "GET") {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              conversations: true,
              usageLogs: true,
            },
          },
        },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json({ user });
    } catch (error: any) {
      console.error("Error fetching user:", error);
      return res.status(500).json({ error: "Failed to fetch user" });
    }
  }

  if (req.method === "PATCH") {
    try {
      const { role } = req.body;

      if (!role || !["admin", "member"].includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }

      const user = await prisma.user.update({
        where: { id },
        data: { role },
      });

      return res.status(200).json({ user });
    } catch (error: any) {
      console.error("Error updating user:", error);
      return res.status(500).json({ error: "Failed to update user" });
    }
  }

  if (req.method === "DELETE") {
    try {
      await prisma.user.delete({
        where: { id },
      });

      return res.status(200).json({ success: true });
    } catch (error: any) {
      console.error("Error deleting user:", error);
      return res.status(500).json({ error: "Failed to delete user" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}

