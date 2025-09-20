export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }
    const body = await request.json();
    const { approvedBy } = body;
    if (!approvedBy) {
      return NextResponse.json({ error: 'Missing approvedBy' }, { status: 400 });
    }
    const updated = await prisma.timeEntry.update({
      where: { id },
      data: { approvedBy }
    });
    return NextResponse.json({ success: true, entry: updated });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }
    await prisma.timeActivity.deleteMany({ where: { timeEntryId: id } });
    await prisma.timeEntry.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
