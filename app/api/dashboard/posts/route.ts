import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      include: { author: true },
      orderBy: { createdAt: "desc" },
    });

    const total = posts.length;
    const published = posts.filter(p => p.published).length;
    const drafts = total - published;
    const withCover = posts.filter(p => !!p.coverImage).length;
    const withMeta = posts.filter(p => !!p.metaTitle || !!p.metaDescription).length;

    return NextResponse.json({
      postStats: {
        total,
        published,
        drafts,
        withCover,
        withMeta,
      },
      posts,
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load posts" }, { status: 500 });
  }
}
