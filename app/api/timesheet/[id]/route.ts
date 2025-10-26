import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { buildDateTime, durationSeconds } from "@/lib/dateUtils";

const updateSchema = z.object({
  activity: z.string().min(1).optional(),
  activityDesc: z.string().min(1).optional(),
  location: z.string().optional(),
  shiftDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  shiftType: z.enum(["DAY", "NIGHT"]).optional(),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  // optional activities replacement array
  activities: z
    .array(
      z.object({
        id: z.string().optional(),
        activity: z.string().min(1),
        activityDesc: z.string().optional(),
        location: z.string().optional(),
        startTime: z.string().regex(/^\d{2}:\d{2}$/),
        endTime: z.string().regex(/^\d{2}:\d{2}$/),
      }),
    )
    .optional(),
});

export async function PATCH(request: Request, { params }: any) {
  const session = await getServerSession(authOptions);

  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = params.id;

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  let data: z.infer<typeof updateSchema>;

  try {
    data = updateSchema.parse(await request.json());
  } catch (e: any) {
    return NextResponse.json(
      { error: "Invalid payload", detail: e.errors },
      { status: 400 },
    );
  }

  try {
    // fetch existing entry to get shiftDate/shiftType if needed
    // @ts-ignore
    const existing = await (prisma as any).timeEntry.findUnique({
      where: { id },
    });

    if (!existing)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const shiftDate =
      data.shiftDate || existing.shiftDate.toISOString().slice(0, 10);
    const shiftType = data.shiftType || existing.shiftType;

    // If start/end provided, compute datetimes
    let startDt = undefined;
    let endDt = undefined;

    if (data.startTime)
      startDt = buildDateTime(shiftDate, data.startTime, shiftType);
    if (data.endTime) endDt = buildDateTime(shiftDate, data.endTime, shiftType);

    let durationSec = existing.durationSec;

    if (startDt && endDt) {
      if (endDt <= startDt) {
        return NextResponse.json(
          { error: "End must be after start" },
          { status: 400 },
        );
      }
      durationSec = durationSeconds(startDt, endDt);
    }

    // Build update object
    const updateData: any = {};

    if (data.shiftDate)
      updateData.shiftDate = new Date(data.shiftDate + "T00:00:00.000Z");
    if (data.shiftType) updateData.shiftType = data.shiftType;
    // legacy per-entry activity columns removed; activities are stored in TimeActivity

    // @ts-ignore
    const updated = await (prisma as any).timeEntry.update({
      where: { id },
      data: updateData,
    });

    // If activities provided, replace existing activities for this timeEntry
    if (data.activities) {
      // delete existing activities
      try {
        // @ts-ignore
        await (prisma as any).timeActivity.deleteMany({
          where: { timeEntryId: id },
        });
      } catch (err) {
        // ignore
      }

      const activitiesToCreate: any[] = [];

      for (const a of data.activities) {
        const aStart = buildDateTime(
          data.shiftDate || updated.shiftDate.toISOString().slice(0, 10),
          a.startTime,
          data.shiftType || updated.shiftType,
        );
        const aEnd = buildDateTime(
          data.shiftDate || updated.shiftDate.toISOString().slice(0, 10),
          a.endTime,
          data.shiftType || updated.shiftType,
        );

        if (!aStart || !aEnd || aEnd <= aStart) {
          return NextResponse.json(
            { error: "Invalid activity times" },
            { status: 400 },
          );
        }
        activitiesToCreate.push({
          timeEntryId: id,
          activity: a.activity,
          activityDesc: a.activityDesc ?? null,
          location: a.location ?? null,
          startTime: aStart,
          endTime: aEnd,
          durationSec: durationSeconds(aStart, aEnd),
        });
      }

      if (activitiesToCreate.length > 0) {
        // @ts-ignore
        await (prisma as any).timeActivity.createMany({
          data: activitiesToCreate,
        });
      }
    }

    // compute top-level summary from activities for response
    const refreshed = await (prisma as any).timeEntry.findUnique({
      where: { id },
      include: { activities: true },
    });

    type Act = {
      id: string;
      activity: string;
      activityDesc?: string | null;
      location?: string | null;
      startTime: Date;
      endTime: Date;
      durationSec: number;
    };
    const activities: Act[] = (refreshed?.activities || []).map((a: any) => ({
      id: a.id,
      activity: a.activity,
      activityDesc: a.activityDesc ?? null,
      location: a.location ?? null,
      startTime: a.startTime,
      endTime: a.endTime,
      durationSec: a.durationSec,
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
      id: refreshed?.id,
      shiftDate: refreshed?.shiftDate
        ? refreshed.shiftDate.toISOString().slice(0, 10)
        : null,
      shiftType: refreshed?.shiftType ?? null,
      activities: activities.map((a) => ({
        ...a,
        duration: new Date((a.durationSec || 0) * 1000)
          .toISOString()
          .substring(11, 19),
      })),
      startTime: topStart ? topStart.toISOString() : null,
      endTime: topEnd ? topEnd.toISOString() : null,
      duration: new Date(totalSec * 1000).toISOString().substring(11, 19),
    });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: any) {
  const session = await getServerSession(authOptions);

  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = params.id;

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    // @ts-ignore
    const existing = await (prisma as any).timeEntry.findUnique({
      where: { id },
    });

    if (!existing)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // @ts-ignore
    await (prisma as any).timeEntry.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
