/* global window */
(function (w) {
  const Encrypt = w.PdfMasterEncrypt;

  /**
   * @param {File} file
   * @param {{ encrypt: boolean; password: string; srcPassword?: string }} options
   * @returns {Promise<Uint8Array>}
   */
  async function reencryptPdfFile(file, options) {
    const Decrypt = w.PdfMasterDecrypt;
    const pdfDoc = await Decrypt.loadPdfDoc(file, options.srcPassword || "");
    return Encrypt.finalizePdfBytes(pdfDoc, options.encrypt, options.password || "");
  }

  w.PdfMasterReencrypt = { reencryptPdfFile };
})(typeof window !== "undefined" ? window : globalThis);
