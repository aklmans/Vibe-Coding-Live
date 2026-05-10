import {
  getLiveStateSnapshot,
  subscribeLiveState,
  type LiveStateSnapshot,
} from "../../../../lib/live-state";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function encodeSnapshot(snapshot: LiveStateSnapshot): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(snapshot)}\n\n`);
}

export function GET(request: Request) {
  let unsubscribe: (() => void) | null = null;
  let closed = false;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const close = () => {
        if (closed) return;
        closed = true;
        unsubscribe?.();
        controller.close();
      };

      controller.enqueue(encodeSnapshot(getLiveStateSnapshot()));
      unsubscribe = subscribeLiveState((snapshot) => {
        if (!closed) {
          controller.enqueue(encodeSnapshot(snapshot));
        }
      });
      request.signal.addEventListener("abort", close, { once: true });
    },
    cancel() {
      closed = true;
      unsubscribe?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
