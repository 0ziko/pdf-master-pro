/* global window, document */
/* Micro SEO landing pages: unit pair + small calculators. Reads window.__MICRO_SPOKE__ */
(function () {
  "use strict";

  function byId(id) {
    return document.getElementById(id);
  }

  function initUnit() {
    var c = window.__MICRO_SPOKE__;
    if (!c || c.type !== "unit" || !window.SnakeUnits) return;
    var inp = byId("spoke-input");
    var out = byId("spoke-result");
    if (!inp || !out) return;
    var cat = window.SnakeUnits.CATS[c.category];
    if (!cat) return;
    var toU = (cat.units || []).find(function (u) { return u.id === c.to; });
    var sym = byId("spoke-result-unit");
    function run() {
      var v = parseFloat(inp.value);
      if (isNaN(v)) {
        out.textContent = "—";
        if (sym) sym.textContent = "";
        return;
      }
      var s = window.SnakeUnits.convertPair(c.category, v, c.from, c.to);
      out.textContent = s != null ? s : "—";
      if (sym) sym.textContent = toU ? toU.sym : "";
    }
    inp.addEventListener("input", run);
    inp.addEventListener("change", run);
    run();
  }

  function outHtml(id, html) {
    var el = byId(id);
    if (el) el.innerHTML = html;
  }
  function outText(id, t) {
    var el = byId(id);
    if (el) el.textContent = t;
  }

  function initCalc() {
    var c = window.__MICRO_SPOKE__;
    if (!c || c.type !== "calc" || !c.calc) return;
    var T = window.CalcTools;
    var S = window.SnakeTools;
    var mode = c.calc;
    function wire(ids, fn) {
      ids.forEach(function (id) {
        var n = byId(id);
        if (n) n.addEventListener("input", fn);
      });
    }

    if (mode === "pctOf" && T) {
      var runPct = function () {
        var p = byId("spoke-pct");
        var o = byId("spoke-of");
        var r = T.calcPercentOf(p && p.value, o && o.value);
        outText("spoke-out", r ? String(r.value) : "—");
      };
      wire(["spoke-pct", "spoke-of"], runPct);
      runPct();
    } else if (mode === "discount" && T) {
      var runD = function () {
        var x = T.calcDiscount(byId("spoke-price") && byId("spoke-price").value, byId("spoke-dpct") && byId("spoke-dpct").value);
        if (!x) { outText("spoke-out", "—"); return; }
        outHtml("spoke-out", "<div>Final: <strong>" + x.final + "</strong></div><div class=\"spoke-sub\">You save: " + x.saved + " (" + x.pct + "%)</div>");
      };
      wire(["spoke-price", "spoke-dpct"], runD);
      runD();
    } else if (mode === "ratio" && T) {
      var runR = function () {
        var r = T.calcRatioSimplify(byId("spoke-ra") && byId("spoke-ra").value, byId("spoke-rb") && byId("spoke-rb").value);
        outText("spoke-out", r ? r.a + " : " + r.b : "—");
      };
      wire(["spoke-ra", "spoke-rb"], runR);
      runR();
    } else if (mode === "age" && S) {
      var runA = function () {
        var v = byId("spoke-birth") && byId("spoke-birth").value;
        if (!v) { outText("spoke-out", "—"); return; }
        var r = S.calcAge(v);
        if (!r) { outText("spoke-out", "—"); return; }
        outHtml("spoke-out", "<p><strong>" + r.years + "</strong> years, " + r.months + " months, " + r.days + " days</p><p class=\"spoke-sub\">Next birthday in " + r.daysToNext + " days · Born on a " + r.bornOn + "</p>");
      };
      if (byId("spoke-birth")) {
        byId("spoke-birth").addEventListener("change", runA);
        byId("spoke-birth").addEventListener("input", runA);
        runA();
      }
    } else if (mode === "dateDiff" && T) {
      var runDd = function () {
        var r = T.dateRangeStats(
          byId("spoke-d1") && byId("spoke-d1").value,
          byId("spoke-d2") && byId("spoke-d2").value
        );
        if (!r) { outText("spoke-out", "—"); return; }
        outHtml("spoke-out", "<div>Calendar days: <strong>" + r.totalDays + "</strong></div><div>Working days (Mon–Fri): <strong>" + r.workingDays + "</strong></div><div>Weeks: " + r.totalWeeks + "</div>");
      };
      wire(["spoke-d1", "spoke-d2"], runDd);
      runDd();
    } else if (mode === "compound" && T) {
      var runC = function () {
        var r = T.calcCompound(
          byId("spoke-cp") && byId("spoke-cp").value,
          byId("spoke-cr") && byId("spoke-cr").value,
          byId("spoke-cy") && byId("spoke-cy").value,
          byId("spoke-cn") && byId("spoke-cn").value
        );
        if (!r) { outText("spoke-out", "—"); return; }
        outHtml("spoke-out", "<div>Final: <strong>" + r.finalAmount + "</strong></div><div>Interest: " + r.interest + "</div>");
      };
      wire(["spoke-cp", "spoke-cr", "spoke-cy", "spoke-cn"], runC);
      runC();
    } else if (mode === "loan" && T) {
      var runL = function () {
        var r = T.calcLoan(
          byId("spoke-loan-p") && byId("spoke-loan-p").value,
          byId("spoke-loan-r") && byId("spoke-loan-r").value,
          byId("spoke-loan-n") && byId("spoke-loan-n").value
        );
        if (!r) { outText("spoke-out", "—"); return; }
        outHtml("spoke-out", "<div>Monthly payment: <strong>" + r.emi + "</strong></div><div>Total paid: " + r.totalPay + " · Interest: " + r.interest + "</div>");
      };
      wire(["spoke-loan-p", "spoke-loan-r", "spoke-loan-n"], runL);
      runL();
    } else if (mode === "profit" && T) {
      var runP = function () {
        var r = T.calcProfitMargin(
          byId("spoke-pc") && byId("spoke-pc").value,
          byId("spoke-pp") && byId("spoke-pp").value
        );
        if (!r) { outText("spoke-out", "—"); return; }
        outHtml("spoke-out", "<div>Margin: <strong>" + r.marginPct + "%</strong></div><div>Markup: " + (r.markupPct != null ? r.markupPct + "%" : "—") + "</div>");
      };
      wire(["spoke-pc", "spoke-pp"], runP);
      runP();
    } else if (mode === "mbps" && T) {
      var runM = function () {
        var r = T.mbpsToMBps(byId("spoke-mbps") && byId("spoke-mbps").value);
        outText("spoke-out", r != null ? String(r) : "—");
      };
      if (byId("spoke-mbps")) {
        byId("spoke-mbps").addEventListener("input", runM);
        runM();
      }
    } else if (mode === "binary" && T) {
      if (byId("spoke-dec")) {
        byId("spoke-dec").addEventListener("input", function () {
          var s = T.decimalToBinaryStr(this.value);
          if (byId("spoke-bin")) byId("spoke-bin").value = s != null ? s : "";
        });
      }
      if (byId("spoke-bin")) {
        byId("spoke-bin").addEventListener("input", function () {
          var n = T.binaryToDecimal(this.value);
          if (byId("spoke-dec")) byId("spoke-dec").value = n != null ? String(n) : "";
        });
      }
    }
  }

  function boot() {
    var c = window.__MICRO_SPOKE__ || {};
    if (c.type === "unit") initUnit();
    else if (c.type === "calc") initCalc();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
