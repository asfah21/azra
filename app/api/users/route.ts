import { NextRequest, NextResponse } from "next/server";

import { getUsersData } from "@/app/dashboard/users/action";

export async function GET(_request: NextRequest) {
  try {
    const result = await getUsersData();

    if (!result.success) {
      return NextResponse.json(
        { error: result.message || "Failed to fetch users" },
        { status: 500 },
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}
