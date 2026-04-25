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
      "index.caption":     "Pick a tool and let's go! 🐍",
      /* ── Directory tool names & descs ── */
      "pdf.excel.name":"Excel → PDF","pdf.excel.desc":"xlsx, xls, csv with full Unicode",
      "pdf.image.name":"Image → PDF","pdf.image.desc":"PNG, JPEG, WebP, GIF, BMP",
      "pdf.merge.name":"Merge PDFs","pdf.merge.desc":"Combine multiple PDFs into one",
      "pdf.split.name":"Split PDF","pdf.split.desc":"Extract pages or custom ranges",
      "pdf.encrypt.name":"Encrypt / Decrypt","pdf.encrypt.desc":"Password-protect or unlock PDFs",
      "units.length.name":"Length","units.length.desc":"km, m, cm, miles, ft, in",
      "units.weight.name":"Weight / Mass","units.weight.desc":"kg, g, lbs, oz, stones",
      "units.temp.name":"Temperature","units.temp.desc":"°C, °F, K, °R",
      "units.area.name":"Area","units.area.desc":"m², km², ft², acres, hectares",
      "units.volume.name":"Volume","units.volume.desc":"L, mL, gallons, cups, fl oz",
      "units.speed.name":"Speed","units.speed.desc":"km/h, mph, m/s, knots, Mach",
      "units.data.name":"Data Storage","units.data.desc":"B, KB, MB, GB, TB, PB",
      "units.time.name":"Time Duration","units.time.desc":"ms, s, min, h, days, weeks, yr",
      "units.energy.name":"Energy","units.energy.desc":"J, kJ, cal, kcal, kWh, BTU",
      "units.pressure.name":"Pressure","units.pressure.desc":"Pa, bar, psi, atm, mmHg",
      "units.fuel.name":"Fuel Efficiency","units.fuel.desc":"L/100km, km/L, MPG",
      "text.words.name":"Word Counter","text.words.desc":"Words, chars, sentences, read time",
      "text.case.name":"Text Case","text.case.desc":"UPPER, lower, Title, camelCase…",
      "text.base64.name":"Base64","text.base64.desc":"Encode or decode Base64 strings",
      "text.age.name":"Age Calculator","text.age.desc":"Exact age + birthday countdown",
      "text.bmi.name":"BMI Calculator","text.bmi.desc":"Body Mass Index with visual gauge",
      "text.percent.name":"Percentage","text.percent.desc":"X% of Y · What % · % Change",
      "text.random.name":"Random Number","text.random.desc":"Range, count, unique options",
      "text.pass.name":"Password Generator","text.pass.desc":"Secure passwords + strength meter",
      "text.qr.name":"QR Code","text.qr.desc":"Generate downloadable QR codes",
      "text.unix.name":"Unix Timestamp","text.unix.desc":"Live epoch clock · Date conversion",
      "dev.json.name":"JSON Formatter","dev.json.desc":"Format, validate, or minify JSON",
      "dev.hash.name":"Hash Generator","dev.hash.desc":"SHA-1, SHA-256, SHA-384, SHA-512",
      "dev.uuid.name":"UUID Generator","dev.uuid.desc":"Cryptographically secure v4 UUIDs",
      "dev.regex.name":"Regex Tester","dev.regex.desc":"Live pattern matching + highlighting",
      "dev.url.name":"URL Encode / Decode","dev.url.desc":"Percent-encode or decode URLs",
      "dev.html.name":"HTML Entities","dev.html.desc":"Escape/unescape HTML characters",
      "dev.base.name":"Base Converter","dev.base.desc":"Binary ↔ Octal ↔ Decimal ↔ Hex",
      "dev.roman.name":"Roman Numerals","dev.roman.desc":"Numbers 1–3999 ↔ Roman notation",
      "dev.lorem.name":"Lorem Ipsum","dev.lorem.desc":"Placeholder text generator",
      "dev.md.name":"Markdown Preview","dev.md.desc":"Live side-by-side MD rendering",
      "calc.discount.name":"Discount","calc.discount.desc":"Sale price & savings amount",
      "calc.vat.name":"VAT / Tax","calc.vat.desc":"Add or extract tax from a price",
      "calc.tip.name":"Tip Calculator","calc.tip.desc":"Tip + total + per-person split",
      "calc.compound.name":"Compound Interest","calc.compound.desc":"Investment growth over time",
      "calc.loan.name":"Loan / EMI","calc.loan.desc":"Monthly payment & total interest",
      "calc.fuel.name":"Fuel Cost","calc.fuel.desc":"Trip cost by distance + efficiency",
      "calc.bmr.name":"BMR / TDEE","calc.bmr.desc":"Daily calorie needs",
      "calc.ideal.name":"Ideal Weight","calc.ideal.desc":"Target weight & healthy BMI range",
      "calc.water.name":"Water Intake","calc.water.desc":"Daily hydration recommendation",
      "calc.sleep.name":"Sleep Cycles","calc.sleep.desc":"Best wake times per 90-min cycles",
      "calc.due.name":"Pregnancy Due Date","calc.due.desc":"LMP + 280 days (Naegele's rule)",
      "color.convert.name":"Color Converter","color.convert.desc":"HEX ↔ RGB ↔ HSL ↔ CMYK",
      "color.contrast.name":"Contrast Checker","color.contrast.desc":"WCAG AA/AAA compliance",
      "color.shades.name":"Shade Generator","color.shades.desc":"Full lightness scale from any color",
      "color.gradient.name":"Gradient Builder","color.gradient.desc":"Linear/radial CSS gradients",
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
      "index.caption":     "Bir araç seç ve başla! 🐍",
      /* ── Directory tool names & descs ── */
      "pdf.excel.name":"Excel → PDF","pdf.excel.desc":"xlsx, xls, csv — tam Unicode desteği",
      "pdf.image.name":"Görsel → PDF","pdf.image.desc":"PNG, JPEG, WebP, GIF, BMP",
      "pdf.merge.name":"PDF Birleştir","pdf.merge.desc":"Birden fazla PDF'i tek dosyada birleştir",
      "pdf.split.name":"PDF Ayır","pdf.split.desc":"Sayfa çıkar veya özel aralık belirle",
      "pdf.encrypt.name":"Şifrele / Aç","pdf.encrypt.desc":"PDF'i kilitle veya şifreyi kaldır",
      "units.length.name":"Uzunluk","units.length.desc":"km, m, cm, mil, ft, inç",
      "units.weight.name":"Ağırlık / Kütle","units.weight.desc":"kg, g, lb, oz, taş",
      "units.temp.name":"Sıcaklık","units.temp.desc":"°C, °F, K, °R",
      "units.area.name":"Alan","units.area.desc":"m², km², ft², dönüm, hektar",
      "units.volume.name":"Hacim","units.volume.desc":"L, mL, galon, bardak, sıvı oz",
      "units.speed.name":"Hız","units.speed.desc":"km/s, mph, m/sn, knot, Mach",
      "units.data.name":"Veri Depolama","units.data.desc":"B, KB, MB, GB, TB, PB",
      "units.time.name":"Süre Dönüştürücü","units.time.desc":"ms, sn, dk, sa, gün, hafta, yıl",
      "units.energy.name":"Enerji","units.energy.desc":"J, kJ, kal, kcal, kWh, BTU",
      "units.pressure.name":"Basınç","units.pressure.desc":"Pa, bar, psi, atm, mmHg",
      "units.fuel.name":"Yakıt Verimliliği","units.fuel.desc":"L/100km, km/L, MPG",
      "text.words.name":"Kelime Sayacı","text.words.desc":"Kelime, harf, cümle, okuma süresi",
      "text.case.name":"Büyük/Küçük Harf","text.case.desc":"BÜYÜK, küçük, Başlık, camelCase…",
      "text.base64.name":"Base64","text.base64.desc":"Base64 şifrele veya çöz",
      "text.age.name":"Yaş Hesaplama","text.age.desc":"Kesin yaş + doğum günü geri sayımı",
      "text.bmi.name":"Vücut Kitle İndeksi","text.bmi.desc":"VKİ hesapla, görsel gösterge",
      "text.percent.name":"Yüzde Hesaplama","text.percent.desc":"Y'nin %X'i · % değişim hesapla",
      "text.random.name":"Rastgele Sayı","text.random.desc":"Aralık, adet, tekrarsız seçenek",
      "text.pass.name":"Şifre Üretici","text.pass.desc":"Güçlü şifre + güç göstergesi",
      "text.qr.name":"QR Kod","text.qr.desc":"İndirilebilir QR kodu oluştur",
      "text.unix.name":"Unix Zaman Damgası","text.unix.desc":"Canlı epoch saati · Tarih dönüşümü",
      "dev.json.name":"JSON Biçimlendirici","dev.json.desc":"JSON formatla, doğrula veya sıkıştır",
      "dev.hash.name":"Hash Üretici","dev.hash.desc":"SHA-1, SHA-256, SHA-384, SHA-512",
      "dev.uuid.name":"UUID Üretici","dev.uuid.desc":"Kriptografik olarak güvenli v4 UUID",
      "dev.regex.name":"Regex Test","dev.regex.desc":"Canlı desen eşleştirme + vurgulama",
      "dev.url.name":"URL Kodlama / Çözme","dev.url.desc":"URL'leri kodla veya geri çöz",
      "dev.html.name":"HTML Varlıkları","dev.html.desc":"HTML karakterlerini kaçış/geri al",
      "dev.base.name":"Taban Dönüştürücü","dev.base.desc":"İkili ↔ Sekizli ↔ Onlu ↔ Onaltılı",
      "dev.roman.name":"Roma Rakamları","dev.roman.desc":"1–3999 ↔ Roma rakamı dönüşümü",
      "dev.lorem.name":"Lorem Ipsum","dev.lorem.desc":"Yer tutucu metin üretici",
      "dev.md.name":"Markdown Önizleme","dev.md.desc":"Canlı yan yana MD görüntüleme",
      "calc.discount.name":"İndirim Hesaplama","calc.discount.desc":"İndirimli fiyat & tasarruf miktarı",
      "calc.vat.name":"KDV / Vergi","calc.vat.desc":"Fiyata KDV ekle veya çıkar",
      "calc.tip.name":"Bahşiş Hesaplama","calc.tip.desc":"Bahşiş + toplam + kişi başı paylaşım",
      "calc.compound.name":"Bileşik Faiz","calc.compound.desc":"Yatırım büyümesi — zaman içinde",
      "calc.loan.name":"Kredi / Taksit","calc.loan.desc":"Aylık taksit & toplam faiz miktarı",
      "calc.fuel.name":"Yakıt Maliyeti","calc.fuel.desc":"Mesafe + verimlilik ile gezi maliyeti",
      "calc.bmr.name":"BMR / TDEE","calc.bmr.desc":"Günlük kalori ihtiyacı hesapla",
      "calc.ideal.name":"İdeal Kilo","calc.ideal.desc":"Hedef kilo & sağlıklı VKİ aralığı",
      "calc.water.name":"Su İhtiyacı","calc.water.desc":"Günlük hidrasyon önerisi",
      "calc.sleep.name":"Uyku Döngüleri","calc.sleep.desc":"90 dk döngülere göre ideal uyanma saati",
      "calc.due.name":"Doğum Tarihi","calc.due.desc":"SAS + 280 gün (Naegele kuralı)",
      "color.convert.name":"Renk Dönüştürücü","color.convert.desc":"HEX ↔ RGB ↔ HSL ↔ CMYK",
      "color.contrast.name":"Kontrast Denetleyici","color.contrast.desc":"WCAG AA/AAA uyumluluğu",
      "color.shades.name":"Ton Üretici","color.shades.desc":"Herhangi bir renkten tam ton skalası",
      "color.gradient.name":"Geçiş Oluşturucu","color.gradient.desc":"Doğrusal/radyal CSS geçişleri",
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
