import { notFound } from "next/navigation";

import ClientPage from "./ClientPage";

import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/Footer";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const post = await prisma.post.findUnique({ where: { slug: params.slug } });

  if (!post) return {};

  return {
    title: `${post.title} – Azra Blog`,
    description: post.description,
    openGraph: { title: post.title, description: post.description },
  };
}

export default async function BlogDetail({
  params,
}: {
  params: { slug: string };
}) {
  const post = await prisma.post.findUnique({ where: { slug: params.slug } });

  if (!post) return notFound();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {/* <main className="flex-1">
            <BlogClientPage />
          </main> */}
      <ClientPage post={post} />
      <Footer />
    </div>
  );
}
