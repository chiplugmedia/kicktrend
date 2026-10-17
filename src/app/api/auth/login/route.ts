import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required." },
        { status: 400 }
      );
    }

    const cleanInput = username.trim().toLowerCase();

    // Look up by username or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: cleanInput },
          { email: cleanInput },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    await createSession({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role as "user" | "admin",
      avatar: user.avatar,
    });

    return NextResponse.json({
      success: true,
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to log in." },
      { status: 500 }
    );
  }
}
