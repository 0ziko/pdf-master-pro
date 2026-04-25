/* ── SnakeMascot v3 — 3D PNG image + CSS keyframe animations ─────── */
(function (w) {
  'use strict';

  /* ── Inject CSS keyframes once per page ───────────────────────── */
  if (!document.getElementById('__snake_css__')) {
    var s = document.createElement('style');
    s.id = '__snake_css__';
    s.textContent = [
      /* Base image */
      '.snake-img{width:150px;height:150px;object-fit:contain;display:block;',
      'margin:0 auto;transform-origin:center bottom;transition:filter .3s;}',

      /* Idle — gentle float */
      '.snake-img-idle{animation:snkFloat 3s ease-in-out infinite;}',
      '@keyframes snkFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}',

      /* 1. dance — wide sway + tilt */
      '.snake-anim-dance{animation:snkDance 3s ease-in-out forwards;}',
      '@keyframes snkDance{',
      '0%{transform:translateX(0) rotate(0deg)}',
      '15%{transform:translateX(-24px) rotate(-15deg)}',
      '30%{transform:translateX(24px) rotate(15deg)}',
      '45%{transform:translateX(-20px) rotate(-12deg)}',
      '60%{transform:translateX(20px) rotate(12deg)}',
      '75%{transform:translateX(-12px) rotate(-7deg)}',
      '90%{transform:translateX(12px) rotate(7deg)}',
      '100%{transform:translateX(0) rotate(0deg)}}',

      /* 2. rainbow — full hue cycle */
      '.snake-anim-rainbow{animation:snkRainbow 4s linear forwards;}',
      '@keyframes snkRainbow{',
      '0%{filter:hue-rotate(0deg) brightness(1) saturate(1)}',
      '25%{filter:hue-rotate(90deg) brightness(1.25) saturate(1.5)}',
      '50%{filter:hue-rotate(180deg) brightness(1) saturate(2)}',
      '75%{filter:hue-rotate(270deg) brightness(1.25) saturate(1.5)}',
      '100%{filter:hue-rotate(360deg) brightness(1) saturate(1)}}',

      /* 3. party — chaotic disco shake */
      '.snake-anim-party{animation:snkParty 2.2s ease-in-out forwards;}',
      '@keyframes snkParty{',
      '0%{transform:translate(0,0) rotate(0deg);filter:hue-rotate(0deg)}',
      '10%{transform:translate(-14px,-10px) rotate(-10deg);filter:hue-rotate(60deg)}',
      '20%{transform:translate(14px,6px) rotate(10deg);filter:hue-rotate(120deg)}',
      '30%{transform:translate(-12px,-14px) rotate(-12deg);filter:hue-rotate(180deg)}',
      '40%{transform:translate(12px,10px) rotate(12deg);filter:hue-rotate(240deg)}',
      '50%{transform:translate(-16px,-6px) rotate(-14deg);filter:hue-rotate(300deg)}',
      '60%{transform:translate(16px,-10px) rotate(14deg);filter:hue-rotate(360deg)}',
      '70%{transform:translate(-10px,8px) rotate(-8deg);filter:hue-rotate(60deg)}',
      '80%{transform:translate(10px,-8px) rotate(8deg);filter:hue-rotate(120deg)}',
      '90%{transform:translate(-4px,4px) rotate(-3deg);filter:hue-rotate(30deg)}',
      '100%{transform:translate(0,0) rotate(0deg);filter:hue-rotate(0deg)}}',

      /* 4. sleep — droop + darken + snore bob */
      '.snake-anim-sleep{animation:snkSleep 5s ease-in-out forwards;}',
      '@keyframes snkSleep{',
      '0%{transform:translateY(0) rotate(0deg);filter:brightness(1)}',
      '20%{transform:translateY(12px) rotate(-6deg);filter:brightness(0.75)}',
      '40%{transform:translateY(18px) rotate(-9deg);filter:brightness(0.65)}',
      '55%{transform:translateY(20px) rotate(-9deg);filter:brightness(0.6)}',
      '65%{transform:translateY(17px) rotate(-8deg);filter:brightness(0.65)}',
      '80%{transform:translateY(10px) rotate(-4deg);filter:brightness(0.8)}',
      '100%{transform:translateY(0) rotate(0deg);filter:brightness(1)}}',

      /* 5. stretch — tall squash-and-stretch */
      '.snake-anim-stretch{animation:snkStretch 3s ease-in-out forwards;}',
      '@keyframes snkStretch{',
      '0%{transform:scaleY(1) scaleX(1)}',
      '25%{transform:scaleY(1.6) scaleX(0.75)}',
      '50%{transform:scaleY(1.7) scaleX(0.7)}',
      '65%{transform:scaleY(0.85) scaleX(1.2)}',
      '80%{transform:scaleY(1.1) scaleX(0.95)}',
      '90%{transform:scaleY(0.97) scaleX(1.03)}',
      '100%{transform:scaleY(1) scaleX(1)}}',

      /* 6. bounce — gravity hop with squash */
      '.snake-anim-bounce{animation:snkBounce 2.5s cubic-bezier(.36,.07,.19,.97) forwards;}',
      '@keyframes snkBounce{',
      '0%{transform:translateY(0) scaleY(1) scaleX(1)}',
      '18%{transform:translateY(-45px) scaleY(1.15) scaleX(0.88)}',
      '33%{transform:translateY(0) scaleY(0.82) scaleX(1.18)}',
      '48%{transform:translateY(-28px) scaleY(1.08) scaleX(0.94)}',
      '62%{transform:translateY(0) scaleY(0.9) scaleX(1.1)}',
      '75%{transform:translateY(-14px) scaleY(1.04) scaleX(0.97)}',
      '88%{transform:translateY(0) scaleY(0.96) scaleX(1.04)}',
      '100%{transform:translateY(0) scaleY(1) scaleX(1)}}',

      /* 7. coil — spin with scale pulse */
      '.snake-anim-coil{animation:snkCoil 3s ease-in-out forwards;}',
      '@keyframes snkCoil{',
      '0%{transform:rotate(0deg) scale(1)}',
      '25%{transform:rotate(180deg) scale(0.75)}',
      '50%{transform:rotate(360deg) scale(1.15)}',
      '70%{transform:rotate(390deg) scale(1)}',
      '85%{transform:rotate(355deg) scale(1)}',
      '100%{transform:rotate(360deg) scale(1)}}',

      /* 8. heartbeat — double-beat pulse */
      '.snake-anim-heartbeat{animation:snkHeart 2.2s ease-in-out forwards;}',
      '@keyframes snkHeart{',
      '0%{transform:scale(1)}',
      '12%{transform:scale(1.28)}',
      '22%{transform:scale(1.05)}',
      '35%{transform:scale(1.32)}',
      '50%{transform:scale(1)}',
      '65%{transform:scale(1.18)}',
      '75%{transform:scale(1)}',
      '88%{transform:scale(1.08)}',
      '100%{transform:scale(1)}}',

      /* 9. flip — 3D barrel roll on Y axis */
      '.snake-anim-flip{animation:snkFlip 2.2s ease-in-out forwards;}',
      '@keyframes snkFlip{',
      '0%{transform:rotateY(0deg) translateY(0)}',
      '25%{transform:rotateY(90deg) translateY(-12px)}',
      '50%{transform:rotateY(180deg) translateY(0)}',
      '75%{transform:rotateY(270deg) translateY(-12px)}',
      '100%{transform:rotateY(360deg) translateY(0)}}',

      /* 10. loop — figure-8 infinity path */
      '.snake-anim-loop{animation:snkLoop 4s ease-in-out forwards;}',
      '@keyframes snkLoop{',
      '0%{transform:translate(0,0) rotate(0deg)}',
      '12%{transform:translate(28px,-22px) rotate(18deg)}',
      '25%{transform:translate(0,-38px) rotate(0deg)}',
      '37%{transform:translate(-28px,-22px) rotate(-18deg)}',
      '50%{transform:translate(0,0) rotate(0deg)}',
      '62%{transform:translate(28px,22px) rotate(18deg)}',
      '75%{transform:translate(0,38px) rotate(0deg)}',
      '87%{transform:translate(-28px,22px) rotate(-18deg)}',
      '100%{transform:translate(0,0) rotate(0deg)}}',

    ].join('');
    document.head.appendChild(s);
  }

  /* ── Animation durations match CSS (ms) ────────────────────── */
  var DUR = {
    dance:     3000,
    rainbow:   4000,
    party:     2200,
    sleep:     5000,
    stretch:   3000,
    bounce:    2500,
    coil:      3000,
    heartbeat: 2200,
    flip:      2200,
    loop:      4000,
  };

  /* ── Constructor ────────────────────────────────────────────── */
  function SnakeMascot(canvasId) {
    this._img   = null;
    this._timer = null;

    /* If already replaced (called twice on same page), reuse existing img */
    var existing = document.getElementById('snakeImg');
    if (existing) { this._img = existing; return; }

    var canvas = document.getElementById(canvasId);
    if (!canvas) return;

    /* Build img element */
    var img = document.createElement('img');
    img.id        = 'snakeImg';
    img.alt       = 'SnakeConverter mascot';
    img.className = 'snake-img snake-img-idle';
    img.src       = 'img/snake-mascot.png';
    img.onerror   = function () { img.style.display = 'none'; };

    /* Swap canvas → img */
    canvas.parentNode.replaceChild(img, canvas);
    this._img = img;
  }

  /* Play a named animation, call callback when done */
  SnakeMascot.prototype.playAnimation = function (name, callback) {
    var img  = this._img;
    if (!img) { if (callback) callback(); return; }

    /* Strip all animation classes, force reflow */
    img.className = 'snake-img';
    void img.offsetWidth; /* reflow triggers CSS restart */

    img.className = 'snake-img snake-anim-' + name;

    var dur  = DUR[name] || 3000;
    var self = this;
    if (this._timer) clearTimeout(this._timer);
    this._timer = setTimeout(function () {
      img.className = 'snake-img snake-img-idle';
      if (callback) callback();
    }, dur + 80);
  };

  SnakeMascot.prototype.stopAnimation = function () {
    if (this._timer) clearTimeout(this._timer);
    if (this._img)   this._img.className = 'snake-img snake-img-idle';
  };

  w.SnakeMascot = SnakeMascot;

})(window);
