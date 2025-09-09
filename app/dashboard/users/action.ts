"use server";

import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";

import prisma from "@/lib/prisma";
import { consolePino } from "@/lib/logger";

// Tambahkan tipe return yang sesuai
export type FormState = {
  message?: string;
  errors?: Record<string, string>;
} | null;

export async function addUsers(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as Role;
    const department = formData.get("department") as string;
    const currentUserRole = formData.get("currentUserRole") as string;

    // Validasi role - hanya super_admin yang dapat menambahkan user
    if (currentUserRole !== "super_admin") {
      return {
        errors: {
          general:
            "Unauthorized: Hanya Super Admin yang dapat menambahkan user.",
        },
      };
    }

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

    revalidatePath("/dashboard/users");

    return { message: "User berhasil ditambahkan!" };
  } catch (error: any) {
    consolePino.error("Error adding user:", error);

    // Log detailed error information
    if (error instanceof Error) {
      consolePino.error("Error name:", error.name);
      consolePino.error("Error message:", error.message);
      if ("code" in error) {
        consolePino.error("Error code:", error.code);
      }
      if ("meta" in error) {
        consolePino.error("Error meta:", error.meta);
      }
    }

    return {
      errors: {
        general: `Terjadi kesalahan saat menambahkan user: ${error.message || "Unknown error"}`,
      },
    };
  }
}

export async function updateUser(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as Role;
    const department = formData.get("department") as string;
    const currentUserRole = formData.get("currentUserRole") as string;

    // Debug logging
    consolePino.info("Update user data:", {
      id,
      name,
      email,
      role,
      department,
      currentUserRole,
      hasPassword: !!password,
    });

    // Validasi role - hanya super_admin yang dapat mengedit user
    if (currentUserRole !== "super_admin") {
      return {
        errors: {
          general: "Unauthorized: Hanya Super Admin yang dapat mengedit user.",
        },
      };
    }

    // Validasi
    if (!id || !name || !email || !role) {
      return {
        errors: {
          general: "ID, nama, email, dan role wajib diisi.",
        },
      };
    }

    // Cek apakah user exists
    const existingUser = await prisma.user.findUnique({ where: { id } });

    if (!existingUser) {
      return {
        errors: {
          general: "User tidak ditemukan.",
        },
      };
    }

    // Cek email jika berubah
    if (email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({ where: { email } });

      if (emailExists) {
        return {
          errors: {
            email: "Email sudah digunakan.",
          },
        };
      }
    }

    // Prepare update data
    const updateData: any = {
      name,
      email,
      role,
      department: department || null,
    };

    // Hash password jika ada
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update user
    await prisma.user.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/dashboard/users");

    return { message: "User berhasil diupdate!" };
  } catch (error) {
    consolePino.error("Error updating user:", error);

    return {
      errors: {
        general: "Terjadi kesalahan saat mengupdate user.",
      },
    };
  }
}

export async function deleteUser(id: string, currentUserRole?: string) {
  try {
    // Validasi role - hanya super_admin yang dapat menghapus user
    if (currentUserRole !== "super_admin") {
      return {
        success: false,
        message: "Unauthorized: Hanya Super Admin yang dapat menghapus user.",
      };
    }

    // Cek apakah user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!existingUser) {
      return { success: false, message: "User tidak ditemukan!" };
    }

    // Cek apakah user yang akan dihapus adalah super_admin
    if (existingUser.role === "super_admin") {
      return { success: false, message: "Tidak dapat menghapus Super Admin!" };
    }

    // Hapus user
    await prisma.user.delete({
      where: { id },
    });

    revalidatePath("/dashboard/users");

    return {
      success: true,
      message: `User ${existingUser.name} berhasil dihapus!`,
    };
  } catch (error) {
    consolePino.error("Error deleting user:", error);

    return {
      success: false,
      message: "Terjadi kesalahan saat menghapus user.",
    };
  }
}

