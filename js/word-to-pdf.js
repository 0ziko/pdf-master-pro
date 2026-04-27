/* global window, document */
(function (w) {
  const Fonts = w.PdfMasterFonts;
  const Encrypt = w.PdfMasterEncrypt;

  let mammothLoadPromise = null;

  function loadMammoth() {
    if (w.mammoth) return Promise.resolve(w.mammoth);
    if (mammothLoadPromise) return mammothLoadPromise;
    mammothLoadPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src =
        "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js";
      s.async = true;
      s.onload = () => {
        if (w.mammoth) resolve(w.mammoth);
        else reject(new Error("Mammoth not available"));
      };
      s.onerror = () => reject(new Error("Mammoth failed to load"));
      document.head.appendChild(s);
    });
    return mammothLoadPromise;
  }

  /**
   * @param {File} file
   * @param {{ encrypt: boolean; password: string }} options
   * @returns {Promise<Uint8Array>}
   */
  async function wordFileToPdfBytes(file, options) {
    const mammoth = await loadMammoth();
    const { jsPDF } = w.jspdf;
    const data = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: data });
    const text = (result && result.value) ? result.value : "";

    const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "p" });
    await Fonts.ensureDejaVuFonts(doc);
    const font = Fonts.family;
    doc.setFont(font, "normal");
    doc.setFontSize(10);

    const body = text.trim() || " ";
    const lines = doc.splitTextToSize(body, 180);
    let y = 20;
    const lh = 5;
    const maxY = 285;
    for (let i = 0; i < lines.length; i++) {
      if (y > maxY) {
        doc.addPage();
        y = 20;
      }
      doc.text(lines[i], 15, y);
      y += lh;
    }

    const raw = doc.output("arraybuffer");
    const { PDFDocument } = w.PDFLib;
    const pdfDoc = await PDFDocument.load(raw);
    return Encrypt.finalizePdfBytes(
      pdfDoc,
      options.encrypt,
      options.password || ""
    );
  }

  w.PdfMasterWord = { wordFileToPdfBytes };
})(typeof window !== "undefined" ? window : globalThis);
