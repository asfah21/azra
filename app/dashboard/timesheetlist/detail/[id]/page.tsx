"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@heroui/react";

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
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-8">
      {/* Kop dan Logo */}
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <div>
          <img alt="Logo" className="h-12 w-12" src="/favicon.ico" />
        </div>
        <div className="text-center flex-1">
          <h2 className="text-xl font-bold text-blue-900">
            PT. GUNUNG SAMUDERA INTERNASIONAL
          </h2>
          <div className="text-sm text-gray-700">
            Jl. Poros Kolaka Wolo, Desa Samaenre Kec. Wolo, Kab. Kolaka
          </div>
          <div className="text-sm text-gray-700">
            Telp: 082271548976 | www.gsicorp.co.id
          </div>
        </div>
        <div style={{ width: 48 }} />
      </div>
      <h3 className="text-xl font-bold mb-4 text-center text-blue-800">
        DETAIL TIMESHEET
      </h3>
      <table className="w-full border mb-6">
        <tbody>
          <tr>
            <td className="border px-2 py-1 font-semibold w-1/3 text-gray-700 bg-gray-50">
              ID
            </td>
            <td className="border px-2 py-1 text-gray-900">{data.id}</td>
          </tr>
          <tr>
            <td className="border px-2 py-1 font-semibold text-gray-700 bg-gray-50">
              User
            </td>
            <td className="border px-2 py-1 text-gray-900">{data.userName}</td>
          </tr>
          <tr>
            <td className="border px-2 py-1 font-semibold text-gray-700 bg-gray-50">
              Tanggal
            </td>
            <td className="border px-2 py-1 text-gray-900">{data.shiftDate}</td>
          </tr>
          <tr>
            <td className="border px-2 py-1 font-semibold text-gray-700 bg-gray-50">
              Shift
            </td>
            <td className="border px-2 py-1 text-gray-900">{data.shiftType}</td>
          </tr>
          <tr>
            <td className="border px-2 py-1 font-semibold text-gray-700 bg-gray-50">
              Asset Tag
            </td>
            <td className="border px-2 py-1 text-gray-900">
              {data.assetTag ?? "-"}
            </td>
          </tr>
          <tr>
            <td className="border px-2 py-1 font-semibold text-gray-700 bg-gray-50">
              Activity
            </td>
            <td className="border px-2 py-1 text-gray-900">{data.activity}</td>
          </tr>
          <tr>
            <td className="border px-2 py-1 font-semibold text-gray-700 bg-gray-50">
              Deskripsi
            </td>
            <td className="border px-2 py-1 text-gray-900">
              {data.activityDesc}
            </td>
          </tr>
          <tr>
            <td className="border px-2 py-1 font-semibold text-gray-700 bg-gray-50">
              Lokasi
            </td>
            <td className="border px-2 py-1 text-gray-900">{data.location}</td>
          </tr>
          <tr>
            <td className="border px-2 py-1 font-semibold text-gray-700 bg-gray-50">
              Start
            </td>
            <td className="border px-2 py-1 text-gray-900">{data.startTime}</td>
          </tr>
          <tr>
            <td className="border px-2 py-1 font-semibold text-gray-700 bg-gray-50">
              End
            </td>
            <td className="border px-2 py-1 text-gray-900">{data.endTime}</td>
          </tr>
          <tr>
            <td className="border px-2 py-1 font-semibold text-gray-700 bg-gray-50">
              Durasi (detik)
            </td>
            <td className="border px-2 py-1 text-gray-900">
              {data.durationSec}
            </td>
          </tr>
        </tbody>
      </table>
      {/* Approval dan Tanda Tangan */}
      <div className="mt-8 flex flex-col gap-6">
        <div className="flex justify-between">
          <div className="text-center flex-1">
            <div className="font-semibold text-gray-700">Dibuat Oleh</div>
            <div style={{ height: 60 }} />
            <div className="font-bold underline text-gray-900">
              {data.userName}
            </div>
          </div>
          <div className="text-center flex-1">
            <div className="font-semibold text-gray-700">Disetujui Oleh</div>
            <div style={{ height: 60 }} />
            <div className="font-bold underline text-gray-900">
              {data.approvedBy ?? "________________"}
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-8">
        <Button color="primary" onPress={() => handleDownload("pdf")}>
          Download PDF
        </Button>
        <Button color="secondary" onPress={() => handleDownload("xls")}>
          Download XLS
        </Button>
      </div>
    </div>
  );
}
