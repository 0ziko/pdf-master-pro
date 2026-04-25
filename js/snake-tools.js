/* ── Snake mascot — fully autonomous, zero button dependency ── */
(function () {

  /* ── Captions per animation ─────────────────────────────────── */
  var CAPTIONS = {
    en: {
      idle:     "Pick a tool and let's go! 🐍",
      wave:     "Hey there! 👋",
      sleep:    "Zzz… just resting… 💤",
      party:    "Let's gooo! 🎉",
      think:    "Hmm, what shall I convert next? 🤔",
      love:     "I love helping you! ❤️",
      surprise: "Whoa! This is awesome! 😱",
      flex:     "Strong tools, stronger snake! 💪",
      music:    "La la la… converting in style 🎵",
      fire:     "On fire today! 🔥",
      cool:     "Yeah, I'm kind of a big deal 😎",
    },
    tr: {
      idle:     "Bir araç seç ve başla! 🐍",
      wave:     "Merhaba! 👋",
      sleep:    "Zzz… biraz dinleniyorum… 💤",
      party:    "Haydi gidelim! 🎉",
      think:    "Hmm, sırada ne çevireceğiz? 🤔",
      love:     "Sana yardım etmeyi seviyorum! ❤️",
      surprise: "Vay be! Harika! 😱",
      flex:     "Güçlü araçlar, güçlü yılan! 💪",
      music:    "La la la… dönüştürme modunda 🎵",
      fire:     "Bugün çok hızlıyım! 🔥",
      cool:     "Evet, ben bu işin ustasıyım 😎",
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

  /* ── Emoji pop helper ────────────────────────────────────────── */
  function popEmoji(emoji) {
    var el = document.getElementById("snakeChomp");
    if (!el) return;
    el.textContent = emoji;
    el.style.opacity = "1";
    el.style.transform = "translate(-50%,-50%) scale(1.4)";
    setTimeout(function () {
      el.style.opacity = "0";
      el.style.transform = "translate(-50%,-80%) scale(0.8)";
    }, 1200);
  }

  /* ── CSS shake on canvas ─────────────────────────────────────── */
  function shakeCanvas(canvas) {
    canvas.style.transition = "transform 0.07s";
    var seq = ["-6px", "6px", "-5px", "5px", "-3px", "0px"];
    var i = 0;
    var iv = setInterval(function () {
      canvas.style.transform = "translateX(" + seq[i] + ")";
      i++;
      if (i >= seq.length) { clearInterval(iv); canvas.style.transform = ""; }
    }, 70);
  }

  /* ── CSS bounce on canvas ────────────────────────────────────── */
  function bounceCanvas(canvas, times) {
    var count = 0;
    var iv = setInterval(function () {
      canvas.style.transform = count % 2 === 0 ? "translateY(-8px)" : "translateY(0)";
      count++;
      if (count >= times * 2) { clearInterval(iv); canvas.style.transform = ""; }
    }, 160);
  }

  /* ── CSS spin on canvas ──────────────────────────────────────── */
  function spinCanvas(canvas, deg, ms) {
    canvas.style.transition = "transform " + ms + "ms ease-in-out";
    canvas.style.transform = "rotate(" + deg + "deg)";
    setTimeout(function () {
      canvas.style.transition = "transform " + ms + "ms ease-in-out";
      canvas.style.transform = "rotate(0deg)";
      setTimeout(function () { canvas.style.transition = ""; canvas.style.transform = ""; }, ms);
    }, ms + 100);
  }

  /* ── The 10 autonomous animations ───────────────────────────── */
  var ANIMATIONS = [

    /* 1. Wave hello */
    function wave(canvas, snake, done) {
      setCaption("wave");
      popEmoji("👋");
      snake.onFileSelect();
      setTimeout(done, 2200);
    },

    /* 2. Sleep / nap */
    function sleep(canvas, snake, done) {
      setCaption("sleep");
      popEmoji("💤");
      canvas.style.transition = "opacity 0.6s";
      canvas.style.opacity = "0.55";
      setTimeout(function () {
        popEmoji("💤");
        setTimeout(function () {
          canvas.style.opacity = "1";
          canvas.style.transition = "";
          done();
        }, 2500);
      }, 800);
    },

    /* 3. Party */
    function party(canvas, snake, done) {
      setCaption("party");
      popEmoji("🎉");
      snake.onFileSelect();
      setTimeout(function () { popEmoji("🎊"); snake.onFileSelect(); }, 700);
      setTimeout(function () { bounceCanvas(canvas, 3); }, 400);
      setTimeout(done, 2800);
    },

    /* 4. Deep thought */
    function think(canvas, snake, done) {
      setCaption("think");
      popEmoji("🤔");
      setTimeout(function () { popEmoji("💭"); }, 1200);
      setTimeout(done, 2500);
    },

    /* 5. Love */
    function love(canvas, snake, done) {
      setCaption("love");
      popEmoji("❤️");
      snake.onFileSelect();
      setTimeout(function () { popEmoji("💖"); }, 900);
      setTimeout(done, 2200);
    },

    /* 6. Surprise */
    function surprise(canvas, snake, done) {
      setCaption("surprise");
      popEmoji("😱");
      shakeCanvas(canvas);
      snake.onFileSelect();
      setTimeout(done, 2000);
    },

    /* 7. Flex */
    function flex(canvas, snake, done) {
      setCaption("flex");
      popEmoji("💪");
      bounceCanvas(canvas, 4);
      setTimeout(function () { snake.onFileSelect(); }, 300);
      setTimeout(done, 2500);
    },

    /* 8. Music */
    function music(canvas, snake, done) {
      setCaption("music");
      popEmoji("🎵");
      var notes = ["🎵", "🎶", "🎸", "🎵"];
      notes.forEach(function (n, i) {
        setTimeout(function () { popEmoji(n); }, i * 600);
      });
      setTimeout(function () { bounceCanvas(canvas, 2); }, 200);
      setTimeout(done, 3000);
    },

    /* 9. Fire */
    function fire(canvas, snake, done) {
      setCaption("fire");
      popEmoji("🔥");
      snake.onFileSelect();
      setTimeout(function () { shakeCanvas(canvas); popEmoji("⚡"); }, 700);
      setTimeout(done, 2200);
    },

    /* 10. Cool */
    function cool(canvas, snake, done) {
      setCaption("cool");
      popEmoji("😎");
      spinCanvas(canvas, 12, 400);
      setTimeout(function () { snake.onFileSelect(); }, 500);
      setTimeout(done, 2500);
    },
  ];

  /* ── Autonomous scheduler ────────────────────────────────────── */
  var lastAnimIdx = -1;

  function runNext(canvas, snake) {
    /* Pick a random animation, avoid repeating the last one */
    var available = ANIMATIONS.map(function (_, i) { return i; })
                              .filter(function (i) { return i !== lastAnimIdx; });
    var idx = available[Math.floor(Math.random() * available.length)];
    lastAnimIdx = idx;

    ANIMATIONS[idx](canvas, snake, function () {
      /* After animation finishes, wait 4–8 seconds, then do another */
      var pause = 4000 + Math.random() * 4000;
      setCaption("idle");
      setTimeout(function () { runNext(canvas, snake); }, pause);
    });
  }

  /* ── Init ────────────────────────────────────────────────────── */
  function init() {
    if (!window.SnakeMascot) return;
    var canvas = document.getElementById("snakeCanvas");
    if (!canvas) return;

    /* Reuse existing instance if index.html already created one */
    var snake = window.snakeMascot || new window.SnakeMascot("snakeCanvas");
    window.snakeMascot = snake;
    setCaption("idle");

    /* Start autonomous loop after 2.5 seconds */
    setTimeout(function () { runNext(canvas, snake); }, 2500);

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
