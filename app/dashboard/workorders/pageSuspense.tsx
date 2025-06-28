// import { PaperClipIcon } from "@heroicons/react/24/outline";
// import { Suspense } from "react";

// import GammaCardGrid from "./components/CardGrid";
// import GammaTableData from "./components/TableData";
// import { getBreakdownsData } from "./action";

// export const metadata = {
//   title: "Work Order",
// };

// // Component untuk menampilkan konten utama
// async function WorkOrderContent() {
//   const { allBreakdowns, breakdownStats } = await getBreakdownsData();

//   return (
//     <>
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
//         <GammaCardGrid stats={breakdownStats} />
//       </div>

//       <GammaTableData dataTable={allBreakdowns} />
//     </>
//   );
// }

// // Loading component untuk Suspense
// function WorkOrderLoading() {
//   return (
//     <div className="space-y-6">
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
//         {[...Array(4)].map((_, i) => (
//           <div
//             key={i}
//             className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse"
//           >
//             <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
//             <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
//           </div>
//         ))}
//       </div>
//       <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
//         <div className="p-6">
//           <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
//           <div className="space-y-3">
//             {[...Array(5)].map((_, i) => (
//               <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function WoPage() {
//   return (
//     <div className="p-0 md:p-5 max-w-7xl mx-auto">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
//         <div className="flex items-center gap-3">
//           <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl">
//             <PaperClipIcon className="w-6 h-6 text-primary-600" />
//           </div>
//           <div>
//             <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
//               Work Order
//             </h1>
//           </div>
//         </div>
//         {/* <div className="flex flex-wrap gap-2"><WoRightButtonList /></div> */}
//       </div>

//       <Suspense fallback={<WorkOrderLoading />}>
//         <WorkOrderContent />
//       </Suspense>
//     </div>
//   );
// }
