import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

import { consolePino } from "@/lib/logger";

const prisma = new PrismaClient();

async function main() {
  consolePino.info("🌱 Memulai proses seeding...");

  // Bersihkan data lama
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // === USER ===
  const superAdminPassword = await bcrypt.hash("super1234", 12);
  const guestPassword = await bcrypt.hash("guest1234", 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@example.com" },
    update: { password: superAdminPassword },
    create: {
      name: "Super Admin",
      email: "superadmin@example.com",
      password: superAdminPassword,
      role: "super_admin",
      department: "IT",
      avatar: "https://i.pravatar.cc/150?u=superadmin",
      photo: "https://i.pravatar.cc/150?u=superadmin",
      location: "Site Wolo",
      phone: "081234567890",
    },
  });

  const guest = await prisma.user.upsert({
    where: { email: "guest@example.com" },
    update: { password: guestPassword },
    create: {
      name: "Guest User",
      email: "guest@example.com",
      password: guestPassword,
      role: "guest",
      department: "HR",
      avatar: "https://i.pravatar.cc/150?u=guest",
      photo: "https://i.pravatar.cc/150?u=guest",
      location: "Kolaka",
      phone: "089876543210",
    },
  });

  consolePino.info("✅ User berhasil dibuat");

  // === POSTS ===
  const posts = await prisma.post.createMany({
    data: [
      {
        title: "Mengenal Dunia Alat Berat",
        slug: "mengenal-dunia-alat-berat",
        description:
          "Artikel pengantar mengenai berbagai jenis alat berat di dunia industri pertambangan.",
        content:
          "Alat berat merupakan mesin berukuran besar yang digunakan untuk membantu pekerjaan konstruksi dan pertambangan. Contohnya adalah excavator, bulldozer, dan dump truck.",
        coverImage: "https://picsum.photos/seed/alat-berat/800/400",
        images: [
          "https://picsum.photos/seed/exca/600/400",
          "https://picsum.photos/seed/dt/600/400",
        ],
        tags: ["Alat Berat", "Pertambangan"],
        category: "Artikel",
        published: true,
        publishedAt: new Date(),
        metaTitle: "Mengenal Dunia Alat Berat",
        metaDescription:
          "Penjelasan singkat tentang alat berat dan fungsinya dalam pertambangan.",
        authorId: superAdmin.id,
      },
      {
        title: "Tips Merawat Elektronik di Area Tambang",
        slug: "tips-merawat-elektronik-di-area-tambang",
        description:
          "Cara menjaga perangkat elektronik agar tahan lama di lingkungan kerja ekstrem.",
        content:
          "Lingkungan tambang penuh debu dan suhu tinggi. Perangkat elektronik seperti laptop dan radio komunikasi harus dibersihkan secara rutin dan disimpan dengan benar.",
        coverImage: "https://picsum.photos/seed/elektronik/800/400",
        images: [
          "https://picsum.photos/seed/laptop/600/400",
          "https://picsum.photos/seed/radio/600/400",
        ],
        tags: ["Elektronik", "Perawatan"],
        category: "Tips",
        published: true,
        publishedAt: new Date(),
        metaTitle: "Tips Merawat Elektronik di Area Tambang",
        metaDescription:
          "Langkah-langkah menjaga elektronik agar awet di lokasi kerja ekstrem.",
        authorId: superAdmin.id,
      },
      {
        title: "Desain Dashboard Monitoring Sederhana",
        slug: "desain-dashboard-monitoring-sederhana",
        description:
          "Konsep dasar pembuatan dashboard untuk memantau performa alat berat.",
        content:
          "Dashboard monitoring digunakan untuk memantau status dan performa alat berat secara real-time menggunakan data sensor dan sistem IoT.",
        coverImage: "https://picsum.photos/seed/dashboard/800/400",
        images: [
          "https://picsum.photos/seed/chart/600/400",
          "https://picsum.photos/seed/graph/600/400",
        ],
        tags: ["Dashboard", "IoT", "Monitoring"],
        category: "Teknologi",
        published: false,
        metaTitle: "Desain Dashboard Monitoring Sederhana",
        metaDescription:
          "Konsep UI dan fungsionalitas dasar untuk dashboard alat berat.",
        authorId: superAdmin.id,
      },
    ],
    skipDuplicates: true,
  });

  consolePino.info("✅ Post berhasil dibuat");

  // === COMMENTS ===
  const allPosts = await prisma.post.findMany();

  for (const post of allPosts) {
    await prisma.comment.createMany({
      data: [
        {
          content: "Artikel yang sangat informatif, terima kasih!",
          postId: post.id,
          userId: guest.id,
        },
        {
          content: "Terima kasih sudah membaca.",
          postId: post.id,
          userId: superAdmin.id,
        },
      ],
    });
  }

  consolePino.info("✅ Komentar berhasil dibuat");
  consolePino.info("🎉 Seeding selesai!");
}

main()
  .catch((e) => {
    consolePino.error("❌ Terjadi error saat seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
