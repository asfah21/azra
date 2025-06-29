import { NextRequest, NextResponse } from "next/server";

import { getBreakdownsData } from "@/app/dashboard/workorders/actions/serverAction";

export async function GET(_request: NextRequest) {
  try {
    const data = await getBreakdownsData();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch work orders" },
      { status: 500 },
    );
  }
}
