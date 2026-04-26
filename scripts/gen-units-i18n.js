/* One-off: node scripts/gen-units-i18n.js — prints u.cat.id keys for i18n.js */
const TR = {
  length: { kilometer: "Kilometre", meter: "Metre", centimeter: "Santimetre", millimeter: "Milimetre", micrometer: "Mikrometre", mile: "Mil", yard: "Yard", foot: "Fit", inch: "İnç", nautical_mile: "Deniz mili", light_year: "Işık yılı" },
  weight: { metric_ton: "Metrik ton", kilogram: "Kilogram", gram: "Gram", milligram: "Miligram", microgram: "Mikrogram", pound: "Pound (lb)", ounce: "Ons (oz)", stone: "Stone", us_ton: "ABD tonu", carat: "Karat" },
  temperature: { c: "Santigrat (°C)", f: "Fahrenhayt (°F)", k: "Kelvin", r: "Rankine" },
  area: { square_kilometer: "Kilometre kare", square_meter: "Metre kare", square_centimeter: "Santimetre kare", square_millimeter: "Milimetre kare", hectare: "Hektar", acre: "Akre", square_mile: "Mil kare", square_yard: "Yard kare", square_foot: "Fit kare", square_inch: "İnç kare" },
  volume: { cubic_meter: "Metreküp", liter: "Litre", milliliter: "Mililitre", cubic_centimeter: "Santimetre küp", us_gallon: "ABD galonu", uk_gallon: "İngiliz galonu", us_quart: "ABD kuart", us_pint: "ABD pinti", us_cup: "ABD bardağı", us_fl_oz: "ABD sıvı onsu", tablespoon: "Yemek kaşığı (ABD)", teaspoon: "Çay kaşığı (ABD)" },
  speed: { meter_per_second: "Metre/saniye", kilometer_per_hour: "Kilometre/saat", mile_per_hour: "Mil/saat", knot: "Knot", foot_per_second: "Fit/saniye", mach: "Mach (deniz seviyesi)", speed_of_light: "Işık hızı" },
  data: { bit: "Bit", byte: "Bayt", kilobyte: "Kilobayt", megabyte: "Megabayt", gigabyte: "Gigabayt", terabyte: "Terabayt", petabyte: "Petabayt", kilobit: "Kilobit", megabit: "Megabit", gigabit: "Gigabit" },
  time: { nanosecond: "Nanisaniye", microsecond: "Mikrosaniye", millisecond: "Milisaniye", second: "Saniye", minute: "Dakika", hour: "Saat", day: "Gün", week: "Hafta", month: "Ay (ortalama)", year: "Yıl" },
  energy: { joule: "Joule", kilojoule: "Kilojoule", calorie: "Kalori (küçük)", kilocalorie: "Büyük kalori (kcal)", watt_hour: "Vatsaat", kilowatt_hour: "Kilowatsaat", btu: "BTU", electronvolt: "Elektronvolt", foot_pound: "Feet-pound" },
  pressure: { pascal: "Pascal", kilopascal: "Kilopascal", megapascal: "Megapascal", bar: "Bar", millibar: "Milibar", atm: "Atmosfer", psi: "PSI", torr: "Torr", mmhg: "mmHg", inhg: "inHg" },
  fuel: { liter_per_100km: "Litre / 100 km", km_per_liter: "km / litre", mpg_us: "MPG (ABD)", mpg_uk: "MPG (UK)" },
};
const fs = require("fs");
const s = fs.readFileSync(require("path").join(__dirname, "../js/units.js"), "utf8");
const lines = s.split("\n");
let cat = null;
const pairs = [];
for (const line of lines) {
  const cm = line.match(/^\s{4}(length|weight|temperature|area|volume|speed|data|time|energy|pressure|fuel):/);
  if (cm) { cat = cm[1]; continue; }
  if (!cat) continue;
  const im = line.match(/id: "([^"]+)".*label: "([^"]+)"/);
  if (im) pairs.push({ cat, id: im[1], en: im[2] });
}
for (const p of pairs) {
  const tr = (TR[p.cat] && TR[p.cat][p.id]) || p.en;
  console.log(`      "u.${p.cat}.${p.id}":"${p.en.replace(/"/g, '\\"')}",`);
}
console.log("---TR---");
for (const p of pairs) {
  const tr = (TR[p.cat] && TR[p.cat][p.id]) || p.en;
  console.log(`      "u.${p.cat}.${p.id}":"${tr.replace(/"/g, '\\"')}",`);
}
