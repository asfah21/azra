import { notFound } from "next/navigation";

import ClientPage from "./ClientPage";

import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/Footer";

// --- METADATA ---
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  // HARUS await params (Next.js 15/16 rule)
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug },
  });

  if (!post) return {};

  return {
    title: `${post.title} – Azra Blog`,
    description: post.description,
    openGraph: { title: post.title, description: post.description },
  };
}

// --- PAGE ---
export default async function BlogDetail({
  params,
}: {
  params: { slug: string };
}) {
  // HARUS await params
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug },
  });

  if (!post) return notFound();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <ClientPage post={post} />
      <Footer />
    </div>
  );
}
