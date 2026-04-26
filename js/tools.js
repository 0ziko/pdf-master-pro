/* global window, document, crypto */
(function (w) {
  "use strict";

  /* ══════════════════════════════════════════════
     1. WORD COUNTER
  ══════════════════════════════════════════════ */
  function analyzeText(text) {
    const trimmed = text.trim();
    const words       = trimmed ? trimmed.split(/\s+/).length : 0;
    const chars       = text.length;
    const charsNoSpc  = text.replace(/\s/g, "").length;
    const sentences   = trimmed.split(/[.!?]+/).filter((s) => s.trim()).length;
    const paragraphs  = trimmed ? text.split(/\n\n+/).filter((p) => p.trim()).length || 1 : 0;
    const readingMins = Math.ceil(words / 200);
    return { words, chars, charsNoSpc, sentences, paragraphs, readingMins };
  }

  /* ══════════════════════════════════════════════
     2. AGE CALCULATOR
  ══════════════════════════════════════════════ */
  function parseLocalDateInput(birthStr) {
    if (!birthStr || typeof birthStr !== "string") return null;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthStr.trim());
    if (m) {
      const y = parseInt(m[1], 10), mo = parseInt(m[2], 10) - 1, d = parseInt(m[3], 10);
      const dt = new Date(y, mo, d);
      if (dt.getFullYear() === y && dt.getMonth() === mo && dt.getDate() === d) return dt;
    }
    const d = new Date(birthStr);
    return isNaN(d) ? null : d;
  }

  function calcAge(birthStr) {
    const birth = parseLocalDateInput(String(birthStr || ""));
    if (!birth) return null;
    const now = new Date();

    let years  = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth()    - birth.getMonth();
    let days   = now.getDate()     - birth.getDate();

    if (days < 0) {
      months--;
      days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    }
    if (months < 0) { years--; months += 12; }

    const totalDays = Math.floor((now - birth) / 86400000);
    const totalWeeks = Math.floor(totalDays / 7);
    const totalHours = Math.floor((now - birth) / 3600000);

    const nextBday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBday <= now) nextBday.setFullYear(nextBday.getFullYear() + 1);
    const daysToNext = Math.ceil((nextBday - now) / 86400000);

    return { years, months, days, totalDays, totalWeeks, totalHours, daysToNext, bornDow: birth.getDay() };
  }

  /* ══════════════════════════════════════════════
     3. BMI CALCULATOR
  ══════════════════════════════════════════════ */
  function calcBMI(heightCm, weightKg) {
    const h   = heightCm / 100;
    const bmi = weightKg / (h * h);

    let catKey, color;
    if      (bmi < 18.5) { catKey = "under"; color = "#60a5fa"; }
    else if (bmi < 25)   { catKey = "normal"; color = "#4ade80"; }
    else if (bmi < 30)   { catKey = "over";   color = "#fbbf24"; }
    else                 { catKey = "obese";  color = "#f87171"; }

    const minNormal = (18.5 * h * h).toFixed(1);
    const maxNormal = (24.9 * h * h).toFixed(1);
    const pct = Math.min(100, Math.max(0, ((bmi - 10) / (45 - 10)) * 100));

    return { bmi: bmi.toFixed(1), catKey, color, minNormal, maxNormal, pct };
  }

  /* ══════════════════════════════════════════════
     4. PERCENTAGE CALCULATOR
  ══════════════════════════════════════════════ */
  function pctOf(pct, total)     { return +((pct / 100) * total); }
  function isWhatPct(part, whole){ return +((part / whole) * 100); }
  function pctChange(from, to)   {
    const v = ((to - from) / Math.abs(from)) * 100;
    return { value: Math.abs(v), sign: v >= 0 ? "+" : "−" };
  }

  /* ══════════════════════════════════════════════
     5. TEXT CASE CONVERTER
  ══════════════════════════════════════════════ */
  function convertCase(text, mode) {
    switch (mode) {
      case "upper":
        return text.toUpperCase();
      case "lower":
        return text.toLowerCase();
      case "title":
        return text.replace(/\b\w/g, (c) => c.toUpperCase());
      case "sentence":
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
      case "camel":
        return text.toLowerCase()
          .replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase());
      case "pascal":
        return text
          .replace(/(?:^|\s+|[^a-zA-Z0-9]+)(\w)/g, (_, c) => c.toUpperCase());
      case "snake":
        return text.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
      case "kebab":
        return text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      case "reverse":
        return text.split("").reverse().join("");
      case "alternating":
        return text.split("").map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join("");
      default:
        return text;
    }
  }

  /* ══════════════════════════════════════════════
     6. RANDOM NUMBER GENERATOR
  ══════════════════════════════════════════════ */
  function randomNums(min, max, count, unique, sorted) {
    if (min > max) throw new Error("i18n:err.rng.minmax");
    if (unique && (max - min + 1) < count)
      throw new Error("i18n:err.rng.uniq|" + (max - min + 1) + "|" + min + "|" + max);

    const arr = [];
    if (unique) {
      const pool = [];
      for (let i = min; i <= max; i++) pool.push(i);
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      arr.push(...pool.slice(0, count));
    } else {
      for (let i = 0; i < count; i++)
        arr.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return sorted ? arr.sort((a, b) => a - b) : arr;
  }

  /* ══════════════════════════════════════════════
     7. PASSWORD GENERATOR
  ══════════════════════════════════════════════ */
  function generatePwd(len, opts) {
    const { upper, lower, nums, syms, noAmbig } = opts;
    let pool = "";
    if (upper) pool += noAmbig ? "ABCDEFGHJKLMNPQRSTUVWXYZ" : "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (lower) pool += noAmbig ? "abcdefghjkmnpqrstuvwxyz"  : "abcdefghijklmnopqrstuvwxyz";
    if (nums)  pool += noAmbig ? "23456789" : "0123456789";
    if (syms)  pool += "!@#$%^&*()-_=+[]{}|;:,.<>?";
    if (!pool)  pool = "abcdefghijklmnopqrstuvwxyz";

    const buf = new Uint32Array(len);
    crypto.getRandomValues(buf);
    return Array.from(buf, (v) => pool[v % pool.length]).join("");
  }

  function pwdStrength(pwd) {
    let score = 0;
    if (pwd.length >= 8)          score++;
    if (pwd.length >= 12)         score++;
    if (pwd.length >= 16)         score++;
    if (/[A-Z]/.test(pwd))        score++;
    if (/[a-z]/.test(pwd))        score++;
    if (/[0-9]/.test(pwd))        score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 2) return { strength: 1, pct: 20,  color: "#f87171" };
    if (score <= 4) return { strength: 2, pct: 50,  color: "#fbbf24" };
    if (score <= 5) return { strength: 3, pct: 75,  color: "#4ade80" };
    return                { strength: 4, pct: 100, color: "#22d3ee" };
  }

  /* ══════════════════════════════════════════════
     8. QR CODE  — rendered via qrcode.js library
  ══════════════════════════════════════════════ */
  async function renderQR(canvasId, text, opts) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !w.QRCode) throw new Error("i18n:err.qr.nolib");
    if (!text.trim()) throw new Error("i18n:err.qr.empty");
    await w.QRCode.toCanvas(canvas, text, {
      width:            opts.size || 256,
      errorCorrectionLevel: opts.ecl || "M",
      color: { dark: opts.dark || "#000000", light: opts.light || "#ffffff" },
    });
  }

  /* ══════════════════════════════════════════════
     9. BASE64 CONVERTER
  ══════════════════════════════════════════════ */
  function b64encode(str) {
    try   { return btoa(unescape(encodeURIComponent(str))); }
    catch (e) { throw new Error("i18n:err.b64.encode"); }
  }
  function b64decode(str) {
    try   { return decodeURIComponent(escape(atob(str.trim()))); }
    catch (e) { throw new Error("i18n:err.b64.bad"); }
  }

  /* ══════════════════════════════════════════════
     10. UNIX TIMESTAMP
  ══════════════════════════════════════════════ */
  function nowUnix() { return Math.floor(Date.now() / 1000); }

  function dateToUnix(dateStr) {
    const d = new Date(dateStr);
    if (isNaN(d)) throw new Error("i18n:err.unix.date");
    return Math.floor(d.getTime() / 1000);
  }

  function unixToDate(ts) {
    const n = Number(ts);
    if (!Number.isFinite(n)) throw new Error("i18n:err.unix.ts");
    const d = new Date(n * 1000);
    return {
      iso:   d.toISOString(),
      local: d.toLocaleString(),
      utc:   d.toUTCString(),
    };
  }

  /* ── Export ───────────────────────────────── */
  w.SnakeTools = {
    analyzeText,
    calcAge,
    calcBMI,
    pctOf, isWhatPct, pctChange,
    convertCase,
    randomNums,
    generatePwd, pwdStrength,
    renderQR,
    b64encode, b64decode,
    nowUnix, dateToUnix, unixToDate,
  };
})(window);
