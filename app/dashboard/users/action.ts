"use server";

import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";

import prisma from "@/lib/prisma";
import { consolePino } from "@/lib/logger";
import { authOptions } from "@/lib/auth";

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
    const fidRaw = (formData.get("fid") as string | null)?.trim() ?? "";
    const nikRaw = (formData.get("nik") as string | null)?.trim() ?? "";
    const session = await getServerSession(authOptions);
    const currentUserRole = session?.user?.role as string | undefined;

    // Validasi role - hanya super_admin dari session yang dapat menambahkan user
    if (currentUserRole !== "super_admin") {
      return {
        errors: {
          general:
            "Unauthorized: Hanya Super Admin yang dapat menambahkan user.",
        },
      };
    }

    // Validasi
    const allowedRoles = [
      "super_admin",
      "admin_heavy",
      "admin_elec",
      "pengawas",
      "mekanik",
      "guest",
    ] as const;

    if (
      !name ||
      !email ||
      !password ||
      !role ||
      !allowedRoles.includes(role as any)
    ) {
      return { errors: { general: "Semua field wajib diisi." } };
    }

    // Cek email
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return { errors: { email: "Email sudah digunakan." } };
    }

    // Parse & validasi FID (opsional, numerik)
    let fidNumber: number | null = null;

    if (fidRaw) {
      const n = Number(fidRaw);

      if (Number.isNaN(n)) {
        return { errors: { general: "FID harus berupa angka." } };
      }
      fidNumber = n;
      // Cek duplikat FID
      const dupFid = await prisma.user.findFirst({
        where: { fid: n },
        select: { id: true },
      });

      if (dupFid) {
        return { errors: { general: `FID sudah digunakan oleh user lain.` } };
      }
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
        fid: fidNumber,
        nik: nikRaw || null,
      },
    });

    revalidatePath("/dashboard/users");

    return { message: "User berhasil ditambahkan!" };
  } catch (error: any) {
    consolePino.error("Error adding user:", error);

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
    const jabatan = formData.get("jabatan") as string;
    const fidRaw = (formData.get("fid") as string | null)?.trim() ?? "";
    const nikRaw = (formData.get("nik") as string | null)?.trim() ?? "";
    const session = await getServerSession(authOptions);
    const currentUserRole = session?.user?.role as string | undefined;

    consolePino.info("Update user data:", {
      id,
      name,
      email,
      role,
      department,
      jabatan,
      currentUserRole,
      fid: fidRaw,
      nik: nikRaw,
      hasPassword: !!password,
    });

    if (currentUserRole !== "super_admin") {
      return {
        errors: {
          general: "Unauthorized: Hanya Super Admin yang dapat mengedit user.",
        },
      };
    }

    // Validasi
    const allowedRoles = [
      "super_admin",
      "admin_heavy",
      "admin_elec",
      "pengawas",
      "mekanik",
      "guest",
    ] as const;

    if (
      !id ||
      !name ||
      !email ||
      !role ||
      !allowedRoles.includes(role as any)
    ) {
      return { errors: { general: "ID, nama, email, dan role wajib diisi." } };
    }

    // Cek user
    const existingUser = await prisma.user.findUnique({ where: { id } });

    if (!existingUser) {
      return { errors: { general: "User tidak ditemukan." } };
    }

    // Cek email jika berubah
    if (email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({ where: { email } });

      if (emailExists) {
        return { errors: { email: "Email sudah digunakan." } };
      }
    }

    // Parse & validasi FID (opsional, numerik)
    let fidToSave: number | null = null;
    let setFidNull = false;

    if (fidRaw === "") {
      setFidNull = true; // kosongkan FID
    } else {
      const n = Number(fidRaw);

      if (!Number.isNaN(n)) {
        fidToSave = n;
        // Jika berubah, cek duplikat FID
        if ((existingUser as any).fid !== n) {
          const dupFid = await prisma.user.findFirst({
            where: { fid: n, NOT: { id } },
            select: { id: true },
          });

          if (dupFid) {
            return {
              errors: { general: `FID sudah digunakan oleh user lain.` },
            };
          }
        }
      } else {
        return { errors: { general: "FID harus berupa angka." } };
      }
    }

    // Siapkan data update
    const updateData: any = {
      name,
      email,
      role,
      department: department || null,
      jabatan: jabatan || null,
      nik: nikRaw ? String(nikRaw) : null,
    };

    if (setFidNull) {
      updateData.fid = null;
    } else if (fidToSave !== null) {
      updateData.fid = fidToSave;
    }

    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await prisma.user.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/dashboard/users");

    return { message: "User berhasil diupdate!" };
  } catch (error) {
    consolePino.error("Error updating user:", error);

    return { errors: { general: "Terjadi kesalahan saat mengupdate user." } };
  }
}

