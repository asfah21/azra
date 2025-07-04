// import { prisma } from "@/lib/prisma";

// export async function getDashboardData() {
//   try {
//     // Get asset statistics
//     const assets = await prisma.unit.findMany({
//       select: {
//         status: true,
//         condition: true,
//         categoryId: true,
//         category: {
//           select: {
//             name: true,
//           },
//         },
//         breakdowns: {
//           where: {
//             status: {
//               in: ["pending", "in_progress"],
//             },
//           },
//         },
//       },
//     });

//     // Get work order statistics
//     const breakdowns = await prisma.breakdown.findMany({
//       select: {
//         status: true,
//         breakdownTime: true,
//         createdAt: true,
//       },
//     });

//     // Calculate asset stats
//     const assetStats = {
//       total: assets.length,
//       active: assets.filter((asset) => asset.status === "operational").length,
//       maintenance: assets.filter((asset) => asset.status === "maintenance")
//         .length,
//       critical: assets.filter(
//         (asset) => asset.condition === "critical" || asset.condition === "poor",
//       ).length,
//     };

//     // Calculate work order stats
//     const workOrderStats = {
//       total: breakdowns.length,
//       pending: breakdowns.filter((b) => b.status === "pending").length,
//       inProgress: breakdowns.filter((b) => b.status === "in_progress").length,
//       rfu: breakdowns.filter((b) => b.status === "rfu").length,
//       overdue: breakdowns.filter((b) => b.status === "overdue").length,
//     };

//     // Calculate monthly breakdowns (last 6 months)
//     const monthlyBreakdowns = [];
//     const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
//     const currentDate = new Date();

//     for (let i = 5; i >= 0; i--) {
//       const monthDate = new Date(
//         currentDate.getFullYear(),
//         currentDate.getMonth() - i,
//         1,
//       );
//       const nextMonth = new Date(
//         monthDate.getFullYear(),
//         monthDate.getMonth() + 1,
//         1,
//       );

//       const count = breakdowns.filter((b) => {
//         const breakdownDate = new Date(b.createdAt);

//         return breakdownDate >= monthDate && breakdownDate < nextMonth;
//       }).length;

//       monthlyBreakdowns.push({
//         month: months[monthDate.getMonth()],
//         count,
//       });
//     }

//     // Calculate category distribution
//     const categoryCounts = assets.reduce(
//       (acc, asset) => {
//         const categoryName = asset.category?.name || "Unknown";

//         acc[categoryName] = (acc[categoryName] || 0) + 1;

//         return acc;
//       },
//       {} as Record<string, number>,
//     );

//     const categoryDistribution = Object.entries(categoryCounts).map(
//       ([category, count]) => ({
//         category,
//         count,
//       }),
//     );

//     // Mock maintenance performance data (you can replace with real data)
//     const maintenancePerformance = [
//       { department: "Heavy Equipment", completionRate: 92 },
//       { department: "Electrical", completionRate: 88 },
//       { department: "Mechanical", completionRate: 85 },
//       { department: "General", completionRate: 78 },
//     ];

//     return {
//       assetStats,
//       workOrderStats,
//       monthlyBreakdowns,
//       categoryDistribution,
//       maintenancePerformance,
//     };
//   } catch (error) {
//     console.error("Error fetching dashboard data:", error);

//     return {
//       assetStats: { total: 0, active: 0, maintenance: 0, critical: 0 },
//       workOrderStats: {
//         total: 0,
//         pending: 0,
//         inProgress: 0,
//         rfu: 0,
//         overdue: 0,
//       },
//       monthlyBreakdowns: [],
//       categoryDistribution: [],
//       maintenancePerformance: [],
//     };
//   }
// }

// export async function getRecentActivities() {
//   try {
//     // Ambil aktivitas terbaru dari UnitHistory
//     const recentActivities = await prisma.unitHistory.findMany({
//       take: 10, // Ambil 10 aktivitas terbaru
//       orderBy: {
//         createdAt: "desc",
//       },
//       include: {
//         unit: {
//           select: {
//             name: true,
//             assetTag: true,
//           },
//         },
//       },
//     });

