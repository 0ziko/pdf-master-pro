/* global window, document */
(function (w) {
  "use strict";

  const DPR = Math.min(w.devicePixelRatio || 1, 2);
  const LW = 340, LH = 120;
  const CX = LW / 2, CY = LH / 2;

  /* ── Bump constants ──────────────────────────────── */
  const MAX_BUMPS   = 5;
  const ANCHORS     = [0.83, 0.66, 0.50, 0.34, 0.17];
  const BASE_SIZE   = 15;
  const GROW_STEP   = 4;
  const MAX_SIZE    = 30;
  const BUMP_RADIUS = 0.22;

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
  function easeInOut(t) { return t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2,2)/2; }
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

      /* Bump queue */
      this.bumps = [];
      this._bumpTick = false;

      /* head extension & shake */
      this.eatExt = 0;
      this.shake  = 0;

      /* ── Autonomous animation extras ─────────────── */
      this.animMode   = null;   /* "rainbow" | "party" | "heartbeat" | null */
      this.rainbowHue = 0;      /* 0–1 hue offset, cycles */
      this.floatingZs = [];     /* [{x,y,alpha,dy,size}] for sleep */
      this._heartScale = 1;     /* for heartbeat pulse */
      this._animCb    = null;   /* callback when anim finishes */

      this._chompEl = document.getElementById("snakeChomp");

      requestAnimationFrame(() => this._loop());
    }

    /* ── State machine ───────────────────────────── */
    _go(s) {
      this._s = s; this.stateT = 0;
      this._bumpTick = false;
      /* clear autonomous extras on any non-special state */
      const keepMode = ["rainbow", "party", "heartbeat"];
      if (!keepMode.includes(s)) this.animMode = null;
      if (s !== "sleep") this.floatingZs = [];
      if (s === "eating" || s === "snacking") this._shakeStage();
      this.canvas.dispatchEvent(new CustomEvent("snakestate", { detail: s, bubbles: true }));
    }

    /* Called when an autonomous animation finishes */
    _doneAnim() {
      this.animMode    = null;
      this.floatingZs  = [];
      this._heartScale = 1;
      this.smiling = false; this.winking = false; this.rosy = false;
      this._go("idle");
      if (this._animCb) {
        const cb = this._animCb;
        this._animCb = null;
        setTimeout(cb, 50);
      }
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
        this.bumps.unshift({ pos: 0.96, targetPos: ANCHORS[0], size: 0, targetSize: BASE_SIZE });
        this.bumps.forEach((b, i) => {
          b.targetPos = ANCHORS[i] || ANCHORS[ANCHORS.length - 1];
        });
        this.bumps[0].targetSize = BASE_SIZE;
      } else {
        this.bumps.forEach((b) => {
          b.targetSize = Math.min(b.targetSize + GROW_STEP, MAX_SIZE);
        });
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

      /* always animate bumps */
      this.bumps.forEach((b) => {
        b.pos  = lerp(b.pos,  b.targetPos,  0.055);
        b.size = lerp(b.size, b.targetSize, 0.09);
      });
      this.bumps = this.bumps.filter((b) => b.size > 0.4 || b.targetSize > 0);

      switch (this._s) {

        /* ── Existing functional states ─────────── */
        case "idle":
          this.smiling = false; this.winking = false; this.mouthOpen = false; this.rosy = false;
          this.eatExt    = lerp(this.eatExt, 0, 0.1);
          this.shake     = lerp(this.shake, 0, 0.12);
          this.fileAlpha = lerp(this.fileAlpha, 0, 0.08);
          this.pdfAlpha  = lerp(this.pdfAlpha, 0, 0.06);
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
          this.bumps.forEach((b) => {
            b.targetPos = Math.max(b.targetPos - 0.0008, 0.04);
          });
          break;

        case "spitting":
          this.mouthOpen = st < 1.2;
          this.pdfAlpha  = clamp(st * 3.5, 0, 1);
          this.pdfDX     = easeOut(clamp(st / 1.8, 0, 1)) * 95;
          this._clearBumps();
          if (st > 2.2) this._go("happy");
          break;

        case "happy":
          this.smiling = true; this.rosy = true; this.mouthOpen = false;
          this.pdfAlpha = lerp(this.pdfAlpha, 0, 0.04);
          {
            const wp = (st * 1.8) % (Math.PI * 2);
            this.winking = wp > 0.5 && wp < 2.2;
          }
          if (st > 5.5) this._go("idle");
          break;

        case "snack-happy":
          this.smiling = true; this.rosy = true; this.mouthOpen = false;
          {
            const wp2 = st * 3.5;
            this.winking = wp2 > 0.3 && wp2 < 1.8;
          }
          if (st > 2.5) this._go("idle");
          break;

        /* ── Autonomous animation states ─────────── */

        /* 1. Dance: dramatic wide sine wave */
        case "dance":
          this.smiling = st > 0.5;
          if (st > 3.2) this._doneAnim();
          break;

        /* 2. Rainbow: normal wave, rainbow body */
        case "rainbow":
          this.animMode   = "rainbow";
          this.rainbowHue = (this.rainbowHue + 0.007) % 1;
          this.smiling = true;
          if (st > 3.0) this._doneAnim();
          break;

        /* 3. Party: chaotic wave + rainbow */
        case "party":
          this.animMode   = "party";
          this.rainbowHue = (this.rainbowHue + 0.018) % 1;
          this.smiling = Math.sin(st * 14) > 0;
          this.rosy    = Math.sin(st * 14) < 0;
          if (st > 2.8) this._doneAnim();
          break;

        /* 4. Sleep: coil shape + floating Z letters */
        case "sleep":
          this.smiling = false; this.winking = false; this.tongueOut = false;
          /* spawn Z letters from head area */
          if (Math.random() < 0.035 && st > 0.5) {
            const sleepPts = this._ptsSleep();
            const h = sleepPts[sleepPts.length - 1];
            this.floatingZs.push({
              x: h.x + 20 + (Math.random() - 0.5) * 20,
              y: h.y - 8,
              alpha: 0.9,
              dy: 0.45 + Math.random() * 0.3,
              size: 13 + Math.random() * 9,
            });
          }
          this.floatingZs.forEach((z) => {
            z.y     -= z.dy;
            z.alpha -= 0.007;
          });
          this.floatingZs = this.floatingZs.filter((z) => z.alpha > 0.02);
          if (st > 4.5) this._doneAnim();
          break;

        /* 5. Stretch: snake extends flat then snaps back */
        case "stretch":
          this.smiling = st > 1.5 && st < 2.8;
          if (st > 3.2) this._doneAnim();
          break;

        /* 6. Bounce: gravity-based body bounce */
        case "bounce":
          this.smiling = true;
          if (st > 3.2) this._doneAnim();
          break;

        /* 7. Coil: snake wraps into a spinning circle */
        case "coil":
          this.smiling = st > 1.0;
          if (st > 3.5) this._doneAnim();
          break;

        /* 8. Heartbeat: body scale pulses */
        case "heartbeat":
          this.animMode    = "heartbeat";
          this.smiling     = true; this.rosy = true;
          this._heartScale = 1 + Math.sin(st * 9) * 0.09 * Math.min(st * 1.5, 1);
          if (st > 3.0) { this._heartScale = 1; this._doneAnim(); }
          break;

        /* 9. Flip: snake flips upside-down and back */
        case "flip":
          this.smiling = st > 1.5;
          if (st > 3.5) this._doneAnim();
          break;

        /* 10. Loop: snake traces a figure-8 infinity path */
        case "loop":
          this.smiling = true;
          if (st > 4.0) this._doneAnim();
          break;
      }
    }

    /* ── Control point routing ───────────────────── */
    _pts() {
      switch (this._s) {
        case "dance":    return this._ptsDance();
        case "rainbow":  return this._ptsDefault();   /* rainbow = normal + color */
        case "party":    return this._ptsParty();
        case "sleep":    return this._ptsSleep();
        case "stretch":  return this._ptsStretch();
        case "bounce":   return this._ptsBounce();
        case "coil":     return this._ptsCoil();
        case "heartbeat":return this._ptsDefault();   /* heartbeat = normal + scale */
        case "flip":     return this._ptsFlip();
        case "loop":     return this._ptsLoop();
        default:         return this._ptsDefault();
      }
    }

    /* Default control points (idle/eating/etc.) */
    _ptsDefault() {
      const s   = this._s;
      const bob = Math.sin(this.t) * (s === "idle" || s === "snack-happy" || s === "rainbow" || s === "heartbeat" ? 4.5 : 1.8);
      const sx  = this.shake;
      const ext = this.eatExt;

      const bumpAt = (fi, total) => {
        const f = fi / (total - 1);
        let total_b = 0;
        for (const b of this.bumps) {
          const d = Math.abs(f - b.pos);
          if (d < BUMP_RADIUS)
            total_b += Math.sin((1 - d / BUMP_RADIUS) * Math.PI) * b.size;
        }
        return Math.min(total_b, MAX_SIZE + 4);
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

    /* 1. Dance: exaggerated wide sine wave across full canvas */
    _ptsDance() {
      const t  = this.t;
      const st = this.stateT;
      const amp = Math.min(st * 28, 46); /* ramp up amplitude */
      return Array.from({ length: 8 }, (_, i) => ({
        x: 14 + (i / 7) * 305,
        y: CY + Math.sin(t * 3.0 + i * Math.PI / 2.6) * amp,
      }));
    }

    /* 3. Party: chaotic multi-frequency body */
    _ptsParty() {
      const t = this.t;
      return Array.from({ length: 8 }, (_, i) => ({
        x: 14 + (i / 7) * 288 + Math.sin(t * 4.5 + i * 1.4) * 10,
        y: CY + Math.sin(t * 7.5 + i * 1.1) * 36 + Math.cos(t * 5.2 + i * 0.9) * 17,
      }));
    }

    /* 4. Sleep: snake coils into a soft C-shape */
    _ptsSleep() {
      const t  = this.t;
      const st = this.stateT;
      const coilProg = Math.min(easeInOut(st / 1.0), 1); /* coil progress 0→1 */
      const cx = 145, cy = 60, rx = 62, ry = 34;

      return Array.from({ length: 8 }, (_, i) => {
        /* Start from default pos, lerp toward coil circle */
        const defaultXs = [16, 52, 88, 122, 152, 174, 188, 200];
        const defaultYs = [80, 26, 84, 28, 76, 55, 55, 55];
        const phi = Math.PI * 0.7 + (i / 7) * Math.PI * 1.6 + Math.sin(t * 0.6) * 0.12;
        return {
          x: lerp(defaultXs[i], cx + Math.cos(phi) * rx, coilProg),
          y: lerp(defaultYs[i], cy + Math.sin(phi) * ry, coilProg),
        };
      });
    }

    /* 5. Stretch: extend to flat line then snap back */
    _ptsStretch() {
      const st = this.stateT;
      let p;
      if (st < 1.4) {
        p = easeOut(st / 1.4);          /* 0 → stretched */
      } else if (st < 2.0) {
        p = 1;                           /* hold stretched */
      } else {
        p = 1 - easeOut((st - 2.0) / 1.2); /* snap back */
      }
      const defXs = [16, 52, 88, 122, 152, 174, 188];
      const defYs = [80, 26, 84, 28, 76, 55, 55];
      return defXs.map((bx, i) => ({
        x: lerp(bx, 14 + (i / 6) * 305, p),
        y: lerp(defYs[i], CY, p),
      }));
    }

    /* 6. Bounce: gravity physics bounce across body */
    _ptsBounce() {
      const t  = this.t;
      const st = this.stateT;
      const intensity = Math.min(st * 1.5, 1) * Math.max(1 - (st - 2.2) * 0.8, 0.2);
      const baseXs = [16, 52, 88, 122, 152, 174, 188];
      return baseXs.map((bx, i) => {
        const bounce = Math.pow(Math.abs(Math.sin(t * 3.8 + i * 0.42)), 1.6) * 50 * intensity;
        return { x: bx, y: 98 - bounce };
      });
    }

    /* 7. Coil: wrap into a spinning circle */
    _ptsCoil() {
      const t  = this.t;
      const st = this.stateT;
      const coilP = Math.min(easeInOut(st / 1.2), 1);
      const uncoilP = st > 2.5 ? easeOut((st - 2.5) / 1.0) : 0;
      const cx = CX, cy = CY;
      const rx = lerp(lerp(90, 48, coilP), 90, uncoilP);
      const ry = lerp(lerp(38, 30, coilP), 38, uncoilP);

      return Array.from({ length: 8 }, (_, i) => {
        const phi = (i / 7) * Math.PI * 2 + t * 1.6;
        return {
          x: cx + Math.cos(phi) * rx,
          y: cy + Math.sin(phi) * ry,
        };
      });
    }

    /* 9. Flip: snake flips upside-down and returns */
    _ptsFlip() {
      const st = this.stateT;
      let flipAngle;
      if (st < 0.7) {
        flipAngle = easeOut(st / 0.7) * Math.PI;
      } else if (st < 2.6) {
        flipAngle = Math.PI;
      } else {
        flipAngle = Math.PI + easeOut((st - 2.6) / 0.7) * Math.PI;
      }
      const defXs = [16, 52, 88, 122, 152, 174, 188];
      const defYs = [80, 26, 84, 28, 76, 55, 55];
      return defXs.map((bx, i) => ({
        x: bx,
        y: CY + (defYs[i] - CY) * Math.cos(flipAngle),
      }));
    }

    /* 10. Loop: figure-8 / infinity path */
    _ptsLoop() {
      const t  = this.t;
      const st = this.stateT;
      const enterP = Math.min(easeInOut(st / 1.0), 1);
      const exitP  = st > 3.2 ? easeInOut((st - 3.2) / 0.8) : 0;
      const cx = CX - 10, cy = CY;

      return Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 7) * Math.PI * 2 + t * 0.75;
        const r = 52;
        const tx = cx + Math.cos(angle) * r * 1.85;
        const ty = cy + Math.sin(angle * 2) * r * 0.65;
        const defX = 16 + (i / 7) * 175;
        const defY = [80, 26, 84, 28, 76, 55, 55, 55][i];
        return {
          x: lerp(lerp(defX, tx, enterP), defX, exitP),
          y: lerp(lerp(defY, ty, enterP), defY, exitP),
        };
      });
    }

    /* ── Draw ────────────────────────────────────── */
    _draw() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, LW, LH);

      /* Heartbeat: scale entire snake from center */
      if (this.animMode === "heartbeat" && this._heartScale !== 1) {
        ctx.save();
        ctx.translate(CX, CY);
        ctx.scale(this._heartScale, this._heartScale);
        ctx.translate(-CX, -CY);
      }

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

      /* Draw floating Z letters for sleep */
      if (this.floatingZs.length > 0) this._drawZs();

      if (this.animMode === "heartbeat" && this._heartScale !== 1) {
        ctx.restore();
      }
    }

    _drawBody(pts) {
      const ctx = this.ctx;
      const n   = pts.length;

      if (this.animMode === "rainbow" || this.animMode === "party") {
        /* Full-spectrum rainbow that rotates over time */
        const hBase = (this.rainbowHue * 360);
        const g = ctx.createLinearGradient(pts[0].x, 0, pts[n - 1].x, 0);
        g.addColorStop(0.00, `hsl(${(hBase)        % 360},100%,58%)`);
        g.addColorStop(0.25, `hsl(${(hBase +  90)  % 360},100%,58%)`);
        g.addColorStop(0.50, `hsl(${(hBase + 180)  % 360},100%,58%)`);
        g.addColorStop(0.75, `hsl(${(hBase + 270)  % 360},100%,58%)`);
        g.addColorStop(1.00, `hsl(${(hBase + 360)  % 360},100%,58%)`);
        ctx.strokeStyle = g;
        ctx.lineWidth   = this.animMode === "party" ? 16 : 14;
      } else {
        const g = ctx.createLinearGradient(pts[0].x, 0, pts[n - 1].x, 0);
        g.addColorStop(0, C.body0); g.addColorStop(0.45, C.body1); g.addColorStop(1, C.body2);
        ctx.strokeStyle = g;
        ctx.lineWidth   = 14;
      }

      ctx.beginPath(); catmull(ctx, pts);
      ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke();

      ctx.beginPath();
      catmull(ctx, pts.map((p) => ({ x: p.x + 2, y: p.y - 3 })));
      ctx.strokeStyle = "rgba(255,255,255,.14)"; ctx.lineWidth = 5; ctx.stroke();
    }

    _drawZs() {
      const ctx = this.ctx;
      this.floatingZs.forEach((z) => {
        ctx.save();
        ctx.globalAlpha  = Math.max(0, z.alpha);
        ctx.font         = `bold ${z.size | 0}px system-ui, sans-serif`;
        ctx.fillStyle    = "#c4b5fd";
        ctx.textAlign    = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("z", z.x, z.y);
        ctx.restore();
      });
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
      this.fileX = 188 + 16 + 58;
      this.fileY = 55;
    }

    /* ── Public API ──────────────────────────────── */

    /**
     * Trigger one of the 10 named autonomous animations.
     * name: "dance"|"rainbow"|"party"|"sleep"|"stretch"|"bounce"|"coil"|"heartbeat"|"flip"|"loop"
     * cb: optional callback when animation finishes
     */
    playAnimation(name, cb) {
      if (this._busy) { if (cb) setTimeout(cb, 50); return; }
      this._animCb = cb || null;
      this.smiling = false; this.winking = false; this.rosy = false;
      this.mouthOpen = false;
      this._go(name);
    }

    /** Called on each file drop */
    async snackFile() {
      if (this._busy) return;
      if (this._s !== "idle" && this._s !== "snack-happy") return;

      this._placeFileIcon();
      this.fileAlpha = 1; this.fileScale = 1;
      this._go("snacking");
      this._popChomp("CHOMP! 🐍");

      await wait(1550);
      if (this._s === "snacking") this._go("snack-happy");
    }

    /** Wraps PDF processing */
    async processStart(fn) {
      this._busy = true;

      if (this.bumps.length === 0) {
        this._placeFileIcon();
        this.fileAlpha = 1; this.fileScale = 1;
        this._go("eating");
        this._popChomp("CHOMP! 🐍");
        await wait(1700);
      } else {
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
