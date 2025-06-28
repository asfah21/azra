// import { Package } from "lucide-react";
// import { Metadata } from "next";
// import { Suspense } from "react";

// import AssetCardGrids from "./components/CardGrid";
// import TableDatas from "./components/TableData";
// import { getAssetsData, getUsersData } from "./action";

// import { prisma } from "@/lib/prisma";

// export const metadata: Metadata = {
//   title: "Asset Management",
//   description: "Manage assets and view statistics",
// };

// // Loading component untuk Suspense
// function AssetsStatsLoading() {
//   return (
//     <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
//       {[...Array(4)].map((_, i) => (
//         <div
//           key={i}
//           className="h-32 bg-gray-200 animate-pulse rounded-xl"
//         />
//       ))}
//     </div>
//   );
// }

// function TableLoading() {
//   return (
//     <div className="space-y-4">
//       <div className="h-10 bg-gray-200 animate-pulse rounded-lg" />
//       {[...Array(5)].map((_, i) => (
//         <div
//           key={i}
//           className="h-16 bg-gray-100 animate-pulse rounded-lg"
//         />
//       ))}
//     </div>
//   );
// }

// // Komponen untuk menampilkan stats cards
// async function AssetsStats() {
//   const { assetStats } = await getAssetsData();

//   return (
//     <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
//       <AssetCardGrids stats={assetStats} />
//     </div>
//   );
// }

// // Komponen untuk menampilkan table
// async function AssetsTable() {
//   const { allAssets, users } = await getAssetsData();

//   return <TableDatas dataTable={allAssets} users={users} />;
// }

// export default function AssetsPage() {
//   return (
//     <div className="p-0 md:p-5 max-w-7xl mx-auto">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
//         <div className="flex items-center gap-3">
//           <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl">
//             <Package className="w-6 h-6 text-primary-600" />
//           </div>
//           <div>
//             <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
//               Asset Management
//             </h1>
//           </div>
//         </div>
//       </div>

//       {/* Stats Cards dengan Suspense */}
//       <Suspense fallback={<AssetsStatsLoading />}>
//         <AssetsStats />
//       </Suspense>

//       {/* Assets Table dengan Suspense */}
//       <Suspense fallback={<TableLoading />}>
//         <AssetsTable />
//       </Suspense>
//     </div>
//   );
// }
