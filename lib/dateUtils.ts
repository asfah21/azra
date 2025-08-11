// lib/dateUtils.ts
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "N/A";

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    // Format konsisten: YYYY-MM-DD atau MM/DD/YYYY
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return "Invalid Date";
  }
}

// Alternative: Format ISO untuk konsistensi penuh
export function formatDateISO(date: Date | string | null | undefined): string {
  if (!date) return "N/A";

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    return dateObj.toISOString().split("T")[0]; // YYYY-MM-DD
  } catch {
    return "Invalid Date";
  }
}
