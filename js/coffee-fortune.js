/* global window */
/* Turkish coffee fortune — client-side only; lines are i18n, selection is deterministic from seed. */
(function (w) {
  "use strict";

  var MOOD_COUNT = 6;
  var LINE_COUNT = 24;

  function hashSeed(s) {
    var h = 2166136261;
    var str = String(s);
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0) || 1;
  }

  function mulberry32(a) {
    return function () {
      var t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function pickMoodAndLines(seedStr) {
    var seed = hashSeed(seedStr);
    var rng = mulberry32(seed);
    var mood = Math.floor(rng() * MOOD_COUNT) + 1;
    var lines = [];
    var used = {};
    var guard = 0;
    while (lines.length < 5 && guard++ < 200) {
      var j = Math.floor(rng() * LINE_COUNT) + 1;
      if (!used[j]) {
        used[j] = 1;
        lines.push(j);
      }
    }
    return { mood: mood, lines: lines, seed: seed };
  }

  w.CoffeeFortune = {
    MOOD_COUNT: MOOD_COUNT,
    LINE_COUNT: LINE_COUNT,
    hashSeed: hashSeed,
    pickMoodAndLines: pickMoodAndLines,
  };
})(window);
