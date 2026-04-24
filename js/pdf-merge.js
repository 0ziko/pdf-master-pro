/* global window */
(function (w) {
  const Encrypt = w.PdfMasterEncrypt;

  /**
   * @param {File[]} files sıra korunur
   * @param {{ encrypt: boolean; password: string; srcPasswords?: string[] }} options
   *   srcPasswords[i] — files[i] için açılış şifresi (boşsa şifresiz denenir)
   * @returns {Promise<Uint8Array>}
   */
  async function mergePdfFiles(files, options) {
    const { PDFDocument } = w.PDFLib;
    const Decrypt = w.PdfMasterDecrypt;
    const passwords = options.srcPasswords || [];
    const merged = await PDFDocument.create();

    for (let i = 0; i < files.length; i++) {
      const src = await Decrypt.loadPdfDoc(files[i], passwords[i] || "");
      const indices = src.getPageIndices();
      const copied = await merged.copyPages(src, indices);
      copied.forEach((p) => merged.addPage(p));
    }

    return Encrypt.finalizePdfBytes(merged, options.encrypt, options.password || "");
  }

  w.PdfMasterMerge = { mergePdfFiles };
})(typeof window !== "undefined" ? window : globalThis);
