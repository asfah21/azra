// Improvement Tips: Lakukan pemisahan tanggung jawab (separation of concerns).
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import * as XLSX from "xlsx";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions); //Proteksi API

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format");
    const type = searchParams.get("type");

    if (!format || !type) {
      return NextResponse.json(
        { error: "Missing required parameters: format and type" },
        { status: 400 },
      );
    }

    if (format !== "excel") {
      return NextResponse.json(
        { error: "Only excel format is supported" },
        { status: 400 },
      );
    }

    let data: any[] = [];
    let filename = "";

    switch (type) {
      case "assets":
        data = await prisma.unit.findMany({
          include: {
            category: true,
            createdBy: {
              select: { name: true, email: true },
            },
            assignedTo: {
              select: { name: true, email: true },
            },
          },
          orderBy: { createdAt: "desc" },
        });

        // Transform data for Excel
        data = data.map((unit) => ({
          "Asset Tag": unit.assetTag,
          Nama: unit.name,
          Deskripsi: unit.description || "",
          Kategori: unit.category?.name || "",
          Status: unit.status,
          Kondisi: unit.condition || "",
          "Serial Number": unit.serialNumber || "",
          Lokasi: unit.location || "",
          Departemen: unit.department || "",
          Manufacturer: unit.manufacturer || "",
          "Tanggal Install": unit.installDate
            ? new Date(unit.installDate).toLocaleDateString("id-ID")
            : "",
          "Warranty Expiry": unit.warrantyExpiry
            ? new Date(unit.warrantyExpiry).toLocaleDateString("id-ID")
            : "",
          "Last Maintenance": unit.lastMaintenance
            ? new Date(unit.lastMaintenance).toLocaleDateString("id-ID")
            : "",
          "Next Maintenance": unit.nextMaintenance
            ? new Date(unit.nextMaintenance).toLocaleDateString("id-ID")
            : "",
          "Asset Value": unit.assetValue || 0,
          "Utilization Rate": unit.utilizationRate || 0,
          "Dibuat Oleh": unit.createdBy?.name || "",
          "Assigned To": unit.assignedTo?.name || "",
          "Tanggal Dibuat": new Date(unit.createdAt).toLocaleDateString(
            "id-ID",
          ),
        }));
        filename = "List_Asset";
        break;

      case "users":
        // Get user activities
        data = await prisma.user.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            role: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        });

        data = data.map((user) => ({
          ID: user.id,
          Nama: user.name || "",
          Email: user.email || "",
          Departemen: user.department || "",
          Role: user.role || "",
          "Tanggal Dibuat": new Date(user.createdAt).toLocaleDateString(
            "id-ID",
          ),
        }));
        filename = "List_Activity";
        break;

      case "workorders":
        data = await prisma.breakdown.findMany({
          include: {
            unit: {
              select: { assetTag: true, name: true },
            },
            reportedBy: {
              select: { name: true, email: true },
            },
            inProgressBy: {
              select: { name: true, email: true },
            },
          },
          orderBy: { createdAt: "desc" },
        });

        data = data.map((wo) => ({
          "HARI/TANGGAL": new Date(wo.createdAt).toLocaleDateString("id-ID"),
          "STATUS": wo.status,
          "NO REGISTER": wo.breakdownNumber || "",  
          "NAMA": wo.reportedBy?.name || "",
          "HOUR REPORT": wo.reportedAt
            ? new Date(wo.reportedAt).toLocaleDateString("id-ID")
            : "",
          "HOUR DOWN UNIT": wo.breakdownTime
            ? new Date(wo.breakdownTime).toLocaleDateString("id-ID")
            : "",
          "SHIFT": wo.shift || "",
          "KODE UNIT": wo.unit?.assetTag || "",
          "HM / KM": wo.workingHours || 0,
          "LOKASI": wo.description || "",
          
          "UNIT": wo.unit?.name || "",
          "PRIORITY": wo.priority || "",
          "IN PROGRESS BY": wo.inProgressBy?.name || "",
          "IN PROGRESS AT": wo.inProgressAt
            ? new Date(wo.inProgressAt).toLocaleDateString("id-ID")
            : "",
        }));
        filename = "List_Work_Order";
        break;

      case "maintenance":
        data = await prisma.rFUReport.findMany({
          include: {
            breakdown: {
              include: {
                unit: {
                  select: { assetTag: true, name: true },
                },
              },
            },
            resolvedBy: {
              select: { name: true, email: true },
            },
            actions: {
              orderBy: { actionTime: "asc" },
            },
          },
          orderBy: { resolvedAt: "desc" },
        });

        data = data.map((report) => ({
          ID: report.id,
          Unit: report.breakdown?.unit?.name || "",
          "Asset Tag": report.breakdown?.unit?.assetTag || "",
          Solution: report.solution || "",
          "Work Details": report.workDetails || "",
          "Resolved By": report.resolvedBy?.name || "",
          "Resolved At": report.resolvedAt
            ? new Date(report.resolvedAt).toLocaleDateString("id-ID")
            : "",
          "Actions Count": report.actions?.length || 0,
        }));
        filename = "Riwayat_Maintenance";
        break;

      case "breakdowns":
        data = await prisma.breakdown.findMany({
          where: {
            status: "rfu",
          },
          include: {
            unit: {
              select: { assetTag: true, name: true },
            },
            reportedBy: {
              select: { name: true },
            },
            rfuReport: {
              select: { solution: true, resolvedAt: true },
            },
          },
          orderBy: { createdAt: "desc" },
        });

        data = data.map((breakdown) => ({
          "Breakdown Number": breakdown.breakdownNumber || "",
          Unit: breakdown.unit?.name || "",
          "Asset Tag": breakdown.unit?.assetTag || "",
          Deskripsi: breakdown.description || "",
          Priority: breakdown.priority || "",
          Status: breakdown.status,
          "Reported By": breakdown.reportedBy?.name || "",
          Solution: breakdown.rfuReport?.solution || "",
          "Breakdown Time": breakdown.breakdownTime
            ? new Date(breakdown.breakdownTime).toLocaleDateString("id-ID")
            : "",
          "Resolved At": breakdown.rfuReport?.resolvedAt
            ? new Date(breakdown.rfuReport.resolvedAt).toLocaleDateString(
                "id-ID",
              )
            : "",
          "Tanggal Dibuat": new Date(breakdown.createdAt).toLocaleDateString(
            "id-ID",
          ),
        }));
        filename = "Breakdown_Assets";
        break;

      case "readiness":
        // Get asset readiness by location
        data = await prisma.unit.findMany({
          where: {
            status: "operational",
          },
          select: {
            assetTag: true,
            name: true,
            location: true,
            department: true,
            status: true,
            condition: true,
          },
          orderBy: [{ location: "asc" }, { department: "asc" }],
        });

        data = data.map((unit) => ({
          "Asset Tag": unit.assetTag,
          Nama: unit.name,
          Lokasi: unit.location || "",
          Departemen: unit.department || "",
          Status: unit.status,
          Kondisi: unit.condition || "",
          Ready:
            unit.status === "operational" && unit.condition !== "broken"
              ? "Ya"
              : "Tidak",
        }));
        filename = "Ketersediaan_Asset";
        break;

      default:
        return NextResponse.json(
          { error: "Invalid report type" },
          { status: 400 },
        );
    }

    if (data.length === 0) {
      return NextResponse.json(
        { error: "No data found for the requested report" },
        { status: 404 },
      );
    }

    // Create Excel workbook
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "buffer",
    });

    // Set headers for file download
    const headers = new Headers();

    headers.set(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    headers.set(
      "Content-Disposition",
      `attachment; filename="${filename}_${new Date().toISOString().split("T")[0]}.xlsx"`,
    );

    return new NextResponse(excelBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Download error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
