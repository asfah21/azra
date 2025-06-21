
import GammaCardGrid from "./components/CardGrid";

import { prisma } from "@/lib/prisma";
import { PaperClipIcon } from "@heroicons/react/24/outline";
import GammaTableData from "./components/TableData";

export default async function GammaPage() {
  const allBreakdowns = await prisma.breakdown.findMany({
    include: {
      reportedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
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
      components: true,
      rfuReport: {
        include: {
          resolvedBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl">
            <PaperClipIcon className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Gamma Work Orders
            </h1>
          </div>
        </div>
        {/* <div className="flex flex-wrap gap-2"><WoRightButtonList /></div> */}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <GammaCardGrid stats={allBreakdowns} />
      </div>

      <GammaTableData dataTable={allBreakdowns} />

      {/* <h1>Daftar Breakdown</h1>
      <div className="grid gap-4">
        {allBreakdowns.map((breakdown) => (
          <div key={breakdown.id} className="border p-4 rounded">
            <h3>#{breakdown.breakdownNumber || breakdown.id}</h3>
            <p>
              <strong>Deskripsi:</strong> {breakdown.description}
            </p>
            <p>
              <strong>Unit:</strong> {breakdown.unit.name}
            </p>
            <p>
              <strong>Dilaporkan oleh:</strong> {breakdown.reportedBy.name}
            </p>
            <p>
              <strong>Status:</strong> {breakdown.status}
            </p>
            <p>
              <strong>Waktu Breakdown:</strong>{" "}
              {breakdown.breakdownTime.toLocaleString()}
            </p>
            <p>
              <strong>Jam Kerja:</strong> {breakdown.workingHours} jam
            </p>
            {breakdown.components.length > 0 && (
              <p>
                <strong>Komponen:</strong> {breakdown.components.length} item
              </p>
            )}
          </div>
        ))}
      </div> */}
    </div>
  );

}
