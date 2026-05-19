import broker from '@/lib/sseBroker';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request, { params }) {
  const { providerId } = params;

  const stream = new ReadableStream({
    start(controller) {
      const writer = {
        write(chunk) {
          controller.enqueue(chunk);
        },
        close() {
          controller.close();
        },
      };

      // Register with broker
      broker.addClient(providerId, writer);

      // Send initial heartbeat
      const heartbeat = `data: ${JSON.stringify({ type: 'CONNECTED', providerId })}\n\n`;
      controller.enqueue(new TextEncoder().encode(heartbeat));

      // Keep-alive ping every 25 seconds
      const interval = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(': ping\n\n'));
        } catch {
          clearInterval(interval);
        }
      }, 25000);

      // Cleanup on disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        broker.removeClient(providerId, writer);
        try { controller.close(); } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
