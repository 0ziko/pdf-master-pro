/* ── SnakeConverter Analytics + Cookie Consent ──────────────────
   GA4 only loads AFTER the user accepts cookies.
   Replace GA_MEASUREMENT_ID with your actual GA4 ID.
──────────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  var GA_ID = "G-XXXXXXXXXX"; /* ← Replace with your GA4 Measurement ID */
  var CONSENT_KEY = "sc_cookie_consent";

  /* ── Load GA4 ──────────────────────────────────────────────── */
  function loadGA() {
    if (window._gaLoaded) return;
    window._gaLoaded = true;

    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    gtag("js", new Date());
    gtag("config", GA_ID, { anonymize_ip: true, cookie_flags: "SameSite=None;Secure" });
  }

  /* ── Track page events (call after loadGA) ─────────────────── */
  window.scTrack = function (eventName, params) {
    if (!window.gtag) return;
    gtag("event", eventName, params || {});
  };

  /* ── Consent state ─────────────────────────────────────────── */
  function getConsent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }
  function setConsent(val) {
    try { localStorage.setItem(CONSENT_KEY, val); } catch (e) {}
  }

  /* ── Render banner ─────────────────────────────────────────── */
  function showBanner() {
    var lang = (document.documentElement.lang || "en").toLowerCase().startsWith("tr") ? "tr" : "en";
    /* also check PdfMasterI18n for dynamic lang */
    if (window.PdfMasterI18n) lang = window.PdfMasterI18n.getLang();

    var txt = {
      en: {
        msg:    "We use cookies to analyse traffic and improve your experience.",
        accept: "Accept",
        reject: "Decline",
        link:   "Learn more",
      },
      tr: {
        msg:    "Trafiği analiz etmek ve deneyiminizi geliştirmek için çerezler kullanıyoruz.",
        accept: "Kabul Et",
        reject: "Reddet",
        link:   "Daha fazla",
      },
    }[lang] || {};

    var banner = document.createElement("div");
    banner.id = "sc-cookie-banner";
    banner.innerHTML =
      '<div class="sc-cb-inner">' +
        '<span class="sc-cb-msg">' + txt.msg + '</span>' +
        '<div class="sc-cb-btns">' +
          '<button id="sc-cb-accept" class="sc-cb-btn sc-cb-yes">' + txt.accept + '</button>' +
          '<button id="sc-cb-reject" class="sc-cb-btn sc-cb-no">'  + txt.reject + '</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(banner);

    /* Animate in */
    requestAnimationFrame(function () { banner.classList.add("sc-cb-visible"); });

    document.getElementById("sc-cb-accept").addEventListener("click", function () {
      setConsent("accepted");
      hideBanner(banner);
      loadGA();
    });
    document.getElementById("sc-cb-reject").addEventListener("click", function () {
      setConsent("rejected");
      hideBanner(banner);
    });
  }

  function hideBanner(banner) {
    banner.classList.remove("sc-cb-visible");
    setTimeout(function () { banner && banner.parentNode && banner.parentNode.removeChild(banner); }, 400);
  }

  /* ── Inject banner CSS ─────────────────────────────────────── */
  function injectStyles() {
    var style = document.createElement("style");
    style.textContent = [
      "#sc-cookie-banner{",
        "position:fixed;bottom:0;left:0;right:0;z-index:99999;",
        "transform:translateY(100%);transition:transform .35s cubic-bezier(.4,0,.2,1);",
        "background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);",
        "border-top:1px solid rgba(130,80,255,.3);",
        "box-shadow:0 -4px 24px rgba(0,0,0,.5);",
        "font-family:system-ui,sans-serif;",
      "}",
      "#sc-cookie-banner.sc-cb-visible{transform:translateY(0);}",
      ".sc-cb-inner{",
        "display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;",
        "max-width:1100px;margin:0 auto;padding:14px 20px;",
      "}",
      ".sc-cb-msg{color:#c4b5fd;font-size:14px;flex:1;min-width:220px;}",
      ".sc-cb-btns{display:flex;gap:10px;flex-shrink:0;}",
      ".sc-cb-btn{",
        "padding:8px 20px;border-radius:8px;border:none;cursor:pointer;",
        "font-size:13px;font-weight:600;transition:all .2s;",
      "}",
      ".sc-cb-yes{background:linear-gradient(135deg,#8250ff,#6030e0);color:#fff;}",
      ".sc-cb-yes:hover{filter:brightness(1.15);}",
      ".sc-cb-no{background:transparent;color:#6b7280;border:1px solid rgba(107,114,128,.4);}",
      ".sc-cb-no:hover{color:#9ca3af;border-color:rgba(156,163,175,.6);}",
      "@media(max-width:500px){",
        ".sc-cb-inner{flex-direction:column;align-items:flex-start;}",
        ".sc-cb-btns{width:100%;}",
        ".sc-cb-btn{flex:1;text-align:center;}",
      "}",
    ].join("");
    document.head.appendChild(style);
  }

  /* ── Boot ──────────────────────────────────────────────────── */
  function boot() {
    injectStyles();
    var consent = getConsent();
    if (consent === "accepted") {
      loadGA();
    } else if (consent === null) {
      /* First visit — show banner after short delay */
      setTimeout(showBanner, 1500);
    }
    /* "rejected" → do nothing */
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

})();
