import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { db } from "../../../lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { firstName, lastName, username, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Check if username is taken (if provided)
    if (username) {
      const existingUsername = await db.user.findUnique({
        where: {
          username: username,
        },
      });

      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await db.user.create({
      data: {
        firstName: firstName || null,
        lastName: lastName || null,
        username: username || null,
        email,
        password: hashedPassword,
        role: "member",
      },
    });

    const fullName = [user.firstName, user.lastName]
      .filter(Boolean)
      .join(' ') || user.username || 'User';

    return res.status(201).json({
      user: {
        id: user.id,
        name: fullName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
