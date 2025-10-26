import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function PATCH(request: Request, { params }: any) {
  const session = await getServerSession(authOptions);

  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = params.id;
  let body: any;

  try {
    body = await request.json();
  } catch {
    body = {};
  }

  if (body.action === "close") {
    try {
      await prisma.timeEntry.update({
        where: { id },
        data: { status: "closed", updatedAt: new Date() },
      });

      return NextResponse.json({ ok: true });
    } catch (e) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  return NextResponse.json({ error: "Unsupported" }, { status: 400 });
}
