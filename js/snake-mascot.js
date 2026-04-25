/* ── SnakeMascot v4 — Canvas cartoon snake, 3D-style ──────────────── */
(function (w) {
  'use strict';

  /* ────── Palette (matches 3D mascot) ──────────────────────────── */
  var G_HI   = '#88D488';  /* highlight green  */
  var G_MID  = '#4CAF50';  /* body green       */
  var G_DRK  = '#2E7D32';  /* shadow green     */
  var BELLY  = 'rgba(210,245,210,0.55)';
  var EDGE   = '#1B5E20';
  var TONGUE = '#E91E63';
  var IRIS   = '#1565C0';
  var PUPIL  = '#0D1117';

  /* ────── Tiny helpers ─────────────────────────────────────────── */
  function rg(ctx, x, y, r, ox, oy, c0, c1, c2) {
    var g = ctx.createRadialGradient(x + ox, y + oy, r * 0.05, x, y, r);
    g.addColorStop(0,   c0);
    g.addColorStop(0.5, c1);
    g.addColorStop(1,   c2);
    return g;
  }
  function circ(ctx, x, y, r, fill, stroke, lw) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    if (fill)   { ctx.fillStyle = fill;   ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1.5; ctx.stroke(); }
  }
  function lerp(a, b, t) { return a + (b - a) * t; }

  /* ────── Body segment positions ───────────────────────────────── */
  function segs(W, H, t, anim) {
    var cx = W / 2, cy = H / 2 + 12;
    var bob = Math.sin(t * 0.04) * 5;

    if (anim === 'dance') {
      var sw = Math.sin(t * 0.07) * 22;
      return [
        {x: cx + sw,        y: cy - 20 + bob, r: 14},
        {x: cx - sw * 0.7, y: cy - 5 + bob,  r: 12.5},
        {x: cx + sw * 0.5, y: cy + 10 + bob, r: 11.5},
        {x: cx - sw * 0.3, y: cy + 24 + bob, r: 10},
        {x: cx + sw * 0.2, y: cy + 36 + bob, r: 8.5},
        {x: cx,             y: cy + 46 + bob, r: 7},
      ];
    }
    if (anim === 'bounce') {
      var jmp = -Math.abs(Math.sin(t * 0.1)) * 30;
      var sq  = Math.abs(Math.sin(t * 0.1)) * 0.22;
      return [
        {x: cx,      y: cy + jmp,      r: 14 * (1 + sq)},
        {x: cx - 14, y: cy + jmp + 18, r: 12},
        {x: cx + 12, y: cy + jmp + 30, r: 11},
        {x: cx - 8,  y: cy + jmp + 40, r: 9.5},
        {x: cx + 5,  y: cy + jmp + 48, r: 8},
      ];
    }
    if (anim === 'spin') {
      var ang = t * 0.065;
      return [0,1,2,3,4,5].map(function(i) {
        var a = ang + (i / 6) * Math.PI * 2;
        return {x: cx + Math.cos(a) * 30, y: cy + Math.sin(a) * 20, r: 13 - i * 1.5};
      });
    }
    if (anim === 'wave') {
      return [0,1,2,3,4,5].map(function(i) {
        return {
          x: cx + Math.sin(t * 0.07 + i * 0.95) * 25,
          y: cy - 18 + i * 14 + bob,
          r: 14 - i * 1.5,
        };
      });
    }
    if (anim === 'stretch') {
      var stretch = 1 + Math.sin(t * 0.05) * 0.4;
      return [0,1,2,3,4,5].map(function(i) {
        return {x: cx + (i - 2.5) * 6, y: cy + i * 8 * stretch + bob, r: 13 - i};
      });
    }
    /* Default coil */
    return [
      {x: cx + 8,   y: cy - 18 + bob, r: 14},
      {x: cx - 18,  y: cy - 3 + bob,  r: 13},
      {x: cx + 20,  y: cy + 10 + bob, r: 12},
      {x: cx - 10,  y: cy + 24 + bob, r: 11},
      {x: cx + 8,   y: cy + 35 + bob, r: 9.5},
      {x: cx - 3,   y: cy + 45 + bob, r: 7.5},
    ];
  }

  /* ────── Head position ─────────────────────────────────────────── */
  function headPos(sv, W, H, t, anim) {
    if (anim === 'spin') {
      var a2 = t * 0.065 - 0.9;
      return {x: W/2 + Math.cos(a2) * 38, y: H/2 + Math.sin(a2) * 26, r: 21};
    }
    var s = sv[0];
    return {x: s.x + 3, y: s.y - s.r - 15, r: 21};
  }

  /* ────── Draw one body segment ─────────────────────────────────── */
  function drawSeg(ctx, s, side) {
    var g = rg(ctx, s.x, s.y, s.r, -s.r*0.3*side, -s.r*0.3, G_HI, G_MID, G_DRK);
    circ(ctx, s.x, s.y, s.r, g, EDGE, 1.5);
    /* belly stripe */
    ctx.beginPath();
    ctx.ellipse(s.x, s.y + s.r * 0.18, s.r * 0.42, s.r * 0.28, 0, 0, Math.PI * 2);
    ctx.fillStyle = BELLY;
    ctx.fill();
    /* scale dot */
    ctx.beginPath();
    ctx.arc(s.x + s.r * 0.35 * side, s.y - s.r * 0.3, s.r * 0.12, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.fill();
  }

  /* ────── Draw head ─────────────────────────────────────────────── */
  function drawHead(ctx, hd, t, anim) {
    var x = hd.x, y = hd.y, r = hd.r;
    var sleeping = anim === 'sleep';
    var winking  = anim === 'wink' && Math.sin(t * 0.09) > 0.35;
    var happy    = anim === 'happy';
    var rainbow  = anim === 'rainbow';

    /* head ball */
    var g = rg(ctx, x, y, r, -r*0.3, -r*0.35, rainbow ? '#B2EBF2' : '#88D488', G_MID, G_DRK);
    circ(ctx, x, y, r, g, EDGE, 2);

    /* cheek blush */
    if (happy) {
      ctx.beginPath();
      ctx.ellipse(x - r*0.5, y + r*0.22, r*0.22, r*0.12, 0, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(255,100,100,0.25)';
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + r*0.5, y + r*0.22, r*0.22, r*0.12, 0, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(255,100,100,0.25)';
      ctx.fill();
    }

    /* belly face patch */
    ctx.beginPath();
    ctx.ellipse(x, y + r*0.22, r*0.56, r*0.42, 0, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(205,240,205,0.55)';
    ctx.fill();

    /* ── eyes ── */
    var eR  = r * 0.255;
    var eOX = r * 0.37;
    var eY  = y - r * 0.08;

    [-1, 1].forEach(function(side, idx) {
      var ex = x + side * eOX;
      var closed = sleeping || (winking && idx === 1);
      if (closed) {
        ctx.beginPath();
        ctx.arc(ex, eY + eR * 0.15, eR, Math.PI, 0);
        ctx.strokeStyle = EDGE; ctx.lineWidth = 2.2; ctx.stroke();
      } else {
        /* white */
        circ(ctx, ex, eY, eR, '#EEF8FF', EDGE, 1);
        /* iris */
        circ(ctx, ex + eR*0.12, eY + eR*0.12, eR * 0.6, IRIS);
        /* pupil */
        circ(ctx, ex + eR*0.2, eY + eR*0.22, eR * 0.32, PUPIL);
        /* shine */
        circ(ctx, ex - eR*0.04, eY - eR*0.1, eR * 0.15, 'rgba(255,255,255,0.92)');
      }
    });

    /* ── smile / expression ── */
    ctx.lineCap = 'round';
    if (happy) {
      /* big grin */
      ctx.beginPath();
      ctx.arc(x, y + r*0.22, r*0.42, 0.05*Math.PI, 0.95*Math.PI);
      ctx.fillStyle = '#1B4020';
      ctx.fill();
      /* teeth */
      ctx.fillStyle = '#FAFAFA';
      [-1, 0, 1].forEach(function(i) {
        ctx.beginPath();
        ctx.rect(x + i * r*0.22 - r*0.08, y + r*0.22 - 4, r*0.15, 5);
        ctx.fill();
      });
    } else {
      ctx.beginPath();
      ctx.arc(x, y + r*0.3, r*0.32, 0.15*Math.PI, 0.85*Math.PI);
      ctx.strokeStyle = EDGE; ctx.lineWidth = 2; ctx.stroke();
    }

    /* ── tongue ── */
    var tPhase = Math.sin(t * 0.13);
    if (tPhase > 0.15 && !sleeping) {
      var ty0 = y + r + 1, ty1 = y + r + 11 + tPhase * 4;
      ctx.strokeStyle = TONGUE; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(x, ty0); ctx.lineTo(x, ty1); ctx.stroke();
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x, ty1); ctx.lineTo(x - r*0.2, ty1 + r*0.2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, ty1); ctx.lineTo(x + r*0.2, ty1 + r*0.2); ctx.stroke();
    }

    /* ── sleep ZZZs ── */
    if (sleeping) {
      var zA = (Math.sin(t * 0.025) + 1) * 0.3 + 0.25;
      var zD = (t * 0.45) % 28;
      [12, 9, 6].forEach(function(fs, i) {
        ctx.font = 'bold ' + fs + 'px sans-serif';
        ctx.fillStyle = 'rgba(180,190,230,' + (zA - i*0.08) + ')';
        ctx.fillText('z', x + 26 + i*8 + zD*0.2, y - 8 - i*9 - zD*0.2);
      });
    }
  }

  /* ────── Master draw call ──────────────────────────────────────── */
  function drawAll(ctx, W, H, t, anim) {
    ctx.clearRect(0, 0, W, H);

    var sv = segs(W, H, t, anim);
    var hd = headPos(sv, W, H, t, anim);

    /* rainbow filter */
    if (anim === 'rainbow') {
      ctx.filter = 'hue-rotate(' + (t * 4) + 'deg) saturate(1.35)';
    }

    /* happy scale pulse */
    if (anim === 'happy') {
      var p = 1 + Math.sin(t * 0.16) * 0.05;
      ctx.save();
      ctx.translate(W/2, H/2); ctx.scale(p, p); ctx.translate(-W/2, -H/2);
    }

    /* draw body tail→head */
    for (var i = sv.length - 1; i >= 0; i--) {
      drawSeg(ctx, sv[i], i % 2 === 0 ? 1 : -1);
    }
    drawHead(ctx, hd, t, anim);

    if (anim === 'happy') ctx.restore();
    ctx.filter = 'none';
  }

  /* ────── Animation list & durations (ms) ─────────────────────── */
  var ANIMS = ['idle','dance','rainbow','sleep','bounce','spin','wave','wink','happy','stretch'];
  var DUR   = {idle:3500,dance:4000,rainbow:4000,sleep:5000,bounce:3000,spin:3500,wave:4000,wink:2500,happy:3500,stretch:3000};

  /* ────── Constructor ──────────────────────────────────────────── */
  function SnakeMascot(canvasId) {
    /* Support both a fresh canvas and the case where the old v3 swapped to img */
    var el = document.getElementById(canvasId) ||
             document.getElementById('snakeImg');
    if (!el) return;

    var canvas;
    if (el.tagName === 'CANVAS') {
      canvas = el;
    } else {
      /* Replace img with a new canvas */
      canvas = document.createElement('canvas');
      canvas.id = canvasId;
      el.parentNode.replaceChild(canvas, el);
    }

    var W = 160, H = 160;
    canvas.width  = W;
    canvas.height = H;
    canvas.style.cssText = 'display:block;width:160px;height:160px;background:transparent;';

    var ctx  = canvas.getContext('2d');
    var tick = 0;
    var anim = 'idle';
    var raf;

    function loop() {
      tick++;
      ctx.clearRect(0, 0, W, H);

      /* coil/spin get extra canvas transform */
      if (anim === 'spin') {
        ctx.save();
        ctx.translate(W/2, H/2);
        ctx.rotate(tick * 0.04);
        ctx.translate(-W/2, -H/2);
        drawAll(ctx, W, H, tick, anim);
        ctx.restore();
      } else if (anim === 'stretch') {
        var sy = 1 + Math.sin(tick * 0.06) * 0.35;
        var sx = 1 / sy;
        ctx.save();
        ctx.translate(W/2, H);
        ctx.scale(sx, sy);
        ctx.translate(-W/2, -H);
        drawAll(ctx, W, H, tick, anim);
        ctx.restore();
      } else {
        drawAll(ctx, W, H, tick, anim);
      }
      raf = requestAnimationFrame(loop);
    }

    raf = requestAnimationFrame(loop);

    this.playAnimation = function(name, cb) {
      anim = ANIMS.indexOf(name) >= 0 ? name : 'idle';
      if (cb) setTimeout(cb, DUR[name] || 3500);
    };
    this.stopAnimation = function() { anim = 'idle'; };
    this.destroy       = function() { cancelAnimationFrame(raf); };
  }

  w.SnakeMascot = SnakeMascot;

})(window);
