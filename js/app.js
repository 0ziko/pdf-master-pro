/* global document, window */
(function () {
  const U = window.PdfMasterUtils;
  const Excel = window.PdfMasterExcel;
  const Image = window.PdfMasterImage;
  const Merge = window.PdfMasterMerge;
  const Split = window.PdfMasterSplit;
  const Reencrypt = window.PdfMasterReencrypt;

  const tabs = Array.from(document.querySelectorAll("[data-tab]"));
  const panels = Array.from(document.querySelectorAll("[data-panel]"));

  const encryptCheck = document.getElementById("globalEncrypt");
  const passInput = document.getElementById("globalPassword");
  const passNote = document.getElementById("passwordAsciiNote");

  function readEncryptOptions() {
    const encrypt = !!(encryptCheck && encryptCheck.checked);
    const password = (passInput && passInput.value) || "";
    if (passNote) {
      const warn = encrypt && password && U.passwordNeedsAsciiNote(password);
      passNote.classList.toggle("hidden", !warn);
    }
    return { encrypt, password };
  }

  function setBusy(btn, busy, labelBusy, labelIdle) {
    if (!btn) return;
    btn.disabled = !!busy;
    btn.textContent = busy ? labelBusy : labelIdle;
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const id = tab.getAttribute("data-tab");
      tabs.forEach((t) => t.classList.toggle("tab-active", t === tab));
      panels.forEach((p) => {
        p.classList.toggle("is-visible", p.getAttribute("data-panel") === id);
      });
    });
  });

  function wireDropzone(zoneId, inputId, onFiles) {
    const zone = document.getElementById(zoneId);
    const input = document.getElementById(inputId);
    if (!zone || !input) return;

    zone.addEventListener("click", () => input.click());
    input.addEventListener("change", () => {
      if (input.files && input.files.length) onFiles(input.files);
    });
    ["dragenter", "dragover"].forEach((ev) => {
      zone.addEventListener(ev, (e) => {
        e.preventDefault();
        zone.classList.add("dragover");
      });
    });
    ["dragleave", "drop"].forEach((ev) => {
      zone.addEventListener(ev, (e) => {
        e.preventDefault();
        zone.classList.remove("dragover");
      });
    });
    zone.addEventListener("drop", (e) => {
      const fl = e.dataTransfer && e.dataTransfer.files;
      if (fl && fl.length) onFiles(fl);
    });
  }

  /** --- Excel --- */
  const excelStatus = document.getElementById("excelStatus");
  const excelBtn = document.getElementById("excelRun");
  let excelFile = null;

  function renderExcelStatus(name) {
    if (!excelStatus) return;
    excelStatus.textContent = name ? `Seçili: ${name}` : "Henüz dosya yok.";
  }

  wireDropzone("excelDrop", "excelInput", (files) => {
    excelFile = files[0];
    renderExcelStatus(excelFile.name);
  });

  if (excelBtn) {
    excelBtn.addEventListener("click", async () => {
      if (!excelFile) {
        alert("Önce bir Excel dosyası seç.");
        return;
      }
      const enc = readEncryptOptions();
      if (enc.encrypt && !enc.password) {
        alert("Şifreleme açıkken şifre gerekli.");
        return;
      }
      setBusy(excelBtn, true, "İşleniyor…", excelBtn.dataset.labelIdle || "PDF indir");
      try {
        const bytes = await Excel.excelFileToPdfBytes(excelFile, {
          encrypt: enc.encrypt,
          password: enc.password,
          landscape: true,
        });
        U.downloadBlob(bytes, U.baseName(excelFile.name) + ".pdf");
      } catch (e) {
        console.error(e);
        alert(e.message || String(e));
      } finally {
        setBusy(
          excelBtn,
          false,
          "",
          excelBtn.dataset.labelIdle || "PDF indir"
        );
      }
    });
  }

  /** --- Image --- */
  const imageStatus = document.getElementById("imageStatus");
  const imageBtn = document.getElementById("imageRun");
  const imageFit = document.getElementById("imageFit");
  let imageFile = null;

  wireDropzone("imageDrop", "imageInput", (files) => {
    imageFile = files[0];
    if (imageStatus) imageStatus.textContent = imageFile ? imageFile.name : "";
  });

  if (imageBtn) {
    imageBtn.addEventListener("click", async () => {
      if (!imageFile) {
        alert("Bir görsel seç.");
        return;
      }
      const enc = readEncryptOptions();
      if (enc.encrypt && !enc.password) {
        alert("Şifreleme açıkken şifre gerekli.");
        return;
      }
      setBusy(imageBtn, true, "İşleniyor…", imageBtn.dataset.labelIdle || "PDF indir");
      try {
        const fit =
          imageFit && imageFit.value === "original" ? "original" : "a4";
        const bytes = await Image.imageFileToPdfBytes(imageFile, {
          encrypt: enc.encrypt,
          password: enc.password,
          fit,
        });
        U.downloadBlob(bytes, U.baseName(imageFile.name) + ".pdf");
      } catch (e) {
        console.error(e);
        alert(e.message || String(e));
      } finally {
        setBusy(
          imageBtn,
          false,
          "",
          imageBtn.dataset.labelIdle || "PDF indir"
        );
      }
    });
  }

  /** --- Merge --- */
  const mergeList = document.getElementById("mergeList");
  const mergeBtn = document.getElementById("mergeRun");
  let mergeFiles = [];

  function renderMergeList() {
    if (!mergeList) return;
    mergeList.innerHTML = "";
    if (!mergeFiles.length) {
      mergeList.textContent = "PDF dosyalarını ekleyin (sıra korunur).";
      return;
    }
    mergeFiles.forEach((f, i) => {
      const row = document.createElement("div");
      row.className =
        "file-chip rounded-xl px-3 py-2 text-sm flex justify-between gap-2";
      row.innerHTML = `<span class="truncate">${i + 1}. ${f.name}</span>`;
      mergeList.appendChild(row);
    });
  }

  wireDropzone("mergeDrop", "mergeInput", (files) => {
    const pdfs = Array.from(files).filter((f) =>
      /\.pdf$/i.test(f.name)
    );
    mergeFiles = mergeFiles.concat(pdfs);
    renderMergeList();
  });

  document.getElementById("mergeClear")?.addEventListener("click", () => {
    mergeFiles = [];
    renderMergeList();
  });

  if (mergeBtn) {
    mergeBtn.addEventListener("click", async () => {
      if (mergeFiles.length < 2) {
        alert("Birleştirmek için en az iki PDF gerekli.");
        return;
      }
      const enc = readEncryptOptions();
      if (enc.encrypt && !enc.password) {
        alert("Şifreleme açıkken şifre gerekli.");
        return;
      }
      setBusy(mergeBtn, true, "Birleştiriliyor…", mergeBtn.dataset.labelIdle || "İndir");
      try {
        const bytes = await Merge.mergePdfFiles(mergeFiles, enc);
        U.downloadBlob(bytes, "birlesik.pdf");
      } catch (e) {
        console.error(e);
        alert(e.message || String(e));
      } finally {
        setBusy(
          mergeBtn,
          false,
          "",
          mergeBtn.dataset.labelIdle || "İndir"
        );
      }
    });
  }

  /** --- Split --- */
  const splitStatus = document.getElementById("splitStatus");
  const splitBtn = document.getElementById("splitRun");
  const splitMode = document.getElementById("splitMode");
  const splitRanges = document.getElementById("splitRanges");
  let splitFile = null;

  wireDropzone("splitDrop", "splitInput", (files) => {
    splitFile = files[0];
    if (splitStatus) splitStatus.textContent = splitFile ? splitFile.name : "";
  });

  function toggleRangesField() {
    const rangesRow = document.getElementById("splitRangesRow");
    if (!rangesRow || !splitMode) return;
    rangesRow.classList.toggle("hidden", splitMode.value !== "ranges");
  }
  splitMode?.addEventListener("change", toggleRangesField);
  toggleRangesField();

  if (splitBtn) {
    splitBtn.addEventListener("click", async () => {
      if (!splitFile) {
        alert("Bir PDF seç.");
        return;
      }
      setBusy(splitBtn, true, "Ayırılıyor…", splitBtn.dataset.labelIdle || "ZIP indir");
      try {
        const mode = splitMode && splitMode.value === "ranges" ? "ranges" : "each";
        const rangesText = splitRanges ? splitRanges.value : "";
        if (mode === "ranges" && !rangesText.trim()) {
          alert("Aralık modunda örn. 1-3,5 yazın.");
          setBusy(splitBtn, false, "", splitBtn.dataset.labelIdle || "ZIP indir");
          return;
        }
        const blob = await Split.splitPdf(splitFile, mode, rangesText);
        U.downloadBlob(blob, U.baseName(splitFile.name) + "-ayrilmis.zip");
      } catch (e) {
        console.error(e);
        alert(e.message || String(e));
      } finally {
        setBusy(
          splitBtn,
          false,
          "",
          splitBtn.dataset.labelIdle || "ZIP indir"
        );
      }
    });
  }

  /** --- Encrypt only --- */
  const encStatus = document.getElementById("encStatus");
  const encBtn = document.getElementById("encRun");
  let encFile = null;

  wireDropzone("encDrop", "encInput", (files) => {
    encFile = files[0];
    if (encStatus) encStatus.textContent = encFile ? encFile.name : "";
  });

  if (encBtn) {
    encBtn.addEventListener("click", async () => {
      if (!encFile) {
        alert("PDF seç.");
        return;
      }
      const enc = readEncryptOptions();
      if (!enc.encrypt || !enc.password) {
        alert("Bu sekmede çıktı şifreli olmalı: üstteki şifrelemeyi aç ve şifre yaz.");
        return;
      }
      setBusy(encBtn, true, "Şifreleniyor…", encBtn.dataset.labelIdle || "İndir");
      try {
        const bytes = await Reencrypt.reencryptPdfFile(encFile, enc);
        U.downloadBlob(bytes, U.baseName(encFile.name) + "-kilitli.pdf");
      } catch (e) {
        console.error(e);
        alert(e.message || String(e));
      } finally {
        setBusy(encBtn, false, "", encBtn.dataset.labelIdle || "İndir");
      }
    });
  }

  /** idle labels on buttons */
  document.querySelectorAll("[data-label-idle]").forEach((btn) => {
    btn.dataset.labelIdle =
      btn.getAttribute("data-label-idle") || btn.textContent;
  });

  encryptCheck?.addEventListener("change", readEncryptOptions);
  passInput?.addEventListener("input", readEncryptOptions);
  readEncryptOptions();
})();
