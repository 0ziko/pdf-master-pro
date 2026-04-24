/* global window */
(function (w) {
  "use strict";

  /* ── Temperature is special (non-multiplicative) ── */
  function tempToC(val, from) {
    if (from === "c") return val;
    if (from === "f") return (val - 32) * 5 / 9;
    if (from === "k") return val - 273.15;
    if (from === "r") return (val - 491.67) * 5 / 9;
  }
  function tempFromC(val, to) {
    if (to === "c") return val;
    if (to === "f") return val * 9 / 5 + 32;
    if (to === "k") return val + 273.15;
    if (to === "r") return (val + 273.15) * 9 / 5;
  }

  /* ── Unit tables (factor = how many BASE UNITS 1 of this unit equals) ── */
  const CATS = {
    length: {
      label: "Length", icon: "📏",
      base: "meter",
      units: [
        { id: "kilometer",     sym: "km",   label: "Kilometer",      factor: 1e3 },
        { id: "meter",         sym: "m",    label: "Meter",          factor: 1 },
        { id: "centimeter",    sym: "cm",   label: "Centimeter",     factor: 1e-2 },
        { id: "millimeter",    sym: "mm",   label: "Millimeter",     factor: 1e-3 },
        { id: "micrometer",    sym: "μm",   label: "Micrometer",     factor: 1e-6 },
        { id: "mile",          sym: "mi",   label: "Mile",           factor: 1609.344 },
        { id: "yard",          sym: "yd",   label: "Yard",           factor: 0.9144 },
        { id: "foot",          sym: "ft",   label: "Foot",           factor: 0.3048 },
        { id: "inch",          sym: "in",   label: "Inch",           factor: 0.0254 },
        { id: "nautical_mile", sym: "nmi",  label: "Nautical Mile",  factor: 1852 },
        { id: "light_year",    sym: "ly",   label: "Light Year",     factor: 9.4607e15 },
      ],
    },
    weight: {
      label: "Weight / Mass", icon: "⚖️",
      base: "kilogram",
      units: [
        { id: "metric_ton", sym: "t",   label: "Metric Ton",  factor: 1e3 },
        { id: "kilogram",   sym: "kg",  label: "Kilogram",    factor: 1 },
        { id: "gram",       sym: "g",   label: "Gram",        factor: 1e-3 },
        { id: "milligram",  sym: "mg",  label: "Milligram",   factor: 1e-6 },
        { id: "microgram",  sym: "μg",  label: "Microgram",   factor: 1e-9 },
        { id: "pound",      sym: "lb",  label: "Pound",       factor: 0.453592 },
        { id: "ounce",      sym: "oz",  label: "Ounce",       factor: 0.0283495 },
        { id: "stone",      sym: "st",  label: "Stone",       factor: 6.35029 },
        { id: "us_ton",     sym: "ton", label: "US Ton",      factor: 907.185 },
        { id: "carat",      sym: "ct",  label: "Carat",       factor: 2e-4 },
      ],
    },
    temperature: {
      label: "Temperature", icon: "🌡️",
      special: "temperature",
      units: [
        { id: "c", sym: "°C", label: "Celsius"    },
        { id: "f", sym: "°F", label: "Fahrenheit" },
        { id: "k", sym: "K",  label: "Kelvin"     },
        { id: "r", sym: "°R", label: "Rankine"    },
      ],
    },
    area: {
      label: "Area", icon: "📐",
      base: "square_meter",
      units: [
        { id: "square_kilometer", sym: "km²",  label: "Square Kilometer", factor: 1e6 },
        { id: "square_meter",     sym: "m²",   label: "Square Meter",     factor: 1 },
        { id: "square_centimeter",sym: "cm²",  label: "Square Centimeter",factor: 1e-4 },
        { id: "square_millimeter",sym: "mm²",  label: "Square Millimeter",factor: 1e-6 },
        { id: "hectare",          sym: "ha",   label: "Hectare",          factor: 1e4 },
        { id: "acre",             sym: "ac",   label: "Acre",             factor: 4046.856 },
        { id: "square_mile",      sym: "mi²",  label: "Square Mile",      factor: 2.59e6 },
        { id: "square_yard",      sym: "yd²",  label: "Square Yard",      factor: 0.836127 },
        { id: "square_foot",      sym: "ft²",  label: "Square Foot",      factor: 0.092903 },
        { id: "square_inch",      sym: "in²",  label: "Square Inch",      factor: 6.4516e-4 },
      ],
    },
    volume: {
      label: "Volume", icon: "🧪",
      base: "liter",
      units: [
        { id: "cubic_meter",    sym: "m³",   label: "Cubic Meter",     factor: 1000 },
        { id: "liter",          sym: "L",    label: "Liter",           factor: 1 },
        { id: "milliliter",     sym: "mL",   label: "Milliliter",      factor: 0.001 },
        { id: "cubic_centimeter",sym: "cm³", label: "Cubic Centimeter",factor: 0.001 },
        { id: "us_gallon",      sym: "gal",  label: "US Gallon",       factor: 3.78541 },
        { id: "uk_gallon",      sym: "imp gal",label: "UK Gallon",     factor: 4.54609 },
        { id: "us_quart",       sym: "qt",   label: "US Quart",        factor: 0.946353 },
        { id: "us_pint",        sym: "pt",   label: "US Pint",         factor: 0.473176 },
        { id: "us_cup",         sym: "cup",  label: "US Cup",          factor: 0.236588 },
        { id: "us_fl_oz",       sym: "fl oz",label: "US Fluid Ounce",  factor: 0.0295735 },
        { id: "tablespoon",     sym: "tbsp", label: "Tablespoon (US)", factor: 0.0147868 },
        { id: "teaspoon",       sym: "tsp",  label: "Teaspoon (US)",   factor: 0.00492892 },
      ],
    },
    speed: {
      label: "Speed", icon: "💨",
      base: "meter_per_second",
      units: [
        { id: "meter_per_second",     sym: "m/s",  label: "Meter / Second",   factor: 1 },
        { id: "kilometer_per_hour",   sym: "km/h", label: "Kilometer / Hour", factor: 1/3.6 },
        { id: "mile_per_hour",        sym: "mph",  label: "Mile / Hour",      factor: 0.44704 },
        { id: "knot",                 sym: "kn",   label: "Knot",             factor: 0.514444 },
        { id: "foot_per_second",      sym: "ft/s", label: "Foot / Second",    factor: 0.3048 },
        { id: "mach",                 sym: "Ma",   label: "Mach (at sea level)",factor: 340.29 },
        { id: "speed_of_light",       sym: "c",    label: "Speed of Light",   factor: 299792458 },
      ],
    },
    data: {
      label: "Data Storage", icon: "💾",
      base: "byte",
      units: [
        { id: "bit",      sym: "bit", label: "Bit",      factor: 0.125 },
        { id: "byte",     sym: "B",   label: "Byte",     factor: 1 },
        { id: "kilobyte", sym: "KB",  label: "Kilobyte", factor: 1024 },
        { id: "megabyte", sym: "MB",  label: "Megabyte", factor: 1048576 },
        { id: "gigabyte", sym: "GB",  label: "Gigabyte", factor: 1073741824 },
        { id: "terabyte", sym: "TB",  label: "Terabyte", factor: 1.0995e12 },
        { id: "petabyte", sym: "PB",  label: "Petabyte", factor: 1.1259e15 },
        { id: "kilobit",  sym: "Kb",  label: "Kilobit",  factor: 125 },
        { id: "megabit",  sym: "Mb",  label: "Megabit",  factor: 125000 },
        { id: "gigabit",  sym: "Gb",  label: "Gigabit",  factor: 1.25e8 },
      ],
    },
    time: {
      label: "Time", icon: "⏱️",
      base: "second",
      units: [
        { id: "nanosecond",  sym: "ns",  label: "Nanosecond",  factor: 1e-9 },
        { id: "microsecond", sym: "μs",  label: "Microsecond", factor: 1e-6 },
        { id: "millisecond", sym: "ms",  label: "Millisecond", factor: 1e-3 },
        { id: "second",      sym: "s",   label: "Second",      factor: 1 },
        { id: "minute",      sym: "min", label: "Minute",      factor: 60 },
        { id: "hour",        sym: "h",   label: "Hour",        factor: 3600 },
        { id: "day",         sym: "d",   label: "Day",         factor: 86400 },
        { id: "week",        sym: "wk",  label: "Week",        factor: 604800 },
        { id: "month",       sym: "mo",  label: "Month (avg)", factor: 2629800 },
        { id: "year",        sym: "yr",  label: "Year",        factor: 31557600 },
      ],
    },
    energy: {
      label: "Energy", icon: "⚡",
      base: "joule",
      units: [
        { id: "joule",       sym: "J",    label: "Joule",          factor: 1 },
        { id: "kilojoule",   sym: "kJ",   label: "Kilojoule",      factor: 1e3 },
        { id: "calorie",     sym: "cal",  label: "Calorie (small)",factor: 4.184 },
        { id: "kilocalorie", sym: "kcal", label: "Kilocalorie",    factor: 4184 },
        { id: "watt_hour",   sym: "Wh",   label: "Watt·hour",      factor: 3600 },
        { id: "kilowatt_hour",sym:"kWh",  label: "Kilowatt·hour",  factor: 3.6e6 },
        { id: "btu",         sym: "BTU",  label: "BTU",            factor: 1055.06 },
        { id: "electronvolt",sym: "eV",   label: "Electronvolt",   factor: 1.60218e-19 },
        { id: "foot_pound",  sym: "ft·lb",label: "Foot-Pound",     factor: 1.35582 },
      ],
    },
    pressure: {
      label: "Pressure", icon: "🔵",
      base: "pascal",
      units: [
        { id: "pascal",      sym: "Pa",   label: "Pascal",        factor: 1 },
        { id: "kilopascal",  sym: "kPa",  label: "Kilopascal",    factor: 1e3 },
        { id: "megapascal",  sym: "MPa",  label: "Megapascal",    factor: 1e6 },
        { id: "bar",         sym: "bar",  label: "Bar",           factor: 1e5 },
        { id: "millibar",    sym: "mbar", label: "Millibar",      factor: 100 },
        { id: "atm",         sym: "atm",  label: "Atmosphere",    factor: 101325 },
        { id: "psi",         sym: "psi",  label: "PSI",           factor: 6894.76 },
        { id: "torr",        sym: "Torr", label: "Torr",          factor: 133.322 },
        { id: "mmhg",        sym: "mmHg", label: "mmHg",          factor: 133.322 },
        { id: "inhg",        sym: "inHg", label: "inHg",          factor: 3386.39 },
      ],
    },
    fuel: {
      label: "Fuel Efficiency", icon: "⛽",
      base: "liter_per_100km",
      special: "fuel",
      units: [
        { id: "liter_per_100km",   sym: "L/100km", label: "Liter / 100km"  },
        { id: "km_per_liter",      sym: "km/L",    label: "km / Liter"     },
        { id: "mpg_us",            sym: "mpg",     label: "MPG (US)"       },
        { id: "mpg_uk",            sym: "mpg (UK)",label: "MPG (UK)"       },
      ],
    },
  };

  /* ── Conversion engine ─────────────────── */
  function convertAll(catId, value, fromId) {
    const cat = CATS[catId];
    if (!cat || isNaN(value)) return [];

    /* Temperature special case */
    if (cat.special === "temperature") {
      const celsius = tempToC(value, fromId);
      return cat.units.map(u => ({
        ...u,
        result: fmt(tempFromC(celsius, u.id)),
        isFrom: u.id === fromId,
      }));
    }

    /* Fuel special case */
    if (cat.special === "fuel") {
      function toL100(v, from) {
        if (from === "liter_per_100km") return v;
        if (from === "km_per_liter")    return 100 / v;
        if (from === "mpg_us")          return 235.215 / v;
        if (from === "mpg_uk")          return 282.481 / v;
      }
      function fromL100(l100, to) {
        if (to === "liter_per_100km") return l100;
        if (to === "km_per_liter")    return 100 / l100;
        if (to === "mpg_us")          return 235.215 / l100;
        if (to === "mpg_uk")          return 282.481 / l100;
      }
      const base = toL100(value, fromId);
      return cat.units.map(u => ({
        ...u,
        result: fmt(fromL100(base, u.id)),
        isFrom: u.id === fromId,
      }));
    }

    /* Standard factor-based conversion */
    const fromUnit = cat.units.find(u => u.id === fromId);
    if (!fromUnit) return [];
    const baseValue = value * fromUnit.factor;   /* convert to base unit */

    return cat.units.map(u => ({
      ...u,
      result: fmt(baseValue / u.factor),
      isFrom: u.id === fromId,
    }));
  }

  function fmt(n) {
    if (!isFinite(n)) return "—";
    if (Math.abs(n) === 0) return "0";
    if (Math.abs(n) >= 1e15 || (Math.abs(n) < 1e-10 && n !== 0))
      return n.toExponential(6);
    const str = parseFloat(n.toPrecision(10)).toString();
    return str;
  }

  w.SnakeUnits = { CATS, convertAll };
})(window);