export async function deleteUser(id: string, _currentUserRole?: string) {
  try {
    // Validasi role dari session - hanya super_admin yang dapat menghapus user
    const session = await getServerSession(authOptions);
    const currentUserRole = session?.user?.role as string | undefined;

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
    const excelDataJson = formData.get("excelData") as string | null;
    const createdById = formData.get("createdById") as string | null;

    consolePino.info("importUsersFromExcel called, createdById:", createdById);
    if (excelDataJson) {
      try {
        const preview = JSON.parse(excelDataJson);

        consolePino.info(
          "Received excel rows:",
          Array.isArray(preview) ? preview.length : "not-array",
        );
        consolePino.info("First row preview:", preview[0]);
      } catch (e) {
        consolePino.error("excelDataJson parse error", e);
      }
    } else {
      consolePino.warn("No excelData provided in formData");
    }

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

    const failed: { rowIndex: number; reason: string }[] = [];

    // Hash password jika ada, lalu buat user satu per satu
    await Promise.all(
      excelData.map(async (row, idx) => {
        try {
          const email = String(row.email || "").trim();
          const name = String(row.name || "").trim();
          const role = String(row.role || "").trim();
          const department = row.department
            ? String(row.department).trim()
            : null;
          const fid = row.fid ? String(row.fid).trim() : null;
          const nik = row.nik ? String(row.nik).trim() : null;
          const passwordRaw = row.password ?? "";

          if (!email || !name || !role) {
            failed.push({
              rowIndex: idx + 1,
              reason: "Missing required fields (name/email/role)",
            });

            return;
          }

          // Cek duplicate email
          const existingByEmail = await prisma.user.findUnique({
            where: { email },
            select: { id: true },
          });

          if (existingByEmail) {
            failed.push({
              rowIndex: idx + 1,
              reason: `Email sudah ada: ${email}`,
            });

            return;
          }

          // Cek duplicate fid jika ada (jika kolom fid ada di schema)
          if (fid) {
            try {
              const fidNumber = Number(fid);
              const whereClause = Number.isNaN(fidNumber)
                ? { externalId: fid }
                : { OR: [{ fid: fidNumber }, { externalId: fid }] };

              const existingByFid = await prisma.user.findFirst({
                where: whereClause,
                select: { id: true },
              });

              if (existingByFid) {
                failed.push({
                  rowIndex: idx + 1,
                  reason: `FID sudah ada: ${fid}`,
                });

                return;
              }
            } catch {
              // jika kolom fid tidak ada di schema, skip check quietly
            }
          }

          const hashedPassword =
            passwordRaw && String(passwordRaw).trim() !== ""
              ? await bcrypt.hash(String(passwordRaw), 10)
              : "";

          // Include fid/nik converting to numeric when possible (Prisma expects Int for fid in your schema)
          const createData: any = {
            name,
            email,
            password: hashedPassword || "",
            role,
            department: department || null,
          };

          if (fid) {
            const fidNumber = Number(fid);

            if (!Number.isNaN(fidNumber)) {
              // schema expects Int — provide a number
              createData.fid = fidNumber;
            } else {
              // if not numeric, try fallback field name that could store string IDs
              createData.externalId = fid;
            }
          }

          // In your schema nik is stored as String (error showed "Expected String or Null"),
          // so always store NIK as string to avoid type mismatch.
          if (nik) {
            createData.nik = String(nik);
          }

          try {
            await prisma.user.create({
              data: createData,
            });
          } catch (prismaErr: any) {
            // log more details to help debugging (Prisma errors contain meta/code)
            consolePino.error("Prisma create error for row:", {
              idx,
              createData,
            });
            consolePino.error("Prisma error:", {
              message: prismaErr?.message,
              code: prismaErr?.code,
              meta: prismaErr?.meta,
            });
            throw prismaErr;
          }
        } catch (err: any) {
          consolePino.error("Row import error:", { idx, err });
          failed.push({
            rowIndex: idx + 1,
            reason: err?.message || "Unknown error",
          });
        }
      }),
    );

    revalidatePath("/dashboard/users");

    if (failed.length > 0) {
      return {
        success: false,
        message: `Beberapa baris gagal diimpor (${failed.length}). Lihat detail.`,
        detail: failed,
      };
    }

    return {
      success: true,
      message: "Data users berhasil diimpor!",
    };
  } catch (error) {
    console.error("Error importing users from Excel:", error);

    return { success: false, message: "Server error saat import" };
  }
}

export async function getUsersData() {
  try {
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        jabatan: true,
        createdAt: true,
        lastActive: true,
        // tambahkan fid & nik agar dikirim ke client
        fid: true,
        nik: true,
        photo: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Hitung stats dari data yang sudah di-fetch
    const totalUsers = allUsers.length;

    // Hitung new users bulan ini
    const startOfMonth = new Date();

    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newUsers = allUsers.filter(
      (user) => user.createdAt >= startOfMonth,
    ).length;

    // Hitung active users (aktif dalam 30 hari terakhir)
    const thirtyDaysAgo = new Date();

    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeUsers = allUsers.filter(
      (user) => user.lastActive && user.lastActive >= thirtyDaysAgo,
    ).length;

    // Hitung inactive users (tidak aktif dalam 30 hari terakhir atau tidak ada lastActive)
    const inactiveUsers = allUsers.filter(
      (user) => !user.lastActive || user.lastActive < thirtyDaysAgo,
    ).length;

    const userStats = {
      total: totalUsers,
      new: newUsers,
      active: activeUsers,
      inactive: inactiveUsers,
    };

    return {
      success: true,
      data: {
        users: allUsers,
        stats: userStats,
      },
    };
  } catch (error) {
    console.error("Error fetching users data:", error);

    return {
      success: false,
      message: "Terjadi kesalahan saat mengambil data users.",
      data: {
        users: [],
        stats: {
          total: 0,
          new: 0,
          active: 0,
          inactive: 0,
        },
      },
    };
  }
}
