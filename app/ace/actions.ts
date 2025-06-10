"use server";

import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";

import prisma from "@/lib/prisma";

// Tambahkan tipe return yang sesuai
export type FormState = {
  message?: string;
  errors?: Record<string, string>;
} | null;

export async function addUser(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as Role;
    const department = formData.get("department") as string;

    // Validasi
    if (!name || !email || !password || !role) {
      return {
        errors: {
          general: "Semua field wajib diisi.",
        },
      };
    }

    // Cek email
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return {
        errors: {
          email: "Email sudah digunakan.",
        },
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan user
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        department,
      },
    });

    revalidatePath("/users");

    return { message: "User berhasil ditambahkan!" };
  } catch (error) {
    console.error("Error adding user:", error);

    return {
      errors: {
        general: "Terjadi kesalahan saat menambahkan user.",
      },
    };
  }
}
