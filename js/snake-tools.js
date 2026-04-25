/* ── Snake mascot integration for tool pages (non-PDF) ── */
(function () {
  var CAPTIONS = {
    en: {
      idle:          "Pick a tool and let's go! 🐍",
      excited:       "Ooh, something to work with! 👀",
      eating:        "CHOMP! Crunching your input… 😋",
      snacking:      "CHOMP! Tasty data! 😄",
      "snack-happy": "Yummy! Ready for more! 😊",
      digesting:     "Hmm, let me calculate… 🤔",
      spitting:      "✨ Here's your result!",
      done:          "Done! Easy! 🎉",
    },
    tr: {
      idle:          "Bir araç seç ve başla! 🐍",
      excited:       "Ooh, veri girdi! Hazırım! 👀",
      eating:        "ÇIĞN! Veri işleniyor… 😋",
      snacking:      "ÇIĞN! Lezzetli veri! 😄",
      "snack-happy": "Nefis! Hazırım! 😊",
      digesting:     "Hmm, hesaplıyorum… 🤔",
      spitting:      "✨ İşte sonucun!",
      done:          "Bitti! Kolay gelsin! 🎉",
    },
  };

  function setCaption(state) {
    var el = document.getElementById("snakeCaption");
    if (!el) return;
    var lang = window.PdfMasterI18n ? window.PdfMasterI18n.getLang() : "en";
    var map = CAPTIONS[lang] || CAPTIONS.en;
    el.textContent = map[state] || map.idle;
  }

  window.addEventListener("load", function () {
    if (!window.SnakeMascot) return;
    var canvas = document.getElementById("snakeCanvas");
    if (!canvas) return;

    var snake = new window.SnakeMascot("snakeCanvas");
    window.snakeMascot = snake;
    setCaption("idle");

    /* State → caption */
    canvas.addEventListener("snakestate", function (e) {
      setCaption(e.detail);
    });

    /* Input interactions → excited wiggle */
    document.querySelectorAll(
      ".input-field, .tool-textarea, select, " +
      "input[type='number'], input[type='text'], " +
      "input[type='date'], input[type='time'], " +
      "input[type='color'], input[type='range']"
    ).forEach(function (el) {
      el.addEventListener("input", function () { snake.onFileSelect(); });
    });

    /* Button clicks → full eat+process+spit sequence
       Skip animation for control buttons (data-no-snake) like Start/Stop/Reset/Lap */
    document.querySelectorAll(".btn-primary:not([data-no-snake])").forEach(function (btn) {
      var origFn = btn.onclick;
      btn.onclick = null;
      btn.addEventListener("click", function () {
        if (snake._busy) { if (origFn) origFn.call(btn); return; }
        snake.processStart(function () {
          return new Promise(function (resolve) {
            requestAnimationFrame(function () {
              if (origFn) origFn.call(btn);
              setTimeout(resolve, 120);
            });
          });
        }).catch(function () {});
      });
    });

    /* Re-apply caption on language switch */
    document.querySelectorAll("[data-lang-btn]").forEach(function (b) {
      b.addEventListener("click", function () {
        setTimeout(function () { setCaption(snake._s || "idle"); }, 50);
      });
    });
  });
})();
