// components/UserName.tsx
"use client";

import { useSession } from "next-auth/react";

interface UserNameProps {
  userId: string | null;
}

export function UserName({ userId }: UserNameProps) {
  const { data: session } = useSession();

  // Jika tidak ada userId, kembalikan "Unassigned"
  if (!userId) {
    return <span>Unassigned</span>;
  }

  // Jika userId sama dengan user saat ini, tampilkan "You"
  if (userId === session?.user?.id) {
    return <span>{session.user.name || "You"}</span>;
    // return <span>You</span>;
  }

  // Jika ada daftar users dari props, cari nama berdasarkan id
  // (Ini alternatif jika Anda tidak ingin/menggunakan database query)

  return <span>{userId}</span>; // Fallback tampilkan ID jika nama tidak ditemukan
}
