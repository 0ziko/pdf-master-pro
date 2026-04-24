/* global window */
(function (w) {
  const Encrypt = w.PdfMasterEncrypt;

  /**
   * @param {File[]} files sıra korunur
   * @param {{ encrypt: boolean; password: string; srcPassword?: string }} options
   * @returns {Promise<Uint8Array>}
   */
  async function mergePdfFiles(files, options) {
    const { PDFDocument } = w.PDFLib;
    const Decrypt = w.PdfMasterDecrypt;
    const merged = await PDFDocument.create();

    for (const file of files) {
      const src = await Decrypt.loadPdfDoc(file, options.srcPassword || "");
      const indices = src.getPageIndices();
      const copied = await merged.copyPages(src, indices);
      copied.forEach((p) => merged.addPage(p));
    }

    return Encrypt.finalizePdfBytes(merged, options.encrypt, options.password || "");
  }

  w.PdfMasterMerge = { mergePdfFiles };
})(typeof window !== "undefined" ? window : globalThis);
