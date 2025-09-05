import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { buildDateTime, durationSeconds, getShiftInfo, parseHHMM } from '@/lib/dateUtils';

const createSchema = z.object({
  shiftDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  shiftType: z.enum(['DAY', 'NIGHT']),
  activity: z.string().min(1),
  activityDesc: z.string().min(1),
  location: z.string().min(1).optional().or(z.literal('').transform(() => undefined)),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const shiftDate = searchParams.get('shiftDate');
  const shiftType = searchParams.get('shiftType') as 'DAY' | 'NIGHT' | null;

  let where: any = { userId: session.user.id };
  if (shiftDate && /^\d{4}-\d{2}-\d{2}$/.test(shiftDate)) {
    where.shiftDate = new Date(shiftDate + 'T00:00:00.000Z');
  }
  if (shiftType) {
    where.shiftType = shiftType;
  }

  try {
    // @ts-ignore Model will exist after migration
    const entries = await (prisma as any).timeEntry.findMany({
      where,
      orderBy: { startTime: 'asc' },
      include: { user: true },
    });
    return NextResponse.json(entries.map((e: any) => ({
      id: e.id,
      userId: e.userId,
      userName: e.user?.name || '-',
      activity: e.activity,
      activityDesc: e.activityDesc,
      location: e.location,
      shiftDate: e.shiftDate.toISOString().slice(0, 10),
      shiftType: e.shiftType,
      startTime: e.startTime,
      endTime: e.endTime,
      duration: new Date(e.durationSec * 1000).toISOString().substring(11,19),
    })));
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let data: z.infer<typeof createSchema>;
  try {
    data = createSchema.parse(await request.json());
  } catch (e: any) {
    return NextResponse.json({ error: 'Invalid payload', detail: e.errors }, { status: 400 });
  }

  const startDt = buildDateTime(data.shiftDate, data.startTime, data.shiftType);
  const endDt = buildDateTime(data.shiftDate, data.endTime, data.shiftType);
  if (!startDt || !endDt) {
    return NextResponse.json({ error: 'Invalid time mapping' }, { status: 400 });
  }
  if (endDt <= startDt) {
    return NextResponse.json({ error: 'End must be after start (no cross-midnight yet)' }, { status: 400 });
  }

  // Validate within shift window
  const { shiftType } = data;
  if (shiftType === 'DAY') {
    const min = buildDateTime(data.shiftDate, '06:00', 'DAY')!;
    const max = buildDateTime(data.shiftDate, '18:00', 'DAY')!;
    if (startDt < min || endDt > max) {
      return NextResponse.json({ error: 'Time outside DAY shift (06-18)' }, { status: 400 });
    }
  } else {
    // NIGHT: window 18:00 shiftDate -> 06:00 shiftDate+1
    const nStart = buildDateTime(data.shiftDate, '18:00', 'NIGHT')!;
    const nEnd = buildDateTime(data.shiftDate, '06:00', 'NIGHT')!; // this becomes next day 06:00
    if (startDt < nStart || endDt > nEnd) {
      return NextResponse.json({ error: 'Time outside NIGHT shift (18-06)' }, { status: 400 });
    }
  }

  const durationSec = durationSeconds(startDt, endDt);

  try {
  // @ts-ignore Model will exist after migration
  const created = await (prisma as any).timeEntry.create({
      data: {
        userId: session.user.id,
        shiftDate: new Date(data.shiftDate + 'T00:00:00.000Z'),
        shiftType: data.shiftType,
        activity: data.activity,
        activityDesc: data.activityDesc,
        location: data.location,
        startTime: startDt,
        endTime: endDt,
        durationSec,
      },
    });
    return NextResponse.json({
      id: created.id,
      activity: created.activity,
      activityDesc: created.activityDesc,
      location: created.location,
      shiftDate: data.shiftDate,
      shiftType: created.shiftType,
      startTime: created.startTime,
      endTime: created.endTime,
      duration: new Date(durationSec * 1000).toISOString().substring(11,19),
    });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
