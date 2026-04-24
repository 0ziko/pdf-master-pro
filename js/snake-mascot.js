/* global window, document */
(function (w) {
  "use strict";

  const DPR = Math.min(w.devicePixelRatio || 1, 2);
  const LW = 280, LH = 110; // logical size

  /* ── Palette ─────────────────────────────────────── */
  const C = {
    body0: "#14532d", body1: "#16a34a", body2: "#4ade80",
    head: "#15803d", headHi: "#22c55e",
    eye: "#fff", pupil: "#0a0a14",
    tongue: "#f43f5e",
    file: "#6d28d9", fileFold: "#4c1d95",
    pdf: "#059669", pdfFold: "#065f46",
    text: "#fff",
    shadow: "rgba(0,0,0,.28)",
    blush: "rgba(255,100,100,.22)",
  };

  /* ── Helpers ─────────────────────────────────────── */
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }

  function roundRect(ctx, x, y, w, h, r) {
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
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
    }
  }

  /* ── SnakeMascot ─────────────────────────────────── */
  class SnakeMascot {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.canvas.width = LW * DPR;
      this.canvas.height = LH * DPR;
      this.canvas.style.width = LW + "px";
      this.canvas.style.height = LH + "px";
      this.ctx = this.canvas.getContext("2d");
      this.ctx.scale(DPR, DPR);

      /* time */
      this.t = 0;
      this.stateT = 0;

      /* state */
      this._s = "idle";

      /* tongue */
      this.tonguePhase = 0;
      this.tongueOut = false;

      /* expression */
      this.smiling = false;
      this.winking = false;
      this.mouthOpen = false;

      /* file/pdf icons */
      this.fileAlpha = 0;
      this.fileScale = 1;
      this.pdfAlpha = 0;
      this.pdfDX = 0;

      /* bump (digesting) */
      this.bumpPos = 1;
      this.bumpAmt = 0;

      /* head extension (eating) */
      this.eatExt = 0;

      /* shake (excited) */
      this.shake = 0;

      this._raf();
    }

    /* ── State machine ──────────────────────── */
    _go(s) { this._s = s; this.stateT = 0; }

    _raf() {
      this._tick();
      requestAnimationFrame(() => this._raf());
    }

    _tick() {
      this.t += 0.022;
      this.stateT += 0.022;

      /* tongue */
      this.tonguePhase += 0.03;
      const tp = this.tonguePhase % (Math.PI * 3.5);
      this.tongueOut = (this._s === "idle" || this._s === "happy") && tp > 6.2 && tp < 7.8;

      const st = this.stateT;

      switch (this._s) {
        case "idle":
          this.smiling = false; this.winking = false; this.mouthOpen = false;
          this.eatExt     = lerp(this.eatExt, 0, 0.12);
          this.bumpAmt    = lerp(this.bumpAmt, 0, 0.1);
          this.shake      = lerp(this.shake, 0, 0.15);
          this.fileAlpha  = lerp(this.fileAlpha, 0, 0.1);
          this.pdfAlpha   = lerp(this.pdfAlpha, 0, 0.08);
          break;

        case "excited":
          this.shake = Math.sin(st * 28) * 6 * clamp(1 - st * 2.5, 0, 1);
          if (st > 1) this._go("idle");
          break;

        case "eating":
          this.eatExt  = clamp(st * 2.8, 0, 1);
          this.mouthOpen = st > 0.45 && st < 0.9;
          if (st > 0.5) {
            this.fileAlpha = clamp(1 - (st - 0.5) * 5, 0, 1);
            this.fileScale = clamp(1 - (st - 0.5) * 3.5, 0.05, 1);
          }
          if (st > 0.88) {
            this.bumpPos = 1;
            this.bumpAmt = lerp(this.bumpAmt, 12, 0.18);
            this.mouthOpen = false;
            this.eatExt = lerp(this.eatExt, 0, 0.08);
          }
          break;

        case "digesting":
          this.bumpPos = clamp(1 - st * 0.25, 0, 1);
          this.bumpAmt = st < 1.2 ? lerp(this.bumpAmt, 11, 0.1) : lerp(this.bumpAmt, 7, 0.04);
          break;

        case "spitting":
          this.mouthOpen = st < 1.0;
          this.pdfAlpha  = clamp(st * 5, 0, 1);
          this.pdfDX     = st * 65;
          this.bumpAmt   = lerp(this.bumpAmt, 0, 0.12);
          if (st > 1.4) this._go("happy");
          break;

        case "happy":
          this.smiling = true; this.mouthOpen = false;
          this.pdfAlpha = lerp(this.pdfAlpha, 0, 0.04);
          /* wink: two blinks */
          const wp = (st * 2.2) % (Math.PI * 2);
          this.winking = wp > 0.4 && wp < 1.9;
          if (st > 4) this._go("idle");
          break;
      }

      this._draw();
    }

    /* ── Body control points ────────────────── */
    _pts() {
      const bob = Math.sin(this.t) * (this._s === "idle" ? 4 : 1.5);
      const ext  = this.eatExt * 20;
      const bp   = this.bumpPos;
      const ba   = this.bumpAmt;

      const bump = (fi, total) => {
        const f = fi / (total - 1);
        const d = Math.abs(f - bp);
        return d < 0.28 ? Math.sin((1 - d / 0.28) * Math.PI) * ba : 0;
      };

      const sx = this.shake;
      return [
        { x: 18 + sx,           y: 75 + bob * 0.2 + bump(0, 7) },
        { x: 50 + sx * 0.7,     y: 28 + bob * 0.4 + bump(1, 7) },
        { x: 82 + sx * 0.4,     y: 78 + bob * 0.6 + bump(2, 7) },
        { x: 113 + sx * 0.1,    y: 30 + bob * 0.8 + bump(3, 7) },
        { x: 143 - sx * 0.1,    y: 72 + bob * 0.9 + bump(4, 7) },
        { x: 165 - sx * 0.3,    y: 52 + bob       + bump(5, 7) },
        { x: 178 + ext,         y: 52 + bob * 0.3 + bump(6, 7) },
      ];
    }

    /* ── Drawing ────────────────────────────── */
    _draw() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, LW, LH);

      const pts = this._pts();
      const head = pts[pts.length - 1];

      /* file icon */
      if (this.fileAlpha > 0.01)
        this._drawDoc(head.x + 32, head.y, this.fileAlpha, this.fileScale, false);

      /* pdf icon */
      if (this.pdfAlpha > 0.01)
        this._drawDoc(head.x + 28 + this.pdfDX, head.y, this.pdfAlpha, 1, true);

      /* body */
      ctx.save();
      ctx.shadowColor = C.shadow;
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 5;
      this._drawBody(pts);
      ctx.restore();

      /* head */
      this._drawHead(head);
    }

    _drawBody(pts) {
      const ctx = this.ctx;
      const n = pts.length;
      const grad = ctx.createLinearGradient(pts[0].x, 0, pts[n - 1].x, 0);
      grad.addColorStop(0,    C.body0);
      grad.addColorStop(0.45, C.body1);
      grad.addColorStop(1,    C.body2);

      /* main stroke */
      ctx.beginPath();
      catmull(ctx, pts);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 13;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();

      /* sheen */
      ctx.beginPath();
      catmull(ctx, pts.map((p) => ({ x: p.x + 1.5, y: p.y - 2.5 })));
      ctx.strokeStyle = "rgba(255,255,255,0.13)";
      ctx.lineWidth = 4.5;
      ctx.stroke();
    }

    _drawHead(pt) {
      const ctx = this.ctx;
      const x = pt.x + 16, y = pt.y;

      /* head fill */
      const hg = ctx.createRadialGradient(x - 3, y - 4, 2, x, y, 16);
      hg.addColorStop(0, C.headHi);
      hg.addColorStop(1, C.head);
      ctx.fillStyle = hg;
      ctx.shadowColor = C.shadow;
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 3;
      ctx.beginPath();
      ctx.ellipse(x, y, 16, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      /* scale arcs */
      ctx.strokeStyle = "rgba(0,0,0,.14)";
      ctx.lineWidth = 0.9;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(x - 7 + i * 6.5, y + 1.5, 4.5, Math.PI, Math.PI * 2);
        ctx.stroke();
      }

      /* eyes */
      const ex = x + 5;
      const ey = [y - 4.5, y + 4.5];
      ey.forEach((ey0, ei) => {
        ctx.fillStyle = C.eye;
        ctx.beginPath();
        ctx.arc(ex, ey0, 3.8, 0, Math.PI * 2);
        ctx.fill();

        if (ei === 0 && this.winking) {
          /* wink arc */
          ctx.strokeStyle = C.pupil;
          ctx.lineWidth = 2;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.arc(ex, ey0 + 0.5, 2.8, Math.PI * 1.08, Math.PI * 1.92);
          ctx.stroke();
        } else {
          ctx.fillStyle = C.pupil;
          ctx.beginPath();
          ctx.arc(ex + 0.9, ey0, 2.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "rgba(255,255,255,.85)";
          ctx.beginPath();
          ctx.arc(ex + 1.4, ey0 - 1, 0.9, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      /* nostrils */
      ctx.fillStyle = "rgba(0,0,0,.25)";
      [y - 2.5, y + 2.5].forEach((ny) => {
        ctx.beginPath(); ctx.arc(x + 11, ny, 1.1, 0, Math.PI * 2); ctx.fill();
      });

      /* mouth */
      if (this.mouthOpen) {
        /* open with teeth */
        ctx.fillStyle = "#07070f";
        ctx.beginPath();
        ctx.ellipse(x + 14, y, 6, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.fillRect(x + 10, y - 8, 5, 4);
        ctx.fillRect(x + 10, y + 4, 5, 4);
        ctx.fillStyle = "#f43f5e";
        ctx.beginPath();
        ctx.ellipse(x + 14, y + 2, 3, 2, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.smiling) {
        ctx.strokeStyle = C.pupil;
        ctx.lineWidth = 2.2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x + 7, y + 1);
        ctx.quadraticCurveTo(x + 13, y + 9, x + 19, y + 1);
        ctx.stroke();
        /* blush */
        ctx.fillStyle = C.blush;
        ctx.beginPath(); ctx.arc(x + 2, y + 7, 4.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 15, y + 7, 4.5, 0, Math.PI * 2); ctx.fill();
      } else {
        /* neutral */
        ctx.strokeStyle = C.pupil;
        ctx.lineWidth = 1.6;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x + 8, y + 3.5);
        ctx.quadraticCurveTo(x + 13, y + 7, x + 18, y + 3.5);
        ctx.stroke();
      }

      /* tongue */
      if (this.tongueOut) {
        ctx.strokeStyle = C.tongue;
        ctx.lineWidth = 2.2;
        ctx.lineCap = "round";
        const tx = x + 17;
        ctx.beginPath(); ctx.moveTo(tx, y); ctx.lineTo(tx + 8, y - 4); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(tx, y); ctx.lineTo(tx + 8, y + 4); ctx.stroke();
      }
    }

    _drawDoc(x, y, alpha, scale, isPdf) {
      const ctx = this.ctx;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      const w = 22, h = 26, r = 3;
      const bx = -w / 2, by = -h / 2;

      ctx.shadowColor = "rgba(0,0,0,.4)";
      ctx.shadowBlur = 7;
      ctx.shadowOffsetY = 3;

      ctx.fillStyle = isPdf ? C.pdf : C.file;
      roundRect(ctx, bx, by, w, h, r);
      ctx.fill();

      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      /* fold */
      ctx.fillStyle = isPdf ? C.pdfFold : C.fileFold;
      ctx.beginPath();
      ctx.moveTo(bx + w - 7, by);
      ctx.lineTo(bx + w, by + 7);
      ctx.lineTo(bx + w - 7, by + 7);
      ctx.closePath();
      ctx.fill();

      if (isPdf) {
        ctx.font = "bold 7px system-ui, sans-serif";
        ctx.fillStyle = C.text;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("PDF", 0, 2);
      } else {
        ctx.strokeStyle = "rgba(255,255,255,.75)";
        ctx.lineWidth = 1.6;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(bx + 5, by + 9);  ctx.lineTo(bx + 15, by + 9);
        ctx.moveTo(bx + 5, by + 13); ctx.lineTo(bx + 15, by + 13);
        ctx.moveTo(bx + 5, by + 17); ctx.lineTo(bx + 11, by + 17);
        ctx.stroke();
      }

      ctx.restore();
    }

    /* ── Public API ──────────────────────────── */
    onFileSelect() {
      if (this._s === "idle") this._go("excited");
    }

    /** Wraps a processing function and drives all animation states. */
    async processStart(fn) {
      this.fileAlpha = 1;
      this.fileScale = 1;
      this._go("eating");
      await wait(950);
      this._go("digesting");

      let result, err;
      const minDigest = wait(400);
      try {
        result = await fn();
      } catch (e) {
        err = e;
      }
      await minDigest;

      if (err) { this._go("idle"); throw err; }

      this._go("spitting");
      await wait(1500);
      /* happy state auto-returns to idle after ~4s */
      return result;
    }
  }

  w.SnakeMascot = SnakeMascot;
})(window);
