import { prisma } from "@/lib/prisma";

export async function getUsersData() {
    try {
      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          department: true,
          createdAt: true,
          lastActive: true,
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