import { useState } from "react";

type ExportRange = "today" | "yesterday" | "last7" | "last30" | "all";

export function useExportFingerprint() {
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  async function exportData({
    range,
    search,
    join,
  }: {
    range: ExportRange;
    search?: string;
    join?: "user";
  }) {
    setExporting(true);
    setExportProgress(0);

    // Smooth progress: ease-in, mid steady, ease-out to 92% while waiting
    let ticking = true;
    let pct = 0;
    let phase = 0; // 0: ease-in, 1: steady, 2: ease-out
    const timer = setInterval(() => {
      if (!ticking) return;
      if (phase === 0) {
        // ease-in: faster at start but limited
        pct = Math.min(40, pct + 3);
        if (pct >= 40) phase = 1;
      } else if (phase === 1) {
        // steady: moderate increments
        pct = Math.min(75, pct + 2);
        if (pct >= 75) phase = 2;
      } else {
        // ease-out: small increments to 92
        pct = Math.min(92, pct + 1);
      }
      setExportProgress(pct);
    }, 150);

    try {
      const res = await fetch(`/api/fingerprint/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          range,
          search: search?.trim() || undefined,
          join,
        }),
      });

      if (!res.ok) {
        const text = await res.text();

        throw new Error(`Export error (${res.status}): ${text}`);
      }

      // Stop ticker and transition smoothly from current to 100
      ticking = false;
      clearInterval(timer);

      // Animate finalization from current pct to 100
      const start = pct;
      const duration = 600; // ms
      const steps = 20;
      let i = 0;
      const finalTimer = setInterval(
        () => {
          i += 1;
          const t = i / steps;
          // ease-out cubic
          const eased = 1 - Math.pow(1 - t, 3);
          const value = Math.min(
            100,
            Math.round(start + (100 - start) * eased),
          );

          setExportProgress(value);
          if (i >= steps) clearInterval(finalTimer);
        },
        Math.max(20, Math.floor(duration / steps)),
      );

      const contentType = res.headers.get("Content-Type") || "";

      if (contentType.includes("application/json")) {
        const json = await res.json();
        const url: string | undefined = json?.url ?? json?.downloadUrl;
        const filename = json?.filename ?? "fingerprint_export.xlsx";

        if (!url) throw new Error("No download URL returned by server");
        const a = document.createElement("a");

        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();

        return;
      }

      // Blob path: extract filename from Content-Disposition
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const cd = res.headers.get("Content-Disposition") || "";
      let filename = "fingerprint_export.xlsx";
      const match = cd.match(/filename=([^;]+)/i);

      if (match && match[1]) {
        filename = match[1].replace(/\"/g, "").trim();
      }
      const a = document.createElement("a");

      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      ticking = false;
      clearInterval(timer);
      setExporting(false);
    }
  }

  return { exporting, exportProgress, exportData };
}
