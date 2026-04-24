/* global window */
(function (w) {
  /**
   * @param {ArrayBuffer} buffer
   * @returns {string}
   */
  function arrayBufferToBinaryString(buffer) {
    const bytes = new Uint8Array(buffer);
    const chunk = 0x8000;
    let binary = "";
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    return binary;
  }

  /**
   * @param {string} name
   */
  function baseName(name) {
    const i = name.lastIndexOf(".");
    return i === -1 ? name : name.slice(0, i);
  }

  /**
   * @param {BlobPart} data
   * @param {string} filename
   */
  function downloadBlob(data, filename) {
    const blob =
      data instanceof Blob
        ? data
        : new Blob([data], { type: "application/pdf" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }

  /**
   * PDF 1.4–1.7 şifre motoru (Rev 2–4) şifrede byte > 255 kabul etmez.
   * @param {string} s
   */
  function passwordNeedsAsciiNote(s) {
    for (let i = 0; i < s.length; i++) {
      const c = s.charCodeAt(i);
      if (c > 0xff) return true;
    }
    return false;
  }

  /**
   * @param {File} file
   * @returns {Promise<ArrayBuffer>}
   */
  function readFileArrayBuffer(file) {
    return file.arrayBuffer();
  }

  w.PdfMasterUtils = {
    arrayBufferToBinaryString,
    baseName,
    downloadBlob,
    passwordNeedsAsciiNote,
    readFileArrayBuffer,
  };
})(typeof window !== "undefined" ? window : globalThis);
