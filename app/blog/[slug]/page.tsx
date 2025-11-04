// import { prisma } from "@/lib/prisma";
// import { notFound } from "next/navigation";

// export async function generateMetadata({ params }: { params: { slug: string } }) {
//   const post = await prisma.post.findUnique({ where: { slug: params.slug } });
//   if (!post) return {};
//   return {
//     title: `${post.title} – Azra Blog`,
//     description: post.description,
//     openGraph: { title: post.title, description: post.description },
//   };
// }

// export default async function BlogDetail({ params }: { params: { slug: string } }) {
//   const post = await prisma.post.findUnique({ where: { slug: params.slug } });
//   if (!post) return notFound();

//   return (
//     <article className="max-w-3xl mx-auto px-4 py-12 prose">
//       <h1>{post.title}</h1>
//       <p className="text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</p>
//       <div dangerouslySetInnerHTML={{ __html: post.content }} />
//     </article>
//   );
// }
// //