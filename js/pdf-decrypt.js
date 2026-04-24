/* global window, document */
(function (w) {
  /**
   * PDF dosyasını yükler.
   * - Şifresiz PDF'ler doğrudan pdf-lib ile yüklenir (vektör/metin korunur).
   * - Şifreli PDF'ler PDF.js ile sayfalar canvas'a render edilir, sonra
   *   her sayfa JPEG olarak yeni bir pdf-lib PDFDocument'e gömülür.
   *   (Metin aranamaz hale gelir; görsel kalite yüksek tutulur.)
   *
   * @param {File} file
   * @param {string} [srcPassword] — şifreli ise açılış şifresi
   * @returns {Promise<PDFDocument>}
   */
  async function loadPdfDoc(file, srcPassword) {
    const { PDFDocument } = w.PDFLib;
    const bytes = new Uint8Array(await file.arrayBuffer());

    try {
      return await PDFDocument.load(bytes);
    } catch (e) {
      const msg = (e && e.message) || String(e);
      if (!msg.toLowerCase().includes("encrypt") && e.name !== "EncryptedPDFError") {
        throw e;
      }
      if (!srcPassword) {
        throw new Error(`"${file.name}" şifreli — kaynak şifresini girin.`);
      }
      return _renderWithPdfJs(bytes, srcPassword, file.name);
    }
  }

  /**
   * PDF.js ile şifreyi çözer, her sayfayı canvas'a render eder,
   * yeni bir pdf-lib PDFDocument olarak döndürür.
   */
  async function _renderWithPdfJs(bytes, password, fileName) {
    const pdfjsLib = w.pdfjsLib;
    if (!pdfjsLib) throw new Error("PDF.js yüklenemedi.");

    const { PDFDocument } = w.PDFLib;

    const loadTask = pdfjsLib.getDocument({ data: bytes, password });

    let srcDoc;
    try {
      srcDoc = await loadTask.promise;
    } catch (e) {
      if (e && (e.name === "PasswordException" || (e.message && e.message.toLowerCase().includes("password")))) {
        throw new Error(`"${fileName}" için şifre hatalı veya eksik.`);
      }
      throw e;
    }

    const newDoc = await PDFDocument.create();
    const numPages = srcDoc.numPages;

    for (let i = 1; i <= numPages; i++) {
      const page = await srcDoc.getPage(i);

      const vp1 = page.getViewport({ scale: 1.0 });
      const vp2 = page.getViewport({ scale: 2.0 });

      const canvas = document.createElement("canvas");
      canvas.width  = Math.ceil(vp2.width);
      canvas.height = Math.ceil(vp2.height);
      const ctx = canvas.getContext("2d");

      await page.render({ canvasContext: ctx, viewport: vp2 }).promise;

      const jpegBytes = await _canvasToJpeg(canvas);
      const img = await newDoc.embedJpg(jpegBytes);

      const pdfPage = newDoc.addPage([vp1.width, vp1.height]);
      pdfPage.drawImage(img, { x: 0, y: 0, width: vp1.width, height: vp1.height });
    }

    return newDoc;
  }

  function _canvasToJpeg(canvas) {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        async (blob) => {
          if (!blob) { reject(new Error("Canvas → JPEG dönüşümü başarısız.")); return; }
          resolve(new Uint8Array(await blob.arrayBuffer()));
        },
        "image/jpeg",
        0.92
      );
    });
  }

  w.PdfMasterDecrypt = { loadPdfDoc };
})(typeof window !== "undefined" ? window : globalThis);
