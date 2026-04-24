/* global window, document */
(function (w) {
  const U = w.PdfMasterUtils;
  const C = w.PdfMasterConfig;

  let cache = null;

  /**
   * jsPDF belgesine DejaVu Sans (normal + bold) vfs üzerinden ekler; autoTable ile uyumludur.
   * @param {object} doc jsPDF örneği
   */
  async function ensureDejaVuFonts(doc) {
    if (cache) {
      _applyVfs(doc, cache);
      return;
    }

    const [sansBuf, boldBuf] = await Promise.all([
      fetch(C.dejaVuSansUrl).then((r) => {
        if (!r.ok) throw new Error("DejaVu Sans indirilemedi");
        return r.arrayBuffer();
      }),
      fetch(C.dejaVuSansBoldUrl).then((r) => {
        if (!r.ok) throw new Error("DejaVu Sans Bold indirilemedi");
        return r.arrayBuffer();
      }),
    ]);

    cache = {
      normal: U.arrayBufferToBinaryString(sansBuf),
      bold: U.arrayBufferToBinaryString(boldBuf),
    };
    _applyVfs(doc, cache);
  }

  function _applyVfs(doc, data) {
    const name = C.fontFamilyName;
    const ttfNormal = `${name}-Regular.ttf`;
    const ttfBold = `${name}-Bold.ttf`;
    doc.addFileToVFS(ttfNormal, data.normal);
    doc.addFileToVFS(ttfBold, data.bold);
    doc.addFont(ttfNormal, name, "normal");
    doc.addFont(ttfBold, name, "bold");
    doc.setFont(name, "normal");
  }

  w.PdfMasterFonts = {
    ensureDejaVuFonts,
    get family() {
      return C.fontFamilyName;
    },
  };
})(typeof window !== "undefined" ? window : globalThis);
