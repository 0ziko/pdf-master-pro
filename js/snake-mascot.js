/* global window, document */
(function (w) {
  "use strict";

  const DPR = Math.min(w.devicePixelRatio || 1, 2);
  const LW = 340, LH = 120;

  /* ── Bump constants ──────────────────────────────── */
  const MAX_BUMPS   = 5;
  /* positions along body (0 = tail, 1 = head) */
  const ANCHORS     = [0.83, 0.66, 0.50, 0.34, 0.17];
  const BASE_SIZE   = 15;   /* px height of first bump set */
  const GROW_STEP   = 4;    /* px added per extra file when full */
  const MAX_SIZE    = 30;
  const BUMP_RADIUS = 0.22; /* fraction of body length each bump occupies */

  /* ── Palette ─────────────────────────────────────── */
  const C = {
    body0: "#14532d", body1: "#16a34a", body2: "#4ade80",
    head: "#15803d", headHi: "#22c55e",
    eye: "#fff", pupil: "#0a0a14",
    tongue: "#f43f5e",
    file: "#6d28d9", fileFold: "#4c1d95",
    pdf: "#059669",  pdfFold: "#065f46",
    shadow: "rgba(0,0,0,.32)",
    blush: "rgba(255,100,100,.25)",
  };

  /* ── Helpers ─────────────────────────────────────── */
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function easeOut(t) { return 1 - (1 - t) * (1 - t); }
  function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }

  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function catmull(ctx, pts) {
    if (pts.length < 2) return;
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i];
      const p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      ctx.bezierCurveTo(
        p1.x + (p2.x - p0.x) / 6, p1.y + (p2.y - p0.y) / 6,
        p2.x - (p3.x - p1.x) / 6, p2.y - (p3.y - p1.y) / 6,
        p2.x, p2.y
      );
    }
  }

  /* ── SnakeMascot ─────────────────────────────────── */
  class SnakeMascot {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;

      this.canvas.width  = LW * DPR;
      this.canvas.height = LH * DPR;
      this.canvas.style.width  = LW + "px";
      this.canvas.style.height = LH + "px";
      this.ctx = this.canvas.getContext("2d");
      this.ctx.scale(DPR, DPR);

      this.t = 0; this.stateT = 0;
      this._s = "idle";
      this._busy = false;

      /* tongue */
      this.tonguePhase = 0; this.tongueOut = false;

      /* expression */
      this.smiling = false; this.winking = false; this.mouthOpen = false; this.rosy = false;

      /* file/pdf icons */
      this.fileAlpha = 0; this.fileScale = 1; this.fileX = 0; this.fileY = 0;
      this.pdfAlpha  = 0; this.pdfDX = 0;

      /* ── Bump queue — persists across multiple snacks ── */
      this.bumps = [];   /* [{ pos, targetPos, size, targetSize }] */
      this._bumpTick = false; /* guard: only add one bump per snacking state */

      /* head extension */
      this.eatExt = 0;
      /* stage shake */
      this.shake  = 0;

      this._chompEl = document.getElementById("snakeChomp");

      requestAnimationFrame(() => this._loop());
    }

    /* ── State machine ───────────────────────────── */
    _go(s) {
      this._s = s; this.stateT = 0;
      this._bumpTick = false;
      if (s === "eating" || s === "snacking") this._shakeStage();
      /* broadcast state so app.js can update caption */
      this.canvas.dispatchEvent(new CustomEvent("snakestate", { detail: s, bubbles: true }));
    }

    _shakeStage() {
      const stage = document.querySelector(".snake-stage");
      if (!stage) return;
      stage.classList.remove("is-biting");
      void stage.offsetWidth;
      stage.classList.add("is-biting");
      setTimeout(() => stage.classList.remove("is-biting"), 600);
    }

    _popChomp(text) {
      if (!this._chompEl) return;
      this._chompEl.textContent = text;
      this._chompEl.classList.remove("chomp-show");
      void this._chompEl.offsetWidth;
      this._chompEl.classList.add("chomp-show");
    }

    /* ── Bump management ─────────────────────────── */
    _addBump() {
      if (this.bumps.length < MAX_BUMPS) {
        /* insert new bump at head end, shift others toward tail */
        this.bumps.unshift({ pos: 0.96, targetPos: ANCHORS[0], size: 0, targetSize: BASE_SIZE });
        this.bumps.forEach((b, i) => {
          b.targetPos  = ANCHORS[i] || ANCHORS[ANCHORS.length - 1];
          /* keep existing sizes, only reset target position */
        });
        /* make sure targetSize is set for new one */
        this.bumps[0].targetSize = BASE_SIZE;
      } else {
        /* snake is "full" — grow every existing bump */
        this.bumps.forEach((b) => {
          b.targetSize = Math.min(b.targetSize + GROW_STEP, MAX_SIZE);
        });
        /* also nudge the newest bump back to head for a visible "gulp" flash */
        if (this.bumps[0]) this.bumps[0].pos = 0.96;
      }
    }

    _clearBumps() {
      this.bumps.forEach((b) => { b.targetSize = 0; });
    }

    /* ── Main loop ───────────────────────────────── */
    _loop() {
      this.t += 0.022; this.stateT += 0.022;
      this._update(); this._draw();
      requestAnimationFrame(() => this._loop());
    }

    _update() {
      /* tongue */
      this.tonguePhase += 0.028;
      const tp = this.tonguePhase % (Math.PI * 4);
      this.tongueOut = (this._s === "idle" || this._s === "snack-happy") && tp > 7.5 && tp < 9.2;

      const st = this.stateT;

      /* ── always animate bumps ───────────────────── */
      this.bumps.forEach((b) => {
        b.pos  = lerp(b.pos,  b.targetPos,  0.055);
        b.size = lerp(b.size, b.targetSize, 0.09);
      });
      /* remove fully shrunk bumps */
      this.bumps = this.bumps.filter((b) => b.size > 0.4 || b.targetSize > 0);

      switch (this._s) {

        case "idle":
          this.smiling = false; this.winking = false; this.mouthOpen = false; this.rosy = false;
          this.eatExt    = lerp(this.eatExt, 0, 0.1);
          this.shake     = lerp(this.shake, 0, 0.12);
          this.fileAlpha = lerp(this.fileAlpha, 0, 0.08);
          this.pdfAlpha  = lerp(this.pdfAlpha, 0, 0.06);
          /* bumps intentionally persist so user sees them between snacks */
          break;

        case "excited":
          this.shake = Math.sin(st * 30) * 7 * clamp(1 - st * 2, 0, 1);
          if (st > 0.8) this._go("idle");
          break;

        case "eating":
        case "snacking": {
          const lunge = clamp(st / 0.5, 0, 1);
          this.eatExt    = easeOut(lunge) * 42;
          this.mouthOpen = st > 0.38;

          if (st > 0.55) {
            const g = clamp((st - 0.55) / 0.5, 0, 1);
            this.fileAlpha = clamp(1 - g * 1.4, 0, 1);
            this.fileScale = clamp(1 - g, 0.05, 1);
          }
          /* add bump at gulp moment — exactly once per snacking state */
          if (st > 0.95 && !this._bumpTick) {
            this._bumpTick = true;
            this._addBump();
          }
          if (st > 1.1) {
            this.mouthOpen = false;
            this.eatExt    = lerp(this.eatExt, 0, 0.1);
          }
          break;
        }

        case "digesting":
          /* bumps slowly migrate toward tail during processing */
          this.bumps.forEach((b) => {
            b.targetPos = Math.max(b.targetPos - 0.0008, 0.04);
          });
          break;

        case "spitting":
          this.mouthOpen = st < 1.2;
          this.pdfAlpha  = clamp(st * 3.5, 0, 1);
          this.pdfDX     = easeOut(clamp(st / 1.8, 0, 1)) * 95;
          /* clear bumps — they shrink away as PDF flies out */
          this._clearBumps();
          if (st > 2.2) this._go("happy");
          break;

        case "happy":
          this.smiling = true; this.rosy = true; this.mouthOpen = false;
          this.pdfAlpha = lerp(this.pdfAlpha, 0, 0.04);
          const wp = (st * 1.8) % (Math.PI * 2);
          this.winking = wp > 0.5 && wp < 2.2;
          if (st > 5.5) this._go("idle");
          break;

        case "snack-happy":
          this.smiling = true; this.rosy = true; this.mouthOpen = false;
          this.bumpAmt = 0;
          const wp2 = st * 3.5;
          this.winking = wp2 > 0.3 && wp2 < 1.8;
          if (st > 2.5) this._go("idle");
          break;
      }
    }

    /* ── Control points (bumps summed from queue) ── */
    _pts() {
      const s   = this._s;
      const bob = Math.sin(this.t) * (s === "idle" || s === "snack-happy" ? 4.5 : 1.8);
      const sx  = this.shake;
      const ext = this.eatExt;

      /* sum all bumps for each control point */
      const bumpAt = (fi, total) => {
        const f = fi / (total - 1);
        let total_b = 0;
        for (const b of this.bumps) {
          const d = Math.abs(f - b.pos);
          if (d < BUMP_RADIUS)
            total_b += Math.sin((1 - d / BUMP_RADIUS) * Math.PI) * b.size;
        }
        return Math.min(total_b, MAX_SIZE + 4); /* cap extreme stacking */
      };

      return [
        { x: 16  + sx,        y: 80 + bob * 0.15 + bumpAt(0, 7) },
        { x: 52  + sx * 0.7,  y: 26 + bob * 0.35 + bumpAt(1, 7) },
        { x: 88  + sx * 0.4,  y: 84 + bob * 0.55 + bumpAt(2, 7) },
        { x: 122 + sx * 0.1,  y: 28 + bob * 0.75 + bumpAt(3, 7) },
        { x: 152 - sx * 0.15, y: 76 + bob * 0.90 + bumpAt(4, 7) },
        { x: 174 - sx * 0.3,  y: 55 + bob        + bumpAt(5, 7) },
        { x: 188 + ext,       y: 55 + bob * 0.25 + bumpAt(6, 7) },
      ];
    }

    /* ── Draw ────────────────────────────────────── */
    _draw() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, LW, LH);

      const pts  = this._pts();
      const head = pts[pts.length - 1];

      if (this.fileAlpha > 0.01)
        this._drawDoc(this.fileX, this.fileY, this.fileAlpha, this.fileScale, false);

      if (this.pdfAlpha > 0.01)
        this._drawDoc(this.fileX + this.pdfDX, head.y, this.pdfAlpha, 1, true);

      ctx.save();
      ctx.shadowColor = C.shadow; ctx.shadowBlur = 12; ctx.shadowOffsetY = 5;
      this._drawBody(pts);
      ctx.restore();

      this._drawHead(head);
    }

    _drawBody(pts) {
      const ctx = this.ctx;
      const n   = pts.length;
      const g   = ctx.createLinearGradient(pts[0].x, 0, pts[n - 1].x, 0);
      g.addColorStop(0, C.body0); g.addColorStop(0.45, C.body1); g.addColorStop(1, C.body2);

      ctx.beginPath(); catmull(ctx, pts);
      ctx.strokeStyle = g; ctx.lineWidth = 14;
      ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke();

      ctx.beginPath();
      catmull(ctx, pts.map((p) => ({ x: p.x + 2, y: p.y - 3 })));
      ctx.strokeStyle = "rgba(255,255,255,.14)"; ctx.lineWidth = 5; ctx.stroke();
    }

    _drawHead(pt) {
      const ctx = this.ctx;
      const x   = pt.x + 17, y = pt.y;

      const hg = ctx.createRadialGradient(x - 4, y - 5, 2, x, y, 18);
      hg.addColorStop(0, C.headHi); hg.addColorStop(1, C.head);

      ctx.shadowColor = C.shadow; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4;
      ctx.fillStyle = hg;
      ctx.beginPath(); ctx.ellipse(x, y, 17, 13, 0, 0, Math.PI * 2); ctx.fill();
      ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

      ctx.strokeStyle = "rgba(0,0,0,.15)"; ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath(); ctx.arc(x - 8 + i * 7, y + 2, 5, Math.PI, Math.PI * 2); ctx.stroke();
      }

      [y - 5, y + 5].forEach((ey, ei) => {
        ctx.fillStyle = C.eye;
        ctx.beginPath(); ctx.arc(x + 5, ey, 4.2, 0, Math.PI * 2); ctx.fill();

        if (ei === 0 && this.winking) {
          ctx.strokeStyle = C.pupil; ctx.lineWidth = 2.2; ctx.lineCap = "round";
          ctx.beginPath(); ctx.arc(x + 5, ey + 0.8, 3.2, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
        } else {
          ctx.fillStyle = C.pupil;
          ctx.beginPath(); ctx.arc(x + 6, ey, 2.4, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "rgba(255,255,255,.9)";
          ctx.beginPath(); ctx.arc(x + 6.8, ey - 1.1, 1, 0, Math.PI * 2); ctx.fill();
        }
      });

      ctx.fillStyle = "rgba(0,0,0,.22)";
      [y - 3, y + 3].forEach((ny) => {
        ctx.beginPath(); ctx.arc(x + 12, ny, 1.2, 0, Math.PI * 2); ctx.fill();
      });

      if (this.mouthOpen) {
        ctx.fillStyle = "#06060f";
        ctx.beginPath(); ctx.ellipse(x + 15, y, 7, 9, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "white";
        ctx.fillRect(x + 10, y - 9, 6, 5);
        ctx.fillRect(x + 10, y + 4, 6, 5);
        ctx.fillStyle = "#f43f5e";
        ctx.beginPath(); ctx.ellipse(x + 15, y + 3, 3.5, 2.5, 0, 0, Math.PI * 2); ctx.fill();
      } else if (this.smiling) {
        ctx.strokeStyle = C.pupil; ctx.lineWidth = 2.5; ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x + 7, y + 2); ctx.quadraticCurveTo(x + 14, y + 11, x + 21, y + 2);
        ctx.stroke();
        if (this.rosy) {
          ctx.fillStyle = C.blush;
          ctx.beginPath(); ctx.arc(x + 1, y + 8, 5, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(x + 17, y + 8, 5, 0, Math.PI * 2); ctx.fill();
        }
      } else {
        ctx.strokeStyle = C.pupil; ctx.lineWidth = 1.8; ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x + 8, y + 4); ctx.quadraticCurveTo(x + 14, y + 8, x + 19, y + 4);
        ctx.stroke();
      }

      if (this.tongueOut) {
        ctx.strokeStyle = C.tongue; ctx.lineWidth = 2.5; ctx.lineCap = "round";
        const tx = x + 19;
        ctx.beginPath(); ctx.moveTo(tx, y); ctx.lineTo(tx + 9, y - 5); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(tx, y); ctx.lineTo(tx + 9, y + 5); ctx.stroke();
      }
    }

    _drawDoc(x, y, alpha, scale, isPdf) {
      const ctx = this.ctx;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x, y); ctx.scale(scale, scale);

      const iw = 28, ih = 34, ir = 4;
      const bx = -iw / 2, by = -ih / 2;

      ctx.shadowColor = "rgba(0,0,0,.45)"; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4;
      ctx.fillStyle = isPdf ? C.pdf : C.file;
      rr(ctx, bx, by, iw, ih, ir); ctx.fill();
      ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

      ctx.fillStyle = isPdf ? C.pdfFold : C.fileFold;
      ctx.beginPath();
      ctx.moveTo(bx + iw - 8, by); ctx.lineTo(bx + iw, by + 8); ctx.lineTo(bx + iw - 8, by + 8);
      ctx.closePath(); ctx.fill();

      if (isPdf) {
        ctx.font = "bold 8px system-ui, sans-serif";
        ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("PDF", 0, 2);
      } else {
        ctx.strokeStyle = "rgba(255,255,255,.8)"; ctx.lineWidth = 2; ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(bx + 6, by + 10); ctx.lineTo(bx + 18, by + 10);
        ctx.moveTo(bx + 6, by + 15); ctx.lineTo(bx + 18, by + 15);
        ctx.moveTo(bx + 6, by + 20); ctx.lineTo(bx + 13, by + 20);
        ctx.stroke();
      }
      ctx.restore();
    }

    /* ── Helpers ─────────────────────────────────── */
    _placeFileIcon() {
      this.fileX = 188 + 16 + 58;   /* fixed position on canvas */
      this.fileY = 55;
    }

    /* ── Public API ──────────────────────────────── */

    /**
     * Called on each file drop — plays a snack eat and adds one bump.
     * Can be called multiple times without interfering with processStart.
     */
    async snackFile() {
      if (this._busy) return;
      /* allow snacking from idle or from snack-happy only */
      if (this._s !== "idle" && this._s !== "snack-happy") return;

      this._placeFileIcon();
      this.fileAlpha = 1; this.fileScale = 1;
      this._go("snacking");
      this._popChomp("CHOMP! 🐍");

      await wait(1550); /* snacking animation duration */
      if (this._s === "snacking") this._go("snack-happy");
    }

    /**
     * Wraps processing.
     * - If files were already snacked (bumps exist): skip eating, go straight to digesting.
     * - If nothing was snacked yet: does one full eat first.
     */
    async processStart(fn) {
      this._busy = true;

      if (this.bumps.length === 0) {
        /* no prior snacking — eat one file-icon as visual */
        this._placeFileIcon();
        this.fileAlpha = 1; this.fileScale = 1;
        this._go("eating");
        this._popChomp("CHOMP! 🐍");
        await wait(1700);
        /* bump already added by _update() at stateT ≈ 0.95 */
      } else {
        /* files already in belly — jump straight to processing */
        this._go("digesting");
        await wait(300);
      }

      if (this._s !== "digesting") this._go("digesting");

      let result, err;
      const minDigest = wait(700);
      try { result = await fn(); }
      catch (e) { err = e; }
      await minDigest;

      if (err) { this._busy = false; this._go("idle"); throw err; }

      this._go("spitting");
      this._popChomp("✨ HERE!");
      await wait(2200);
      this._busy = false;
      return result;
    }

    onFileSelect() {
      if (!this._busy && this._s === "idle") this._go("excited");
    }
  }

  w.SnakeMascot = SnakeMascot;
})(window);
