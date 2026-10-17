import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { updatePostAction, getPostById } from "@/app/actions/post-actions";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const postId = parseInt(id, 10);

    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid article ID." }, { status: 400 });
    }

    const post = await getPostById(postId);
    if (!post) {
      return NextResponse.json({ error: "Article not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, article: post });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch article." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    const postId = parseInt(id, 10);

    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid article ID." }, { status: 400 });
    }

    const body = await request.json();
    const result = await updatePostAction(postId, body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Article updated successfully.",
      article: result.post,
    });
  } catch (error: any) {
    if (error.message?.includes("Forbidden") || error.message?.includes("Authentication")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to update article." },
      { status: 500 }
    );
  }
}
