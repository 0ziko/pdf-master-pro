/**
 * Cloudflare Pages Function — POST /api/share/upload
 * Stores PDF in KV (binary) with 7-day TTL and returns a shareable link.
 */

const EXPIRE_SEC  = 7 * 24 * 60 * 60;   // 7 days in seconds
const MAX_SIZE_MB = 20;
const MAX_SIZE_B  = MAX_SIZE_MB * 1024 * 1024;

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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

export async function onRequestPost({ request, env }) {
  try {
    if (!env.PDF_KV) {
      return json({
        error: "KV storage not configured. Bind a KV namespace as PDF_KV in Cloudflare Pages → Settings → Bindings.",
      }, 500);
    }

    const ct = request.headers.get("Content-Type") || "";
    let fileData, fileName = "document.pdf";

    if (ct.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");
      if (!file) return json({ error: "No file field in form." }, 400);
      if (file.size > MAX_SIZE_B)
        return json({ error: `File too large. Max ${MAX_SIZE_MB} MB.` }, 413);
      fileData = await file.arrayBuffer();
      fileName = file.name || fileName;
    } else {
      fileData = await request.arrayBuffer();
      if (fileData.byteLength > MAX_SIZE_B)
        return json({ error: `File too large. Max ${MAX_SIZE_MB} MB.` }, 413);
    }

    const id        = crypto.randomUUID();
    const now       = Date.now();
    const expiresAt = now + EXPIRE_SEC * 1000;

    /* Store binary PDF directly in KV with automatic TTL expiry */
    await env.PDF_KV.put(id, fileData, {
      expirationTtl: EXPIRE_SEC,
      metadata: {
        fileName,
        uploadedAt: now,
        expiresAt,
        sizeBytes: fileData.byteLength,
      },
    });

    return json({
      id,
      url:       `https://snakeconverter.com/api/share/${id}`,
      fileName,
      expiresAt: new Date(expiresAt).toISOString(),
      sizeBytes: fileData.byteLength,
    });

  } catch (e) {
    return json({ error: "Internal error: " + (e.message || String(e)) }, 500);
  }
}
