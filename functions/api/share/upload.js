/**
 * Cloudflare Pages Function — POST /api/share/upload
 * Stores a PDF in R2 and returns a shareable link.
 */

const EXPIRE_MS   = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_SIZE_MB = 25;
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
      const buf = await request.arrayBuffer();
      if (buf.byteLength > MAX_SIZE_B)
        return json({ error: `File too large. Max ${MAX_SIZE_MB} MB.` }, 413);
      fileData = buf;
    }

    if (!env.PDF_BUCKET) {
      return json({ error: "Storage not configured. Bind R2 bucket PDF_BUCKET in Cloudflare Pages settings." }, 500);
    }

    const id        = crypto.randomUUID();
    const now       = Date.now();
    const expiresAt = now + EXPIRE_MS;

    await env.PDF_BUCKET.put(id, fileData, {
      httpMetadata:   { contentType: "application/pdf" },
      customMetadata: {
        fileName,
        uploadedAt: now.toString(),
        expiresAt:  expiresAt.toString(),
      },
    });

    const shareUrl = `https://snakeconverter.com/api/share/${id}`;

    return json({
      id,
      url:       shareUrl,
      fileName,
      expiresAt: new Date(expiresAt).toISOString(),
      sizeBytes: fileData.byteLength,
    });

  } catch (e) {
    return json({ error: "Internal error: " + (e.message || String(e)) }, 500);
  }
}
