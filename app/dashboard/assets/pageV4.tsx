import { Users } from "lucide-react";
import { Metadata } from "next";
import { Prisma } from "@prisma/client";

import UserCardGrids from "./components/CardGrid";
import TableDatas from "./components/TableData";
import ErrorBoundaryWrapper from "./components/ErrorBoundaryWrapper";

import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "User Management",
  description: "Manage users and view statistics",
};

export const revalidate = 180; // 3 menit

async function getTotal(): Promise<number> {
  try {
    const totalAssets = await prisma.unit.count();

    console.log(`Successfully fetched ${totalAssets} total users`);

    return totalAssets;
  } catch (error) {
    console.error("Error fetching total users:", error);

    // Throw error dengan type information untuk error handling yang lebih baik
    const err = new Error("Failed to fetch total users");

    (err as any).type = "database";
    throw err;
  }
}

async function getNew(): Promise<number> {
  try {
    const startOfMonth = new Date();

    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newAssets = await prisma.unit.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    console.log(`Successfully fetched ${newAssets} new users this month`);

    return newAssets;
  } catch (error) {
    console.error("Error fetching new users:", error);

    const err = new Error("Failed to fetch new users");

    (err as any).type = "database";
    throw err;
  }
}

// Type definition untuk Unit list item
type UnitListItem = Prisma.UnitGetPayload<{
  select: {
    id: true;
    assetTag: true;
    name: true;
    description: true;
    categoryId: true;
    status: true;
    condition: true;
    serialNumber: true;
    location: true;
    department: true;
    manufacturer: true;
    installDate: true;
    warrantyExpiry: true;
    lastMaintenance: true;
    nextMaintenance: true;
    assetValue: true;
    utilizationRate: true;
    createdAt: true;
    createdById: true;
    assignedToId: true;
  };
}>;

async function getTable(): Promise<UnitListItem[]> {
  try {
    const dataTable = await prisma.unit.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        assetTag: true,
        name: true,
        description: true,
        categoryId: true,
        status: true,
        condition: true,
        serialNumber: true,
        location: true,
        department: true,
        manufacturer: true,
        installDate: true,
        warrantyExpiry: true,
        lastMaintenance: true,
        nextMaintenance: true,
        assetValue: true,
        utilizationRate: true,
        createdAt: true,
        createdById: true,
        assignedToId: true,
      },
    });

    console.log(`Successfully fetched ${dataTable.length} users for table`);

    return dataTable;
  } catch (error) {
    console.error("Error fetching users table:", error);

    const err = new Error("Failed to fetch users table");

    (err as any).type = "database";
    throw err;
  }
}

interface AssetsPageContentProps {
  initialData?: {
    totalAssets: number;
    newAssets: number;
    dataTable: UnitListItem[];
  };
  hasErrors?: boolean;
  errorTypes?: Array<"database" | "network" | "general">;
}

function AssetsPageContent({
  initialData,
  hasErrors = false,
  errorTypes = [],
}: AssetsPageContentProps) {
  if (!initialData) {
    // Fallback UI jika tidak ada data sama sekali
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
            There was an error loading the user management page.
          </p>
        </div>
      </div>
    );
  }

  const { totalAssets, newAssets, dataTable } = initialData;
  const cardStats = { total: totalAssets, new: newAssets };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl">
            <Users className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              User Management
            </h1>
          </div>
        </div>
      </div>

      {/* Error indicator jika ada data yang gagal dimuat */}
      {hasErrors && (
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
        <UserCardGrids stats={cardStats} />
      </div>

      {/* Users Table */}
      <TableDatas dataTable={dataTable} />
    </div>
  );
}

export default async function AssetsPage() {
  try {
    // Fetch data secara parallel dengan error handling yang lebih robust
    const [totalResult, newResult, tableResult] = await Promise.allSettled([
      getTotal(),
      getNew(),
      getTable(),
    ]);

    // Check for critical errors (semua gagal)
    const allFailed = [totalResult, newResult, tableResult].every(
      (result) => result.status === "rejected",
    );

    if (allFailed) {
      // Jika semua gagal, kemungkinan masalah database/network yang serius
      const firstError =
        totalResult.status === "rejected"
          ? totalResult.reason
          : new Error("Unknown error");
      const errorType = (firstError as any)?.type || "database";

      return (
        <ErrorBoundaryWrapper errorType={errorType} hasError={true}>
          <AssetsPageContent />
        </ErrorBoundaryWrapper>
      );
    }

    // Extract hasil dengan fallback values
    const totalAssets =
      totalResult.status === "fulfilled" ? totalResult.value : 0;
    const newAssets = newResult.status === "fulfilled" ? newResult.value : 0;
    const dataTable =
      tableResult.status === "fulfilled" ? tableResult.value : [];

    // Check apakah ada error
    const hasErrors = [totalResult, newResult, tableResult].some(
      (result) => result.status === "rejected",
    );

    // Collect error types
    const errorTypes: Array<"database" | "network" | "general"> = [];

    [totalResult, newResult, tableResult].forEach((result) => {
      if (result.status === "rejected") {
        const errorType = (result.reason as any)?.type || "general";

        if (!errorTypes.includes(errorType)) {
          errorTypes.push(errorType);
        }
      }
    });

    // Log jika ada yang gagal
    if (totalResult.status === "rejected") {
      console.error("Failed to fetch total users:", totalResult.reason);
    }
    if (newResult.status === "rejected") {
      console.error("Failed to fetch new users:", newResult.reason);
    }
    if (tableResult.status === "rejected") {
      console.error("Failed to fetch users table:", tableResult.reason);
    }

    return (
      <ErrorBoundaryWrapper
        errorType={errorTypes[0]} // Use first error type
        hasError={hasErrors && errorTypes.length > 0}
      >
        <AssetsPageContent
          errorTypes={errorTypes}
          hasErrors={hasErrors}
          initialData={{ totalAssets, newAssets, dataTable }}
        />
      </ErrorBoundaryWrapper>
    );
  } catch (error) {
    console.error("Critical error in AssetsPage:", error);

    // Critical error fallback
    return (
      <ErrorBoundaryWrapper errorType="general" hasError={true}>
        <AssetsPageContent />
      </ErrorBoundaryWrapper>
    );
  }
}
