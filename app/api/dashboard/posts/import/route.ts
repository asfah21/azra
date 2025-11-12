import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const posts = (body.posts || []) as Array<any>;

    if (!Array.isArray(posts) || posts.length === 0) {
      return NextResponse.json({ error: "No posts" }, { status: 400 });
    }

    const created = [] as any[];

    for (const p of posts) {
      const author = p.authorEmail
        ? await prisma.user.findUnique({ where: { email: p.authorEmail } })
        : null;

      const images: string[] = Array.isArray(p.images) ? p.images : [];

      const createdPost = await prisma.post.upsert({
        where: { slug: p.slug },
        update: {
          title: p.title,
          content: p.content,
          description: p.description ?? null,
          coverImage: p.coverImage ?? null,
          link: p.link ?? null,
          images,
          tags: Array.isArray(p.tags) ? p.tags : [],
          category: p.category ?? null,
          published: !!p.published,
          publishedAt: p.publishedAt ? new Date(p.publishedAt) : null,
          metaTitle: p.metaTitle ?? null,
          metaDescription: p.metaDescription ?? null,
          authorId: author?.id ?? null,
        },
        create: {
          title: p.title,
          slug: p.slug,
          content: p.content,
          description: p.description ?? null,
          coverImage: p.coverImage ?? null,
          link: p.link ?? null,
          images,
          tags: Array.isArray(p.tags) ? p.tags : [],
          category: p.category ?? null,
          published: !!p.published,
          publishedAt: p.publishedAt ? new Date(p.publishedAt) : null,
          metaTitle: p.metaTitle ?? null,
          metaDescription: p.metaDescription ?? null,
          authorId: author?.id ?? null,
        },
      });

      created.push(createdPost);
    }

    return NextResponse.json({ ok: true, count: created.length });
  } catch (e: any) {
    console.error(e);

    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
