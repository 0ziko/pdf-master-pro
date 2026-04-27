/* ── Snake mascot — static SVG + optional one-off playAnimation() from pages ── */
(function () {

  /* ── Captions ────────────────────────────────────────────────── */
  var CAPTIONS = {
    en: {
      idle:      "Pick a tool and let's go! 🐍",
      idleTools: "Pick a utility tool! 🐍",
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
      idleTools: "Yardımcı bir araç seç! 🐍",
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

  function isToolsPage() {
    return /tools\.html/i.test(String(location.pathname || "")) || /\/tools\/?$/.test(String(location.pathname || ""));
  }
  function setCaption(key) {
    var el = document.getElementById("snakeCaption");
    if (!el) return;
    var map = CAPTIONS[getLang()] || CAPTIONS.en;
    if (key === "idle" && isToolsPage() && map.idleTools) {
      el.textContent = map.idleTools;
      return;
    }
    el.textContent = map[key] || (isToolsPage() && map.idleTools ? map.idleTools : map.idle);
  }

  /* ── Init ────────────────────────────────────────────────────── */
  function init() {
    if (!window.SnakeMascot) return;

    /* Reuse existing instance or create fresh one */
    var snake = window.snakeMascot || new window.SnakeMascot("snakeCanvas");
    window.snakeMascot = snake;
    setCaption("idle");

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
