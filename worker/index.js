/**
 * SnakeConverter PDF Share Worker
 * Cloudflare Worker + R2  —  free tier
 *
 * Routes:
 *   POST /api/share/upload        → stores PDF, returns { id, url, expiresAt }
 *   GET  /api/share/:id           → streams PDF back
 *   GET  /api/share/:id/info      → returns metadata JSON
 *   DELETE /api/share/:id         → manual delete
 */

const EXPIRE_MS   = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_SIZE_MB = 25;
const MAX_SIZE_B  = MAX_SIZE_MB * 1024 * 1024;

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

function err(msg, status = 400) {
  return json({ error: msg }, status);
}

export default {
  async fetch(request, env) {
    const url    = new URL(request.url);
    const path   = url.pathname;
    const method = request.method;

    // CORS preflight
    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    // ── POST /api/share/upload ─────────────────────────────
    if (method === "POST" && path === "/api/share/upload") {
      const ct = request.headers.get("Content-Type") || "";
      if (!ct.includes("application/pdf") && !ct.includes("multipart/form-data") && !ct.includes("application/octet-stream")) {
        return err("Only PDF files are accepted.");
      }

      let fileData;
      let fileName = "document.pdf";

      if (ct.includes("multipart/form-data")) {
        const form = await request.formData();
        const file = form.get("file");
        if (!file) return err("No file field in form.");
        if (file.size > MAX_SIZE_B) return err(`File too large. Max ${MAX_SIZE_MB} MB.`);
        fileData = await file.arrayBuffer();
        fileName = file.name || fileName;
      } else {
        const buf = await request.arrayBuffer();
        if (buf.byteLength > MAX_SIZE_B) return err(`File too large. Max ${MAX_SIZE_MB} MB.`);
        fileData = buf;
      }

      const id        = crypto.randomUUID();
      const now       = Date.now();
      const expiresAt = now + EXPIRE_MS;

      await env.PDF_BUCKET.put(id, fileData, {
        httpMetadata: { contentType: "application/pdf" },
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
    }

    // ── GET /api/share/:id/info ────────────────────────────
    const infoMatch = path.match(/^\/api\/share\/([a-f0-9-]{36})\/info$/);
    if (method === "GET" && infoMatch) {
      const obj = await env.PDF_BUCKET.head(infoMatch[1]);
      if (!obj) return err("File not found.", 404);
      const expiresAt = parseInt(obj.customMetadata?.expiresAt || "0");
      if (Date.now() > expiresAt) {
        await env.PDF_BUCKET.delete(infoMatch[1]);
        return err("File has expired.", 410);
      }
      return json({
        fileName:   obj.customMetadata?.fileName || "document.pdf",
        uploadedAt: new Date(parseInt(obj.customMetadata?.uploadedAt)).toISOString(),
        expiresAt:  new Date(expiresAt).toISOString(),
        sizeBytes:  obj.size,
      });
    }

    // ── GET /api/share/:id ─────────────────────────────────
    const fileMatch = path.match(/^\/api\/share\/([a-f0-9-]{36})$/);
    if (method === "GET" && fileMatch) {
      const id  = fileMatch[1];
      const obj = await env.PDF_BUCKET.get(id);
      if (!obj) return err("File not found.", 404);

      const expiresAt = parseInt(obj.customMetadata?.expiresAt || "0");
      if (Date.now() > expiresAt) {
        await env.PDF_BUCKET.delete(id);
        return err("File has expired.", 410);
      }

      const fileName = obj.customMetadata?.fileName || "document.pdf";
      return new Response(obj.body, {
        headers: {
          ...CORS,
          "Content-Type":        "application/pdf",
          "Content-Disposition": `inline; filename="${fileName}"`,
          "Cache-Control":       "private, max-age=3600",
        },
      });
    }

    // ── DELETE /api/share/:id ──────────────────────────────
    const delMatch = path.match(/^\/api\/share\/([a-f0-9-]{36})$/);
    if (method === "DELETE" && delMatch) {
      await env.PDF_BUCKET.delete(delMatch[1]);
      return json({ deleted: true });
    }

    return err("Not found.", 404);
  },

  // Daily cleanup cron — remove expired files (set in wrangler.toml)
  async scheduled(event, env) {
    const list = await env.PDF_BUCKET.list();
    const now  = Date.now();
    for (const obj of list.objects) {
      const meta = await env.PDF_BUCKET.head(obj.key);
      const exp  = parseInt(meta?.customMetadata?.expiresAt || "0");
      if (exp && now > exp) {
        await env.PDF_BUCKET.delete(obj.key);
      }
    }
  },
};
