/**
 * Single source of truth for SEO spoke slugs. Used by generate-micro-pages + generate-sitemap.
 */
"use strict";

const HOST = "https://snakeconverter.com";

const UNIT_PAIRS = [
  { slug: "cm-to-inches", category: "length", from: "centimeter", to: "inch" },
  { slug: "meters-to-feet", category: "length", from: "meter", to: "foot" },
  { slug: "km-to-miles", category: "length", from: "kilometer", to: "mile" },
  { slug: "mm-to-inches", category: "length", from: "millimeter", to: "inch" },
  { slug: "yards-to-meters", category: "length", from: "yard", to: "meter" },
  { slug: "kg-to-lbs", category: "weight", from: "kilogram", to: "pound" },
  { slug: "lbs-to-kg", category: "weight", from: "pound", to: "kilogram" },
  { slug: "grams-to-ounces", category: "weight", from: "gram", to: "ounce" },
  { slug: "ounces-to-grams", category: "weight", from: "ounce", to: "gram" },
  { slug: "celsius-to-fahrenheit", category: "temperature", from: "c", to: "f" },
  { slug: "fahrenheit-to-celsius", category: "temperature", from: "f", to: "c" },
  { slug: "celsius-to-kelvin", category: "temperature", from: "c", to: "k" },
  { slug: "liters-to-gallons", category: "volume", from: "liter", to: "us_gallon" },
  { slug: "gallons-to-liters", category: "volume", from: "us_gallon", to: "liter" },
  { slug: "milliliters-to-fluid-ounces", category: "volume", from: "milliliter", to: "us_fl_oz" },
  { slug: "kmh-to-mph", category: "speed", from: "kilometer_per_hour", to: "mile_per_hour" },
  { slug: "mph-to-kmh", category: "speed", from: "mile_per_hour", to: "kilometer_per_hour" },
  { slug: "knots-to-mph", category: "speed", from: "knot", to: "mile_per_hour" },
  { slug: "mb-to-gb", category: "data", from: "megabyte", to: "gigabyte" },
  { slug: "gb-to-tb", category: "data", from: "gigabyte", to: "terabyte" },
  { slug: "kb-to-mb", category: "data", from: "kilobyte", to: "megabyte" },
  { slug: "square-meters-to-square-feet", category: "area", from: "square_meter", to: "square_foot" },
  { slug: "acres-to-hectares", category: "area", from: "acre", to: "hectare" },
  { slug: "hectares-to-acres", category: "area", from: "hectare", to: "acre" },
  { slug: "square-km-to-acres", category: "area", from: "square_kilometer", to: "acre" },
  { slug: "meters-to-yards", category: "length", from: "meter", to: "yard" },
  { slug: "inches-to-cm", category: "length", from: "inch", to: "centimeter" },
  { slug: "stone-to-kg", category: "weight", from: "stone", to: "kilogram" },
  { slug: "metric-tons-to-pounds", category: "weight", from: "metric_ton", to: "pound" },
];

const CALC_SPOKES = [
  { slug: "percentage-calculator", calc: "pctOf", h1en: "Percentage calculator — what is X% of Y?", h1tr: "Yüzde hesaplama — X’in %Y’si kaç?" },
  { slug: "discount-calculator", calc: "discount", h1en: "Discount calculator — sale price", h1tr: "İndirim hesaplama — indirimli fiyat" },
  { slug: "ratio-calculator", calc: "ratio", h1en: "Ratio calculator — simplify A : B", h1tr: "Oran hesaplayıcı — A : B sadeleştir" },
  { slug: "age-calculator", calc: "age", h1en: "Age calculator — years, months, days", h1tr: "Yaş hesaplama — yıl, ay, gün" },
  { slug: "days-between-dates", calc: "dateDiff", h1en: "Days between two dates", h1tr: "İki tarih arası gün sayısı" },
  { slug: "compound-interest-calculator", calc: "compound", h1en: "Compound interest calculator", h1tr: "Bileşik faiz hesaplayıcı" },
  { slug: "loan-calculator", calc: "loan", h1en: "Loan payment calculator (EMI)", h1tr: "Kredi taksit (EMI) hesaplayıcı" },
  { slug: "profit-margin-calculator", calc: "profit", h1en: "Profit margin calculator", h1tr: "Kar marjı hesaplayıcı" },
  { slug: "mbps-to-mbs", calc: "mbps", h1en: "Mbps to MB/s converter", h1tr: "Mbps’ten MB/s’ye" },
  { slug: "binary-to-decimal", calc: "binary", h1en: "Binary to decimal (and back)", h1tr: "İkili / onluk dönüştürücü" },
];

/**
 * @returns {string[]} Absolute loc URLs for sitemap (EN + tr for each spoke).
 */
function getSitemapSpokeUrls() {
  const urls = [];
  UNIT_PAIRS.forEach((row) => {
    urls.push(`${HOST}/convert/${row.slug}`);
    urls.push(`${HOST}/tr/convert/${row.slug}`);
  });
  CALC_SPOKES.forEach((row) => {
    urls.push(`${HOST}/calculators/${row.slug}`);
    urls.push(`${HOST}/tr/calculators/${row.slug}`);
  });
  return urls;
}

module.exports = {
  HOST,
  UNIT_PAIRS,
  CALC_SPOKES,
  getSitemapSpokeUrls,
};
