import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { buildDateTime, durationSeconds } from '@/lib/dateUtils';

const schema = z.object({ timeEntryId: z.string().min(1), activity: z.string().min(1), activityDesc: z.string().optional(), location: z.string().optional(), startTime: z.string().regex(/^\d{2}:\d{2}$/), endTime: z.string().regex(/^\d{2}:\d{2}$/), shiftDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(), shiftType: z.enum(['DAY','NIGHT']).optional() });

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  let data: any;
  try { data = schema.parse(body); } catch (e: any) { return NextResponse.json({ error: 'Invalid payload', detail: e.errors }, { status: 400 }); }

  // Determine shiftDate & shiftType: if not provided, read parent timeEntry
  let shiftDate = data.shiftDate;
  let shiftType = data.shiftType;
  if (!shiftDate || !shiftType) {
    const parent = await prisma.timeEntry.findUnique({ where: { id: data.timeEntryId } });
    if (!parent) return NextResponse.json({ error: 'Parent not found' }, { status: 404 });
    shiftDate = shiftDate || parent.shiftDate.toISOString().slice(0,10);
    shiftType = shiftType || parent.shiftType;
  }

  const s = buildDateTime(shiftDate, data.startTime, shiftType as any);
  const e = buildDateTime(shiftDate, data.endTime, shiftType as any);
  if (!s || !e || e.getTime() <= s.getTime()) return NextResponse.json({ error: 'Invalid times' }, { status: 400 });

  const dur = durationSeconds(s, e);
  try {
    const created = await prisma.timeActivity.create({ data: { timeEntryId: data.timeEntryId, activity: data.activity, activityDesc: data.activityDesc ?? null, location: data.location ?? null, startTime: s, endTime: e, durationSec: dur } });
    return NextResponse.json({ id: created.id });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
