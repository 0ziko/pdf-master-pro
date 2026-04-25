/* ── SnakeConverter Pro Plan System ────────────────────────────────
   HOW TO ACTIVATE STRIPE:
   1. Create account at https://stripe.com
   2. Go to Payment Links → Create a link for a $5.99/month subscription
   3. Copy the link (format: https://buy.stripe.com/XXXXXXXX)
   4. Replace STRIPE_PAYMENT_LINK below

   WHAT THIS MODULE DOES:
   - Tracks daily tool usage in localStorage
   - Free tier: unlimited for non-PDF operations; PDF limited to 10/day
   - When limit reached: shows upgrade modal with Stripe link
   - Pro users (sc_pro=true in localStorage) have no limits and no ads
   - Adds "Pro" badge to header when user is Pro
   - Adds "Upgrade" button to every page header
────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  /* ─── CONFIG ────────────────────────────────────────────────────── */
  var PRO_ENABLED       = false;           /* Set true to activate Pro plan UI & limits */
  var STRIPE_LINK_BASE  = 'https://buy.stripe.com/REPLACE_WITH_YOUR_STRIPE_LINK';
  var SUCCESS_URL       = 'https://snakeconverter.com/pro-success.html?sc_pro=1&session_id={CHECKOUT_SESSION_ID}';
  /* Full link with success URL appended for Stripe Payment Links */
  var STRIPE_LINK       = STRIPE_LINK_BASE + '?success_url=' + encodeURIComponent(SUCCESS_URL);
  var FREE_PDF_LIMIT    = 10;   /* PDF operations per day (free tier) */
  var USAGE_KEY         = 'sc_usage';
  var PRO_KEY           = 'sc_pro';
  var PRO_TOKEN_KEY     = 'sc_pro_token';
  /* ─────────────────────────────────────────────────────────────── */

  /* Bail out early — Pro plan disabled */
  if (!PRO_ENABLED) {
    window.scCheckPdfLimit = function () { return true; };
    window.scRecordPdfUse  = function () {};
    window.scIsPro         = function () { return false; };
    return;
  }

  /* ── Pro status helpers ─────────────────────────────────────────── */
  function isPro() {
    try { return localStorage.getItem(PRO_KEY) === 'true'; } catch (e) { return false; }
  }

  /* ── Usage tracking ─────────────────────────────────────────────── */
  function getUsage() {
    try {
      var raw = localStorage.getItem(USAGE_KEY);
      if (!raw) return {};
      var data = JSON.parse(raw);
      /* Reset if date changed */
      var today = new Date().toISOString().slice(0, 10);
      if (data.date !== today) return { date: today };
      return data;
    } catch (e) { return {}; }
  }

  function saveUsage(data) {
    try {
      var today = new Date().toISOString().slice(0, 10);
      data.date = today;
      localStorage.setItem(USAGE_KEY, JSON.stringify(data));
    } catch (e) {}
  }

  /* ── Public: check limit before a PDF operation ─────────────────── */
  window.scCheckPdfLimit = function () {
    if (isPro()) return true;
    var usage = getUsage();
    var count = usage.pdf || 0;
    if (count >= FREE_PDF_LIMIT) {
      showUpgradeModal(
        'Daily PDF Limit Reached',
        'Free users can perform ' + FREE_PDF_LIMIT + ' PDF operations per day. Upgrade to Pro for unlimited access.',
        true
      );
      return false;
    }
    return true;
  };

  /* ── Public: record a completed PDF operation ───────────────────── */
  window.scRecordPdfUse = function () {
    if (isPro()) return;
    var usage = getUsage();
    usage.pdf = (usage.pdf || 0) + 1;
    saveUsage(usage);
  };

  /* ── Upgrade modal ──────────────────────────────────────────────── */
  function showUpgradeModal(title, body, showCounter) {
    /* Remove existing */
    var old = document.getElementById('sc-pro-modal');
    if (old) old.remove();

    var usage = getUsage();
    var counterHtml = showCounter
      ? '<div class="sc-pm-counter">' + (usage.pdf || 0) + ' / ' + FREE_PDF_LIMIT + ' PDF operations used today</div>'
      : '';

    var modal = document.createElement('div');
    modal.id = 'sc-pro-modal';
    modal.innerHTML = [
      '<div class="sc-pm-overlay" id="sc-pm-close"></div>',
      '<div class="sc-pm-box">',
        '<button class="sc-pm-x" id="sc-pm-close-btn" aria-label="Close">✕</button>',
        '<div class="sc-pm-crown">👑</div>',
        '<h2 class="sc-pm-title">' + title + '</h2>',
        '<p class="sc-pm-body">' + body + '</p>',
        counterHtml,
        '<div class="sc-pm-features">',
          '<div class="sc-pm-feat">✓ Unlimited PDF operations</div>',
          '<div class="sc-pm-feat">✓ Files up to 100 MB</div>',
          '<div class="sc-pm-feat">✓ No ads</div>',
          '<div class="sc-pm-feat">✓ Batch processing</div>',
          '<div class="sc-pm-feat">✓ Priority support</div>',
        '</div>',
        '<a href="' + STRIPE_LINK + '" target="_blank" rel="noopener" class="sc-pm-cta" id="sc-pm-upgrade">',
          'Upgrade to Pro — $5.99/month',
        '</a>',
        '<p class="sc-pm-note">Cancel anytime · Secure payment via Stripe</p>',
        '<button class="sc-pm-skip" id="sc-pm-close-btn2">Continue with Free Plan</button>',
      '</div>'
    ].join('');

    document.body.appendChild(modal);
    requestAnimationFrame(function () { modal.classList.add('sc-pm-visible'); });

    function closeModal() {
      modal.classList.remove('sc-pm-visible');
      setTimeout(function () { modal.remove(); }, 300);
    }

    document.getElementById('sc-pm-close').addEventListener('click', closeModal);
    document.getElementById('sc-pm-close-btn').addEventListener('click', closeModal);
    document.getElementById('sc-pm-close-btn2').addEventListener('click', closeModal);

    /* Track CTA click */
    document.getElementById('sc-pm-upgrade').addEventListener('click', function () {
      if (window.scTrack) scTrack('upgrade_click', { source: 'modal' });
    });
  }

  /* ── "Upgrade" button in header ─────────────────────────────────── */
  function addUpgradeButton() {
    var header = document.querySelector('header');
    if (!header) return;

    if (isPro()) {
      /* Show Pro badge instead */
      var badge = document.createElement('a');
      badge.href = 'pricing.html';
      badge.className = 'sc-pro-badge';
      badge.textContent = '👑 Pro';
      header.appendChild(badge);
      return;
    }

    var btn = document.createElement('a');
    btn.href = '#';
    btn.className = 'sc-upgrade-btn';
    btn.textContent = '⚡ Upgrade';
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      showUpgradeModal(
        'Unlock SnakeConverter Pro',
        'Remove ads, get unlimited PDF operations, batch processing and 100 MB file support.',
        false
      );
      if (window.scTrack) scTrack('upgrade_click', { source: 'header_btn' });
    });
    header.appendChild(btn);
  }

  /* ── Inject styles ──────────────────────────────────────────────── */
  function injectStyles() {
    var css = [
      /* Upgrade button */
      '.sc-upgrade-btn{',
        'position:absolute;bottom:0;right:0;',
        'background:linear-gradient(135deg,#f59e0b,#d97706);',
        'color:#1a1a2e;font-size:.65rem;font-weight:800;',
        'padding:.22rem .6rem;border-radius:.5rem;',
        'text-decoration:none;letter-spacing:.05em;text-transform:uppercase;',
        'transition:filter .15s;white-space:nowrap;',
      '}',
      '.sc-upgrade-btn:hover{filter:brightness(1.15);}',
      /* Pro badge */
      '.sc-pro-badge{',
        'position:absolute;bottom:0;right:0;',
        'background:linear-gradient(135deg,#7c3aed,#4f46e5);',
        'color:#fff;font-size:.65rem;font-weight:800;',
        'padding:.22rem .6rem;border-radius:.5rem;',
        'text-decoration:none;letter-spacing:.04em;',
      '}',
      /* Modal overlay */
      '#sc-pro-modal{',
        'position:fixed;inset:0;z-index:999999;',
        'display:flex;align-items:center;justify-content:center;padding:1rem;',
        'opacity:0;transition:opacity .25s;pointer-events:none;',
      '}',
      '#sc-pro-modal.sc-pm-visible{opacity:1;pointer-events:auto;}',
      '.sc-pm-overlay{',
        'position:absolute;inset:0;background:rgba(0,0,0,.72);backdrop-filter:blur(4px);',
      '}',
      '.sc-pm-box{',
        'position:relative;z-index:1;',
        'background:linear-gradient(160deg,#1e1b2e,#12101e);',
        'border:1px solid rgba(139,92,246,.3);',
        'border-radius:1.25rem;padding:2rem 1.75rem;',
        'max-width:420px;width:100%;text-align:center;',
        'box-shadow:0 24px 64px rgba(0,0,0,.6);',
        'transform:translateY(20px);transition:transform .25s;',
      '}',
      '#sc-pro-modal.sc-pm-visible .sc-pm-box{transform:translateY(0);}',
      '.sc-pm-x{',
        'position:absolute;top:.75rem;right:.75rem;',
        'background:none;border:none;color:#6b7280;font-size:1rem;',
        'cursor:pointer;padding:.25rem;line-height:1;',
      '}',
      '.sc-pm-crown{font-size:2.5rem;margin-bottom:.5rem;}',
      '.sc-pm-title{',
        'font-size:1.25rem;font-weight:800;color:#e2d9f3;margin:0 0 .6rem;',
      '}',
      '.sc-pm-body{',
        'color:#94a3b8;font-size:.88rem;line-height:1.6;margin:0 0 .8rem;',
      '}',
      '.sc-pm-counter{',
        'background:rgba(245,158,11,.12);border:1px solid rgba(245,158,11,.25);',
        'border-radius:.5rem;padding:.4rem .75rem;font-size:.8rem;',
        'color:#fbbf24;font-weight:600;margin-bottom:.8rem;display:inline-block;',
      '}',
      '.sc-pm-features{',
        'text-align:left;margin:.8rem 0 1.2rem;display:flex;flex-direction:column;gap:.4rem;',
      '}',
      '.sc-pm-feat{',
        'font-size:.85rem;color:#a5f3c4;display:flex;align-items:center;gap:.5rem;',
      '}',
      '.sc-pm-cta{',
        'display:block;',
        'background:linear-gradient(135deg,#8b5cf6,#6d28d9);',
        'color:#fff;font-weight:700;font-size:.95rem;',
        'padding:.8rem 1.5rem;border-radius:.75rem;',
        'text-decoration:none;transition:filter .15s;margin-bottom:.6rem;',
      '}',
      '.sc-pm-cta:hover{filter:brightness(1.12);}',
      '.sc-pm-note{font-size:.72rem;color:#4b5563;margin:.3rem 0 .6rem;}',
      '.sc-pm-skip{',
        'background:none;border:none;color:#6b7280;font-size:.78rem;',
        'cursor:pointer;text-decoration:underline;padding:.2rem;',
      '}',
      '.sc-pm-skip:hover{color:#9ca3af;}',
      '@media(max-width:480px){',
        '.sc-pm-box{padding:1.5rem 1.25rem;}',
        '.sc-pm-title{font-size:1.1rem;}',
      '}',
    ].join('');

    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);
  }

  /* ── Boot ───────────────────────────────────────────────────────── */
  function boot() {
    injectStyles();
    addUpgradeButton();

    /* Expose modal for external use (e.g. from PDF processing) */
    window.scShowUpgradeModal = showUpgradeModal;
    window.scIsPro = isPro;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