//     // Ambil data breakdown untuk referensi
//     const breakdownIds = recentActivities
//       .filter(
//         (activity) =>
//           activity.logType === "breakdown" ||
//           activity.logType === "status_update",
//       )
//       .map((activity) => activity.referenceId);

//     const breakdowns =
//       breakdownIds.length > 0
//         ? await prisma.breakdown.findMany({
//             where: {
//               id: {
//                 in: breakdownIds,
//               },
//             },
//             select: {
//               id: true,
//               breakdownNumber: true,
//               reportedBy: {
//                 select: {
//                   name: true,
//                   photo: true,
//                 },
//               },
//               inProgressBy: {
//                 select: {
//                   name: true,
//                 },
//               },
//             },
//           })
//         : [];

//     // Ambil data user untuk referensi
//     const userIds = recentActivities
//       .filter(
//         (activity) =>
//           activity.logType === "asset_created" ||
//           activity.logType === "unit_status_change",
//       )
//       .map((activity) => activity.referenceId);

//     const users =
//       userIds.length > 0
//         ? await prisma.user.findMany({
//             where: {
//               id: {
//                 in: userIds,
//               },
//             },
//             select: {
//               id: true,
//               name: true,
//             },
//           })
//         : [];

//     // Format aktivitas
//     const formattedActivities = recentActivities.map((activity, index) => {
//       const breakdown = breakdowns.find((b) => b.id === activity.referenceId);
//       const user = users.find((u) => u.id === activity.referenceId);

//       let userName = "System";
//       let action = activity.message;
//       let type = "default";

//       // Tentukan tipe aktivitas berdasarkan logType
//       switch (activity.logType) {
//         case "breakdown":
//           type = "breakdown";
//           userName = breakdown?.reportedBy?.name || "Unknown User";
//           break;
//         case "status_update":
//           type = "workorder";
//           userName =
//             breakdown?.inProgressBy?.name ||
//             breakdown?.reportedBy?.name ||
//             "Unknown User";
//           break;
//         case "asset_created":
//           type = "asset";
//           userName = user?.name || "Admin";
//           break;
//         case "unit_status_change":
//           type = "maintenance";
//           userName = "System";
//           break;
//         case "breakdown_deleted":
//           type = "breakdown";
//           userName = "Admin";
//           break;
//         default:
//           type = "default";
//       }

//       // Format waktu
//       const now = new Date();
//       const activityTime = new Date(activity.createdAt);
//       const diffInMinutes = Math.floor(
//         (now.getTime() - activityTime.getTime()) / (1000 * 60),
//       );
//       const diffInHours = Math.floor(diffInMinutes / 60);
//       const diffInDays = Math.floor(diffInHours / 24);

//       let timeText = "";

//       if (diffInMinutes < 1) {
//         timeText = "Baru saja";
//       } else if (diffInMinutes < 60) {
//         timeText = `${diffInMinutes} menit yang lalu`;
//       } else if (diffInHours < 24) {
//         timeText = `${diffInHours} jam yang lalu`;
//       } else if (diffInDays < 7) {
//         timeText = `${diffInDays} hari yang lalu`;
//       } else {
//         timeText = activityTime.toLocaleDateString("id-ID", {
//           day: "numeric",
//           month: "short",
//           year: "numeric",
//         });
//       }

//       return {
//         id: activity.id,
//         user: userName,
//         action: action,
//         time: timeText,
//         avatar: `https://i.pravatar.cc/150?u=${index + 1}`,
//         type: type,
//         createdAt: activity.createdAt,
//       };
//     });

//     return formattedActivities;
//   } catch (error) {
//     console.error("Error fetching recent activities:", error);

//     return [];
//   }
// }
