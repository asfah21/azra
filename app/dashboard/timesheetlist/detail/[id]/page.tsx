"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

export default function TimesheetDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    axios
      .get(`/api/timesheetall`)
      .then((res) => {
        if (res.data && Array.isArray(res.data.entries)) {
          const found = res.data.entries.find((e: any) => e.id === id);

          setData(found);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Gagal memuat detail timesheet.");
        setLoading(false);
      });
  }, [id]);

  const handleDownload = (type: "pdf" | "xls") => {
    // TODO: Implement download logic (PDF/XLS)
    alert(`Download ${type} belum diimplementasikan.`);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!data)
    return <div className="p-8 text-center">Data tidak ditemukan.</div>;

  return (
    <div
      className="a4-sheet"
      style={{
        width: "210mm",
        minHeight: "297mm",
        margin: "auto",
        background: "#fff",
        padding: "18mm 12mm",
        fontFamily: "Arial, Calibri, sans-serif",
        fontSize: "11pt",
        boxShadow: "0 0 8px #bbb",
        color: "#1f2937", // gray-800
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
        <img
          alt="Logo"
          src="/favicon.ico"
          style={{ height: 48, marginRight: 12 }}
        />
        <div style={{ flex: 1, textAlign: "center" }}>
          <div
            style={{
              fontWeight: "bold",
              fontSize: "14pt",
              color: "#003366",
            }}
          >
            PT. GUNUNG SAMUDERA INTERNASIONAL
          </div>
          <div style={{ fontSize: "10pt" }}>
            Jl. Poros Kolaka Wolo, Desa Samaenre Kec. Wolo, Kab. Kolaka
            <br />
            Telp: 082271548976 | www.gsicorp.co.id
          </div>
        </div>
        <div style={{ width: 48 }} />
      </div>
      <div
        style={{
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "13pt",
          color: "#003366",
          margin: "8px 0 16px",
        }}
      >
        HEAVY EQUIPMENT TIMESHEET
      </div>

      {/* Info Baris Atas */}
      <table style={{ width: "100%", fontSize: "10pt", marginBottom: 8 }}>
        <tbody>
          <tr>
            <td style={{ width: 120 }}>No. Dokumen</td>
            <td style={{ width: 180 }}>{data.documentNo ?? "-"}</td>
            <td style={{ width: 120 }}>Tanggal</td>
            <td>{data.shiftDate}</td>
          </tr>
          <tr>
            <td>Nama</td>
            <td>{data.userName}</td>
            <td>Shift</td>
            <td>{data.shiftType}</td>
          </tr>
          <tr>
            <td>No Unit</td>
            <td>{data.assetTag ?? "-"}</td>
            <td>Lokasi</td>
            <td>{data.location}</td>
          </tr>
        </tbody>
      </table>

      {/* Tabel Aktivitas */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "10pt",
          marginBottom: 12,
        }}
      >
        <thead>
          <tr>
            <th style={{ border: "1px solid #333", padding: 4 }}>Jam</th>
            <th style={{ border: "1px solid #333", padding: 4 }}>Activity</th>
            <th style={{ border: "1px solid #333", padding: 4 }}>Deskripsi</th>
            <th style={{ border: "1px solid #333", padding: 4 }}>
              Durasi (menit)
            </th>
            <th style={{ border: "1px solid #333", padding: 4 }}>Catatan</th>
          </tr>
        </thead>
        <tbody>
          {(
            data.activities ?? [
              {
                startTime: data.startTime,
                endTime: data.endTime,
                activity: data.activity,
                activityDesc: data.activityDesc,
                durationSec: data.durationSec,
                notes: data.notes,
              },
            ]
          ).map((act: any, idx: number) => (
            <tr key={idx}>
              <td style={{ border: "1px solid #333", padding: 4 }}>
                {act.startTime} - {act.endTime}
              </td>
              <td style={{ border: "1px solid #333", padding: 4 }}>
                {act.activity}
              </td>
              <td style={{ border: "1px solid #333", padding: 4 }}>
                {act.activityDesc}
              </td>
              <td style={{ border: "1px solid #333", padding: 4 }}>
                {Math.round((act.durationSec ?? 0) / 60)}
              </td>
              <td style={{ border: "1px solid #333", padding: 4 }}>
                {act.notes ?? "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer: Approval & Tanda Tangan */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 32,
        }}
      >
        <div style={{ textAlign: "center", flex: 1 }}>
          <div>Dibuat oleh,</div>
          <div style={{ height: 48 }} />
          <div
            style={{
              fontWeight: "bold",
              textDecoration: "underline",
            }}
          >
            {data.userName}
          </div>
          <div style={{ fontSize: "9pt" }}>Operator</div>
        </div>
        <div style={{ textAlign: "center", flex: 1 }}>
          <div>Disetujui oleh,</div>
          <div style={{ height: 48 }} />
          <div
            style={{
              fontWeight: "bold",
              textDecoration: "underline",
            }}
          >
            {data.approvedBy ?? "________________"}
          </div>
          <div style={{ fontSize: "9pt" }}>Supervisor Operation</div>
        </div>
      </div>
    </div>
  );
}
