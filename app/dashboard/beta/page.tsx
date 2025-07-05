import { getUserList, getUserCount } from '@/lib/dashboard/beta'
import { createUser, deleteUser } from './action'
import UserTable from './components/beta/UserTable'
import UserForm from './components/beta/UserForm'
import UserCard from './components/beta/UserCard'

export default async function BetaPage (){
  const [users, count] = await Promise.all([
      getUserList(),
      getUserCount(),
    ]);
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">User Dashboard</h1>

      {/* User Card */}
      <UserCard count={count} />

      {/* Form dan Table */}
      <UserForm action={createUser} />
      <UserTable users={users} onDelete={deleteUser} />
    </div>
  );
} 

// export default async function DashboardPage() {
//   const users = await getUserList();

//   return (
//     <div>
//       <h1>User Dashboard</h1>
//       <UserForm action={createUser} />
//       <UserTable users={users} onDelete={deleteUser} />
//     </div>
//   );
// }


// "use client";
// import { Package } from "lucide-react";

// import AssetCardGrid from "./components/CardGris";
// import TableAssets from "./components/TableAsset";

// export default function AssetsPage() {
//   // Mock data untuk assets

//   return (
//     <div className="p-0 md:p-5 max-w-7xl mx-auto">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
//         <div className="flex items-center gap-3">
//           <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl">
//             <Package className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
//           </div>
//           <div>
//             <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
//               Asset Management
//             </h1>
//           </div>
//         </div>
//       </div>
//       {/* Stats Cards Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
//         <AssetCardGrid />
//       </div>

//       {/* Asset Inventory Table */}
//       <TableAssets />
//     </div>
//   );
// }


