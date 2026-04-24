/* global window */
(function (w) {
  /**
   * pdf-lib-plus-encrypt: önce `encrypt()`, sonra `save()`.
   * Resmi pdf-lib 1.17'de `save({ userPassword })` yoktur — bu yüzden şifre çalışmıyordu.
   *
   * @param {object} pdfDoc PDFLib.PDFDocument
   * @param {string} userPassword
   * @param {object} [opts]
   * @param {boolean} [opts.restrictCopy=true]
   */
  async function encryptDocument(pdfDoc, userPassword, opts) {
    const restrict = opts && opts.restrictCopy === false ? false : true;

    await pdfDoc.encrypt({
      userPassword,
      permissions: restrict
        ? {
            printing: "highResolution",
            modifying: false,
            copying: false,
            annotating: false,
            fillingForms: false,
            contentAccessibility: true,
            documentAssembly: false,
          }
        : {
            printing: "highResolution",
            modifying: true,
            copying: true,
            annotating: true,
            fillingForms: true,
            contentAccessibility: true,
            documentAssembly: true,
          },
    });
  }

  /**
   * @param {object} pdfDoc PDFLib.PDFDocument
   * @param {boolean} enabled
   * @param {string} password
   * @param {object} [saveExtra] save() ek seçenekleri
   */
  async function finalizePdfBytes(pdfDoc, enabled, password, saveExtra) {
    const saveOpts = Object.assign(
      { useObjectStreams: false, updateFieldAppearances: true },
      saveExtra || {}
    );
    if (enabled && password) {
      await encryptDocument(pdfDoc, password, { restrictCopy: true });
    }
    return pdfDoc.save(saveOpts);
  }

  w.PdfMasterEncrypt = {
    encryptDocument,
    finalizePdfBytes,
  };
})(typeof window !== "undefined" ? window : globalThis);
