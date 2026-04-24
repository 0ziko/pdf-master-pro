/* global window */
/*
 * font-loader.js — DejaVu Sans (normal + bold) loader for jsPDF.
 *
 * DejaVu Sans covers a wide Unicode range including all Turkish, Greek,
 * Cyrillic and many other scripts.  This font is ALWAYS loaded for PDF
 * generation, completely independently of the current UI language.
 * The page language toggle (EN / TR) only affects the interface text,
 * never the PDF rendering font.
 *
 * Fallback chain (tried in order until one succeeds):
 *   1. jsDelivr  – https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/
 *   2. Statically – https://cdn.statically.io/gh/dejavu-fonts/dejavu-fonts/…
 */
(function (w) {
  const U = w.PdfMasterUtils;
  const C = w.PdfMasterConfig;

  /* Additional fallback CDN when the primary fails */
  const FALLBACK_NORMAL =
    "https://cdn.statically.io/gh/dejavu-fonts/dejavu-fonts/master/ttf/DejaVuSans.ttf";
  const FALLBACK_BOLD =
    "https://cdn.statically.io/gh/dejavu-fonts/dejavu-fonts/master/ttf/DejaVuSans-Bold.ttf";

  let cache = null; // { normal: binaryString, bold: binaryString }

  async function _fetchWithFallback(primary, fallback) {
    try {
      const r = await fetch(primary, { cache: "force-cache" });
      if (r.ok) return r.arrayBuffer();
      throw new Error("HTTP " + r.status);
    } catch (_) {
      /* primary failed → try fallback */
      const r2 = await fetch(fallback);
      if (!r2.ok) throw new Error("Font CDN unreachable (" + r2.status + ")");
      return r2.arrayBuffer();
    }
  }

  /**
   * Embeds DejaVu Sans (normal + bold) into a jsPDF instance via VFS.
   * Fonts are cached after the first successful download.
   *
   * This function is UI-language-agnostic — it always runs the same way.
   */
  async function ensureDejaVuFonts(doc) {
    if (!cache) {
      const [sansBuf, boldBuf] = await Promise.all([
        _fetchWithFallback(C.dejaVuSansUrl, FALLBACK_NORMAL),
        _fetchWithFallback(C.dejaVuSansBoldUrl, FALLBACK_BOLD),
      ]);
      cache = {
        normal: U.arrayBufferToBinaryString(sansBuf),
        bold:   U.arrayBufferToBinaryString(boldBuf),
      };
    }
    _applyVfs(doc, cache);
  }

  function _applyVfs(doc, data) {
    const name     = C.fontFamilyName;
    const ttfNorm  = `${name}-Regular.ttf`;
    const ttfBold  = `${name}-Bold.ttf`;
    doc.addFileToVFS(ttfNorm, data.normal);
    doc.addFileToVFS(ttfBold, data.bold);
    doc.addFont(ttfNorm, name, "normal");
    doc.addFont(ttfBold, name, "bold");
    doc.setFont(name, "normal");
  }

  w.PdfMasterFonts = {
    ensureDejaVuFonts,
    get family() { return C.fontFamilyName; },
  };
})(typeof window !== "undefined" ? window : globalThis);
