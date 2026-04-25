/**
 * Cloudflare Pages Function — GET /api/share/:id
 * Streams a stored PDF back to the client.
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

    if (!env.PDF_BUCKET) {
      return json({ error: "Storage not configured." }, 500);
    }

    const obj = await env.PDF_BUCKET.get(id);
    if (!obj) return json({ error: "File not found." }, 404);

    const expiresAt = parseInt(obj.customMetadata?.expiresAt || "0");
    if (expiresAt && Date.now() > expiresAt) {
      await env.PDF_BUCKET.delete(id);
      return json({ error: "This link has expired." }, 410);
    }

    const fileName = obj.customMetadata?.fileName || "document.pdf";

    return new Response(obj.body, {
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
