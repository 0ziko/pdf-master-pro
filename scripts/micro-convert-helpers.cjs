/**
 * Node-side conversion for micro page examples only.
 * MUST stay aligned with convertPair in js/units.js (factors and temperature logic).
 */
"use strict";

/* ── Temperature (same as units.js) ── */
function tempToC(val, from) {
  if (from === "c") return val;
  if (from === "f") return (val - 32) * 5 / 9;
  if (from === "k") return val - 273.15;
  if (from === "r") return (val - 491.67) * 5 / 9;
  return NaN;
}
function tempFromC(val, to) {
  if (to === "c") return val;
  if (to === "f") return val * 9 / 5 + 32;
  if (to === "k") return val + 273.15;
  if (to === "r") return (val + 273.15) * 9 / 5;
  return NaN;
}

/* ── CATS: copy of units.js tables for categories used by UNIT_PAIRS only ── */
const CATS = {
  length: {
    base: "meter",
    units: [
      { id: "kilometer", factor: 1e3 },
      { id: "meter", factor: 1 },
      { id: "centimeter", factor: 1e-2 },
      { id: "millimeter", factor: 1e-3 },
      { id: "mile", factor: 1609.344 },
      { id: "yard", factor: 0.9144 },
      { id: "foot", factor: 0.3048 },
      { id: "inch", factor: 0.0254 },
    ],
  },
  weight: {
    base: "kilogram",
    units: [
      { id: "metric_ton", factor: 1e3 },
      { id: "kilogram", factor: 1 },
      { id: "gram", factor: 1e-3 },
      { id: "pound", factor: 0.453592 },
      { id: "ounce", factor: 0.0283495 },
      { id: "stone", factor: 6.35029 },
    ],
  },
  temperature: { special: "temperature", units: [{ id: "c" }, { id: "f" }, { id: "k" }, { id: "r" }] },
  area: {
    base: "square_meter",
    units: [
      { id: "square_kilometer", factor: 1e6 },
      { id: "square_meter", factor: 1 },
      { id: "hectare", factor: 1e4 },
      { id: "acre", factor: 4046.856 },
      { id: "square_foot", factor: 0.092903 },
    ],
  },
  volume: {
    base: "liter",
    units: [
      { id: "liter", factor: 1 },
      { id: "milliliter", factor: 0.001 },
      { id: "us_gallon", factor: 3.78541 },
      { id: "us_fl_oz", factor: 0.0295735 },
    ],
  },
  speed: {
    base: "meter_per_second",
    units: [
      { id: "kilometer_per_hour", factor: 1 / 3.6 },
      { id: "mile_per_hour", factor: 0.44704 },
      { id: "knot", factor: 0.514444 },
    ],
  },
  data: {
    base: "byte",
    units: [
      { id: "kilobyte", factor: 1024 },
      { id: "megabyte", factor: 1048576 },
      { id: "gigabyte", factor: 1073741824 },
      { id: "terabyte", factor: 1.0995e12 },
    ],
  },
};

function fmt(n) {
  if (!isFinite(n)) return "—";
  if (Math.abs(n) === 0) return "0";
  if (Math.abs(n) >= 1e6 || (Math.abs(n) < 0.0001 && n !== 0)) return n.toExponential(4);
  return String(parseFloat(parseFloat(n).toPrecision(8)));
}

function convertPairValue(catId, value, fromId, toId) {
  const cat = CATS[catId];
  if (!cat) return null;
  if (cat.special === "temperature") {
    const c = tempToC(value, fromId);
    return fmt(tempFromC(c, toId));
  }
  const fromU = cat.units.find((u) => u.id === fromId);
  const toU = cat.units.find((u) => u.id === toId);
  if (!fromU || !toU) return null;
  const baseV = value * fromU.factor;
  return fmt(baseV / toU.factor);
}

module.exports = { convertPairValue, CATS, fmt };
