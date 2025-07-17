import React from "react";

export function SpinnerHero() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-small text-default-500">Loading...</p>
      </div>
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-small text-default-500">Loading...</p>
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow border overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            {[...Array(8)].map((_, i) => (
              <th key={i} className="px-4 py-3">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(10)].map((_, rowIdx) => (
            <tr key={rowIdx} className="border-b">
              {[...Array(8)].map((_, colIdx) => (
                <td key={colIdx} className="px-4 py-3">
                  <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
