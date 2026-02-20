"use client";

import React from "react";

export default function GuestDashboardContent({
  _dashboardData,
  user,
}: {
  _dashboardData?: any;
  user: any;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-default-200 bg-content1 p-4 text-sm text-default-700">
        Selamat datang, {user?.name || "Guest"}
      </div>
      {/* Tambahkan widget/komponen khusus guest di bawah ini */}
      {/* ... */}
    </div>
  );
}
