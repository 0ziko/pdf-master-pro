/* global window */
/* Turkish coffee fortune — 30 i18n blocks, one picked per read; seed mixes name, time, optional file meta. */
(function (w) {
  "use strict";

  var BLOCK_COUNT = 30;

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

  /**
   * @param {string} seedStr - name + time + optional "|ph:" + per-file name,size,mtime
   * @returns {{ block: number, seed: number }}
   */
  function pickBlockIndex(seedStr) {
    var seed = hashSeed(seedStr);
    var rng = mulberry32(seed);
    var block = Math.floor(rng() * BLOCK_COUNT) + 1;
    return { block: block, seed: seed };
  }

  w.CoffeeFortune = {
    BLOCK_COUNT: BLOCK_COUNT,
    hashSeed: hashSeed,
    pickBlockIndex: pickBlockIndex,
  };
})(window);
