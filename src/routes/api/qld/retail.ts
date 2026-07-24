import { createFileRoute } from "@tanstack/react-router";
import { fetchQldRetailDatasetsFromUpstream } from "@/lib/qldOpenData.server";

export const Route = createFileRoute("/api/qld/retail")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const data = await fetchQldRetailDatasetsFromUpstream();
          return Response.json(data);
        } catch (error) {
          const message = error instanceof Error ? error.message : "QLD proxy failed";
          return Response.json({ error: message }, { status: 502 });
        }
      },
    },
  },
});
