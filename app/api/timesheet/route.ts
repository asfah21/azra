import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { buildDateTime, durationSeconds } from "@/lib/dateUtils";

function formatDateInTimeZoneISO(date: Date, timeZone = "Asia/Singapore") {
  // Build YYYY-MM-DD based on the target time zone
  try {
    const parts = new Intl.DateTimeFormat("en", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(date);
    const y = parts.find((p) => p.type === "year")?.value;
    const m = parts.find((p) => p.type === "month")?.value;
    const d = parts.find((p) => p.type === "day")?.value;

    if (y && m && d) return `${y}-${m}-${d}`;
  } catch (e) {
    // fallback
  }

  return date.toISOString().slice(0, 10);
}

const createSchema = z.object({
  shiftDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  shiftType: z.enum(["DAY", "NIGHT"]),
  // Backwards-compatible single-activity fields
  activity: z.string().min(1).optional(),
  activityDesc: z.string().min(1).optional(),
  location: z
    .string()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  // New: optional activities array to create multiple activities per TimeEntry
  activities: z
    .array(
      z.object({
        activity: z.string().min(1),
        activityDesc: z.string().optional(),
        location: z.string().optional(),
        startTime: z.string().regex(/^\d{2}:\d{2}$/),
        endTime: z.string().regex(/^\d{2}:\d{2}$/),
      }),
    )
    .optional(),
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const shiftDate = searchParams.get("shiftDate");
  const shiftType = searchParams.get("shiftType") as "DAY" | "NIGHT" | null;

  let where: any = { userId: session.user.id };

  if (shiftDate && /^\d{4}-\d{2}-\d{2}$/.test(shiftDate)) {
    where.shiftDate = new Date(shiftDate + "T00:00:00.000Z");
  }
  if (shiftType) {
    where.shiftType = shiftType;
  }

  try {
    // @ts-ignore Model will exist after migration
    const entries = await (prisma as any).timeEntry.findMany({
      where,
      orderBy: { startTime: "asc" },
      include: { user: true, activities: true },
    });

    return NextResponse.json(
      entries.map((e: any) => {
        const activities = (e.activities || []).map((a: any) => ({
          id: a.id,
          activity: a.activity,
          activityDesc: a.activityDesc,
          location: a.location,
          startTime: a.startTime,
          endTime: a.endTime,
          durationSec: a.durationSec,
          duration: new Date(a.durationSec * 1000)
            .toISOString()
            .substring(11, 19),
        }));

        // derive top-level start/end/duration from activities if available
        let topStart: Date | null = null;
        let topEnd: Date | null = null;
        let totalSec = 0;

        for (const a of activities) {
          const s = new Date(a.startTime);
          const en = new Date(a.endTime);

          if (!topStart || s.getTime() < topStart.getTime()) topStart = s;
          if (!topEnd || en.getTime() > topEnd.getTime()) topEnd = en;
          totalSec += a.durationSec || 0;
        }

        return {
          id: e.id,
          userId: e.userId,
          userName: e.user?.name || "-",
          // summary fields derived from activities
          activities,
          shiftDate: formatDateInTimeZoneISO(e.shiftDate, "Asia/Singapore"),
          shiftType: e.shiftType,
          startTime: topStart ? topStart.toISOString() : null,
          endTime: topEnd ? topEnd.toISOString() : null,
          duration: new Date(totalSec * 1000).toISOString().substring(11, 19),
        };
      }),
    );
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let data: z.infer<typeof createSchema>;

  try {
    data = createSchema.parse(await request.json());
  } catch (e: any) {
    return NextResponse.json(
      { error: "Invalid payload", detail: e.errors },
      { status: 400 },
    );
  }

  // If activities array provided, validate those instead. Otherwise require startTime/endTime.
  let startDt: Date | undefined = undefined;
  let endDt: Date | undefined = undefined;

  if (!data.activities || data.activities.length === 0) {
    if (!data.startTime || !data.endTime) {
      return NextResponse.json(
        {
          error:
            "startTime and endTime are required when activities array is not provided",
        },
        { status: 400 },
      );
    }

    startDt =
      buildDateTime(data.shiftDate, data.startTime, data.shiftType) ??
      undefined;
    endDt =
      buildDateTime(data.shiftDate, data.endTime, data.shiftType) ?? undefined;
    if (!startDt || !endDt) {
      return NextResponse.json(
        { error: "Invalid time mapping" },
        { status: 400 },
      );
    }
    if (endDt.getTime() <= startDt.getTime()) {
      return NextResponse.json(
        { error: "End must be after start (no cross-midnight yet)" },
        { status: 400 },
      );
    }
  }

  // Validate within shift window
  const { shiftType } = data;

  if (shiftType === "DAY") {
    const min = buildDateTime(data.shiftDate, "06:00", "DAY") ?? new Date(0);
    const max = buildDateTime(data.shiftDate, "18:00", "DAY") ?? new Date(0);

    if (
      !startDt ||
      !endDt ||
      startDt.getTime() < min.getTime() ||
      endDt.getTime() > max.getTime()
    ) {
      return NextResponse.json(
        { error: "Time outside DAY shift (06-18)" },
        { status: 400 },
      );
    }
  } else {
    // NIGHT: window 18:00 shiftDate -> 06:00 shiftDate+1
    const nStart =
      buildDateTime(data.shiftDate, "18:00", "NIGHT") ?? new Date(0);
    const nEnd = buildDateTime(data.shiftDate, "06:00", "NIGHT") ?? new Date(0); // this becomes next day 06:00

    if (
      !startDt ||
      !endDt ||
      startDt.getTime() < nStart.getTime() ||
      endDt.getTime() > nEnd.getTime()
    ) {
      return NextResponse.json(
        { error: "Time outside NIGHT shift (18-06)" },
        { status: 400 },
      );
    }
  }

  const durationSec = startDt && endDt ? durationSeconds(startDt, endDt) : 0;

  try {
    // Create TimeEntry header
    const created = await (prisma as any).timeEntry.create({
      data: {
        userId: session.user.id,
        shiftDate: new Date(data.shiftDate + "T00:00:00.000Z"),
        shiftType: data.shiftType,
        // legacy per-entry columns removed from schema; header contains only meta fields
      },
    });

    // Create activities: prefer data.activities array, otherwise fall back to single activity fields
    const activitiesToCreate: any[] = [];

    if (data.activities && data.activities.length > 0) {
      for (const a of data.activities) {
        const aStart = buildDateTime(
          data.shiftDate,
          a.startTime,
          data.shiftType,
        );
        const aEnd = buildDateTime(data.shiftDate, a.endTime, data.shiftType);

        if (!aStart || !aEnd || aEnd <= aStart) {
          return NextResponse.json(
            { error: "Invalid activity times" },
            { status: 400 },
          );
        }
        activitiesToCreate.push({
          timeEntryId: created.id,
          activity: a.activity,
          activityDesc: a.activityDesc ?? null,
          location: a.location ?? null,
          startTime: aStart,
          endTime: aEnd,
          durationSec: durationSeconds(aStart, aEnd),
        });
      }
    } else if (data.activity && startDt && endDt) {
      activitiesToCreate.push({
        timeEntryId: created.id,
        activity: data.activity,
        activityDesc: data.activityDesc ?? null,
        location: data.location ?? null,
        startTime: startDt,
        endTime: endDt,
        durationSec,
      });
    }

    // Bulk create activities if any
    if (activitiesToCreate.length > 0) {
      // @ts-ignore
      await (prisma as any).timeActivity.createMany({
        data: activitiesToCreate,
      });
    }

    // respond with created header and activities
    const withActivities = await (prisma as any).timeEntry.findUnique({
      where: { id: created.id },
      include: { activities: true },
    });

    const activities = (withActivities?.activities || []).map((a: any) => ({
      id: a.id,
      activity: a.activity,
      activityDesc: a.activityDesc,
      location: a.location,
      startTime: a.startTime,
      endTime: a.endTime,
      durationSec: a.durationSec,
      duration: new Date(a.durationSec * 1000).toISOString().substring(11, 19),
    }));

    let topStart: Date | null = null;
    let topEnd: Date | null = null;
    let totalSec = 0;

    for (const a of activities) {
      const s = new Date(a.startTime);
      const en = new Date(a.endTime);

      if (!topStart || s.getTime() < topStart.getTime()) topStart = s;
      if (!topEnd || en.getTime() > topEnd.getTime()) topEnd = en;
      totalSec += a.durationSec || 0;
    }

    return NextResponse.json({
      id: created.id,
      shiftDate: formatDateInTimeZoneISO(
        created.shiftDate ?? new Date(data.shiftDate + "T00:00:00.000Z"),
        "Asia/Singapore",
      ),
      shiftType: created.shiftType,
      activities,
      startTime: topStart ? topStart.toISOString() : null,
      endTime: topEnd ? topEnd.toISOString() : null,
      duration: new Date(totalSec * 1000).toISOString().substring(11, 19),
    });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
