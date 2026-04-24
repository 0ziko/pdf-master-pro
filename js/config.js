/* global window */
(function (w) {
  w.PdfMasterConfig = {
    /** DejaVu Sans — Türkçe ve Unicode tablo metni için (SIL Open Font License) */
    dejaVuSansUrl:
      "https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans.ttf",
    dejaVuSansBoldUrl:
      "https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans-Bold.ttf",
    fontFamilyName: "DejaVuSans",
    /** PDF şifreleme: pdf-lib 1.17 şifrelemez; bu paket `encrypt()` + `save()` kullanır */
    pdfLibScript:
      "https://unpkg.com/pdf-lib-plus-encrypt@1.1.0/dist/pdf-lib-plus-encrypt.min.js",
  };
})(typeof window !== "undefined" ? window : globalThis);
