import { createFileRoute } from "@tanstack/react-router";
import { fetchAbsCpiFromUpstream } from "@/lib/absCpi.server";

export const Route = createFileRoute("/api/abs/cpi")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const data = await fetchAbsCpiFromUpstream();
          return Response.json(data);
        } catch (error) {
          const message = error instanceof Error ? error.message : "ABS proxy failed";
          return Response.json({ error: message }, { status: 502 });
        }
      },
    },
  },
});
