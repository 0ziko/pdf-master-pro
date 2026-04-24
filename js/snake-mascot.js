/* global window, document */
(function (w) {
  "use strict";

  const DPR = Math.min(w.devicePixelRatio || 1, 2);
  /* canvas is 340 × 120 logical px — wide enough for the full eat+spit arc */
  const LW = 340, LH = 120;

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

  function rr(ctx, x, y, w, h, r) {          /* rounded rect path */
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

      /* time counters */
      this.t = 0; this.stateT = 0;

      /* state */
      this._s = "idle";
      this._busy = false; /* true while processStart is running */

      /* tongue */
      this.tonguePhase = 0; this.tongueOut = false;

      /* expression */
      this.smiling = false; this.winking = false; this.mouthOpen = false;
      this.rosy = false;

      /* file icon */
      this.fileAlpha = 0; this.fileScale = 1;
      this.fileX = 0;     this.fileY = 0;

      /* pdf icon */
      this.pdfAlpha = 0; this.pdfDX = 0;

      /* bump */
      this.bumpPos = 1; this.bumpAmt = 0;

      /* head extension toward file */
      this.eatExt = 0;

      /* shake */
      this.shake = 0;

      /* cached chomp el */
      this._chompEl = document.getElementById("snakeChomp");

      requestAnimationFrame(() => this._loop());
    }

    /* ── State machine ───────────────────────────── */
    _go(s) {
      this._s = s; this.stateT = 0;
      if (s === "eating" || s === "snacking") this._shakeStage();
    }

    _shakeStage() {
      const stage = document.querySelector(".snake-stage");
      if (!stage) return;
      stage.classList.remove("is-biting");
      void stage.offsetWidth;          /* force reflow */
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

    /* ── Main loop ───────────────────────────────── */
    _loop() {
      this.t      += 0.022;
      this.stateT += 0.022;
      this._update();
      this._draw();
      requestAnimationFrame(() => this._loop());
    }

    _update() {
      /* tongue flicker — show briefly every ~4 s */
      this.tonguePhase += 0.028;
      const tp = this.tonguePhase % (Math.PI * 4);
      this.tongueOut = (this._s === "idle" || this._s === "snack-happy") && tp > 7.5 && tp < 9.2;

      const st = this.stateT;

      switch (this._s) {
        /* ─ Idle ─────────────────────────────────── */
        case "idle":
          this.smiling   = false; this.winking = false; this.mouthOpen = false; this.rosy = false;
          this.eatExt    = lerp(this.eatExt, 0, 0.1);
          this.bumpAmt   = lerp(this.bumpAmt, 0, 0.08);
          this.shake     = lerp(this.shake, 0, 0.12);
          this.fileAlpha = lerp(this.fileAlpha, 0, 0.08);
          this.pdfAlpha  = lerp(this.pdfAlpha, 0, 0.06);
          break;

        /* ─ Excited (file selected) ──────────────── */
        case "excited":
          this.shake = Math.sin(st * 30) * 7 * clamp(1 - st * 2, 0, 1);
          if (st > 0.8) this._go("idle");
          break;

        /* ─ Eating (before process) ──────────────── */
        /* ─ Snacking (on file-drop) ──────────────── */
        case "eating":
        case "snacking": {
          /* phase 1 (0 → 0.5): lunge toward file */
          const lunge = clamp(st / 0.5, 0, 1);
          this.eatExt  = easeOut(lunge) * 42;       /* max 42 px extension */
          this.mouthOpen = st > 0.38;

          /* phase 2 (0.55 → 1.1): gulp — file shrinks away */
          if (st > 0.55) {
            const g = clamp((st - 0.55) / 0.5, 0, 1);
            this.fileAlpha = clamp(1 - g * 1.4, 0, 1);
            this.fileScale = clamp(1 - g, 0.05, 1);
          }
          /* phase 3 (1.1+): retract, bump appears */
          if (st > 1.1) {
            this.bumpPos  = 1;
            this.bumpAmt  = lerp(this.bumpAmt, 22, 0.18); /* big visible bump */
            this.mouthOpen = false;
            this.eatExt   = lerp(this.eatExt, 0, 0.1);
          }
          break;
        }

        /* ─ Digesting ────────────────────────────── */
        case "digesting":
          /* bump travels tail-ward */
          this.bumpPos = clamp(1 - st * 0.18, 0, 1);
          this.bumpAmt = st < 1.5
            ? lerp(this.bumpAmt, 20, 0.08)
            : lerp(this.bumpAmt, 14, 0.04); /* stays visible during long ops */
          break;

        /* ─ Spitting ─────────────────────────────── */
        case "spitting":
          this.mouthOpen = st < 1.2;
          this.pdfAlpha  = clamp(st * 3.5, 0, 1);
          this.pdfDX     = easeOut(clamp(st / 1.8, 0, 1)) * 95; /* flies 95 px */
          this.bumpAmt   = lerp(this.bumpAmt, 0, 0.1);
          if (st > 2.2) this._go("happy");
          break;

        /* ─ After full process ───────────────────── */
        case "happy":
          this.smiling = true; this.rosy = true; this.mouthOpen = false;
          this.pdfAlpha = lerp(this.pdfAlpha, 0, 0.04);
          /* two clear winks spaced out */
          const wp = (st * 1.8) % (Math.PI * 2);
          this.winking = wp > 0.5 && wp < 2.2;
          if (st > 5.5) this._go("idle");
          break;

        /* ─ After snack (file-drop eat) ─────────── */
        case "snack-happy":
          this.smiling = true; this.rosy = true; this.mouthOpen = false;
          this.bumpAmt = lerp(this.bumpAmt, 0, 0.1);
          const wp2 = st * 3.5;
          this.winking = wp2 > 0.3 && wp2 < 1.8;
          if (st > 2.5) this._go("idle");
          break;
      }
    }

    /* ── Body control points ───────────────────── */
    _pts() {
      const s   = this._s;
      const bob = Math.sin(this.t) * (s === "idle" || s === "snack-happy" ? 4.5 : 1.8);
      const bp  = this.bumpPos, ba = this.bumpAmt;
      const sx  = this.shake;
      const ext = this.eatExt;

      const bump = (fi, total) => {
        const f = fi / (total - 1), d = Math.abs(f - bp);
        return d < 0.32 ? Math.sin((1 - d / 0.32) * Math.PI) * ba : 0;
      };

      return [
        { x: 16  + sx,          y: 80  + bob * 0.15 + bump(0, 7) },
        { x: 52  + sx * 0.7,    y: 26  + bob * 0.35 + bump(1, 7) },
        { x: 88  + sx * 0.4,    y: 84  + bob * 0.55 + bump(2, 7) },
        { x: 122 + sx * 0.1,    y: 28  + bob * 0.75 + bump(3, 7) },
        { x: 152 - sx * 0.15,   y: 76  + bob * 0.90 + bump(4, 7) },
        { x: 174 - sx * 0.3,    y: 55  + bob        + bump(5, 7) },
        { x: 188 + ext,         y: 55  + bob * 0.25 + bump(6, 7) }, /* head anchor */
      ];
    }

    /* ── Draw ────────────────────────────────────── */
    _draw() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, LW, LH);

      const pts  = this._pts();
      const head = pts[pts.length - 1];

      /* file being eaten — FIXED x position, not following head */
      if (this.fileAlpha > 0.01)
        this._drawDoc(this.fileX, this.fileY, this.fileAlpha, this.fileScale, false);

      /* pdf being spit */
      if (this.pdfAlpha > 0.01)
        this._drawDoc(this.fileX + this.pdfDX, head.y, this.pdfAlpha, 1, true);

      /* body */
      ctx.save();
      ctx.shadowColor = C.shadow; ctx.shadowBlur = 12; ctx.shadowOffsetY = 5;
      this._drawBody(pts);
      ctx.restore();

      /* head */
      this._drawHead(head);
    }

    _drawBody(pts) {
      const ctx = this.ctx;
      const n   = pts.length;
      const g   = ctx.createLinearGradient(pts[0].x, 0, pts[n - 1].x, 0);
      g.addColorStop(0,    C.body0);
      g.addColorStop(0.45, C.body1);
      g.addColorStop(1,    C.body2);

      ctx.beginPath(); catmull(ctx, pts);
      ctx.strokeStyle = g; ctx.lineWidth = 14;
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.stroke();

      /* sheen strip */
      ctx.beginPath();
      catmull(ctx, pts.map((p) => ({ x: p.x + 2, y: p.y - 3 })));
      ctx.strokeStyle = "rgba(255,255,255,.14)";
      ctx.lineWidth = 5; ctx.stroke();
    }

    _drawHead(pt) {
      const ctx = this.ctx;
      const x   = pt.x + 17, y = pt.y;

      /* head fill */
      const hg = ctx.createRadialGradient(x - 4, y - 5, 2, x, y, 18);
      hg.addColorStop(0, C.headHi); hg.addColorStop(1, C.head);

      ctx.shadowColor = C.shadow; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4;
      ctx.fillStyle = hg;
      ctx.beginPath(); ctx.ellipse(x, y, 17, 13, 0, 0, Math.PI * 2); ctx.fill();
      ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

      /* scale arcs */
      ctx.strokeStyle = "rgba(0,0,0,.15)"; ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath(); ctx.arc(x - 8 + i * 7, y + 2, 5, Math.PI, Math.PI * 2); ctx.stroke();
      }

      /* eyes */
      [y - 5, y + 5].forEach((ey, ei) => {
        ctx.fillStyle = C.eye;
        ctx.beginPath(); ctx.arc(x + 5, ey, 4.2, 0, Math.PI * 2); ctx.fill();

        if (ei === 0 && this.winking) {
          ctx.strokeStyle = C.pupil; ctx.lineWidth = 2.2; ctx.lineCap = "round";
          ctx.beginPath();
          ctx.arc(x + 5, ey + 0.8, 3.2, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
        } else {
          ctx.fillStyle = C.pupil;
          ctx.beginPath(); ctx.arc(x + 6, ey, 2.4, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "rgba(255,255,255,.9)";
          ctx.beginPath(); ctx.arc(x + 6.8, ey - 1.1, 1, 0, Math.PI * 2); ctx.fill();
        }
      });

      /* nostrils */
      ctx.fillStyle = "rgba(0,0,0,.22)";
      [y - 3, y + 3].forEach((ny) => {
        ctx.beginPath(); ctx.arc(x + 12, ny, 1.2, 0, Math.PI * 2); ctx.fill();
      });

      /* mouth */
      if (this.mouthOpen) {
        /* big open mouth with teeth + tongue */
        ctx.fillStyle = "#06060f";
        ctx.beginPath(); ctx.ellipse(x + 15, y, 7, 9, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "white";
        ctx.fillRect(x + 10, y - 9, 6, 5); /* upper teeth */
        ctx.fillRect(x + 10, y + 4, 6, 5); /* lower teeth */
        ctx.fillStyle = "#f43f5e";
        ctx.beginPath(); ctx.ellipse(x + 15, y + 3, 3.5, 2.5, 0, 0, Math.PI * 2); ctx.fill();
      } else if (this.smiling) {
        ctx.strokeStyle = C.pupil; ctx.lineWidth = 2.5; ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x + 7, y + 2); ctx.quadraticCurveTo(x + 14, y + 11, x + 21, y + 2);
        ctx.stroke();
        if (this.rosy) {
          ctx.fillStyle = C.blush;
          ctx.beginPath(); ctx.arc(x + 1,  y + 8, 5, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(x + 17, y + 8, 5, 0, Math.PI * 2); ctx.fill();
        }
      } else {
        ctx.strokeStyle = C.pupil; ctx.lineWidth = 1.8; ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x + 8, y + 4); ctx.quadraticCurveTo(x + 14, y + 8, x + 19, y + 4);
        ctx.stroke();
      }

      /* tongue */
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
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      /* icon dimensions */
      const iw = 28, ih = 34, ir = 4;
      const bx = -iw / 2, by = -ih / 2;

      ctx.shadowColor = "rgba(0,0,0,.45)";
      ctx.shadowBlur = 10; ctx.shadowOffsetY = 4;

      ctx.fillStyle = isPdf ? C.pdf : C.file;
      rr(ctx, bx, by, iw, ih, ir); ctx.fill();

      ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

      /* fold */
      ctx.fillStyle = isPdf ? C.pdfFold : C.fileFold;
      ctx.beginPath();
      ctx.moveTo(bx + iw - 8, by);
      ctx.lineTo(bx + iw, by + 8);
      ctx.lineTo(bx + iw - 8, by + 8);
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
    _headX() {
      /* estimated head anchor x in current idle pose (no extension) */
      return 188;
    }

    _headY() {
      const bob = Math.sin(this.t) * 4;
      return 55 + bob * 0.25;
    }

    _placeFileIcon() {
      /* put file icon 62 px to the right of the un-extended head */
      this.fileX = this._headX() + 16 + 62; /* 16 = head radius */
      this.fileY = this._headY();
    }

    /* ── Public API ──────────────────────────────── */

    /**
     * Called whenever a file is dropped / selected.
     * Plays a quick snack-eat animation (doesn't block other interactions).
     */
    async snackFile() {
      if (this._busy) return;         /* don't interrupt processing */
      if (this._s !== "idle" && this._s !== "snack-happy") return;

      this._placeFileIcon();
      this.fileAlpha = 1; this.fileScale = 1;
      this._go("snacking");
      this._popChomp("CHOMP! 🐍");

      await wait(1500);               /* snacking lasts 1.5 s */
      if (this._s === "snacking") this._go("snack-happy");
    }

    /**
     * Wraps the processing function with full eat → digest → spit → happy.
     */
    async processStart(fn) {
      this._busy = true;
      this._placeFileIcon();
      this.fileAlpha = 1; this.fileScale = 1;
      this._go("eating");
      this._popChomp("CHOMP! 🐍");

      await wait(1700);               /* dramatic eating phase */
      this._go("digesting");

      let result, err;
      const minDigest = wait(700);   /* at least 0.7 s of digest animation */
      try { result = await fn(); }
      catch (e) { err = e; }
      await minDigest;

      if (err) { this._busy = false; this._go("idle"); throw err; }

      this._go("spitting");
      this._popChomp("✨ HERE!");
      await wait(2200);              /* spit + fly-away */
      this._busy = false;
      /* happy state auto-returns to idle after 5.5 s */
      return result;
    }

    /** Brief excited wiggle on file hover / select */
    onFileSelect() {
      if (!this._busy && this._s === "idle") this._go("excited");
    }
  }

  w.SnakeMascot = SnakeMascot;
})(window);
