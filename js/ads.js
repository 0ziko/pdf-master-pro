/* ── SnakeConverter Ads — v2 ────────────────────────────────────────
   3 named slots, fully responsive (mobile + desktop).

   SLOT IDs — fill these after AdSense approval:
     AdSense → Ads → By ad unit → Display ads → Create → copy data-ad-slot

   AD_SLOT_TOP    → horizontal banner after snake mascot       (leaderboard)
   AD_SLOT_MID    → rectangle in middle of tool sections       (in-article)
   AD_SLOT_BOTTOM → banner before SEO / footer area            (leaderboard)

   Pro users (sc_pro = 'true') → NO ADS shown.
   GDPR: ads only load after cookie consent is accepted.
──────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  /* ─── CONFIG ─────────────────────────────────────────────────────── */
  var AD_ENABLED     = true;
  var ADSENSE_CLIENT = 'ca-pub-1033284237916727';

  /* Fill these 3 slot IDs from AdSense dashboard after approval */
  var AD_SLOT_TOP    = 'XXXXXXXXXX';  /* top banner — leaderboard 728×90   */
  var AD_SLOT_MID    = 'XXXXXXXXXX';  /* mid rect   — rectangle  336×280   */
  var AD_SLOT_BOTTOM = 'XXXXXXXXXX';  /* bottom     — leaderboard 728×90   */
  /* ─────────────────────────────────────────────────────────────── */

  function isPro() {
    try { return localStorage.getItem('sc_pro') === 'true'; } catch (e) { return false; }
  }
  if (!AD_ENABLED || isPro()) return;

  /* ── CSS ─────────────────────────────────────────────────────────── */
  function injectStyles() {
    if (document.getElementById('__scAdsCSS__')) return;
    var css = `
      /* ── Shared ad wrapper ── */
      .sc-ad {
        display: block;
        width: 100%;
        text-align: center;
        position: relative;
        overflow: hidden;
      }
      .sc-ad-label {
        display: block;
        font-size: .58rem;
        letter-spacing: .12em;
        text-transform: uppercase;
        color: #374151;
        margin-bottom: .35rem;
        user-select: none;
      }
      .sc-ad ins.adsbygoogle {
        display: block;
        margin: 0 auto;
        background: transparent;
      }

      /* ── Top slot: horizontal leaderboard ── */
      .sc-ad-top {
        padding: .75rem 0 .5rem;
        border-bottom: 1px solid rgba(255,255,255,.05);
        background: rgba(0,0,0,.12);
      }
      .sc-ad-top ins.adsbygoogle {
        width: 100%;
        max-width: 728px;
        height: 90px;
      }
      /* Mobile: smaller banner */
      @media (max-width: 767px) {
        .sc-ad-top ins.adsbygoogle {
          max-width: 320px;
          height: 50px;
        }
      }

      /* ── Mid slot: rectangle ── */
      .sc-ad-mid {
        padding: 1.25rem 0;
        border-top: 1px solid rgba(255,255,255,.04);
        border-bottom: 1px solid rgba(255,255,255,.04);
      }
      .sc-ad-mid ins.adsbygoogle {
        width: 336px;
        height: 280px;
      }
      /* Mobile: full-width responsive */
      @media (max-width: 767px) {
        .sc-ad-mid ins.adsbygoogle {
          width: 100%;
          height: 250px;
        }
      }

      /* ── Bottom slot: leaderboard ── */
      .sc-ad-bottom {
        padding: 1rem 0 .75rem;
        border-top: 1px solid rgba(255,255,255,.05);
        background: rgba(0,0,0,.1);
        margin-top: 1.5rem;
      }
      .sc-ad-bottom ins.adsbygoogle {
        width: 100%;
        max-width: 728px;
        height: 90px;
      }
      @media (max-width: 767px) {
        .sc-ad-bottom ins.adsbygoogle {
          max-width: 320px;
          height: 100px;
        }
      }
    `;
    var st = document.createElement('style');
    st.id = '__scAdsCSS__';
    st.textContent = css;
    document.head.appendChild(st);
  }

  /* ── Build one <ins> adsbygoogle unit ───────────────────────────── */
  function buildIns(slotId, format) {
    var ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.setAttribute('data-ad-client', ADSENSE_CLIENT);
    ins.setAttribute('data-ad-slot', slotId);
    ins.setAttribute('data-ad-format', format || 'auto');
    ins.setAttribute('data-full-width-responsive', 'true');
    return ins;
  }

  /* ── Build a complete ad block ──────────────────────────────────── */
  function buildAd(slotId, posClass, format) {
    var wrap = document.createElement('div');
    wrap.className = 'sc-ad ' + posClass;
    var label = document.createElement('span');
    label.className = 'sc-ad-label';
    label.textContent = 'Advertisement';
    wrap.appendChild(label);
    var ins = buildIns(slotId, format);
    wrap.appendChild(ins);
    return wrap;
  }

  /* ── Push all inserted <ins> to AdSense ─────────────────────────── */
  function pushAll() {
    document.querySelectorAll('.sc-ad ins.adsbygoogle').forEach(function (ins) {
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
    });
  }

  /* ── Place ads ──────────────────────────────────────────────────── */
  function placeAds() {
    injectStyles();

    /* ─ 1. TOP: after .snake-stage ─ */
    var stage = document.querySelector('.main-card .snake-stage');
    if (stage) {
      var adTop = buildAd(AD_SLOT_TOP, 'sc-ad-top', 'horizontal');
      stage.insertAdjacentElement('afterend', adTop);
    }

    /* ─ 2. MID: after first tool-page-section or jump-nav ─ */
    var midAnchor = document.querySelector(
      '.main-card .tool-page-section:nth-of-type(2), ' +
      '.main-card .jump-nav, ' +
      '.main-card .pdf-nav'
    );
    if (midAnchor) {
      var adMid = buildAd(AD_SLOT_MID, 'sc-ad-mid', 'rectangle');
      midAnchor.insertAdjacentElement('afterend', adMid);
    }

    /* ─ 3. BOTTOM: before .sc-seo-block ─ */
    var seoBlock = document.querySelector('.main-card .sc-seo-block');
    if (seoBlock) {
      var adBot = buildAd(AD_SLOT_BOTTOM, 'sc-ad-bottom', 'horizontal');
      seoBlock.insertAdjacentElement('beforebegin', adBot);
    }

    /* Push all units to AdSense */
    setTimeout(pushAll, 300);
  }

  /* ── GDPR gate ──────────────────────────────────────────────────── */
  function boot() {
    var consent = null;
    try { consent = localStorage.getItem('sc_cookie_consent'); } catch (e) {}
    if (consent === 'accepted') {
      placeAds();
    } else {
      document.addEventListener('sc:consent:accepted', placeAds, { once: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
