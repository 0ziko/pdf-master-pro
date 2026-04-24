/* global window, crypto */
(function (w) {
  "use strict";

  /* ── JSON Formatter ──────────────────────────── */
  function jsonFormat(text, indent) {
    const parsed = JSON.parse(text);             /* throws on invalid */
    return JSON.stringify(parsed, null, indent || 2);
  }
  function jsonMinify(text) {
    return JSON.stringify(JSON.parse(text));
  }

  /* ── Hash (SHA via SubtleCrypto) ─────────────── */
  async function hashText(text, algo) {
    const buf = new TextEncoder().encode(text);
    const hashBuf = await crypto.subtle.digest(algo, buf);
    return Array.from(new Uint8Array(hashBuf))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  }

  /* ── UUID v4 ──────────────────────────────────── */
  function uuidV4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
      (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    );
  }

  /* ── URL Encode / Decode ─────────────────────── */
  function urlEncode(text) { return encodeURIComponent(text); }
  function urlDecode(text) { return decodeURIComponent(text); }

  /* ── HTML Entity Encode / Decode ──────────────── */
  function htmlEncode(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
  function htmlDecode(str) {
    const el = document.createElement("div");
    el.innerHTML = str;
    return el.textContent;
  }

  /* ── Number Base Converter ───────────────────── */
  function baseConvert(value, fromBase) {
    const dec = parseInt(value, fromBase);
    if (isNaN(dec)) return null;
    return {
      dec: dec.toString(10),
      hex: dec.toString(16).toUpperCase(),
      oct: dec.toString(8),
      bin: dec.toString(2),
    };
  }

  /* ── Regex Tester ────────────────────────────── */
  function regexTest(pattern, flags, testStr) {
    let re;
    re = new RegExp(pattern, flags);
    const matches = [];
    let m;
    if (flags.includes("g")) {
      while ((m = re.exec(testStr)) !== null) {
        matches.push({ index: m.index, match: m[0], groups: m.slice(1) });
        if (m.index === re.lastIndex) re.lastIndex++;
      }
    } else {
      m = re.exec(testStr);
      if (m) matches.push({ index: m.index, match: m[0], groups: m.slice(1) });
    }
    return matches;
  }

  /* ── Markdown Preview (basic) ────────────────── */
  function mdToHtml(md) {
    return md
      .replace(/^######\s+(.*)$/gm, "<h6>$1</h6>")
      .replace(/^#####\s+(.*)$/gm, "<h5>$1</h5>")
      .replace(/^####\s+(.*)$/gm, "<h4>$1</h4>")
      .replace(/^###\s+(.*)$/gm, "<h3>$1</h3>")
      .replace(/^##\s+(.*)$/gm, "<h2>$1</h2>")
      .replace(/^#\s+(.*)$/gm, "<h1>$1</h1>")
      .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`(.+?)`/g, "<code>$1</code>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
      .replace(/^---$/gm, "<hr>")
      .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
      .replace(/^- (.+)$/gm, "<li>$1</li>")
      .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")
      .replace(/\n\n/g, "</p><p>")
      .replace(/^([^<].+)$/gm, "<p>$1</p>")
      .replace(/<p><\/p>/g, "");
  }

  /* ── Lorem Ipsum Generator ───────────────────── */
  const LOREM_WORDS = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum".split(" ");

  function loremIpsum(paragraphs, sentencesPerPara) {
    const paras = [];
    for (let p = 0; p < paragraphs; p++) {
      const sentences = [];
      for (let s = 0; s < sentencesPerPara; s++) {
        const len = 8 + Math.floor(Math.random() * 10);
        const words = [];
        for (let w = 0; w < len; w++) {
          words.push(LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]);
        }
        words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
        sentences.push(words.join(" ") + ".");
      }
      paras.push(sentences.join(" "));
    }
    return paras.join("\n\n");
  }

  /* ── Roman Numerals ──────────────────────────── */
  function toRoman(n) {
    n = parseInt(n);
    if (isNaN(n) || n < 1 || n > 3999) return "—";
    const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
    const syms = ["M","CM","D","CD","C","XC","L","XL","X","IX","V","IV","I"];
    let out = "";
    vals.forEach((v, i) => { while (n >= v) { out += syms[i]; n -= v; } });
    return out;
  }
  function fromRoman(s) {
    const map = { I:1, V:5, X:10, L:50, C:100, D:500, M:1000 };
    let val = 0;
    s = s.toUpperCase().trim();
    for (let i = 0; i < s.length; i++) {
      const cur = map[s[i]], nxt = map[s[i+1]];
      if (!cur) return NaN;
      val += nxt > cur ? -cur : cur;
    }
    return val;
  }

  w.DevTools = {
    jsonFormat, jsonMinify, hashText,
    uuidV4, urlEncode, urlDecode, htmlEncode, htmlDecode,
    baseConvert, regexTest, mdToHtml, loremIpsum, toRoman, fromRoman,
  };
})(window);
