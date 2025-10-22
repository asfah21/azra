import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: any,
) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    // Cek apakah parent timeEntry sudah di-approve
    const activity = await prisma.timeActivity.findUnique({ where: { id } });

    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 },
      );
    }
    const parent = await prisma.timeEntry.findUnique({
      where: { id: activity.timeEntryId },
    });

    if (parent?.approvedBy) {
      return NextResponse.json(
        { error: "Cannot delete activity after approval" },
        { status: 403 },
      );
    }
    await prisma.timeActivity.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
