import { Users, Wrench } from "lucide-react";
import { Metadata } from "next";
import { Prisma } from "@prisma/client";

import WoCardGrid from "./components/CardGrid";
import WoUserTable from "./components/TableData";

import { prisma } from "@/lib/prisma";

import { BreakdownStatus } from "@prisma/client";

export const metadata: Metadata = {
  title: "Work Order",
  description: "Manage Work Order",
};

export const revalidate = 180; // 3 menit

async function getTotal(): Promise<number> {
  try {
    const totalWo = await prisma.breakdown.count();

    console.log(`Successfully fetched ${totalWo} total users`);

    return totalWo;
  } catch (error) {
    console.error("Error fetching total users:", error);

    return 0;
  }
}

async function getInProgressWo(): Promise<number> {
  try {
    const inProgressWo = await prisma.breakdown.count({
      where: {
        status: BreakdownStatus.in_progress,
      },
    });

    return inProgressWo;
  } catch (error) {
    console.error("Error fetching pending breakdowns:", error);
    return 0;
  }
}

async function getPendingWo(): Promise<number> {
  try {
    const pendingWo = await prisma.breakdown.count({
      where: {
        status: BreakdownStatus.pending,
      },
    });

    return pendingWo;
  } catch (error) {
    console.error("Error fetching pending breakdowns:", error);
    return 0;
  }
}

async function getOverdueWo(): Promise<number> {
  try {
    const overdueWo = await prisma.breakdown.count({
      where: {
        status: BreakdownStatus.pending,
      },
    });

    return overdueWo;
  } catch (error) {
    console.error("Error fetching pending breakdowns:", error);
    return 0;
  }
}

// type ini lebih straightforward! Langsung define type dengan
// Prisma tanpa perlu validator terpisah. Lebih concise dan tetap type-safe.
type BreakdownPayload = Prisma.BreakdownGetPayload<{
  select: {
    id: true;
    breakdownNumber: true;
    description: true;
    breakdownTime: true;
    workingHours: true;
    status: true;
    createdAt: true;
    unitId: true;
    reportedById: true;
    unit: {
      select: {
        id: true;
        assetTag: true;
        name: true;
        location: true;
        department: true;
        categoryId: true;
      };
    };
    reportedBy: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
    components: {
      select: {
        id: true;
        component: true;
        subcomponent: true;
      };
    };
    rfuReport: {
      select: {
        id: true;
        solution: true;
        resolvedAt: true;
        resolvedById: true;
        resolvedBy: {
          select: {
            id: true;
            name: true;
          };
        };
      };
    };
  };
}>;

async function getTable(): Promise<BreakdownPayload[]> {
  try {
    const dataTable = await prisma.breakdown.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        breakdownNumber: true,
        description: true,
        breakdownTime: true,
        workingHours: true,
        status: true,
        createdAt: true,
        unitId: true,
        reportedById: true,
        unit: {
          select: {
            id: true,
            assetTag: true,
            name: true,
            location: true,
            department: true,
            categoryId: true,
          },
        },
        reportedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        components: {
          select: {
            id: true,
            component: true,
            subcomponent: true,
          },
        },
        rfuReport: {
          select: {
            id: true,
            solution: true,
            resolvedAt: true,
            resolvedById: true,
            resolvedBy: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    console.log(`Successfully fetched ${dataTable.length} wo for table`);

    return dataTable;
  } catch (error) {
    console.error("Error fetching breakdown data:", error);
    // throw new Error("Failed to fetch breakdown data");
    return [];
  }
}

export default async function WorkOrdersPage() {
  try {
    // Fetch data secara parallel dengan error handling yang lebih robust
    const [totalResult, inProgressResult, pendingResult, overdueResult, tableResult] = await Promise.allSettled([
      getTotal(),
      getInProgressWo(),
      getPendingWo(),
      getOverdueWo(),
      getTable(),
    ]);

    // Extract hasil dengan fallback values
    const totalWos = totalResult.status === "fulfilled" ? totalResult.value : 0;
    const inProgressWos = inProgressResult.status === "fulfilled" ? inProgressResult.value:0;
    const pendingWos = pendingResult.status === "fulfilled" ? pendingResult.value : 0;
    const overdueWos = overdueResult.status === "fulfilled" ? overdueResult.value : 0;
    const dataTable = tableResult.status === "fulfilled" ? tableResult.value : [];

    // Log jika ada yang gagal
    if (totalResult.status === "rejected") {
      console.error("Failed to fetch total users:", totalResult.reason);
    }
    if (inProgressResult.status === "rejected") {
      console.error("Failed to fetch new users:", inProgressResult.reason);
    }
    if (pendingResult.status === "rejected") {
      console.error("Failed to fetch new users:", pendingResult.reason);
    }
    if (overdueResult.status === "rejected") {
      console.error("Failed to fetch new users:", overdueResult.reason);
    }
    if (tableResult.status === "rejected") {
      console.error("Failed to fetch users table:", tableResult.reason);
    }

    const cardStats = {
      total: totalWos,
      progress: inProgressWos,
      pending: pendingWos,
      overdue: overdueWos,
    };

    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl">
              <Wrench className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Work Orders
              </h1>
            </div>
          </div>
          {/* <div className="flex flex-wrap gap-2"><WoRightButtonList /></div> */}
        </div>

        {/* Error indicator jika ada data yang gagal dimuat */}
        {(totalResult.status === "rejected" ||
          inProgressResult.status === "rejected" ||
          pendingResult.status === "rejected" ||
          overdueResult.status === "rejected" ||
          tableResult.status === "rejected") && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <p className="text-yellow-800 text-sm font-medium">
                Some data may be incomplete due to loading issues. The page will
                continue to function with available data.
              </p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <WoCardGrid stats={cardStats} />
        </div>

        {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
        <WoMainGrid />
      </div> */}

        <WoUserTable dataTable={dataTable}/>
      </div>
    );
  } catch (error) {
    console.error("Error in UsersPage:", error);

    // Fallback UI jika ada error major
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="p-4 bg-red-50 rounded-xl mb-4">
            <Users className="w-12 h-12 text-red-500 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Unable to Load User Data
          </h2>
          <p className="text-gray-600 mb-4">
            There was an error loading the user management page. Please try
            refreshing the page.
          </p>
          <button
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
}
