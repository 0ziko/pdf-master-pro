/* global window */
/* Life tools: tropical zodiac, public holidays (Nager API) */
(function (w) {
  "use strict";

  /** Tropical sun sign, month 1–12, day 1–31. */
  function sunSign(month, day) {
    const m = month;
    const d = day;
    if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) return "aries";
    if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) return "taurus";
    if ((m === 5 && d >= 21) || (m === 6 && d <= 20)) return "gemini";
    if ((m === 6 && d >= 21) || (m === 7 && d <= 22)) return "cancer";
    if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) return "leo";
    if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) return "virgo";
    if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) return "libra";
    if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) return "scorpio";
    if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) return "sagittarius";
    if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) return "capricorn";
    if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) return "aquarius";
    if ((m === 2 && d >= 19) || (m === 3 && d <= 20)) return "pisces";
    return "aries";
  }

  /** ISO date "YYYY-MM-DD" → 0=Sun … 6=Sat (local) */
  function dayOfWeekFromISO(iso) {
    const p = String(iso).split("-");
    if (p.length < 3) return 0;
    const dt = new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10), 12, 0, 0);
    return isNaN(dt) ? 0 : dt.getDay();
  }

  const DOW_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

  function isoWeekNumber(iso) {
    const p = String(iso).split("-");
    if (p.length < 3) return null;
    const t = new Date(Date.UTC(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10), 0, 0, 0, 0));
    if (isNaN(t)) return null;
    const d = new Date(t);
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  }

  function fetchNagerCountries() {
    return fetch("https://date.nager.at/api/v3/AvailableCountries", { method: "GET" })
      .then((r) => { if (!r.ok) throw new Error("c"); return r.json(); });
  }

  function fetchNagerHolidays(year, country) {
    return fetch("https://date.nager.at/api/v3/PublicHolidays/" + year + "/" + country, { method: "GET" })
      .then((r) => { if (!r.ok) throw new Error("h"); return r.json(); });
  }

  w.LifeTools = {
    sunSign,
    dayOfWeekFromISO,
    DOW_KEYS,
    isoWeekNumber,
    fetchNagerCountries,
    fetchNagerHolidays,
  };
})(window);
