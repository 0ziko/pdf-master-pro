/* global window */
(function (w) {
  "use strict";

  /* ── HEX ↔ RGB ↔ HSL ↔ CMYK ────────────────── */

  function hexToRgb(hex) {
    hex = hex.replace(/^#/, "");
    if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
    if (hex.length !== 6) return null;
    const n = parseInt(hex, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, "0")).join("").toUpperCase();
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        default: h = (r - g) / d + 4;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  function hslToRgb(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;
    if (s === 0) { r = g = b = l; }
    else {
      function hue2rgb(p, q, t) {
        if (t < 0) t += 1; if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      }
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
  }

  function rgbToCmyk(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const k = 1 - Math.max(r, g, b);
    if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
    return {
      c: Math.round((1 - r - k) / (1 - k) * 100),
      m: Math.round((1 - g - k) / (1 - k) * 100),
      y: Math.round((1 - b - k) / (1 - k) * 100),
      k: Math.round(k * 100),
    };
  }

  function cmykToRgb(c, m, y, k) {
    c /= 100; m /= 100; y /= 100; k /= 100;
    return {
      r: Math.round(255 * (1 - c) * (1 - k)),
      g: Math.round(255 * (1 - m) * (1 - k)),
      b: Math.round(255 * (1 - y) * (1 - k)),
    };
  }

  function convertColor(input, from) {
    let rgb;
    if (from === "hex") {
      rgb = hexToRgb(input);
    } else if (from === "rgb") {
      const m = input.match(/(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
      if (!m) return null;
      rgb = { r: +m[1], g: +m[2], b: +m[3] };
    } else if (from === "hsl") {
      const m = input.match(/(\d+)[,\s]+(\d+)%?[,\s]+(\d+)%?/);
      if (!m) return null;
      rgb = hslToRgb(+m[1], +m[2], +m[3]);
    } else if (from === "cmyk") {
      const m = input.match(/(\d+)[,\s]+(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
      if (!m) return null;
      rgb = cmykToRgb(+m[1], +m[2], +m[3], +m[4]);
    }
    if (!rgb) return null;
    const hsl  = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
    const hex  = rgbToHex(rgb.r, rgb.g, rgb.b);
    return { hex, rgb, hsl, cmyk };
  }

  /* ── Contrast (WCAG 2.1) ─────────────────────── */
  function relativeLuminance(r, g, b) {
    const toLinear = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  }

  function contrastRatio(hex1, hex2) {
    const c1 = hexToRgb(hex1), c2 = hexToRgb(hex2);
    if (!c1 || !c2) return null;
    const l1 = relativeLuminance(c1.r, c1.g, c1.b);
    const l2 = relativeLuminance(c2.r, c2.g, c2.b);
    const lighter = Math.max(l1, l2), darker = Math.min(l1, l2);
    const ratio = (lighter + 0.05) / (darker + 0.05);
    return {
      ratio: Math.round(ratio * 100) / 100,
      aaSmall:  ratio >= 4.5, aaLarge:  ratio >= 3,
      aaaSmal:  ratio >= 7,   aaaLarge: ratio >= 4.5,
    };
  }

  /* ── Shade / Tint Generator ───────────────────── */
  function generateShades(hex, steps) {
    const rgb = hexToRgb(hex);
    if (!rgb) return [];
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const results = [];
    for (let i = 0; i <= steps; i++) {
      const l = Math.round(i * (100 / steps));
      const { r, g, b } = hslToRgb(hsl.h, hsl.s, l);
      results.push({ l, hex: rgbToHex(r, g, b) });
    }
    return results;
  }

  /* ── Gradient Builder ────────────────────────── */
  function gradientCSS(color1, color2, angle, type) {
    if (type === "radial") return `radial-gradient(circle, ${color1}, ${color2})`;
    return `linear-gradient(${angle}deg, ${color1}, ${color2})`;
  }

  w.ColorTools = {
    hexToRgb, rgbToHex, rgbToHsl, hslToRgb, rgbToCmyk, cmykToRgb,
    convertColor, contrastRatio, generateShades, gradientCSS,
  };
})(window);
