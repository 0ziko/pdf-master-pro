/* global document, window */
(function () {
  const U     = window.PdfMasterUtils;
  const Excel = window.PdfMasterExcel;
  const Img   = window.PdfMasterImage;
  const Merge = window.PdfMasterMerge;
  const Split = window.PdfMasterSplit;
  const Reenc = window.PdfMasterReencrypt;

  function t(key) {
    return window.PdfMasterI18n ? window.PdfMasterI18n.t(key) : key;
  }

  /* ── Snake mascot ──────────────────────────────────── */
  let snake = null;
  window.addEventListener("load", () => {
    if (window.SnakeMascot) {
      snake = new window.SnakeMascot("snakeCanvas");
      window.snakeMascot = snake;
      _setCaption("idle");
    }
  });

  const CAPTIONS = {
    en: {
      idle:          "Drop a file and watch the magic! 🐍",
      eating:        "CHOMP CHOMP CHOMP… 😋",
      "snacking":    "CHOMP! Tasty file! 😄",
      digesting:     "Mmm… crunching your file…",
      spitting:      "✨ Almost ready…",
      happy:         "🎉 DONE! Wasn't that fun?",
      "snack-happy": "Yummy! Drop more to keep going! 😄",
    },
    tr: {
      idle:          "Bir dosya bırak, sihri izle! 🐍",
      eating:        "ÇIĞNIYORUM ÇIĞNIYORUM… 😋",
      "snacking":    "ÇIĞN! Lezzetli dosya! 😄",
      digesting:     "Mmm… dosyan işleniyor…",
      spitting:      "✨ Neredeyse hazır…",
      happy:         "🎉 BİTTİ! Eğlenceli değil miydi?",
      "snack-happy": "Nefis! Daha fazla dosya bırak! 😄",
    },
  };

  function _setCaption(state) {
    const el = document.getElementById("snakeCaption");
    if (!el) return;
    const lang = window.PdfMasterI18n ? window.PdfMasterI18n.getLang() : "en";
    const map = CAPTIONS[lang] || CAPTIONS.en;
    el.textContent = map[state] || "";
  }

  /** Wraps a processing fn with snake animation + caption */
  async function withSnake(btn, fn) {
    setBusy(btn, true);
    if (snake) {
      _setCaption("eating");
      try {
        const result = await snake.processStart(async () => {
          _setCaption("digesting");
          const r = await fn();
          _setCaption("spitting");
          return r;
        });
        _setCaption("happy");
        setTimeout(() => _setCaption("idle"), 6000);
        return result;
      } catch (e) {
        _setCaption("idle");
        throw e;
      } finally {
        setBusy(btn, false);
      }
    } else {
      try {
        return await fn();
      } finally {
        setBusy(btn, false);
      }
    }
  }

  /* ── Tabs ──────────────────────────────────────────── */
  const tabs   = Array.from(document.querySelectorAll("[data-tab]"));
  const panels = Array.from(document.querySelectorAll("[data-panel]"));

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const id = tab.getAttribute("data-tab");
      tabs.forEach((t2) => t2.classList.toggle("tab-active", t2 === tab));
      panels.forEach((p) =>
        p.classList.toggle("is-visible", p.getAttribute("data-panel") === id)
      );
    });
  });

  /* ── Encrypt banner ────────────────────────────────── */
  const encryptCheck  = document.getElementById("globalEncrypt");
  const passInput     = document.getElementById("globalPassword");
  const passNote      = document.getElementById("passwordAsciiNote");
  const passWrap      = document.getElementById("passWrap");
  const encryptBanner = document.getElementById("encryptBanner");
  const encryptLabel  = document.getElementById("encryptLabel");
  const toggleTrack   = document.getElementById("toggleTrack");

  toggleTrack?.addEventListener("click", () => {
    if (encryptCheck) encryptCheck.checked = !encryptCheck.checked;
    syncEncryptUI();
  });

  function syncEncryptUI() {
    const on = !!(encryptCheck && encryptCheck.checked);
    if (toggleTrack)   toggleTrack.classList.toggle("is-on", on);
    if (encryptBanner) encryptBanner.classList.toggle("is-active", on);
    if (encryptLabel)  encryptLabel.textContent = on ? t("encrypt.on") : t("encrypt.off");
    if (passWrap)      passWrap.classList.toggle("open", on);
    const pw = passInput ? passInput.value : "";
    if (passNote) {
      passNote.style.display =
        on && pw && U.passwordNeedsAsciiNote(pw) ? "block" : "none";
    }
  }

  passInput?.addEventListener("input", syncEncryptUI);
  syncEncryptUI();

  document.addEventListener("langchange", () => {
    syncEncryptUI();
    _setCaption("idle");
  });

  function readEncryptOptions() {
    return {
      encrypt:  !!(encryptCheck && encryptCheck.checked),
      password: (passInput && passInput.value) || "",
    };
  }

  /* ── setBusy ───────────────────────────────────────── */
  const spinnerSVG = `<svg style="width:17px;height:17px;flex-shrink:0;animation:spin .8s linear infinite;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>`;

  const spinStyle = document.createElement("style");
  spinStyle.textContent = "@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}";
  document.head.appendChild(spinStyle);

  function setBusy(btn, busy) {
    if (!btn) return;
    btn.disabled = !!busy;
    const span = btn.querySelector("span[data-i18n]");
    if (span) {
      span.textContent = busy ? t("processing") : t(span.getAttribute("data-i18n"));
    }
    let spinner = btn.querySelector(".btn-spinner");
    if (busy) {
      if (!spinner) {
        const s = document.createElement("span");
        s.className = "btn-spinner";
        s.innerHTML = spinnerSVG;
        btn.insertBefore(s, btn.firstChild);
      }
    } else {
      spinner?.remove();
    }
  }

  function refreshBtnLabels() {
    document.querySelectorAll(".btn-primary[data-i18n-key]").forEach((btn) => {
      const span = btn.querySelector("span[data-i18n]");
      if (span && !btn.disabled) span.textContent = t(span.getAttribute("data-i18n"));
    });
  }

  if (window.PdfMasterI18n) {
    const origSet = window.PdfMasterI18n.setLang;
    window.PdfMasterI18n.setLang = function (lang) {
      origSet(lang);
      syncEncryptUI();
      refreshBtnLabels();
      renderMergeList();
      _setCaption("idle");
    };
  }

  /* ── Dropzone helper ───────────────────────────────── */
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

  function showStatus(dotEl, textEl, name) {
    if (!dotEl) return;
    dotEl.style.display = "inline-flex";
    if (textEl) textEl.textContent = name;
    /* trigger a snack animation for every file that lands on the page */
    if (snake) snake.snackFile();
  }

  /* ── Excel ─────────────────────────────────────────── */
  let excelFile = null;
  const excelStatusEl   = document.getElementById("excelStatus");
  const excelStatusText = document.getElementById("excelStatusText");
  const excelBtn        = document.getElementById("excelRun");

  wireDropzone("excelDrop", "excelInput", (files) => {
    excelFile = files[0];
    showStatus(excelStatusEl, excelStatusText, excelFile.name);
  });

  excelBtn?.addEventListener("click", async () => {
    if (!excelFile) return alert(t("alert.no-excel"));
    const enc = readEncryptOptions();
    if (enc.encrypt && !enc.password) return alert(t("alert.enc-pass"));
    try {
      await withSnake(excelBtn, async () => {
        const bytes = await Excel.excelFileToPdfBytes(excelFile, { ...enc, landscape: true });
        U.downloadBlob(bytes, U.baseName(excelFile.name) + ".pdf");
      });
    } catch (e) { console.error(e); alert(e.message || String(e)); }
  });

  /* ── Image ─────────────────────────────────────────── */
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
    if (!imageFile) return alert(t("alert.no-image"));
    const enc = readEncryptOptions();
    if (enc.encrypt && !enc.password) return alert(t("alert.enc-pass"));
    try {
      await withSnake(imageBtn, async () => {
        const fit = imageFitInput?.value === "original" ? "original" : "a4";
        const bytes = await Img.imageFileToPdfBytes(imageFile, { ...enc, fit });
        U.downloadBlob(bytes, U.baseName(imageFile.name) + ".pdf");
      });
    } catch (e) { console.error(e); alert(e.message || String(e)); }
  });

  /* ── Merge ─────────────────────────────────────────── */
  let mergeFiles = [];
  const mergeList = document.getElementById("mergeList");
  const mergeBtn  = document.getElementById("mergeRun");

  function renderMergeList() {
    if (!mergeList) return;
    mergeList.innerHTML = "";
    if (!mergeFiles.length) {
      mergeList.innerHTML = `<p class="notice" style="text-align:center;">${t("merge.empty")}</p>`;
      return;
    }
    mergeFiles.forEach((f, i) => {
      const row = document.createElement("div");
      row.className = "file-chip";
      row.innerHTML = `
        <span class="file-chip-num">${i + 1}</span>
        <span class="file-chip-name" title="${f.name}">${f.name}</span>
        <input
          type="password"
          class="file-chip-pass"
          data-merge-pass="${i}"
          autocomplete="off"
          placeholder="🔒 ${t("merge.chip.pass")}"
        />
        <button type="button" class="file-chip-del" data-del="${i}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>`;
      mergeList.appendChild(row);
    });

    mergeList.querySelectorAll("[data-del]").forEach((btn2) => {
      btn2.addEventListener("click", (e) => {
        e.stopPropagation();
        mergeFiles.splice(parseInt(btn2.dataset.del, 10), 1);
        renderMergeList();
      });
    });
  }

  wireDropzone("mergeDrop", "mergeInput", (files) => {
    const added = Array.from(files).filter((f) => /\.pdf$/i.test(f.name));
    mergeFiles = mergeFiles.concat(added);
    renderMergeList();
    /* eat once per batch (sequential snacking would overlap) */
    if (snake && added.length) snake.snackFile();
  });

  document.getElementById("mergeClear")?.addEventListener("click", () => {
    mergeFiles = []; renderMergeList();
  });

  mergeBtn?.addEventListener("click", async () => {
    if (mergeFiles.length < 2) return alert(t("alert.merge-min"));
    const enc = readEncryptOptions();
    if (enc.encrypt && !enc.password) return alert(t("alert.enc-pass"));
    const srcPasswords = Array.from(
      mergeList.querySelectorAll("[data-merge-pass]")
    ).map((inp) => inp.value || "");
    try {
      await withSnake(mergeBtn, async () => {
        const bytes = await Merge.mergePdfFiles(mergeFiles, { ...enc, srcPasswords });
        U.downloadBlob(bytes, "merged.pdf");
      });
    } catch (e) { console.error(e); alert(e.message || String(e)); }
  });

  /* ── Split ─────────────────────────────────────────── */
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
    if (!splitFile) return alert(t("alert.no-split"));
    const mode = splitMode?.value === "ranges" ? "ranges" : "each";
    const rangesText = splitRanges?.value || "";
    if (mode === "ranges" && !rangesText.trim()) return alert(t("alert.split-range"));
    const srcPassword = document.getElementById("splitSrcPass")?.value || "";
    try {
      await withSnake(splitBtn, async () => {
        const blob = await Split.splitPdf(splitFile, mode, rangesText, srcPassword);
        U.downloadBlob(blob, U.baseName(splitFile.name) + "-split.zip");
      });
    } catch (e) { console.error(e); alert(e.message || String(e)); }
  });

  /* ── Encrypt ───────────────────────────────────────── */
  let encFile = null;
  const encStatusEl   = document.getElementById("encStatus");
  const encStatusText = document.getElementById("encStatusText");
  const encBtn        = document.getElementById("encRun");

  wireDropzone("encDrop", "encInput", (files) => {
    encFile = files[0];
    showStatus(encStatusEl, encStatusText, encFile.name);
  });

  encBtn?.addEventListener("click", async () => {
    if (!encFile) return alert(t("alert.no-enc"));
    const enc = readEncryptOptions();
    if (!enc.encrypt || !enc.password) return alert(t("alert.enc-enable"));
    const srcPassword = document.getElementById("encSrcPass")?.value || "";
    try {
      await withSnake(encBtn, async () => {
        const bytes = await Reenc.reencryptPdfFile(encFile, { ...enc, srcPassword });
        U.downloadBlob(bytes, U.baseName(encFile.name) + "-locked.pdf");
      });
    } catch (e) { console.error(e); alert(e.message || String(e)); }
  });

  renderMergeList();
})();
