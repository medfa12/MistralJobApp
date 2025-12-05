import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { db } from "../../../lib/db";
import { strictAuthRateLimit } from "../../../lib/rate-limit";
import { validatePasswordWithContext } from "../../../lib/password-validation";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "First name, last name, email and password are required" });
    }

    if (firstName.trim().length === 0) {
      return res.status(400).json({ message: "First name cannot be empty" });
    }

    if (lastName.trim().length === 0) {
      return res.status(400).json({ message: "Last name cannot be empty" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const passwordValidation = validatePasswordWithContext(password, {
      email,
      firstName,
      lastName,
    });

    if (!passwordValidation.valid) {
      return res.status(400).json({
        message: "Password does not meet security requirements",
        errors: passwordValidation.errors,
        strength: passwordValidation.strength,
      });
    }

    const existingUser = await db.user.findUnique({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email,
        password: hashedPassword,
        role: "member",
      },
    });

    const fullName = [user.firstName, user.lastName]
      .filter(Boolean)
      .join(' ') || 'User';

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        name: fullName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export default strictAuthRateLimit(handler);
