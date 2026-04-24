/* global window, document */
(function (w) {
  const Encrypt = w.PdfMasterEncrypt;

  /**
   * Raster (webp/gif vb.) → PNG baytı
   * @param {File} file
   * @returns {Promise<Uint8Array>}
   */
  async function fileToPngBytes(file) {
    const bmp = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = bmp.width;
    canvas.height = bmp.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas desteklenmiyor");
    ctx.drawImage(bmp, 0, 0);
    bmp.close();
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("PNG oluşturulamadı"))), "image/png");
    });
    return new Uint8Array(await blob.arrayBuffer());
  }

  /**
   * @param {File} file
   * @param {{ encrypt: boolean; password: string; fit: 'original' | 'a4' }} options
   * @returns {Promise<Uint8Array>}
   */
  async function imageFileToPdfBytes(file, options) {
    const { PDFDocument } = w.PDFLib;
    const PageSizes = w.PDFLib.PageSizes || {
      A4: [595.28, 841.89],
    };
    const pdfDoc = await PDFDocument.create();
    const type = (file.type || "").toLowerCase();
    const name = (file.name || "").toLowerCase();

    let embedded;
    const buf = new Uint8Array(await file.arrayBuffer());

    if (type.includes("png") || name.endsWith(".png")) {
      embedded = await pdfDoc.embedPng(buf);
    } else if (
      type.includes("jpeg") ||
      type.includes("jpg") ||
      name.endsWith(".jpg") ||
      name.endsWith(".jpeg")
    ) {
      embedded = await pdfDoc.embedJpg(buf);
    } else {
      const pngBytes = await fileToPngBytes(file);
      embedded = await pdfDoc.embedPng(pngBytes);
    }

    const iw = embedded.width;
    const ih = embedded.height;
    const fit = options.fit || "a4";

    if (fit === "original") {
      const page = pdfDoc.addPage([iw, ih]);
      page.drawImage(embedded, { x: 0, y: 0, width: iw, height: ih });
    } else {
      const a4 = PageSizes.A4;
      const pw = a4[0];
      const ph = a4[1];
      const page = pdfDoc.addPage([pw, ph]);
      const scale = Math.min(pw / iw, ph / ih);
      const wDraw = iw * scale;
      const hDraw = ih * scale;
      const x = (pw - wDraw) / 2;
      const y = (ph - hDraw) / 2;
      page.drawImage(embedded, { x, y, width: wDraw, height: hDraw });
    }

    return Encrypt.finalizePdfBytes(
      pdfDoc,
      options.encrypt,
      options.password || ""
    );
  }

  w.PdfMasterImage = { imageFileToPdfBytes };
})(typeof window !== "undefined" ? window : globalThis);
