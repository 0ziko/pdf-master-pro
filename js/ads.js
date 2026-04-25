/* ── SnakeConverter Ads Module ──────────────────────────────────────
   Supports:
     A. EthicalAds   → https://ethicalads.io  (recommended, easy approval)
     B. Google AdSense → https://adsense.google.com (higher CPM, harder approval)

   HOW TO ACTIVATE:
   1. EthicalAds: sign up at ethicalads.io → get your publisher ID
      → Set AD_PROVIDER = 'ethicalads' and ETHICAL_PUBLISHER_ID below
   2. AdSense: get approved at adsense.google.com → get client ID + slot IDs
      → Set AD_PROVIDER = 'adsense' and fill ADSENSE_CLIENT + ADSENSE_SLOT below

   Ads only render when AD_ENABLED = true AND the user has accepted cookies.
   Pro users (localStorage sc_pro = 'true') see no ads.
──────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  /* ─── CONFIG ────────────────────────────────────────────────────── */
  var AD_ENABLED        = true;               /* Set false to disable all ads  */
  var AD_PROVIDER       = 'ethicalads';       /* 'ethicalads' | 'adsense'      */

  /* EthicalAds */
  var ETHICAL_PUBLISHER_ID = 'YOUR_PUBLISHER_ID'; /* ← ethicalads.io publisher ID */

  /* AdSense */
  var ADSENSE_CLIENT    = 'ca-pub-XXXXXXXXXXXXXXXX'; /* ← your AdSense pub ID  */
  var ADSENSE_SLOT      = 'XXXXXXXXXX';              /* ← your Ad slot ID      */
  /* ─────────────────────────────────────────────────────────────── */

  /* Skip for Pro users */
  function isPro() {
    try { return localStorage.getItem('sc_pro') === 'true'; } catch (e) { return false; }
  }

  /* Skip if ads disabled or user is Pro */
  if (!AD_ENABLED || isPro()) return;

  /* Inject shared ad styles */
  function injectStyles() {
    var css = [
      '.sc-ad-wrap{',
        'margin:1.5rem 0;text-align:center;',
      '}',
      '.sc-ad-label{',
        'font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;',
        'color:#4b5563;margin-bottom:.4rem;display:block;',
      '}',
      '.sc-ad-inner{',
        'display:inline-block;border-radius:.75rem;overflow:hidden;',
        'border:1px solid rgba(255,255,255,.06);',
        'background:rgba(255,255,255,.02);',
        'min-height:90px;width:100%;max-width:728px;',
      '}',
      /* EthicalAds native */
      '[data-ea-publisher]{',
        'max-width:100% !important;',
      '}',
    ].join('');
    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);
  }

  /* ── EthicalAds loader ───────────────────────────────────────── */
  function loadEthicalAds(containers) {
    /* Load EthicalAds script once */
    if (!document.querySelector('script[src*="ethicalads"]')) {
      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://media.ethicalads.io/media/client/ethicalads.min.js';
      document.head.appendChild(s);
    }

    containers.forEach(function (wrap) {
      var inner = wrap.querySelector('.sc-ad-inner');
      if (!inner) return;
      var div = document.createElement('div');
      div.setAttribute('data-ea-publisher', ETHICAL_PUBLISHER_ID);
      div.setAttribute('data-ea-type', 'image');
      div.className = 'horizontal';
      inner.appendChild(div);
    });
  }

  /* ── AdSense loader ──────────────────────────────────────────── */
  function loadAdSense(containers) {
    if (!document.querySelector('script[src*="adsbygoogle"]')) {
      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + ADSENSE_CLIENT;
      s.crossOrigin = 'anonymous';
      document.head.appendChild(s);
    }

    containers.forEach(function (wrap) {
      var inner = wrap.querySelector('.sc-ad-inner');
      if (!inner) return;
      var ins = document.createElement('ins');
      ins.className = 'adsbygoogle';
      ins.style.cssText = 'display:block;width:100%;';
      ins.setAttribute('data-ad-client', ADSENSE_CLIENT);
      ins.setAttribute('data-ad-slot', ADSENSE_SLOT);
      ins.setAttribute('data-ad-format', 'auto');
      ins.setAttribute('data-full-width-responsive', 'true');
      inner.appendChild(ins);
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
    });
  }

  /* ── Create ad wrapper HTML ─────────────────────────────────── */
  function buildAdWrap() {
    var wrap = document.createElement('div');
    wrap.className = 'sc-ad-wrap';
    wrap.innerHTML = '<span class="sc-ad-label">Advertisement</span><div class="sc-ad-inner"></div>';
    return wrap;
  }

  /* ── Place ads on page ──────────────────────────────────────── */
  function placeAds() {
    var mainCard = document.querySelector('.main-card');
    if (!mainCard) return;

    var containers = [];

    /* 1. After the snake mascot / page header */
    var stage = mainCard.querySelector('.snake-stage');
    if (stage && stage.nextSibling) {
      var w1 = buildAdWrap();
      mainCard.insertBefore(w1, stage.nextSibling);
      containers.push(w1);
    }

    /* 2. Before the SEO content block (if it exists) */
    var seoBlock = mainCard.querySelector('.sc-seo-block');
    if (seoBlock) {
      var w2 = buildAdWrap();
      mainCard.insertBefore(w2, seoBlock);
      containers.push(w2);
    }

    /* Load provider */
    if (containers.length === 0) return;
    injectStyles();
    if (AD_PROVIDER === 'ethicalads') {
      loadEthicalAds(containers);
    } else {
      loadAdSense(containers);
    }
  }

  /* Boot after DOM ready */
  function boot() {
    /* Only show ads if user has accepted cookies (GDPR) */
    var consent = null;
    try { consent = localStorage.getItem('sc_cookie_consent'); } catch (e) {}
    if (consent !== 'accepted') {
      /* Wait for consent event */
      document.addEventListener('sc:consent:accepted', placeAds, { once: true });
      return;
    }
    placeAds();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
