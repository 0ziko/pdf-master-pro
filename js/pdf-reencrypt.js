/* global window */
(function (w) {
  const Encrypt = w.PdfMasterEncrypt;

  /**
   * Açık PDF'i yükle, isteğe bağlı yeni şifre uygula, bayt döndür.
   * @param {File} file
   * @param {{ encrypt: boolean; password: string }} options
   * @returns {Promise<Uint8Array>}
   */
  async function reencryptPdfFile(file, options) {
    const { PDFDocument } = w.PDFLib;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const pdfDoc = await PDFDocument.load(bytes);
    return Encrypt.finalizePdfBytes(
      pdfDoc,
      options.encrypt,
      options.password || ""
    );
  }

  w.PdfMasterReencrypt = { reencryptPdfFile };
})(typeof window !== "undefined" ? window : globalThis);
