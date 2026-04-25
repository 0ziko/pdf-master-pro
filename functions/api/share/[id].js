/**
 * Cloudflare Pages Function — GET /api/share/:id
 * Streams a stored PDF from KV back to the client.
 */

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestGet({ params, env }) {
  try {
    const id = params.id;
    if (!id) return json({ error: "Missing id." }, 400);

    if (!env.PDF_KV) return json({ error: "Storage not configured." }, 500);

    const { value, metadata } = await env.PDF_KV.getWithMetadata(id, {
      type: "arrayBuffer",
    });

    if (!value) return json({ error: "File not found or link has expired." }, 404);

    const fileName = metadata?.fileName || "document.pdf";

    return new Response(value, {
      headers: {
        ...CORS,
        "Content-Type":        "application/pdf",
        "Content-Disposition": `inline; filename="${encodeURIComponent(fileName)}"`,
        "Cache-Control":       "private, max-age=3600",
      },
    });
  } catch (e) {
    return json({ error: "Internal error: " + (e.message || String(e)) }, 500);
  }
}
