import { NextResponse } from "next/server";
import { testDatabaseConnection } from "@/lib/prisma";

export async function GET() {
  try {
    const result = await testDatabaseConnection();
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: result.message,
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: result.message,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Test DB API error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 