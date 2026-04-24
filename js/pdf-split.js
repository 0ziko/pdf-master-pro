/* global window, JSZip */
(function (w) {
  /**
   * @param {File} file
   * @param {'each' | 'ranges'} mode
   * @param {string} rangesText — örn: "1-3,5" (1 tabanlı, virgülle)
   * @returns {Promise<Blob>} zip veya tek pdf için caller karar verir
   */
  async function splitPdf(file, mode, rangesText) {
    const { PDFDocument } = w.PDFLib;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const src = await PDFDocument.load(bytes);
    const pageCount = src.getPageCount();

    if (mode === "each") {
      const zip = new JSZip();
      for (let i = 0; i < pageCount; i++) {
        const part = await PDFDocument.create();
        const [copied] = await part.copyPages(src, [i]);
        part.addPage(copied);
        const out = await part.save({ useObjectStreams: false });
        zip.file(`sayfa-${String(i + 1).padStart(3, "0")}.pdf`, out);
      }
      return zip.generateAsync({ type: "blob", compression: "DEFLATE" });
    }

    const ranges = _parseRanges(rangesText, pageCount);
    if (!ranges.length) throw new Error("Geçerli sayfa aralığı yok.");

    const zip = new JSZip();
    let partIndex = 0;
    for (const range of ranges) {
      const part = await PDFDocument.create();
      const idxs = [];
      for (let p = range[0]; p <= range[1]; p++) idxs.push(p - 1);
      const copied = await part.copyPages(src, idxs);
      copied.forEach((page) => part.addPage(page));
      const out = await part.save({ useObjectStreams: false });
      partIndex += 1;
      zip.file(
        `bolum-${String(partIndex).padStart(2, "0")}_p${range[0]}-${range[1]}.pdf`,
        out
      );
    }
    return zip.generateAsync({ type: "blob", compression: "DEFLATE" });
  }

  /**
   * @param {string} text
   * @param {number} pageCount
   * @returns {number[][]} inclusive [start,end] 1-based
   */
  function _parseRanges(text, pageCount) {
    const out = [];
    const parts = (text || "")
      .split(/[,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    for (const part of parts) {
      let a;
      let b;
      if (part.includes("-")) {
        const [x, y] = part.split("-").map((n) => parseInt(n.trim(), 10));
        a = x;
        b = y;
      } else {
        a = b = parseInt(part, 10);
      }
      if (Number.isNaN(a) || Number.isNaN(b)) continue;
      if (a > b) [a, b] = [b, a];
      a = Math.max(1, Math.min(a, pageCount));
      b = Math.max(1, Math.min(b, pageCount));
      if (a <= b) out.push([a, b]);
    }
    return out;
  }

  w.PdfMasterSplit = { splitPdf };
})(typeof window !== "undefined" ? window : globalThis);
