import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { buildDateTime } from '@/lib/dateUtils';

const openSchema = z.object({ action: z.literal('open'), shiftDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), shiftType: z.enum(['DAY','NIGHT']), assetTag: z.string().optional() });

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const shiftDate = searchParams.get('shiftDate');
  const shiftType = searchParams.get('shiftType') as 'DAY'|'NIGHT'|null;

  try {
  const where: any = { userId: session.user.id };
    if (shiftDate && /^\d{4}-\d{2}-\d{2}$/.test(shiftDate)) where.shiftDate = new Date(shiftDate + 'T00:00:00.000Z');
    if (shiftType) where.shiftType = shiftType;
  // only consider non-closed sessions for dashboard listing
  where.status = { not: 'closed' };

    const entries = await prisma.timeEntry.findMany({ where, include: { activities: true }, orderBy: { createdAt: 'asc' } });

    // detect open session for this user+shift: use latest timeEntry if exists
    const open = entries.length ? entries[entries.length - 1] : null;

    // flatten activities for frontend convenience
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
        });
      }
    }

    return NextResponse.json({ entries: activities, openEntryId: open?.id || null });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: any;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // support open action
  try {
  const parsed = openSchema.parse(body);
  // create TimeEntry header
  const data: any = { userId: session.user.id, shiftDate: new Date(parsed.shiftDate + 'T00:00:00.000Z'), shiftType: parsed.shiftType, status: 'open' };
  if (parsed.assetTag) data.assetTag = parsed.assetTag;
  const created = await prisma.timeEntry.create({ data });
    return NextResponse.json({ id: created.id });
  } catch (e) {
    return NextResponse.json({ error: 'Bad request or unsupported action' }, { status: 400 });
  }
}

// PATCH for individual timeEntry moved to dynamic route [id]/route.ts
