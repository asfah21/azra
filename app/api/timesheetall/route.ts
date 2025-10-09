import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // Ambil semua timeEntry dari semua user
    const entries = await prisma.timeEntry.findMany({
      include: { activities: true, user: true },
      orderBy: { createdAt: "asc" },
    });

    // Flatten activities, include parent info
    const activities: any[] = [];

    for (const te of entries) {
      for (const a of te.activities || []) {
        activities.push({
          id: a.id,
          timeEntryId: te.id,
          activity: a.activity,
          activityDesc: a.activityDesc,
          location: a.location,
          startTime: a.startTime,
          endTime: a.endTime,
          durationSec: a.durationSec,
          assetTag: te.assetTag || null,
          shiftDate: te.shiftDate?.toISOString().slice(0, 10) || null,
          shiftType: te.shiftType || null,
          userName: te.user?.name || "-",
          approvedBy: te.approvedBy || null,
        });
      }
    }

    return NextResponse.json({ entries: activities });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
