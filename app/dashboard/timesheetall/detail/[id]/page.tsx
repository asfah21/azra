"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FiPrinter, FiDownload, FiZoomIn, FiZoomOut, FiRefreshCw } from "react-icons/fi";

function formatHour(str: string) {
  if (!str) return "-";
  const date = new Date(str);
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}.${m}`;
}

const LOSTIME_CODES = [
  "1","2","3","4","5","6","7","8","9","10","11","12","13","14","SCM","USM"
];

const WORK_AREAS = [
  "1. PIT", "2. DISPOSAL", "3. CLEARING", "4. MHR",
  "5. DOME", "6. BARGING", "7. SETPOND", "8. OTHERS"
];

export default function TimesheetAllDetailPage() {
  const params = useParams();
  const timesheetId = params.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Untuk zoom
  const [zoom, setZoom] = useState(1);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!timesheetId) return;
    axios
      .get(`/api/timesheetall`)
      .then((res) => {
        if (res.data && Array.isArray(res.data.entries)) {
          const activities = res.data.entries.filter(
            (e: any) =>
              e.timesheetId === timesheetId ||
              e.id === timesheetId ||
              e.timeEntryId === timesheetId
          );
          const first = activities[0] || {};
          setData({
            ...first,
            activities,
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Gagal memuat detail timesheet.");
        setLoading(false);
      });
  }, [timesheetId]);

  // Untuk download PDF (opsional, butuh html2pdf atau html2canvas+jsPDF jika mau real PDF)
  const handleDownload = () => {
    window.print(); // Sederhana: print dialog, user bisa save as PDF
  };

  // Untuk print
  const handlePrint = () => {
    window.print();
  };

  // Untuk zoom in/out
  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.1, 2));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.5));
  const handleResetZoom = () => setZoom(1);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!data)
    return <div className="p-8 text-center">Data tidak ditemukan.</div>;

  const activities = Array.isArray(data.activities) ? data.activities : [];

  const LOSTIME_LABELS = [
  "ACTIVITY","P2H", "REFUELING", "CEK TYRE", "PINDAH FRONT", "TUNGGU ALAT", "ANTRI", "ISOMA", "STANDBY",
  "SAFETY CHECK", "TUNGGU OPR", "BERDEBU", "DAILY CHECK", "HUJAN", "LICIN", "SCH", "BD",`${data.location}`
];

  return (
    <>
      <div
  style={{
    position: "sticky",
    top: 0,
    zIndex: 1000,
    backdropFilter: "blur(12px) saturate(180%)",
    WebkitBackdropFilter: "blur(12px) saturate(180%)",
    background: "rgba(255, 255, 255, 0.3)",
    // border: "1px solid rgba(255, 255, 255, 0.18)",
    borderRadius: "16px",
    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
    padding: "10px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    width: "80%",
    margin: "12px auto",
  }}
>
  <button title="Print" onClick={handlePrint} style={toolbarBtnStyle}><FiPrinter /></button>
  <button title="Download PDF" onClick={handleDownload} style={toolbarBtnStyle}><FiDownload /></button>
  <button title="Zoom In" onClick={handleZoomIn} style={toolbarBtnStyle}><FiZoomIn /></button>
  <button title="Zoom Out" onClick={handleZoomOut} style={toolbarBtnStyle}><FiZoomOut /></button>
  <button title="Reset Zoom" onClick={handleResetZoom} style={toolbarBtnStyle}><FiRefreshCw /></button>
</div>



      {/* Konten utama */}
      <div
        ref={contentRef}
        style={{
          width: "210mm",
          minHeight: "297mm",
          margin: "auto",
          marginTop: 30,
          background: "#fff",
          padding: "10mm 8mm",
          fontFamily: "Arial, Calibri, sans-serif",
          fontSize: "10pt",
          color: "#1f2937",
          boxSizing: "border-box",
          boxShadow: "0 0 8px #bbb",
          transform: `scale(${zoom})`,
          transformOrigin: "top center",
          transition: "transform 0.2s",
        }}
      >
        {/* HEADER */}
        <table
          style={{
              width: "100%",
              // borderCollapse: "collapse",
              // marginBottom: 8,
              fontSize: "10pt",
              border: "1px solid #222",
              // borderBottom: "none"
          }}
          >
          <tbody>
              <tr>
              {/* Logo */}
              <td rowSpan={2} style={{ width: 70, textAlign: "center", borderRight: "1px solid #222", padding: 8, verticalAlign: "middle", background: "#fff" }}>
                  <img src="/favicon.ico" alt="Logo" style={{ height: 48 }} />
              </td>
              {/* Title */}
              <td
                  rowSpan={4}
                  style={{
                      textAlign: "center",
                      background: "#fff",
                      borderRight: "1px solid #222",
                      borderTop: "none",
                      flexDirection: "column",
                      justifyContent: "center",     
                      alignItems: "center",        
                  }}
                  >
                  <div
                      style={{
                      fontWeight: 700,
                      fontSize: "11pt",
                      borderBottom: "1px solid #222",
                      color: "#222",
                      width: "100%",
                      textAlign: "center",
                      }}
                  >
                      FORM / FORMULIR
                  </div>
                  <div
                      style={{
                      fontWeight: 800,
                      fontSize: "15pt",
                      color: "#222",
                      }}
                  >
                      HEAVY EQUIPMENT TIMESHEET
                  </div>
              </td>

              {/* Document Info */}
              <td style={{ width: 220, background: "#fff" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9pt" }}>
                  <tbody>
                      <tr>
                      <td style={{ borderBottom: "1px solid #222", borderRight: "1px solid #222", color: "#222", width: 110,   }}>No. Dokumen</td>
                      <td style={{ borderBottom: "1px solid #222", color: "#222",   }}>: {data.documentNo ?? "-"}</td>
                      </tr>
                      <tr>
                      <td style={{ borderBottom: "1px solid #222", borderRight: "1px solid #222", color: "#222",   }}>Revisi</td>
                      <td style={{ borderBottom: "1px solid #222", color: "#222",   }}>: {data.revision ?? "-"}</td>
                      </tr>
                      <tr>
                      <td style={{ borderBottom: "1px solid #222", borderRight: "1px solid #222", color: "#222",   }}>Tanggal Efektif</td>
                      <td style={{ borderBottom: "1px solid #222", color: "#222",   }}>: {data.effectiveDate ?? "-"}</td>
                      </tr>
                      <tr>
                      <td style={{ borderRight: "1px solid #222", color: "#222",   }}>Halaman</td>
                      <td style={{ color: "#222",   }}>: 1</td>
                      </tr>
                  </tbody>
                  </table>
              </td>
              </tr>
          </tbody>
          </table>

        {/* INFO UNIT & USER */}
        <table style={{
          width: "100%",
          fontSize: "10pt",
          marginBottom: 0,
          marginTop: 8,
          tableLayout: "fixed",
          borderCollapse: "collapse"
        }}>
          <tbody>
            <tr>
              <td style={{ width: 80, fontWeight: 500, color: "#222" }}>NO UNIT</td>
              <td style={{ width: 120 }}>: {data.assetTag ?? "-"}</td>
              <td style={{ width: 80, fontWeight: 500, color: "#222" }}>NAMA</td>
              <td style={{ width: 180 }}>: {data.userName}</td>
              {/* <td style={{ width: 80, fontWeight: 500, color: "#222" }}>LOKASI KERJA</td>
              <td style={{ width: 180 }}>: {data.location}</td> */}
            </tr>
            <tr>
              <td style={{ fontWeight: 500, color: "#222" }}>HM AWAL</td>
              <td>: {data.hmAwal ?? "-"}</td>
              <td style={{ fontWeight: 500, color: "#222" }}>SHIFT</td>
              <td>: {data.shiftType}</td>
              <td colSpan={2}></td>
            </tr>
            <tr>
              <td style={{ fontWeight: 500, color: "#222" }}>HM AKHIR</td>
              <td>: {data.hmAkhir ?? "-"}</td>
              <td style={{ fontWeight: 500, color: "#222" }}>TANGGAL</td>
              <td>: {data.shiftDate}</td>
              <td colSpan={2}></td>
            </tr>
          </tbody>
        </table>

        {/* KODE LOSTIME */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "9pt",
            tableLayout: "fixed",
            marginTop: 12,
            marginBottom: 0,
          }}
        >
          <thead>
            <tr style={{ background: "#b6d5f7" }}>
              <th
                rowSpan={1}
                style={{
                  border: "1px solid #222",
                  padding: 4,
                  width: 60,
                  textAlign: "center",
                  fontWeight: 700,
                  verticalAlign: "middle",
                }}
              >
                KODE<br />LOSTIME
              </th>
              {LOSTIME_CODES.map((v, i) => (
                <th
                  key={i}
                  style={{
                    border: "1px solid #222",
                    padding: 2,
                    width: 32,
                    textAlign: "center",
                    fontWeight: 700,
                    verticalAlign: "middle",
                  }}
                >
                  {v}
                </th>
              ))}
              <th
                rowSpan={1}
                style={{
                  border: "1px solid #222",
                  padding: 4,
                  minWidth: 90,
                  textAlign: "center",
                  fontWeight: 700,
                  verticalAlign: "middle",
                  background: "#b6d5f7",
                }}
              >
                CATATAN<br />OPERATOR
              </th>
              
            </tr>
            <tr style={{ background: "#b6d5f7" }}>
                {LOSTIME_LABELS.map((v, i) => (
                    <th
                    key={i}
                    style={{
                        border: "1px solid #222",
                        padding: 0,
                        height: 90,
                        width: 40, // opsional, biar kelihatan proporsional
                        textAlign: "center",
                        background: "#e7f3ff",
                        position: "relative",
                    }}
                    >
                    <div
                        style={{
                        height: "100%",
                        width: "100%",
                        display: "flex",
                        alignItems: "center", // vertikal tengah
                        justifyContent: "center", // horizontal tengah
                        }}
                    >
                        <span
                        style={{
                            display: "inline-block",
                            transform:
                            i === 0 || i === LOSTIME_LABELS.length - 1
                                ? "none"
                                : "rotate(-90deg)",
                            transformOrigin: "center center", // titik rotasi di tengah
                            whiteSpace: "nowrap",
                            fontSize: "8pt",
                            fontWeight: 500,
                            letterSpacing: 0.5,
                            lineHeight: 1,
                        }}
                        >
                        {v}
                        </span>
                    </div>
                    </th>
                ))}
                </tr>

          </thead>
          <tbody>
            {/* <tr>
              <td
              
                style={{
                  border: "1px solid #222",
                  padding: 4,
                  fontWeight: 700,
                  background: "#e7f3ff",
                  textAlign: "center",
                  verticalAlign: "middle",
                }}
              >
                ACTIVITY
              </td>
              {LOSTIME_LABELS.map((_, i) => (
                <td
                  key={i}
                  style={{
                    border: "1px solid #222",
                    padding: 0,
                    background: "#e7f3ff",
                    height: 24,
                  }}
                ></td>
              ))}
              <td
                style={{
                  border: "1px solid #222",
                  padding: 4,
                  background: "#e7f3ff",
                  verticalAlign: "top",
                  fontSize: "10pt",
                  textAlign: "center",
                }}
              >
                {data.catatanOperator ?? "-"}
              </td>
            </tr> */}
          </tbody>
        </table>

        {/* TABEL AKTIVITAS */}
        <div style={{ margin: "16px 0 0" }}>
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "10pt",
            tableLayout: "fixed"
          }}>
            <thead>
              <tr style={{ background: "#b6d5f7" }}>
                <th style={{
                  border: "1px solid #222",
                  padding: 4,
                  width: 90,
                  textAlign: "center",
                  fontWeight: 700
                }}>SHIFT</th>
                <th style={{
                  border: "1px solid #222",
                  padding: 4,
                  width: 160,
                  textAlign: "center",
                  fontWeight: 700
                }}>START OPERASI JAM</th>
                <th style={{
                  border: "1px solid #222",
                  padding: 4,
                  textAlign: "center",
                  fontWeight: 700
                }}>DIISI WAKTU YANG TERJADI (MENIT)</th>
                <th style={{
                  border: "1px solid #222",
                  padding: 4,
                  width: 110,
                  textAlign: "center",
                  fontWeight: 700
                }}>LOKASI</th>
              </tr>
            </thead>
            <tbody>
              {activities.length === 0 && (
                <tr>
                  <td colSpan={4} style={{
                    textAlign: "center",
                    color: "#888",
                    padding: 12,
                    border: "1px solid #222"
                  }}>
                    Tidak ada aktivitas.
                  </td>
                </tr>
              )}
              {activities.map((act: any, idx: number) => (
                <tr key={idx}>
                  <td style={{
                    border: "1px solid #222",
                    padding: 4,
                    textAlign: "center"
                  }}>
                    {data.shiftType}
                  </td>
                  <td style={{
                    border: "1px solid #222",
                    padding: 4,
                    textAlign: "center"
                  }}>
                    {formatHour(act.startTime)} - {formatHour(act.endTime)}
                  </td>
                  <td style={{
                    border: "1px solid #222",
                    padding: 4,
                    whiteSpace: "pre-line"
                  }}>
                    {act.activityDesc || act.activity}
                  </td>
                  <td style={{
                    border: "1px solid #222",
                    padding: 4,
                    textAlign: "center"
                  }}>
                    {act.location ?? data.location}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div style={{
          fontSize: "10pt",
          marginTop: 16,
          background: "#b6d5f7",
          padding: 8,
          borderRadius: 4,
          textAlign: "left",
          fontWeight: 600,
          border: "1px solid #222"
        }}>
          TIMESHEET DIKIRIM PADA : {data.createdAt ? new Date(data.createdAt).toLocaleString("id-ID") : "-"}
        </div>
      </div>
    </>
    
  );
}

// Style tombol toolbar
const toolbarBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  fontSize: 20,
  cursor: "pointer",
  padding: 3,
  color: "#1b45fdff",
  outline: "none",
};
