/* global window, TextEncoder */
(function (w) {
  /**
   * @param {File} file
   * @returns {Promise<string>}
   */
  async function extractFullTextFromPdf(file) {
    const pdfjsLib = w.pdfjsLib;
    if (!pdfjsLib) {
      throw new Error("PDF.js not loaded.");
    }
    const buf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    const parts = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const tc = await page.getTextContent();
      const pageText = tc.items.map((it) => it.str).join(" ");
      parts.push(pageText);
    }
    return parts.join("\n\n").trim();
  }

  /**
   * One CSV column per text line (UTF-8 BOM for Excel).
   * @param {string} text
   * @returns {Uint8Array}
   */
  function textToCsvUtf8Bytes(text) {
    const lines = text.split(/\r\n|\r|\n/);
    const rows = lines.map((line) => '"' + String(line).replace(/"/g, '""') + '"');
    const csv = "\ufeff" + rows.join("\r\n");
    return new TextEncoder().encode(csv);
  }

  /**
   * Minimal RTF with Unicode escapes (opens in Word).
   * @param {string} text
   * @returns {Uint8Array}
   */
  function textToRtfBytes(text) {
    function escapeChar(cp) {
      if (cp === 92) return "\\\\";
      if (cp === 123) return "\\{";
      if (cp === 125) return "\\}";
      if (cp < 128) return String.fromCharCode(cp);
      const signed = cp > 32767 ? cp - 65536 : cp;
      return "\\u" + signed + "?";
    }

    function escapeLine(s) {
      let out = "";
      for (let i = 0; i < s.length; ) {
        const cp = s.codePointAt(i);
        i += cp > 0xffff ? 2 : 1;
        if (cp === 10 || cp === 13) continue;
        if (cp <= 0xffff) out += escapeChar(cp);
        else {
          const h = (cp - 0x10000) >> 10;
          const l = (cp - 0x10000) & 0x3ff;
          const cu1 = 0xd800 + h;
          const cu2 = 0xdc00 + l;
          out += escapeChar(cu1);
          out += escapeChar(cu2);
        }
      }
      return out;
    }

    const lines = text.split(/\r\n|\r|\n/);
    const body = lines.map((line) => escapeLine(line)).join("\\par\r\n");
    const rtf =
      "{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0 Arial;}}\\f0\\fs24 " + body + "}";
    return new TextEncoder().encode(rtf);
  }

  /**
   * @param {File} file
   * @returns {Promise<Uint8Array>}
   */
  async function pdfFileToCsvBytes(file) {
    const text = await extractFullTextFromPdf(file);
    return textToCsvUtf8Bytes(text.length ? text : "");
  }

  /**
   * @param {File} file
   * @returns {Promise<Uint8Array>}
   */
  async function pdfFileToRtfBytes(file) {
    const text = await extractFullTextFromPdf(file);
    return textToRtfBytes(text.length ? text : " ");
  }

  w.PdfMasterPdfExtract = {
    extractFullTextFromPdf,
    pdfFileToCsvBytes,
    pdfFileToRtfBytes,
  };
})(typeof window !== "undefined" ? window : globalThis);
