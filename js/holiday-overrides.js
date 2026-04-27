/* global window */
/* Supplements Nager.Date: many Islamic (Hijri) public holidays are wrong or off-by-days for TR
 * (github.com/nager/Nager.Date issues #611, #255). We strip those rows and insert Diyanet-style
 * Gregorian dates. Table maintained from official / widely published TR calendars; extend yearly. */
(function (w) {
  "use strict";

  function t1(d) { return { date: d, localName: "Ramazan Bayramı 1. Gün", name: "Eid al-Fitr (1st day)", countryCode: "TR", global: true, types: ["Public"] }; }
  function t2(d) { return { date: d, localName: "Ramazan Bayramı 2. Gün", name: "Eid al-Fitr (2nd day)", countryCode: "TR", global: true, types: ["Public"] }; }
  function t3(d) { return { date: d, localName: "Ramazan Bayramı 3. Gün", name: "Eid al-Fitr (3rd day)", countryCode: "TR", global: true, types: ["Public"] }; }
  function k1(d) { return { date: d, localName: "Kurban Bayramı 1. Gün", name: "Eid al-Adha (1st day)", countryCode: "TR", global: true, types: ["Public"] }; }
  function k2(d) { return { date: d, localName: "Kurban Bayramı 2. Gün", name: "Eid al-Adha (2nd day)", countryCode: "TR", global: true, types: ["Public"] }; }
  function k3(d) { return { date: d, localName: "Kurban Bayramı 3. Gün", name: "Eid al-Adha (3rd day)", countryCode: "TR", global: true, types: ["Public"] }; }
  function k4(d) { return { date: d, localName: "Kurban Bayramı 4. Gün", name: "Eid al-Adha (4th day)", countryCode: "TR", global: true, types: ["Public"] }; }

  var TR_EID = {
    2020: [t1("2020-05-24"), t2("2020-05-25"), t3("2020-05-26"), k1("2020-07-31"), k2("2020-08-01"), k3("2020-08-02"), k4("2020-08-03")],
    2021: [t1("2021-05-13"), t2("2021-05-14"), t3("2021-05-15"), k1("2021-07-20"), k2("2021-07-21"), k3("2021-07-22"), k4("2021-07-23")],
    2022: [t1("2022-05-02"), t2("2022-05-03"), t3("2022-05-04"), k1("2022-07-09"), k2("2022-07-10"), k3("2022-07-11"), k4("2022-07-12")],
    2023: [t1("2023-04-21"), t2("2023-04-22"), t3("2023-04-23"), k1("2023-06-28"), k2("2023-06-29"), k3("2023-06-30"), k4("2023-07-01")],
    2024: [t1("2024-04-10"), t2("2024-04-11"), t3("2024-04-12"), k1("2024-06-16"), k2("2024-06-17"), k3("2024-06-18"), k4("2024-06-19")],
    2025: [t1("2025-03-30"), t2("2025-03-31"), t3("2025-04-01"), k1("2025-06-06"), k2("2025-06-07"), k3("2025-06-08"), k4("2025-06-09")],
    2026: [t1("2026-03-20"), t2("2026-03-21"), t3("2026-03-22"), k1("2026-05-27"), k2("2026-05-28"), k3("2026-05-29"), k4("2026-05-30")],
    2027: [t1("2027-03-09"), t2("2027-03-10"), t3("2027-03-11"), k1("2027-05-16"), k2("2027-05-17"), k3("2027-05-18"), k4("2027-05-19")],
    2028: [t1("2028-02-27"), t2("2028-02-28"), t3("2028-02-29"), k1("2028-05-05"), k2("2028-05-06"), k3("2028-05-07"), k4("2028-05-08")],
    2029: [t1("2029-02-14"), t2("2029-02-15"), t3("2029-02-16"), k1("2029-04-24"), k2("2029-04-25"), k3("2029-04-26"), k4("2029-04-27")],
    2030: [t1("2030-02-04"), t2("2030-02-05"), t3("2030-02-06"), k1("2030-04-13"), k2("2030-04-14"), k3("2030-04-15"), k4("2030-04-16")],
  };

  function isNagerUnreliableReligious(row) {
    var n = ((row && row.name) || "") + " " + ((row && row.localName) || "");
    if (/feast of ramadan|feast of sacrifice|şeker|şeker bayramı/i.test(n)) return true;
    if (row && row.name && (/^eid al-fitr/i.test(row.name) || /^eid al-adha/i.test(row.name))) return true;
    if (row && row.countryCode === "TR" && /ramazan|kurban|bayramı/i.test(n) && /eid|feast|ramadan|sacrifice|kurban|ramazan/i.test(n)) {
      return true;
    }
    return false;
  }

  function mergePublicHolidays(country, year, rows) {
    var y = parseInt(year, 10);
    var list = Array.isArray(rows) ? rows.slice() : [];
    if (country !== "TR") {
      list.sort(function (a, b) { return a.date.localeCompare(b.date); });
      return { rows: list, trReligiousApplied: false, trReligiousUnknownYear: false };
    }
    var filtered = list.filter(function (r) { return !isNagerUnreliableReligious(r); });
    var extra = TR_EID[y];
    if (extra && extra.length) {
      var merged = filtered.concat(extra);
      merged.sort(function (a, b) {
        var c = a.date.localeCompare(b.date);
        return c !== 0 ? c : String(a.localName).localeCompare(String(b.localName));
      });
      return { rows: merged, trReligiousApplied: true, trReligiousUnknownYear: false };
    }
    filtered.sort(function (a, b) { return a.date.localeCompare(b.date); });
    return { rows: filtered, trReligiousApplied: false, trReligiousUnknownYear: true };
  }

  w.HolidayOverrides = {
    mergePublicHolidays: mergePublicHolidays,
    hasTrEidDataForYear: function (year) {
      var y = parseInt(year, 10);
      return !!(TR_EID[y] && TR_EID[y].length);
    },
  };
})(window);
