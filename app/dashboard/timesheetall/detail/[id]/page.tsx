"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  FiPrinter,
  FiDownload,
  FiZoomIn,
  FiZoomOut,
  FiRefreshCw,
} from "react-icons/fi";

import { LogoGsi } from "@/components/icons";

function formatHour(str: string) {
  if (!str) return "-";
  const date = new Date(str);
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");

  return `${h}.${m}`;
}

const LOSTIME_CODES = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "SCM",
  "USM",
];

const WORK_AREAS = [
  "1. PIT",
  "2. DISPOSAL",
  "3. CLEARING",
  "4. MHR",
  "5. DOME",
  "6. BARGING",
  "7. SETPOND",
  "8. OTHERS",
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
              e.timeEntryId === timesheetId,
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
    if (!contentRef.current) return;
    const printContents = contentRef.current.innerHTML;
    const printWindow = window.open("", "_blank", "width=900,height=600");

    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Timesheet</title>
          <link href="https://fonts.googleapis.com/css?family=Roboto:400,500,700&display=swap" rel="stylesheet">
          <style>
            body { margin: 0; padding: 0; font-family: 'Roboto', Arial, sans-serif; }
          </style>
        </head>
        <body>${printContents}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
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
    "ACTIVITY",
    "P2H",
    "REFUELING",
    "CEK TYRE",
    "PINDAH FRONT",
    "TUNGGU ALAT",
    "ANTRI",
    "ISOMA",
    "STANDBY",
    "SAFETY CHECK",
    "TUNGGU OPR",
    "BERDEBU",
    "DAILY CHECK",
    "HUJAN",
    "LICIN",
    "SCH",
    "BD",
    `${data.location}`,
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
        <button style={toolbarBtnStyle} title="Print" onClick={handlePrint}>
          <FiPrinter />
        </button>
        <button
          style={toolbarBtnStyle}
          title="Download PDF"
          onClick={handleDownload}
        >
          <FiDownload />
        </button>
        <button style={toolbarBtnStyle} title="Zoom In" onClick={handleZoomIn}>
          <FiZoomIn />
        </button>
        <button
          style={toolbarBtnStyle}
          title="Zoom Out"
          onClick={handleZoomOut}
        >
          <FiZoomOut />
        </button>
        <button
          style={toolbarBtnStyle}
          title="Reset Zoom"
          onClick={handleResetZoom}
        >
          <FiRefreshCw />
        </button>
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
          fontFamily: "'Roboto', Arial, sans-serif",
          // fontFamily: "Arial, Calibri, sans-serif",
          fontSize: "10pt",
          color: "#1f2937",
          boxSizing: "border-box",
          boxShadow: "0 0 8px #bbb",
          transform: `scale(${zoom})`,
          transformOrigin: "top center",
          transition: "transform 0.2s",
          pageBreakAfter: "always",
        }}
      >
        {/* HEADER */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            // marginBottom: 8,
            fontSize: "10pt",
            // border: "1px solid #222",
            // borderBottom: "none"
          }}
        >
          <tbody>
            <tr>
              {/* Logo */}
              <td
                rowSpan={2}
                style={{
                  width: 90,
                  textAlign: "center",
                  borderRight: "1px solid #222",
                  verticalAlign: "middle",
                  background: "#fff",
                }}
              >
                {/* <img src="/favicon.ico" alt="Logo" style={{ height: 48 }} /> */}
                <LogoGsi
                  style={{
                    height: 63,
                    width: 83,
                    objectFit: "contain",
                    display: "block",
                    paddingBottom: 4,
                  }}
                />
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
                    justifyContent: "center",
                    verticalAlign: "middle",
                    paddingBottom: 5,
                  }}
                >
                  FORM / FORMULIR
                </div>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: "13pt",
                    color: "#222",
                    verticalAlign: "middle",
                    paddingTop: 5,
                  }}
                >
                  HEAVY EQUIPMENT TIMESHEET
                </div>
              </td>

              {/* Document Info */}
              <td style={{ width: 220, background: "#fff" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "9pt",
                  }}
                >
                  <tbody>
                    <tr>
                      <td
                        style={{
                          borderBottom: "1px solid #222",
                          borderRight: "1px solid #222",
                          color: "#222",
                          width: 110,
                        }}
                      >
                        No. Dokumen
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #222",
                          color: "#222",
                        }}
                      >
                        : {data.documentNo ?? "GSI-OPR-001G"}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          borderBottom: "1px solid #222",
                          borderRight: "1px solid #222",
                          color: "#222",
                        }}
                      >
                        Revisi
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #222",
                          color: "#222",
                        }}
                      >
                        : {data.revision ?? "1"}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          borderBottom: "1px solid #222",
                          borderRight: "1px solid #222",
                          color: "#222",
                        }}
                      >
                        Tanggal Efektif
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #222",
                          color: "#222",
                        }}
                      >
                        : {data.effectiveDate ?? "18-Sep-24"}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{ borderRight: "1px solid #222", color: "#222" }}
                      >
                        Halaman
                      </td>
                      <td style={{ color: "#222" }}>: 1</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>

        {/* INFO UNIT & USER */}
        <table
          style={{
            width: "100%",
            fontSize: "10pt",
            marginBottom: 0,
            marginTop: 8,
            tableLayout: "fixed",
            borderCollapse: "collapse",
          }}
        >
          <tbody>
            <tr>
              <td style={{ width: 80, fontWeight: 500, color: "#222" }}>
                NO UNIT
              </td>
              <td style={{ width: 120 }}>: {data.assetTag ?? "-"}</td>
              <td style={{ width: 80, fontWeight: 500, color: "#222" }}>
                NAMA
              </td>
              <td style={{ width: 180 }}>: {data.userName}</td>
              {/* <td style={{ width: 80, fontWeight: 500, color: "#222" }}>LOKASI KERJA</td>
              <td style={{ width: 180 }}>: {data.location}</td> */}
            </tr>
            <tr>
              <td style={{ fontWeight: 500, color: "#222" }}>HM AWAL</td>
              <td>: {data.hmAwal ?? "-"}</td>
              <td style={{ fontWeight: 500, color: "#222" }}>SHIFT</td>
              <td>: {data.shiftType}</td>
              <td colSpan={2} />
            </tr>
            <tr>
              <td style={{ fontWeight: 500, color: "#222" }}>HM AKHIR</td>
              <td>: {data.hmAkhir ?? "-"}</td>
              <td style={{ fontWeight: 500, color: "#222" }}>TANGGAL</td>
              <td>: {data.shiftDate}</td>
              <td colSpan={2} />
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
                KODE
                <br />
                LOSTIME
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
                CATATAN_OPERATOR
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
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "10pt",
              tableLayout: "fixed",
            }}
          >
            <thead>
              <tr style={{ background: "#b6d5f7" }}>
                <th
                  style={{
                    border: "1px solid #222",
                    padding: 4,
                    width: 90,
                    textAlign: "center",
                    fontWeight: 700,
                  }}
                >
                  SHIFT
                </th>
                <th
                  style={{
                    border: "1px solid #222",
                    padding: 4,
                    width: 160,
                    textAlign: "center",
                    fontWeight: 700,
                  }}
                >
                  START OPERASI JAM
                </th>
                <th
                  style={{
                    border: "1px solid #222",
                    padding: 4,
                    textAlign: "center",
                    fontWeight: 700,
                  }}
                >
                  DIISI WAKTU YANG TERJADI (MENIT)
                </th>
                <th
                  style={{
                    border: "1px solid #222",
                    padding: 4,
                    width: 110,
                    textAlign: "center",
                    fontWeight: 700,
                  }}
                >
                  LOKASI
                </th>
              </tr>
            </thead>
            <tbody>
              {activities.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      textAlign: "center",
                      color: "#888",
                      padding: 12,
                      border: "1px solid #222",
                    }}
                  >
                    Tidak ada aktivitas.
                  </td>
                </tr>
              )}
              {activities.map((act: any, idx: number) => (
                <tr key={idx}>
                  <td
                    style={{
                      border: "1px solid #222",
                      padding: 4,
                      textAlign: "center",
                    }}
                  >
                    {data.shiftType}
                  </td>
                  <td
                    style={{
                      border: "1px solid #222",
                      padding: 4,
                      textAlign: "center",
                    }}
                  >
                    {formatHour(act.startTime)} - {formatHour(act.endTime)}
                  </td>
                  <td
                    style={{
                      border: "1px solid #222",
                      padding: 4,
                      whiteSpace: "pre-line",
                    }}
                  >
                    {act.activityDesc || act.activity}
                  </td>
                  <td
                    style={{
                      border: "1px solid #222",
                      padding: 4,
                      textAlign: "center",
                    }}
                  >
                    {act.location ?? data.location}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div
          style={{
            fontSize: "10pt",
            marginTop: 16,
            background: "#b6d5f7",
            padding: 8,
            borderRadius: 4,
            textAlign: "left",
            fontWeight: 600,
            border: "1px solid #222",
          }}
        >
          TIMESHEET DIKIRIM PADA :{" "}
          {data.createdAt
            ? new Date(data.createdAt).toLocaleString("id-ID")
            : "-"}
        </div>

        {/* KUESIONER FATIGUE & TANDA TANGAN */}
        <div style={{ marginTop: 18 }}>
          {/* Kuesioner Fatigue */}
          <table
            style={{
              width: "100%",
              border: "1px solid #222",
              borderCollapse: "collapse",
              fontSize: "8pt",
              marginBottom: 12,
              background: "#fff",
            }}
          >
            <thead>
              <tr>
                <th
                  colSpan={3}
                  style={{
                    border: "1px solid #222",
                    background: "#b6d5f7",
                    fontWeight: 700,
                    textAlign: "center",
                    padding: 6,
                    fontSize: "9pt",
                  }}
                >
                  KUISONER FATIGUE
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {/* Pernyataan Karyawan */}
                <td
                  rowSpan={2}
                  style={{
                    border: "1px solid #222",
                    width: 180,
                    verticalAlign: "top",
                    padding: 6,
                    fontWeight: 500,
                    fontSize: "8pt",
                  }}
                >
                  <strong>
                    <center>Pernyataan Karyawan</center>
                  </strong>
                  <div
                    style={{
                      fontWeight: 400,
                      fontSize: "7.5pt",
                      marginTop: 6,
                      justifyContent: "center",
                      textAlign: "center",
                    }}
                  >
                    Saya bertanda tangan dibawah ini menyatakan telah menjawab
                    dan mengisi timesheet ini dengan sebenar-benarnya tanpa ada
                    paksaan dari pihak manapun
                  </div>
                </td>
                {/* Kolom 1 */}
                <td
                  style={{
                    borderRight: "none",
                    padding: 6,
                    fontSize: "7.5pt",
                    width: "40%",
                  }}
                >
                  1. Berapa lama anda tidur dalam kurun 24 jam terakhir
                  <br />
                  &nbsp;&nbsp;a. &lt;6 Jam &nbsp;&nbsp; b. 6-8 Jam &nbsp;&nbsp;
                  c. &gt;8 Jam
                  <br />
                  <br />
                  2. Pada hari kemarin, berapa kali anda mengantuk?
                  <br />
                  &nbsp;&nbsp;a. &gt;1 Kali &nbsp;&nbsp; b. 1 Kali &nbsp;&nbsp;
                  c. 0 Kali
                  <br />
                  <br />
                  3. Pada kondisi normal Anda mungkin bisa mencapai tiga
                  ritase/jam, kira-kira sekarang bisa berapa?
                  <br />
                  &nbsp;&nbsp;a. &lt;3 Ritase &nbsp;&nbsp; b. 1 Ritase
                  &nbsp;&nbsp; c. &gt;3 Ritase
                </td>
                {/* Kolom 2 */}
                <td
                  style={{
                    borderLeft: "none",
                    padding: 6,
                    fontSize: "7.5pt",
                    width: "40%",
                  }}
                >
                  4. Setelah istirahat dan kembali kerja, apa yang anda rasakan?
                  <br />
                  &nbsp;&nbsp;a. Malas &nbsp;&nbsp; b. Biasa saja &nbsp;&nbsp;
                  c. Semangat
                  <br />
                  <br />
                  5. Apakah saat ini Anda membawa badge atau SIMPER?
                  <br />
                  &nbsp;&nbsp;a. Ya &nbsp;&nbsp; b. Tidak &nbsp;&nbsp; c. Tidak
                  Tau
                  <br />
                  <br />
                  6. Berapa kali anda terbangun saat istirahat/tidur
                  siang/malam?
                  <br />
                  &nbsp;&nbsp;a. &gt;2 Kali &nbsp;&nbsp; b. 2 Kali &nbsp;&nbsp;
                  c. &lt;2 Kali
                </td>
              </tr>
            </tbody>
          </table>

          {/* Tanda tangan dan jam kerja */}
          <div style={{ display: "flex", gap: 16, width: "100%" }}>
            {/* Tanda tangan */}
            <table
              style={{
                flex: 2,
                width: "60%",
                border: "1px solid #222",
                borderCollapse: "collapse",
                fontSize: "9pt",
                background: "#fff",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      border: "1px solid #222",
                      padding: 4,
                      width: "33%",
                      textAlign: "center",
                      background: "#e7f3ff",
                    }}
                  >
                    Dibuat oleh,
                  </th>
                  <th
                    style={{
                      border: "1px solid #222",
                      padding: 4,
                      width: "33%",
                      textAlign: "center",
                      background: "#e7f3ff",
                    }}
                  >
                    Diperiksa oleh
                  </th>
                  <th
                    style={{
                      border: "1px solid #222",
                      padding: 4,
                      width: "34%",
                      textAlign: "center",
                      background: "#e7f3ff",
                    }}
                  >
                    Diketahui oleh
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    style={{
                      border: "1px solid #222",
                      height: 88,
                      textAlign: "center",
                      verticalAlign: "middle",
                    }}
                  >
                    <div style={{ fontSize: "8pt", color: "#444" }}>
                      (Operator)
                    </div>
                  </td>
                  <td style={{ border: "1px solid #222" }} />
                  <td style={{ border: "1px solid #222" }} />
                </tr>
                <tr>
                  <td
                    style={{
                      border: "1px solid #222",
                      textAlign: "center",
                      fontSize: "8pt",
                      height: "12pt",
                    }}
                  >
                    Operator
                  </td>
                  <td
                    style={{
                      border: "1px solid #222",
                      textAlign: "center",
                      fontSize: "8pt",
                      height: "12pt",
                    }}
                  >
                    Foreman Operation
                  </td>
                  <td
                    style={{
                      border: "1px solid #222",
                      textAlign: "center",
                      fontSize: "8pt",
                      height: "12pt",
                    }}
                  >
                    Supervisor Operation
                  </td>
                </tr>
              </tbody>
            </table>
            {/* Jam kerja operator */}
            <table
              style={{
                flex: 1,
                width: "40%",
                border: "1px solid #222",
                borderCollapse: "collapse",
                fontSize: "9pt",
                background: "#fff",
              }}
            >
              <thead>
                <tr>
                  <th
                    colSpan={1}
                    style={{
                      border: "1px solid #222",
                      textAlign: "center",
                      background: "#b6d5f7",
                      fontWeight: 700,
                      padding: 4,
                    }}
                  >
                    Jam Produktif
                  </th>
                  <th
                    colSpan={1}
                    style={{
                      border: "1px solid #222",
                      textAlign: "center",
                      background: "#b6d5f7",
                      fontWeight: 700,
                      padding: 4,
                    }}
                  >
                    Jam Non Produktif
                  </th>
                </tr>
                <tr>
                  <td
                    style={{
                      border: "1px solid #222",
                      height: 88,
                      textAlign: "center",
                      verticalAlign: "middle",
                    }}
                  >
                    <div style={{ fontSize: "8pt", color: "#444" }}>
                      (Operator)
                    </div>
                  </td>
                  <td
                    style={{
                      border: "1px solid #222",
                      height: 88,
                      textAlign: "center",
                      verticalAlign: "middle",
                    }}
                  >
                    <div style={{ fontSize: "8pt", color: "#444" }}>
                      (Operator)
                    </div>
                  </td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    style={{
                      border: "1px solid #222",
                      textAlign: "center",
                      fontSize: "8.5pt",
                      color: "#444",
                      height: "12pt",
                    }}
                  >
                    Jam
                  </td>
                  <td
                    style={{
                      border: "1px solid #222",
                      textAlign: "center",
                      fontSize: "8.5pt",
                      color: "#444",
                      height: "12pt",
                    }}
                  >
                    Jam
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
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
