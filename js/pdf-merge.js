/* global window */
(function (w) {
  const Encrypt = w.PdfMasterEncrypt;

  /**
   * @param {File[]} files sıra korunur
   * @param {{ encrypt: boolean; password: string }} options
   * @returns {Promise<Uint8Array>}
   */
  async function mergePdfFiles(files, options) {
    const { PDFDocument } = w.PDFLib;
    const merged = await PDFDocument.create();

    for (const file of files) {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const src = await PDFDocument.load(bytes);
      const indices = src.getPageIndices();
      const copied = await merged.copyPages(src, indices);
      copied.forEach((p) => merged.addPage(p));
    }

    return Encrypt.finalizePdfBytes(
      merged,
      options.encrypt,
      options.password || ""
    );
  }

  w.PdfMasterMerge = { mergePdfFiles };
})(typeof window !== "undefined" ? window : globalThis);
