/* global window, document */
(function (w) {
  const translations = {
    en: {
      badge:               "Browser based · No server",
      subtitle:            "Excel · Image · Merge · Split · Encrypt — zero upload",
      "tab.excel":         "Excel → PDF",
      "tab.image":         "Image → PDF",
      "tab.merge":         "Merge",
      "tab.split":         "Split",
      "tab.encrypt":       "Encrypt",
      "encrypt.off":       "Encryption off",
      "encrypt.on":        "Encryption on",
      "encrypt.desc":      "When on, all output PDFs are locked with your password.",
      "encrypt.ph":        "Set opening password…",
      "encrypt.ascii":     "⚠ PDF passwords only support ASCII characters (English letters/numbers). Other characters may cause errors.",
      "excel.drop.title":  "Drag Excel or CSV file",
      "excel.drop.sub":    "or click · .xlsx · .xls · .csv",
      "excel.btn":         "Download PDF",
      "image.drop.title":  "Drag image file",
      "image.drop.sub":    "PNG · JPEG · WebP · GIF · BMP",
      "image.fit.a4":      "Fit to A4",
      "image.fit.orig":    "Original size",
      "image.btn":         "Download PDF",
      "merge.drop.title":  "Drag PDF files",
      "merge.drop.sub":    "Multiple selection — order preserved",
      "merge.empty":       "No PDFs added yet.",
      "merge.clear":       "Clear list",
      "merge.btn":         "Download Merged PDF",
      "merge.chip.pass":   "password (optional)",
      "split.src.ph":      "PDF opening password (leave blank if not encrypted)",
      "split.drop.title":  "Drag PDF to split",
      "split.drop.sub":    "Output downloaded as ZIP",
      "split.mode.label":  "Split mode",
      "split.mode.each":   "Each page as separate PDF (ZIP)",
      "split.mode.ranges": "By page ranges (ZIP)",
      "split.ranges.label":"Ranges",
      "split.ranges.ph":   "e.g. 1-3,5,8-10",
      "split.ranges.note": "Page numbers start at 1. Separate with commas.",
      "split.btn":         "Download ZIP",
      "enc.src.ph":        "Current password if already encrypted (leave blank if not)",
      "enc.drop.title":    "Drag PDF to encrypt",
      "enc.drop.sub":      "Enable encryption toggle above and set a password",
      "enc.btn":           "Download Encrypted PDF",
      "processing":        "Processing…",
      "alert.no-excel":    "Please select an Excel or CSV file first.",
      "alert.no-image":    "Please select an image file.",
      "alert.merge-min":   "At least two PDF files required.",
      "alert.no-split":    "Please select a PDF file.",
      "alert.no-enc":      "Please select a PDF file.",
      "alert.enc-pass":    "A password is required when encryption is enabled.",
      "alert.split-range": "Please enter ranges — e.g. 1-3,5",
      "alert.enc-enable":  "Enable the encryption toggle above and set a new password.",
      /* ── index.html ── */
      "index.sub":         "50+ free browser tools — zero uploads, zero servers",
      "index.search":      "Search tools…",
      "cat.pdf":           "PDF Tools",
      "cat.units":         "Unit Converters",
      "cat.text":          "Text & Utility",
      "cat.dev":           "Developer",
      "cat.calc":          "Calculators",
      "cat.color":         "Color Tools",
      "viewall.pdf":       "All PDF tools →",
      "viewall.units":     "All unit converters →",
      "viewall.text":      "All utility tools →",
      "viewall.dev":       "All dev tools →",
      "viewall.calc":      "All calculators →",
      "viewall.color":     "All color tools →",
      "index.footer":      "© 2026 SnakeConverter · All tools run in your browser",
    },
    tr: {
      badge:               "Tarayıcı tabanlı · Sunucu yok",
      subtitle:            "Excel · Görsel · Birleştir · Ayır · Şifrele — sıfır yükleme",
      "tab.excel":         "Excel → PDF",
      "tab.image":         "Görsel → PDF",
      "tab.merge":         "Birleştir",
      "tab.split":         "Ayır",
      "tab.encrypt":       "Şifrele",
      "encrypt.off":       "Şifreleme kapalı",
      "encrypt.on":        "Şifreleme açık",
      "encrypt.desc":      "Açık olduğunda tüm çıktı PDF'leri belirlediğin şifreyle kilitlenir.",
      "encrypt.ph":        "Açılış şifresini belirle…",
      "encrypt.ascii":     "⚠ PDF şifresi yalnızca ASCII karakterleri (İngilizce harf/rakam) destekler. Diğer karakterler hata verebilir.",
      "excel.drop.title":  "Excel veya CSV dosyası sürükle",
      "excel.drop.sub":    "ya da tıkla · .xlsx · .xls · .csv",
      "excel.btn":         "PDF İndir",
      "image.drop.title":  "Görsel sürükle",
      "image.drop.sub":    "PNG · JPEG · WebP · GIF · BMP",
      "image.fit.a4":      "A4'e sığdır",
      "image.fit.orig":    "Orijinal boyut",
      "image.btn":         "PDF İndir",
      "merge.drop.title":  "PDF dosyalarını sürükle",
      "merge.drop.sub":    "Çoklu seçim desteklenir — sıra korunur",
      "merge.empty":       "Eklenecek PDF yok.",
      "merge.clear":       "Listeyi temizle",
      "merge.btn":         "Birleşik PDF İndir",
      "merge.chip.pass":   "şifre (opsiyonel)",
      "split.src.ph":      "PDF'in açılış şifresi (şifreli değilse boş bırak)",
      "split.drop.title":  "Ayırılacak PDF sürükle",
      "split.drop.sub":    "Çıktı ZIP olarak indirilir",
      "split.mode.label":  "Ayırma modu",
      "split.mode.each":   "Her sayfa ayrı PDF (ZIP)",
      "split.mode.ranges": "Sayfa aralıkları (ZIP)",
      "split.ranges.label":"Aralıklar",
      "split.ranges.ph":   "Örn: 1-3,5,8-10",
      "split.ranges.note": "Sayfa numaraları 1'den başlar. Virgülle ayır.",
      "split.btn":         "ZIP İndir",
      "enc.src.ph":        "PDF zaten şifreli ise mevcut şifresi (yoksa boş bırak)",
      "enc.drop.title":    "Şifrelenecek PDF sürükle",
      "enc.drop.sub":      "Üstteki şifreleme anahtarını açıp şifre belirle",
      "enc.btn":           "Şifreli PDF İndir",
      "processing":        "İşleniyor…",
      "alert.no-excel":    "Önce bir Excel veya CSV dosyası seç.",
      "alert.no-image":    "Bir görsel seç.",
      "alert.merge-min":   "En az iki PDF gerekli.",
      "alert.no-split":    "Bir PDF seç.",
      "alert.no-enc":      "Bir PDF seç.",
      "alert.enc-pass":    "Şifreleme açıkken şifre gerekli.",
      "alert.split-range": "Aralık yaz — örn: 1-3,5",
      "alert.enc-enable":  "Üstteki şifreleme anahtarını aç ve yeni şifre yaz.",
      /* ── index.html ── */
      "index.sub":         "50+ ücretsiz tarayıcı aracı — sıfır yükleme, sıfır sunucu",
      "index.search":      "Araç ara…",
      "cat.pdf":           "PDF Araçları",
      "cat.units":         "Birim Dönüştürücüler",
      "cat.text":          "Metin & Araçlar",
      "cat.dev":           "Geliştirici Araçları",
      "cat.calc":          "Hesap Makineleri",
      "cat.color":         "Renk Araçları",
      "viewall.pdf":       "Tüm PDF araçları →",
      "viewall.units":     "Tüm birim dönüştürücüler →",
      "viewall.text":      "Tüm araçlar →",
      "viewall.dev":       "Tüm geliştirici araçları →",
      "viewall.calc":      "Tüm hesap makineleri →",
      "viewall.color":     "Tüm renk araçları →",
      "index.footer":      "© 2026 SnakeConverter · Tüm araçlar tarayıcında çalışır",
    },
  };

  const STORAGE_KEY = "pmp-lang";
  let currentLang = localStorage.getItem(STORAGE_KEY) || "en";

  function t(key) {
    return (
      (translations[currentLang] && translations[currentLang][key]) ||
      (translations.en && translations.en[key]) ||
      key
    );
  }

  function setLang(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    apply();
    _updateSwitcher();
  }

  function getLang() {
    return currentLang;
  }

  function apply() {
    /* text content */
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    /* placeholder */
    document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
      el.placeholder = t(el.getAttribute("data-i18n-ph"));
    });
    /* option text */
    document.querySelectorAll("option[data-i18n]").forEach((el) => {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
  }

  function _updateSwitcher() {
    document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
      btn.classList.toggle("lang-active", btn.getAttribute("data-lang-btn") === currentLang);
    });
  }

  function init() {
    apply();
    _updateSwitcher();
    document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
      btn.addEventListener("click", () => setLang(btn.getAttribute("data-lang-btn")));
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  w.PdfMasterI18n = { t, setLang, getLang, apply };
})(typeof window !== "undefined" ? window : globalThis);
