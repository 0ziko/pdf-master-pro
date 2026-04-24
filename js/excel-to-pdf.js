/* global window, XLSX */
(function (w) {
  const Fonts = w.PdfMasterFonts;
  const Encrypt = w.PdfMasterEncrypt;

  /**
   * @param {File} file
   * @param {{ encrypt: boolean; password: string; landscape?: boolean }} options
   * @returns {Promise<Uint8Array>}
   */
  async function excelFileToPdfBytes(file, options) {
    const { jsPDF } = w.jspdf;
    const landscape = options.landscape !== false;
    const doc = new jsPDF({
      orientation: landscape ? "l" : "p",
      unit: "mm",
      format: "a4",
    });

    await Fonts.ensureDejaVuFonts(doc);
    const font = Fonts.family;

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const firstName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstName];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

    if (!jsonData.length) {
      doc.setFont(font, "normal");
      doc.text("Sayfa boş veya okunamadı.", 20, 20);
    } else {
      const head = jsonData[0].map((c) => (c == null ? "" : String(c)));
      const body = jsonData.slice(1).map((row) =>
        row.map((c) => (c == null ? "" : String(c)))
      );

      doc.autoTable({
        head: [head],
        body,
        styles: {
          font,
          fontStyle: "normal",
          fontSize: 8,
          cellPadding: 2,
          overflow: "linebreak",
        },
        headStyles: {
          font,
          fontStyle: "bold",
          fillColor: [79, 70, 229],
          textColor: 255,
        },
        bodyStyles: { font, fontStyle: "normal" },
        margin: { top: 12, left: 8, right: 8 },
        tableWidth: "auto",
        showHead: "everyPage",
      });
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

  w.PdfMasterExcel = { excelFileToPdfBytes };
})(typeof window !== "undefined" ? window : globalThis);
