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

// =====================
// Timesheet shift helpers
// =====================
export type ShiftInfo = { shiftType: 'DAY' | 'NIGHT'; shiftDate: string; nextBoundary: Date };

// timezoneOffsetMinutes: misal +8 jam => 480. Default gunakan offset lokal runtime.
export function getShiftInfo(now: Date = new Date(), timezoneOffsetMinutes?: number): ShiftInfo {
  const local = new Date(now);
  if (timezoneOffsetMinutes !== undefined) {
    // Konversi: buat waktu "lokal" sintetis sesuai offset target.
    const currentOffset = local.getTimezoneOffset(); // menit (biasanya negatif untuk GMT+)
    const diff = currentOffset - timezoneOffsetMinutes; // selisih menit yang perlu diterapkan
    local.setMinutes(local.getMinutes() + diff);
  }

  const year = local.getFullYear();
  const month = local.getMonth();
  const date = local.getDate();
  const hour = local.getHours();

  // Anchor midnight lokal
  const midnight = new Date(year, month, date, 0, 0, 0, 0);

  let shiftType: 'DAY' | 'NIGHT';
  let shiftDateObj: Date; // midnight anchor
  let nextBoundary: Date;

  if (hour >= 6 && hour < 18) {
    // DAY shift
    shiftType = 'DAY';
    shiftDateObj = midnight; // hari ini
    nextBoundary = new Date(year, month, date, 18, 0, 0, 0); // 18:00 hari ini
  } else {
    // NIGHT shift
    shiftType = 'NIGHT';
    if (hour >= 18) {
      // malam baru mulai hari ini jam >=18
      shiftDateObj = midnight; // anchor = hari ini
      nextBoundary = new Date(year, month, date + 1, 6, 0, 0, 0); // 06:00 besok
    } else {
      // jam < 06 berarti masih melanjutkan night shift yang anchor-nya kemarin
      shiftDateObj = new Date(year, month, date - 1, 0, 0, 0, 0);
      nextBoundary = new Date(year, month, date, 6, 0, 0, 0); // 06:00 hari ini
    }
  }

  const shiftDate = formatDateISO(shiftDateObj);
  return { shiftType, shiftDate, nextBoundary };
}

export function parseHHMM(value: string): { hours: number; minutes: number } | null {
  if (!/^\d{2}:\d{2}$/.test(value)) return null;
  const [h, m] = value.split(':').map(Number);
  if (h > 23 || m > 59) return null;
  return { hours: h, minutes: m };
}

export function buildDateTime(shiftDate: string, timeHHMM: string, shiftType: 'DAY' | 'NIGHT'): Date | null {
  const parsed = parseHHMM(timeHHMM);
  if (!parsed) return null;
  const base = new Date(shiftDate + 'T00:00:00');
  // base dianggap di timezone server; untuk konsistensi cukup gunakan UTC interpretasi.
  const dt = new Date(base);
  if (shiftType === 'DAY') {
    dt.setHours(parsed.hours, parsed.minutes, 0, 0);
  } else {
    // NIGHT: rentang 18:00 shiftDate sampai 06:00 shiftDate+1
    if (parsed.hours >= 18) {
      dt.setHours(parsed.hours, parsed.minutes, 0, 0); // hari anchor
    } else {
      // jam < 06 berarti hari berikutnya
      dt.setDate(dt.getDate() + 1);
      dt.setHours(parsed.hours, parsed.minutes, 0, 0);
    }
  }
  return dt;
}

export function durationSeconds(start: Date, end: Date): number {
  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 1000));
}
