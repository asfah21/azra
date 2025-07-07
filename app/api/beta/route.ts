import { getUserList, getUserCount } from '@/lib/dashboard/beta';

export async function GET() {
  let lastData = '';
  let connectionCount = 0;
  
  const stream = new ReadableStream({
    async start(controller) {
      connectionCount++;
      console.log(`SSE connection ${connectionCount} opened`);
      
      const sendData = async () => {
        try {
          const [users, count] = await Promise.all([
            getUserList(),
            getUserCount(),
          ]);
          
          const currentData = JSON.stringify({ users, count });
          
          // Hanya kirim jika data berubah
          if (currentData !== lastData) {
            controller.enqueue(`data: ${currentData}\n\n`);
            lastData = currentData;
            console.log('Data updated, sent to client');
          } else {
            console.log('Data unchanged, skipping send');
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

      // Send initial data
      await sendData();
      
      // Check every 10 seconds
      const interval = setInterval(sendData, 10000);

      // Cleanup on close
      return () => {
        clearInterval(interval);
        connectionCount--;
        console.log(`SSE connection closed, ${connectionCount} remaining`);
      };
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
} 