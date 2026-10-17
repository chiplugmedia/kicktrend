import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Username, email, and password are required." },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");

    if (cleanUsername.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters and alphanumeric." },
        { status: 400 }
      );
    }

    // Check if username exists
    const existingUser = await prisma.user.findUnique({
      where: { username: cleanUsername },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: `The username @${cleanUsername} is already taken.` },
        { status: 409 }
      );
    }

    // Check if email exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (existingEmail) {
      return NextResponse.json(
        { error: "This email address is already registered." },
        { status: 409 }
      );
    }

    // First user becomes admin automatically, or user with admin in username
    const totalUsers = await prisma.user.count();
    const role: "user" | "admin" = totalUsers === 0 || cleanUsername === "admin" ? "admin" : "user";

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        username: cleanUsername,
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role,
      },
    });

    await createSession({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role as "user" | "admin",
      avatar: newUser.avatar,
    });

    return NextResponse.json({
      success: true,
      user: {
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to register user." },
      { status: 500 }
    );
  }
}
