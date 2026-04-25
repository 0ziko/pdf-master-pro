/* ── Snake mascot — fully autonomous, 10 real canvas animations ── */
(function () {

  /* ── Captions ────────────────────────────────────────────────── */
  var CAPTIONS = {
    en: {
      idle:      "Pick a tool and let's go! 🐍",
      dance:     "Watch me slither! 🐍💃",
      rainbow:   "I contain multitudes 🌈",
      party:     "LET'S GOOOO! 🎉",
      sleep:     "Zzz… just resting… 💤",
      stretch:   "Stretching it out~ 🤸",
      bounce:    "Boing boing boing! 🏀",
      coil:      "Going in circles… 🌀",
      heartbeat: "Loving every conversion! ❤️",
      flip:      "Wheeeee! 🙃",
      loop:      "Infinity mode: ON ♾️",
    },
    tr: {
      idle:      "Bir araç seç ve başla! 🐍",
      dance:     "Dans ediyorum! 🐍💃",
      rainbow:   "Rengarenk bir yılanim! 🌈",
      party:     "HADİ GIDELIM! 🎉",
      sleep:     "Zzz… biraz dinleniyorum… 💤",
      stretch:   "Gerinme zamanı~ 🤸",
      bounce:    "Zipla zipla! 🏀",
      coil:      "Dönüyor dönüyor… 🌀",
      heartbeat: "Her dönüşümü seviyorum! ❤️",
      flip:      "Wheeeee! 🙃",
      loop:      "Sonsuzluk modu: AÇIK ♾️",
    },
  };

  function getLang() {
    return window.PdfMasterI18n ? window.PdfMasterI18n.getLang() : "en";
  }

  function setCaption(key) {
    var el = document.getElementById("snakeCaption");
    if (!el) return;
    var map = CAPTIONS[getLang()] || CAPTIONS.en;
    el.textContent = map[key] || map.idle;
  }

  /* ── The 10 real canvas animations (snake body changes shape) ─ */
  var ANIM_NAMES = [
    "dance",      /* 1. Wide sine wave across full canvas             */
    "rainbow",    /* 2. Normal wave with rotating rainbow gradient    */
    "party",      /* 3. Chaotic multi-freq wave + rainbow colors      */
    "sleep",      /* 4. Coils into C-shape, floating Z letters        */
    "stretch",    /* 5. Extends flat then snaps back                  */
    "bounce",     /* 6. Gravity bounce along body                     */
    "coil",       /* 7. Wraps into spinning circle then uncoils       */
    "heartbeat",  /* 8. Whole body pulses in/out rhythmically         */
    "flip",       /* 9. Flips upside-down, stays, flips back          */
    "loop",       /* 10. Figure-8 / infinity path                     */
  ];

  /* ── Autonomous scheduler ────────────────────────────────────── */
  var lastAnimIdx = -1;

  function runNext(snake) {
    /* Pick random animation, avoid repeating */
    var available = ANIM_NAMES.map(function (_, i) { return i; })
                              .filter(function (i) { return i !== lastAnimIdx; });
    var idx = available[Math.floor(Math.random() * available.length)];
    lastAnimIdx = idx;
    var name = ANIM_NAMES[idx];

    setCaption(name);
    snake.playAnimation(name, function () {
      setCaption("idle");
      /* 3–6 second pause before next animation */
      var pause = 3000 + Math.random() * 3000;
      setTimeout(function () { runNext(snake); }, pause);
    });
  }

  /* ── Init ────────────────────────────────────────────────────── */
  function init() {
    if (!window.SnakeMascot) return;

    /* Reuse existing instance or create fresh one */
    var snake = window.snakeMascot || new window.SnakeMascot("snakeCanvas");
    window.snakeMascot = snake;
    setCaption("idle");

    /* Start autonomous loop after 2 seconds */
    setTimeout(function () { runNext(snake); }, 2000);

    /* Re-apply caption on language switch */
    document.querySelectorAll("[data-lang-btn]").forEach(function (b) {
      b.addEventListener("click", function () {
        setTimeout(function () { setCaption("idle"); }, 80);
      });
    });
  }

  /* Handle both "already loaded" and "not yet loaded" cases */
  if (document.readyState === "complete") {
    init();
  } else {
    window.addEventListener("load", init);
  }

})();
