/* global document, window */
(function () {
  const U = window.PdfMasterUtils;
  const Excel = window.PdfMasterExcel;
  const Img = window.PdfMasterImage;
  const Merge = window.PdfMasterMerge;
  const Split = window.PdfMasterSplit;
  const Reencrypt = window.PdfMasterReencrypt;

  /* ── Tabs ─────────────────────────────────────────────── */
  const tabs   = Array.from(document.querySelectorAll("[data-tab]"));
  const panels = Array.from(document.querySelectorAll("[data-panel]"));

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const id = tab.getAttribute("data-tab");
      tabs.forEach((t) => t.classList.toggle("tab-active", t === tab));
      panels.forEach((p) => {
        p.classList.toggle("is-visible", p.getAttribute("data-panel") === id);
      });
    });
  });

  /* ── Encrypt banner ───────────────────────────────────── */
  const encryptCheck  = document.getElementById("globalEncrypt");
  const passInput     = document.getElementById("globalPassword");
  const passNote      = document.getElementById("passwordAsciiNote");
  const passWrap      = document.getElementById("passWrap");
  const encryptBanner = document.getElementById("encryptBanner");
  const encryptLabel  = document.getElementById("encryptLabel");
  const toggleTrack   = document.getElementById("toggleTrack");

  /* Label tıklaması input'u toggle eder; biz görsel senkronu JS ile yaparız */
  document.getElementById("toggleTrack")?.addEventListener("click", () => {
    if (encryptCheck) encryptCheck.checked = !encryptCheck.checked;
    syncEncryptUI();
  });

  function syncEncryptUI() {
    const on = !!(encryptCheck && encryptCheck.checked);

    if (toggleTrack)   toggleTrack.classList.toggle("is-on", on);
    if (encryptBanner) encryptBanner.classList.toggle("is-active", on);
    if (encryptLabel)  encryptLabel.textContent = on ? "Şifreleme açık" : "Şifreleme kapalı";
    if (passWrap)      passWrap.classList.toggle("open", on);

    const pw = passInput ? passInput.value : "";
    if (passNote) {
      passNote.style.display =
        on && pw && U.passwordNeedsAsciiNote(pw) ? "block" : "none";
    }
  }

  passInput?.addEventListener("input", syncEncryptUI);
  syncEncryptUI();

  function readEncryptOptions() {
    return {
      encrypt:  !!(encryptCheck && encryptCheck.checked),
      password: (passInput && passInput.value) || "",
    };
  }

  /* ── Helpers ──────────────────────────────────────────── */
  function showStatus(dotEl, textEl, name) {
    if (!dotEl) return;
    dotEl.style.display = "inline-flex";
    if (textEl) textEl.textContent = name;
  }

  function setBusy(btn, busy) {
    if (!btn) return;
    const idle = btn.dataset.labelIdle || btn.textContent;
    btn.disabled = !!busy;
    if (busy) {
      btn.innerHTML = `<svg style="width:17px;height:17px;animation:spin .8s linear infinite;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> İşleniyor…`;
    } else {
      btn.dataset.labelIdle = idle;
      btn.textContent = idle;
    }
  }

  /* spinner keyframe */
  const style = document.createElement("style");
  style.textContent = "@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}";
  document.head.appendChild(style);

  function wireDropzone(zoneId, inputId, onFiles) {
    const zone  = document.getElementById(zoneId);
    const input = document.getElementById(inputId);
    if (!zone || !input) return;

    zone.addEventListener("click", () => input.click());
    input.addEventListener("change", () => {
      if (input.files && input.files.length) onFiles(input.files);
    });
    ["dragenter", "dragover"].forEach((ev) =>
      zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.add("dragover"); })
    );
    ["dragleave", "drop"].forEach((ev) =>
      zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.remove("dragover"); })
    );
    zone.addEventListener("drop", (e) => {
      const fl = e.dataTransfer && e.dataTransfer.files;
      if (fl && fl.length) onFiles(fl);
    });
  }

  /* ── Excel ────────────────────────────────────────────── */
  let excelFile = null;
  const excelStatusEl   = document.getElementById("excelStatus");
  const excelStatusText = document.getElementById("excelStatusText");
  const excelBtn        = document.getElementById("excelRun");

  wireDropzone("excelDrop", "excelInput", (files) => {
    excelFile = files[0];
    showStatus(excelStatusEl, excelStatusText, excelFile.name);
  });

  excelBtn?.addEventListener("click", async () => {
    if (!excelFile) return alert("Önce bir Excel dosyası seç.");
    const enc = readEncryptOptions();
    if (enc.encrypt && !enc.password) return alert("Şifreleme açıkken şifre gerekli.");
    setBusy(excelBtn, true);
    try {
      const bytes = await Excel.excelFileToPdfBytes(excelFile, { ...enc, landscape: true });
      U.downloadBlob(bytes, U.baseName(excelFile.name) + ".pdf");
    } catch (e) {
      console.error(e); alert(e.message || String(e));
    } finally { setBusy(excelBtn, false); }
  });

  /* ── Image ────────────────────────────────────────────── */
  let imageFile = null;
  const imageStatusEl   = document.getElementById("imageStatus");
  const imageStatusText = document.getElementById("imageStatusText");
  const imageBtn        = document.getElementById("imageRun");
  const imageFitInput   = document.getElementById("imageFit");

  wireDropzone("imageDrop", "imageInput", (files) => {
    imageFile = files[0];
    showStatus(imageStatusEl, imageStatusText, imageFile.name);
  });

  imageBtn?.addEventListener("click", async () => {
    if (!imageFile) return alert("Bir görsel seç.");
    const enc = readEncryptOptions();
    if (enc.encrypt && !enc.password) return alert("Şifreleme açıkken şifre gerekli.");
    setBusy(imageBtn, true);
    try {
      const fit = imageFitInput && imageFitInput.value === "original" ? "original" : "a4";
      const bytes = await Img.imageFileToPdfBytes(imageFile, { ...enc, fit });
      U.downloadBlob(bytes, U.baseName(imageFile.name) + ".pdf");
    } catch (e) {
      console.error(e); alert(e.message || String(e));
    } finally { setBusy(imageBtn, false); }
  });

  /* ── Merge ────────────────────────────────────────────── */
  let mergeFiles = [];
  const mergeList = document.getElementById("mergeList");
  const mergeBtn  = document.getElementById("mergeRun");

  function renderMergeList() {
    if (!mergeList) return;
    mergeList.innerHTML = "";
    if (!mergeFiles.length) {
      mergeList.innerHTML = `<p class="notice" style="text-align:center;">Eklenecek PDF yok.</p>`;
      return;
    }
    mergeFiles.forEach((f, i) => {
      const row = document.createElement("div");
      row.className = "file-chip";
      row.innerHTML = `<span class="file-chip-num">${i + 1}</span><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${f.name}</span>`;
      mergeList.appendChild(row);
    });
  }

  wireDropzone("mergeDrop", "mergeInput", (files) => {
    mergeFiles = mergeFiles.concat(
      Array.from(files).filter((f) => /\.pdf$/i.test(f.name))
    );
    renderMergeList();
  });

  document.getElementById("mergeClear")?.addEventListener("click", () => {
    mergeFiles = []; renderMergeList();
  });

  mergeBtn?.addEventListener("click", async () => {
    if (mergeFiles.length < 2) return alert("En az iki PDF gerekli.");
    const enc = readEncryptOptions();
    if (enc.encrypt && !enc.password) return alert("Şifreleme açıkken şifre gerekli.");
    setBusy(mergeBtn, true);
    try {
      const bytes = await Merge.mergePdfFiles(mergeFiles, enc);
      U.downloadBlob(bytes, "birlesik.pdf");
    } catch (e) {
      console.error(e); alert(e.message || String(e));
    } finally { setBusy(mergeBtn, false); }
  });

  /* ── Split ────────────────────────────────────────────── */
  let splitFile = null;
  const splitStatusEl   = document.getElementById("splitStatus");
  const splitStatusText = document.getElementById("splitStatusText");
  const splitBtn        = document.getElementById("splitRun");
  const splitMode       = document.getElementById("splitMode");
  const splitRanges     = document.getElementById("splitRanges");
  const splitRangesRow  = document.getElementById("splitRangesRow");

  splitMode?.addEventListener("change", () => {
    if (splitRangesRow)
      splitRangesRow.style.display = splitMode.value === "ranges" ? "block" : "none";
  });

  wireDropzone("splitDrop", "splitInput", (files) => {
    splitFile = files[0];
    showStatus(splitStatusEl, splitStatusText, splitFile.name);
  });

  splitBtn?.addEventListener("click", async () => {
    if (!splitFile) return alert("Bir PDF seç.");
    const mode = splitMode?.value === "ranges" ? "ranges" : "each";
    const rangesText = splitRanges?.value || "";
    if (mode === "ranges" && !rangesText.trim()) return alert("Aralık yaz — örn: 1-3,5");
    setBusy(splitBtn, true);
    try {
      const blob = await Split.splitPdf(splitFile, mode, rangesText);
      U.downloadBlob(blob, U.baseName(splitFile.name) + "-ayrilmis.zip");
    } catch (e) {
      console.error(e); alert(e.message || String(e));
    } finally { setBusy(splitBtn, false); }
  });

  /* ── Encrypt only ─────────────────────────────────────── */
  let encFile = null;
  const encStatusEl   = document.getElementById("encStatus");
  const encStatusText = document.getElementById("encStatusText");
  const encBtn        = document.getElementById("encRun");

  wireDropzone("encDrop", "encInput", (files) => {
    encFile = files[0];
    showStatus(encStatusEl, encStatusText, encFile.name);
  });

  encBtn?.addEventListener("click", async () => {
    if (!encFile) return alert("Bir PDF seç.");
    const enc = readEncryptOptions();
    if (!enc.encrypt || !enc.password)
      return alert("Üstteki şifreleme anahtarını aç ve şifre yaz.");
    setBusy(encBtn, true);
    try {
      const bytes = await Reencrypt.reencryptPdfFile(encFile, enc);
      U.downloadBlob(bytes, U.baseName(encFile.name) + "-kilitli.pdf");
    } catch (e) {
      console.error(e); alert(e.message || String(e));
    } finally { setBusy(encBtn, false); }
  });
})();
