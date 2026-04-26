/* global window */
(function (w) {
  "use strict";

  /* ── X% of Y (micro calculator pages) ─────────── */
  function calcPercentOf(pct, ofVal) {
    const p = parseFloat(pct), t = parseFloat(ofVal);
    if (isNaN(p) || isNaN(t)) return null;
    return { value: r2((p / 100) * t) };
  }

  /* ── Discount ────────────────────────────────── */
  function calcDiscount(original, pct) {
    const o = parseFloat(original), p = parseFloat(pct);
    if (isNaN(o) || isNaN(p)) return null;
    const saved  = o * p / 100;
    const final  = o - saved;
    return { original: o, pct: p, saved: r2(saved), final: r2(final) };
  }

  /* ── VAT / Tax ───────────────────────────────── */
  function calcVAT(amount, rate, mode) {
    const a = parseFloat(amount), r = parseFloat(rate);
    if (isNaN(a) || isNaN(r)) return null;
    if (mode === "add") {
      const tax = a * r / 100;
      return { net: r2(a), tax: r2(tax), gross: r2(a + tax), rate: r };
    } else {
      const net = a / (1 + r / 100);
      const tax = a - net;
      return { gross: r2(a), tax: r2(tax), net: r2(net), rate: r };
    }
  }

  /* ── Tip Calculator ──────────────────────────── */
  function calcTip(bill, tipPct, people) {
    const b = parseFloat(bill), t = parseFloat(tipPct), p = parseInt(people) || 1;
    if (isNaN(b) || isNaN(t)) return null;
    const tip   = b * t / 100;
    const total = b + tip;
    return {
      bill: r2(b), tipPct: t, tip: r2(tip),
      total: r2(total), perPerson: r2(total / p), people: p,
    };
  }

  /* ── Compound Interest ───────────────────────── */
  function calcCompound(principal, rate, years, n) {
    const P = parseFloat(principal), r = parseFloat(rate) / 100;
    const t = parseFloat(years),     freq = parseInt(n) || 1;
    if (isNaN(P) || isNaN(r) || isNaN(t)) return null;
    const A = P * Math.pow(1 + r / freq, freq * t);
    return {
      principal: r2(P), rate: parseFloat(rate), years: t, freq,
      finalAmount: r2(A), interest: r2(A - P),
    };
  }

  /* ── Loan / EMI ──────────────────────────────── */
  function calcLoan(principal, annualRate, months) {
    const P = parseFloat(principal), r = parseFloat(annualRate) / 100 / 12;
    const n = parseInt(months);
    if (isNaN(P) || isNaN(r) || isNaN(n) || n <= 0) return null;
    let emi, totalPay, interest;
    if (r === 0) {
      emi = P / n; totalPay = P; interest = 0;
    } else {
      emi = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
      totalPay = emi * n;
      interest = totalPay - P;
    }
    return { emi: r2(emi), totalPay: r2(totalPay), interest: r2(interest), principal: r2(P), months: n };
  }

  /* ── BMR / TDEE ──────────────────────────────── */
  function calcBMR(weight, height, age, sex, activity) {
    const w = parseFloat(weight), h = parseFloat(height), a = parseInt(age);
    if (isNaN(w) || isNaN(h) || isNaN(a)) return null;
    /* Mifflin-St Jeor */
    let bmr = 10 * w + 6.25 * h - 5 * a + (sex === "m" ? 5 : -161);
    const factors = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, veryActive: 1.9 };
    const tdee = bmr * (factors[activity] || 1.2);
    return {
      bmr: Math.round(bmr), tdee: Math.round(tdee),
      lose: Math.round(tdee - 500), gain: Math.round(tdee + 500),
    };
  }

  /* ── Ideal Weight (Hamwi) ────────────────────── */
  function calcIdealWeight(heightCm, sex) {
    const h = parseFloat(heightCm);
    if (isNaN(h)) return null;
    const inchOver5 = (h / 2.54) - 60;
    let base = sex === "m" ? 48 : 45.4;
    let ideal = base + 2.7 * inchOver5;
    ideal = Math.max(ideal, base);
    return { ideal: r2(ideal), min: r2(ideal * 0.9), max: r2(ideal * 1.1), height: h };
  }

  /* ── Water Intake ────────────────────────────── */
  function calcWater(weightKg, activityMin) {
    const w = parseFloat(weightKg), a = parseFloat(activityMin) || 0;
    if (isNaN(w)) return null;
    const base = w * 35;          /* 35 mL per kg */
    const extra = a / 30 * 350;   /* 350 mL per 30 min of activity */
    const total = base + extra;
    return { ml: Math.round(total), liters: r2(total / 1000), cups: r2(total / 240), glasses: r2(total / 250) };
  }

  /* ── Sleep Cycles ─────────────────────────────── */
  function calcSleep(bedtime, wakeSets) {
    /* bedtime = "HH:MM", returns array of wake times for 4-6 cycles */
    const [h, m] = bedtime.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return null;
    const start = h * 60 + m + 15;   /* ~15 min to fall asleep */
    const cycle = 90;
    const results = [];
    for (let i = 4; i <= 6; i++) {
      const wakeMin = (start + cycle * i) % 1440;
      const wh = Math.floor(wakeMin / 60), wm = wakeMin % 60;
      results.push({
        cycles: i,
        hours: r2(cycle * i / 60),
        time: `${String(wh).padStart(2,"0")}:${String(wm).padStart(2,"0")}`,
      });
    }
    return results;
  }

  /* ── Pregnancy Due Date ───────────────────────── */
  function calcDueDate(lmpStr) {
    const lmp = new Date(lmpStr);
    if (isNaN(lmp)) return null;
    const due = new Date(lmp.getTime() + 280 * 86400000);   /* Naegele's rule: LMP + 280 days */
    const today = new Date();
    const diffDays = Math.floor((due - today) / 86400000);
    const weeksPregn = Math.floor((today - lmp) / (7 * 86400000));
    const trimester = weeksPregn < 13 ? 1 : weeksPregn < 27 ? 2 : 3;
    return {
      dueDate: due.toLocaleDateString("en-GB", { day:"2-digit", month:"long", year:"numeric" }),
      daysLeft: diffDays > 0 ? diffDays : 0,
      weeksPregn, trimester,
    };
  }

  /* ── Fuel Cost ────────────────────────────────── */
  function calcFuel(distance, efficiency, fuelPrice, unit) {
    const d = parseFloat(distance), e = parseFloat(efficiency), p = parseFloat(fuelPrice);
    if (isNaN(d) || isNaN(e) || isNaN(p) || e === 0) return null;
    let liters;
    if (unit === "l100") liters = d / 100 * e;            /* L/100km */
    else if (unit === "kml") liters = d / e;               /* km/L   */
    else liters = d / e / 0.621371 * 3.78541;             /* mpg    */
    return { liters: r2(liters), cost: r2(liters * p), distance: d };
  }

  function r2(n) { return Math.round(n * 100) / 100; }

  function _gcdInt(a, b) {
    a = Math.abs(Math.floor(a));
    b = Math.abs(Math.floor(b));
    if (!b) return a;
    return _gcdInt(b, a % b);
  }

  /* Simplify two-part ratio (e.g. 4 and 6 → 2:3) */
  function calcRatioSimplify(a, b) {
    let x = Math.round(parseFloat(a));
    let y = Math.round(parseFloat(b));
    if (isNaN(x) || isNaN(y) || y === 0) return null;
    const g = _gcdInt(x, y);
    return { a: x / g, b: y / g };
  }

  /* Calendar days and Mon–Fri working days between two ISO dates (YYYY-MM-DD) */
  function dateRangeStats(isoA, isoB) {
    const sA = String(isoA).slice(0, 10);
    const sB = String(isoB).slice(0, 10);
    const a = new Date(sA + "T12:00:00");
    const b = new Date(sB + "T12:00:00");
    if (isNaN(a) || isNaN(b)) return null;
    const min = a < b ? a : b;
    const max = a < b ? b : a;
    const totalDays = Math.round((max - min) / 86400000);
    let wd = 0;
    for (let d = new Date(min); d <= max; d.setDate(d.getDate() + 1)) {
      const day = d.getDay();
      if (day !== 0 && day !== 6) wd++;
    }
    return { totalDays, workingDays: wd, totalWeeks: (totalDays / 7).toFixed(2) };
  }

  function calcProfitMargin(cost, price) {
    const c = parseFloat(cost);
    const p = parseFloat(price);
    if (isNaN(c) || isNaN(p) || p === 0) return null;
    return {
      marginPct: r2(((p - c) / p) * 100),
      markupPct: c === 0 ? null : r2(((p - c) / c) * 100),
    };
  }

  /* Megabit per second → megabyte per second (1 byte = 8 bits) */
  function mbpsToMBps(mbps) {
    const m = parseFloat(mbps);
    if (isNaN(m)) return null;
    return r2(m / 8);
  }

  function decimalToBinaryStr(n) {
    const v = parseInt(n, 10);
    if (isNaN(v) || v < 0) return null;
    return v.toString(2);
  }

  function binaryToDecimal(s) {
    const t = String(s).replace(/[^01]/g, "");
    if (!t) return null;
    const v = parseInt(t, 2);
    return isNaN(v) ? null : v;
  }

  w.CalcTools = {
    calcPercentOf,
    calcDiscount, calcVAT, calcTip, calcCompound, calcLoan,
    calcBMR, calcIdealWeight, calcWater, calcSleep, calcDueDate, calcFuel,
    calcRatioSimplify, dateRangeStats, calcProfitMargin, mbpsToMBps,
    decimalToBinaryStr, binaryToDecimal,
  };
})(window);
