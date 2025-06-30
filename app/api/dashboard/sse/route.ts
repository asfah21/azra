import { NextRequest, NextResponse } from "next/server";
import { getDashboardData, getRecentActivities } from "@/app/dashboard/action";

export async function GET(request: NextRequest) {
  // Set headers untuk SSE
  const headers = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Cache-Control",
  };

  const stream = new ReadableStream({
    async start(controller) {
      const sendData = (data: any) => {
        const eventData = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(new TextEncoder().encode(eventData));
      };

      const sendError = (error: string) => {
        const errorData = `data: ${JSON.stringify({ error })}\n\n`;
        controller.enqueue(new TextEncoder().encode(errorData));
      };

      try {
        // Kirim data awal
        const [dashboardData, recentActivities] = await Promise.all([
          getDashboardData(),
          getRecentActivities(),
        ]);

        sendData({
          type: "initial",
          dashboardData,
          recentActivities,
        });

        // Set interval untuk update data (setiap 30 detik)
        const interval = setInterval(async () => {
          try {
            const [newDashboardData, newRecentActivities] = await Promise.all([
              getDashboardData(),
              getRecentActivities(),
            ]);

            sendData({
              type: "update",
              dashboardData: newDashboardData,
              recentActivities: newRecentActivities,
            });
          } catch (error) {
            console.error("Error updating SSE data:", error);
            sendError("Failed to update data");
          }
        }, 30000);

        // Cleanup interval ketika connection ditutup
        request.signal.addEventListener("abort", () => {
          clearInterval(interval);
          controller.close();
        });

        // Cleanup setelah 5 menit untuk mencegah memory leak
        setTimeout(() => {
          clearInterval(interval);
          controller.close();
        }, 300000);

      } catch (error) {
        console.error("Error in SSE stream:", error);
        sendError("Failed to initialize data");
        controller.close();
      }
    },
  });

  return new NextResponse(stream, { headers });
} 