export async function importUsersFromExcel(prevState: any, formData: FormData) {
  try {
    const excelDataJson = formData.get("excelData") as string;
    const createdById = formData.get("createdById") as string;

    if (!excelDataJson || !createdById) {
      return {
        success: false,
        message: "Data Excel atau User ID tidak ditemukan!",
      };
    }

    const excelData = JSON.parse(excelDataJson) as any[];

    if (!Array.isArray(excelData) || excelData.length === 0) {
      return {
        success: false,
        message: "Data Excel kosong atau format tidak valid!",
      };
    }

    // Validasi user exists
    const userExists = await prisma.user.findUnique({
      where: { id: createdById },
    });

    if (!userExists) {
      return {
        success: false,
        message: "User tidak ditemukan!",
      };
    }

    // Hash password jika ada, lalu buat user satu per satu
    await Promise.all(
      excelData.map(async (row) => {
        const hashedPassword =
          row.password && row.password.trim() !== ""
            ? await bcrypt.hash(row.password, 10)
            : undefined;

        await prisma.user.create({
          data: {
            name: row.name,
            email: row.email,
            password: hashedPassword || "",
            role: row.role,
            department: row.department,
          },
        });
      }),
    );

    revalidatePath("/dashboard/users");

    return {
      success: true,
      message: "Data users berhasil diimpor!",
    };
  } catch (error) {
    consolePino.error("Error importing users from Excel:", error);

    return {
      success: false,
      message: "Terjadi kesalahan saat mengimpor data users dari Excel.",
    };
  }
}

// export async function importUsersFromExcel(
//   prevState:any,
//   formData:FormData,
// ) {
//   try {
//     const excelDataJson = formData.get("excelData") as string;
//     const createdById = formData.get("createdById") as string;

//     if (!excelDataJson || !createdById) {
//       return {
//         success: false,
//         message: "Data Excel atau User ID tidak ditemukan!",
//       };
//     }

//     const excelData = JSON.parse(excelDataJson) as any[];

//     if (!Array.isArray(excelData) || excelData.length === 0) {
//       return {
//         success: false,
//         message: "Data Excel kosong atau format tidak valid!",
//       };
//     }

//     // Validasi user exists
//     const userExists = await prisma.user.findUnique({
//       where: { id: createdById },
//     });

//     if (!userExists) {
//       return {
//         success: false,
//         message: "User tidak ditemukan!",
//       };
//     }

//     // Simpan data ke database
//     const usersToCreate = excelData.map((row) => ({
//       name: row.name,
//       email: row.email,
//       password: row.password,
//       role: row.role,
//       department: row.department,
//     }));

//     await prisma.user.createMany({
//       data: usersToCreate,
//     });

//     revalidatePath("/dashboard/users");

//     return {
//       success: true,
//       message: "Data users berhasil diimpor!",
//     };
//   } catch (error) {
//     console.error("Error importing users from Excel:", error);
//     return {
//       success: false,
//       message: "Terjadi kesalahan saat mengimpor data users dari Excel.",
//     };
//   }
// }

// export async function getUsersData() {
//   try {
//     const allUsers = await prisma.user.findMany({
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         role: true,
//         department: true,
//         createdAt: true,
//         lastActive: true,
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });

//     // Hitung stats dari data yang sudah di-fetch
//     const totalUsers = allUsers.length;

//     // Hitung new users bulan ini
//     const startOfMonth = new Date();

//     startOfMonth.setDate(1);
//     startOfMonth.setHours(0, 0, 0, 0);

//     const newUsers = allUsers.filter(
//       (user) => user.createdAt >= startOfMonth,
//     ).length;

//     // Hitung active users (aktif dalam 30 hari terakhir)
//     const thirtyDaysAgo = new Date();

//     thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

//     const activeUsers = allUsers.filter(
//       (user) => user.lastActive && user.lastActive >= thirtyDaysAgo,
//     ).length;

//     // Hitung inactive users (tidak aktif dalam 30 hari terakhir atau tidak ada lastActive)
//     const inactiveUsers = allUsers.filter(
//       (user) => !user.lastActive || user.lastActive < thirtyDaysAgo,
//     ).length;

//     const userStats = {
//       total: totalUsers,
//       new: newUsers,
//       active: activeUsers,
//       inactive: inactiveUsers,
//     };

//     return {
//       success: true,
//       data: {
//         users: allUsers,
//         stats: userStats,
//       },
//     };
//   } catch (error) {
//     console.error("Error fetching users data:", error);

//     return {
//       success: false,
//       message: "Terjadi kesalahan saat mengambil data users.",
//       data: {
//         users: [],
//         stats: {
//           total: 0,
//           new: 0,
//           active: 0,
//           inactive: 0,
//         },
//       },
//     };
//   }
// }
