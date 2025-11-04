// import { prisma } from "@/lib/prisma";
// import Link from "next/link";

// export const metadata = {
//   title: "Azra Blog – Insights & Updates",
//   description: "Latest posts from Azra’s engineering and field operations.",
// };

// export default async function BlogPage() {
//   const posts = await prisma.post.findMany({
//     orderBy: { createdAt: "desc" },
//     select: { title: true, slug: true, description: true, createdAt: true },
//   });

//   return (
//     <section className="max-w-4xl mx-auto px-4 py-12">
//       <h1 className="text-3xl font-bold mb-8">Latest Posts</h1>
//       <ul className="space-y-6">
//         {posts.map((post) => (
//           <li key={post.slug}>
//             <Link href={`/blog/${post.slug}`} className="text-xl font-semibold hover:underline">
//               {post.title}
//             </Link>
//             <p className="text-gray-500">{post.description}</p>
//           </li>
//         ))}
//       </ul>
//     </section>
//   );
// }
