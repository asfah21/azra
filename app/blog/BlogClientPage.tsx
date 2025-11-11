import GridCard from "./components/GridCard";

import { prisma } from "@/lib/prisma";

export default async function BlogClientPage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      title: true,
      slug: true,
      description: true,
      createdAt: true,
      coverImage: true,
    },
    take: 9,
  });

  return <GridCard posts={posts} />;
}
