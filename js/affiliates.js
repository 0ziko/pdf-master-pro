/* ── SnakeConverter Affiliate Module ───────────────────────────────
   Injects a "Sponsored tools" / "Recommended" section into the
   SEO content block for relevant affiliate partner offers.

   HOW TO SET UP:
   1. Join each program and get your affiliate tracking link:
      - NordVPN:    https://affiliate.nordvpn.com
      - Canva:      https://www.canva.com/affiliates
      - Adobe:      https://www.adobe.com/affiliates.html
      - Smallpdf:   https://smallpdf.com/partner-program
   2. Replace the href values in AFFILIATES below with your tracking URLs.
   3. Set AFFILIATE_ENABLED = true.

   Disclosure: all affiliate links are labelled "Sponsored" per FTC rules.
   Pro users see fewer affiliate items (max 1 instead of max 2).
────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var AFFILIATE_ENABLED = true;  /* Set false to hide all affiliate links */

  /* ── Affiliate partner data ─────────────────────────────────────── */
  var PARTNERS = {
    nordvpn: {
      label:    'NordVPN',
      tag:      'Stay secure online',
      desc:     '68% off + 3 months free',
      emoji:    '🔒',
      href:     'https://nordvpn.com/?utm_source=snakeconverter&utm_medium=affiliate',
      pages:    ['dev', 'tools', 'pdf'] /* show on these pages */
    },
    canva: {
      label:    'Canva Pro',
      tag:      'Design like a pro',
      desc:     '30-day free trial',
      emoji:    '🎨',
      href:     'https://www.canva.com/pro/?utm_source=snakeconverter&utm_medium=affiliate',
      pages:    ['color', 'tools']
    },
    adobe: {
      label:    'Adobe Acrobat',
      tag:      'Professional PDF editing',
      desc:     'Full Acrobat suite, 7-day free trial',
      emoji:    '📄',
      href:     'https://acrobat.adobe.com/?utm_source=snakeconverter&utm_medium=affiliate',
      pages:    ['pdf']
    },
    smallpdf: {
      label:    'Smallpdf Pro',
      tag:      'Advanced PDF tools',
      desc:     'Cloud PDF suite — 7-day free trial',
      emoji:    '📑',
      href:     'https://smallpdf.com/pro?utm_source=snakeconverter&utm_medium=affiliate',
      pages:    ['pdf']
    },
    grammarly: {
      label:    'Grammarly',
      tag:      'Better writing instantly',
      desc:     'Free browser extension',
      emoji:    '✍️',
      href:     'https://www.grammarly.com/?utm_source=snakeconverter&utm_medium=affiliate',
      pages:    ['tools']
    }
  };

  /* ── Detect page ─────────────────────────────────────────────────── */
  function getPageKey() {
    return location.pathname.replace(/\//g, '').replace('.html', '') || 'index';
  }

  /* ── Get relevant partners for this page ────────────────────────── */
  function getRelevant(page) {
    return Object.values(PARTNERS).filter(function (p) {
      return p.pages.indexOf(page) >= 0;
    });
  }

  /* ── Inject styles ──────────────────────────────────────────────── */
  function injectStyles() {
    if (document.getElementById('__affCSS__')) return;
    var css = [
      '.sc-aff-section{margin-top:1.5rem;padding-top:1rem;border-top:1px solid rgba(255,255,255,.06);}',
      '.sc-aff-label{',
        'font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;',
        'color:#4b5563;margin-bottom:.65rem;display:block;',
      '}',
      '.sc-aff-grid{display:flex;flex-direction:column;gap:.5rem;}',
      '.sc-aff-card{',
        'display:flex;align-items:center;gap:.75rem;',
        'background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.07);',
        'border-radius:.65rem;padding:.65rem .85rem;',
        'text-decoration:none;transition:background .15s,border-color .15s;',
      '}',
      '.sc-aff-card:hover{background:rgba(255,255,255,.045);border-color:rgba(139,92,246,.25);}',
      '.sc-aff-emoji{font-size:1.3rem;flex-shrink:0;}',
      '.sc-aff-info{flex:1;min-width:0;}',
      '.sc-aff-name{',
        'font-size:.82rem;font-weight:700;color:#c4b5fd;',
        'display:flex;align-items:center;gap:.4rem;',
      '}',
      '.sc-aff-tag{font-size:.72rem;color:#94a3b8;margin-top:.1rem;}',
      '.sc-aff-pill{',
        'flex-shrink:0;background:rgba(74,222,128,.12);',
        'border:1px solid rgba(74,222,128,.2);border-radius:.4rem;',
        'padding:.15rem .5rem;font-size:.68rem;font-weight:600;color:#4ade80;white-space:nowrap;',
      '}',
    ].join('');
    var st = document.createElement('style');
    st.id = '__affCSS__';
    st.textContent = css;
    document.head.appendChild(st);
  }

  /* ── Inject section into SEO block ─────────────────────────────── */
  function inject(partners) {
    var seoInner = document.querySelector('.sc-seo-inner');
    if (!seoInner) return;

    var isPro = false;
    try { isPro = localStorage.getItem('sc_pro') === 'true'; } catch (e) {}
    var maxItems = isPro ? 1 : 2;
    var shown = partners.slice(0, maxItems);
    if (shown.length === 0) return;

    var cardsHtml = shown.map(function (p) {
      return (
        '<a href="' + p.href + '" target="_blank" rel="noopener sponsored" class="sc-aff-card"' +
            ' onclick="if(window.scTrack)scTrack(\'affiliate_click\',{partner:\'' + p.label + '\'})">' +
          '<span class="sc-aff-emoji">' + p.emoji + '</span>' +
          '<div class="sc-aff-info">' +
            '<div class="sc-aff-name">' + p.label + '</div>' +
            '<div class="sc-aff-tag">' + p.tag + '</div>' +
          '</div>' +
          '<span class="sc-aff-pill">' + p.desc + '</span>' +
        '</a>'
      );
    }).join('');

    var section = document.createElement('div');
    section.className = 'sc-aff-section';
    section.innerHTML =
      '<span class="sc-aff-label">Sponsored — Recommended Tools</span>' +
      '<div class="sc-aff-grid">' + cardsHtml + '</div>';

    seoInner.appendChild(section);
  }

  /* ── Boot ───────────────────────────────────────────────────────── */
  function boot() {
    if (!AFFILIATE_ENABLED) return;
    var page     = getPageKey();
    var partners = getRelevant(page);
    if (!partners.length) return;

    injectStyles();

    /* Wait for SEO block to be rendered first */
    var tries = 0;
    var interval = setInterval(function () {
      if (document.querySelector('.sc-seo-inner') || ++tries > 20) {
        clearInterval(interval);
        inject(partners);
      }
    }, 150);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
