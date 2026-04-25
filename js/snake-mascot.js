/* ── SnakeMascot v5 — SVG vector snake, CSS animations ─────────── */
(function (w) {
  'use strict';

  /* ── CSS injected once ──────────────────────────────────────────── */
  if (!document.getElementById('__snkCSS__')) {
    var st = document.createElement('style');
    st.id  = '__snkCSS__';
    st.textContent = `
      #snakeMascotWrap {
        transform-origin: 80px 155px;
        animation: snkFloat 3.2s ease-in-out infinite;
      }
      @keyframes snkFloat {
        0%,100% { transform: translateY(0)   rotate(0deg); }
        35%     { transform: translateY(-7px) rotate(-1.5deg); }
        70%     { transform: translateY(-9px) rotate(1.5deg); }
      }

      #snakeTongue {
        transform-origin: 57px 33px;
        animation: snkTongue 3.8s ease-in-out infinite;
      }
      @keyframes snkTongue {
        0%,55%,100% { opacity:0; transform:scaleY(0); }
        60%,88%     { opacity:1; transform:scaleY(1); }
      }

      /* ── Named animations (applied via JS class) ── */

      .snk-dance {
        animation: snkDance 3.6s ease-in-out !important;
        transform-origin: 80px 155px;
      }
      @keyframes snkDance {
        0%         { transform:rotate(0deg)  translateX(0);    }
        12%        { transform:rotate(-16deg)translateX(-18px); }
        28%        { transform:rotate(16deg) translateX(18px);  }
        44%        { transform:rotate(-12deg)translateX(-12px); }
        60%        { transform:rotate(12deg) translateX(12px);  }
        75%        { transform:rotate(-5deg) translateX(-5px);  }
        90%        { transform:rotate(5deg)  translateX(5px);   }
        100%       { transform:rotate(0deg)  translateX(0);    }
      }

      .snk-rainbow { animation: snkRainbow 4s linear !important; }
      @keyframes snkRainbow {
        0%   { filter: hue-rotate(0deg)   saturate(1.2) brightness(1);   }
        25%  { filter: hue-rotate(90deg)  saturate(1.8) brightness(1.15);}
        50%  { filter: hue-rotate(180deg) saturate(2.2) brightness(1.1); }
        75%  { filter: hue-rotate(270deg) saturate(1.8) brightness(1.15);}
        100% { filter: hue-rotate(360deg) saturate(1.2) brightness(1);   }
      }

      .snk-bounce {
        animation: snkBounce 2.8s cubic-bezier(.36,.07,.19,.97) !important;
        transform-origin: 80px 155px;
      }
      @keyframes snkBounce {
        0%   { transform:translateY(0)    scaleX(1)    scaleY(1);    }
        18%  { transform:translateY(-42px)scaleX(0.88) scaleY(1.12); }
        33%  { transform:translateY(0)    scaleX(1.18) scaleY(0.82); }
        48%  { transform:translateY(-24px)scaleX(0.93) scaleY(1.07); }
        62%  { transform:translateY(0)    scaleX(1.1)  scaleY(0.9);  }
        76%  { transform:translateY(-10px)scaleX(0.97) scaleY(1.03); }
        88%  { transform:translateY(0)    scaleX(1.04) scaleY(0.96); }
        100% { transform:translateY(0)    scaleX(1)    scaleY(1);    }
      }

      .snk-spin {
        animation: snkSpin 3s ease-in-out !important;
        transform-origin: 80px 80px;
      }
      @keyframes snkSpin {
        0%   { transform:rotate(0deg);   }
        70%  { transform:rotate(375deg); }
        85%  { transform:rotate(350deg); }
        100% { transform:rotate(360deg); }
      }

      .snk-wave {
        animation: snkWave 4s ease-in-out !important;
        transform-origin: 80px 155px;
      }
      @keyframes snkWave {
        0%   { transform:translateX(0)    skewY(0deg); }
        14%  { transform:translateX(-20px)skewY(-6deg);}
        28%  { transform:translateX(20px) skewY(6deg); }
        42%  { transform:translateX(-16px)skewY(-5deg);}
        56%  { transform:translateX(16px) skewY(5deg); }
        70%  { transform:translateX(-8px) skewY(-2deg);}
        84%  { transform:translateX(8px)  skewY(2deg); }
        100% { transform:translateX(0)    skewY(0deg); }
      }

      .snk-happy {
        animation: snkHappy 3.2s ease-in-out !important;
        transform-origin: 80px 155px;
      }
      @keyframes snkHappy {
        0%,100%{ transform:scale(1) translateY(0);     filter:brightness(1);    }
        18%    { transform:scale(1.13)translateY(-8px); filter:brightness(1.25); }
        32%    { transform:scale(0.96)translateY(0);    filter:brightness(1);    }
        52%    { transform:scale(1.1) translateY(-6px); filter:brightness(1.2);  }
        68%    { transform:scale(0.98)translateY(0);    filter:brightness(1);    }
        82%    { transform:scale(1.05)translateY(-3px); filter:brightness(1.12); }
      }

      .snk-stretch {
        animation: snkStretch 3.2s ease-in-out !important;
        transform-origin: 80px 155px;
      }
      @keyframes snkStretch {
        0%   { transform:scaleY(1)    scaleX(1);    }
        22%  { transform:scaleY(1.55) scaleX(0.78); }
        42%  { transform:scaleY(1.6)  scaleX(0.76); }
        58%  { transform:scaleY(0.82) scaleX(1.22); }
        74%  { transform:scaleY(1.1)  scaleX(0.94); }
        88%  { transform:scaleY(0.97) scaleX(1.03); }
        100% { transform:scaleY(1)    scaleX(1);    }
      }

      .snk-sleep {
        animation: snkSleep 5s ease-in-out !important;
        transform-origin: 80px 155px;
      }
      @keyframes snkSleep {
        0%   { transform:translateY(0)   rotate(0deg);  filter:brightness(1);    }
        20%  { transform:translateY(8px) rotate(-5deg); filter:brightness(0.82); }
        40%  { transform:translateY(14px)rotate(-8deg); filter:brightness(0.65); }
        60%  { transform:translateY(14px)rotate(-8deg); filter:brightness(0.62); }
        80%  { transform:translateY(8px) rotate(-4deg); filter:brightness(0.8);  }
        100% { transform:translateY(0)   rotate(0deg);  filter:brightness(1);    }
      }

      .snk-wink {
        animation: snkWink 2.6s ease-in-out !important;
        transform-origin: 80px 155px;
      }
      @keyframes snkWink {
        0%,100%{ transform:translateY(0) scaleX(1); }
        20%    { transform:translateY(-6px) scaleX(1.05); }
        40%    { transform:translateY(0) scaleX(1); }
      }

      /* Eye lid overlays */
      .eye-lid {
        transform-origin: center;
        transform: scaleY(0);
        transition: transform 0.15s;
      }
      .snk-sleep .eye-lid { animation: snkLidClose 5s ease-in-out; }
      @keyframes snkLidClose {
        0%,18%  { transform:scaleY(0); }
        28%,100%{ transform:scaleY(1); }
      }
      .snk-wink #smEyeRLid { animation: snkWinkLid 2.6s ease-in-out; }
      @keyframes snkWinkLid {
        0%,38%,80%,100%{ transform:scaleY(0); }
        45%,72%        { transform:scaleY(1); }
      }

      /* Happy smile teeth reveal */
      .snk-happy #smTeeth { animation: snkTeeth 3.2s ease-in-out; }
      @keyframes snkTeeth {
        0%,15%,85%,100% { opacity:0; }
        25%,75%         { opacity:1; }
      }
    `;
    document.head.appendChild(st);
  }

  /* ── Build SVG markup ───────────────────────────────────────────── */
  function buildSVG() {
    var p = 'M 82,150 C 22,140 8,108 34,92 C 60,76 112,74 108,48 C 104,22 65,10 57,6';
    var hx = 57, hy = 6, hr = 27;
    var er = hr * 0.295;
    var elx = hx - hr*0.375, ely = hy - hr*0.1;
    var erx = hx + hr*0.375, ery = hy - hr*0.1;

    return [
      '<svg id="snakeSVG" xmlns="http://www.w3.org/2000/svg"',
      ' viewBox="-5 -28 170 186" width="160" height="158"',
      ' style="display:block;overflow:visible;filter:drop-shadow(0 6px 18px rgba(34,197,94,.28)) drop-shadow(0 2px 8px rgba(0,0,0,.35))">',

      '<defs>',
        '<linearGradient id="smBG" x1="0%" y1="0%" x2="100%" y2="100%">',
          '<stop offset="0%"   stop-color="#81C784"/>',
          '<stop offset="48%"  stop-color="#43A047"/>',
          '<stop offset="100%" stop-color="#2E7D32"/>',
        '</linearGradient>',
        '<radialGradient id="smHG" cx="33%" cy="28%" r="62%">',
          '<stop offset="0%"   stop-color="#A5D6A7"/>',
          '<stop offset="42%"  stop-color="#66BB6A"/>',
          '<stop offset="100%" stop-color="#2E7D32"/>',
        '</radialGradient>',
        '<radialGradient id="smEW" cx="32%" cy="28%" r="68%">',
          '<stop offset="0%"   stop-color="#ffffff"/>',
          '<stop offset="100%" stop-color="#ddeeff"/>',
        '</radialGradient>',
        '<radialGradient id="smEI" cx="30%" cy="28%" r="65%">',
          '<stop offset="0%"   stop-color="#64B5F6"/>',
          '<stop offset="100%" stop-color="#1565C0"/>',
        '</radialGradient>',
      '</defs>',

      '<g id="snakeMascotWrap">',

        /* ── body ── */
        /* outline */
        '<path d="'+p+'" stroke="#1B5E20" stroke-width="33" stroke-linecap="round" fill="none" opacity=".5"/>',
        /* main fill */
        '<path d="'+p+'" stroke="url(#smBG)" stroke-width="28" stroke-linecap="round" fill="none"/>',
        /* belly stripe */
        '<path d="'+p+'" stroke="#C8E6C9" stroke-width="9" stroke-linecap="round" fill="none" opacity=".22"/>',
        /* top highlight */
        '<path d="'+p+'" stroke="rgba(255,255,255,.26)" stroke-width="11" stroke-linecap="round" fill="none"/>',
        /* scale dots */
        '<path d="'+p+'" stroke="rgba(0,0,0,.07)" stroke-width="28" stroke-linecap="round" fill="none"',
          ' stroke-dasharray="4 10" stroke-dashoffset="3"/>',

        /* ── head ── */
        '<g id="smHead" style="transform-origin:'+hx+'px '+hy+'px">',
          /* shadow */
          '<circle cx="'+(hx+2)+'" cy="'+(hy+4)+'" r="'+hr+'" fill="#1B5E20" opacity=".28"/>',
          /* head ball */
          '<circle cx="'+hx+'" cy="'+hy+'" r="'+hr+'" fill="url(#smHG)" stroke="#1B5E20" stroke-width="1.5"/>',
          /* face belly patch */
          '<ellipse cx="'+hx+'" cy="'+(hy+hr*.28)+'" rx="'+(hr*.56)+'" ry="'+(hr*.42)+'" fill="#C8E6C9" opacity=".52"/>',
          /* shine */
          '<ellipse cx="'+(hx-hr*.25)+'" cy="'+(hy-hr*.3)+'" rx="'+(hr*.2)+'" ry="'+(hr*.12)+'"',
            ' fill="rgba(255,255,255,.45)" transform="rotate(-28 '+hx+' '+hy+')"/>',

          /* left eye */
          '<g id="smEyeL" style="transform-origin:'+elx+'px '+ely+'px">',
            '<circle cx="'+elx+'" cy="'+ely+'" r="'+er+'" fill="url(#smEW)" stroke="#1B5E20" stroke-width=".9"/>',
            '<circle cx="'+(elx+er*.2)+'" cy="'+(ely+er*.18)+'" r="'+(er*.63)+'" fill="url(#smEI)"/>',
            '<circle cx="'+(elx+er*.32)+'" cy="'+(ely+er*.28)+'" r="'+(er*.35)+'" fill="#0D1117"/>',
            '<circle cx="'+(elx+er*.04)+'" cy="'+(ely-er*.12)+'" r="'+(er*.18)+'" fill="rgba(255,255,255,.92)"/>',
            '<rect class="eye-lid" id="smEyeLLid"',
              ' x="'+(elx-er)+'" y="'+(ely-er)+'" width="'+(er*2)+'" height="'+(er*2)+'"',
              ' rx="'+er+'" fill="#4CAF50"',
              ' style="transform-origin:'+elx+'px '+ely+'px"/>',
          '</g>',

          /* right eye */
          '<g id="smEyeR" style="transform-origin:'+erx+'px '+ery+'px">',
            '<circle cx="'+erx+'" cy="'+ery+'" r="'+er+'" fill="url(#smEW)" stroke="#1B5E20" stroke-width=".9"/>',
            '<circle cx="'+(erx+er*.2)+'" cy="'+(ery+er*.18)+'" r="'+(er*.63)+'" fill="url(#smEI)"/>',
            '<circle cx="'+(erx+er*.32)+'" cy="'+(ery+er*.28)+'" r="'+(er*.35)+'" fill="#0D1117"/>',
            '<circle cx="'+(erx+er*.04)+'" cy="'+(ery-er*.12)+'" r="'+(er*.18)+'" fill="rgba(255,255,255,.92)"/>',
            '<rect class="eye-lid" id="smEyeRLid"',
              ' x="'+(erx-er)+'" y="'+(ery-er)+'" width="'+(er*2)+'" height="'+(er*2)+'"',
              ' rx="'+er+'" fill="#4CAF50"',
              ' style="transform-origin:'+erx+'px '+ery+'px"/>',
          '</g>',

          /* smile */
          '<path id="smSmile" d="M '+(hx-8)+','+(hy+hr*.4)+' Q '+hx+','+(hy+hr*.72)+' '+(hx+8)+','+(hy+hr*.4)+'"',
            ' stroke="#1B5E20" stroke-width="2.2" fill="none" stroke-linecap="round"/>',
          /* happy teeth (hidden by default) */
          '<g id="smTeeth" opacity="0">',
            '<path d="M '+(hx-10)+','+(hy+hr*.46)+' Q '+hx+','+(hy+hr*.78)+' '+(hx+10)+','+(hy+hr*.46)+'"',
              ' stroke="#1B5E20" stroke-width="10" fill="none" stroke-linecap="round"/>',
            '<path d="M '+(hx-10)+','+(hy+hr*.46)+' Q '+hx+','+(hy+hr*.78)+' '+(hx+10)+','+(hy+hr*.46)+'"',
              ' stroke="white" stroke-width="7" fill="none" stroke-linecap="round"',
              ' stroke-dasharray="4 3" stroke-dashoffset="0"/>',
          '</g>',

          /* nostrils */
          '<circle cx="'+(hx-4)+'" cy="'+(hy+hr*.55)+'" r="1.5" fill="rgba(0,0,0,.35)"/>',
          '<circle cx="'+(hx+4)+'" cy="'+(hy+hr*.55)+'" r="1.5" fill="rgba(0,0,0,.35)"/>',

          /* tongue */
          '<g id="snakeTongue">',
            '<line x1="'+hx+'" y1="'+(hy+hr+1)+'" x2="'+hx+'" y2="'+(hy+hr+11)+'"',
              ' stroke="#E91E63" stroke-width="2.6" stroke-linecap="round"/>',
            '<line x1="'+hx+'" y1="'+(hy+hr+11)+'" x2="'+(hx-5)+'" y2="'+(hy+hr+18)+'"',
              ' stroke="#E91E63" stroke-width="2" stroke-linecap="round"/>',
            '<line x1="'+hx+'" y1="'+(hy+hr+11)+'" x2="'+(hx+5)+'" y2="'+(hy+hr+18)+'"',
              ' stroke="#E91E63" stroke-width="2" stroke-linecap="round"/>',
          '</g>',

        '</g>', /* /smHead */

      '</g>', /* /snakeMascotWrap */
      '</svg>'
    ].join('');
  }

  /* ── Animation list & durations ─────────────────────────────────── */
  var ANIMS = ['idle','dance','rainbow','bounce','spin','wave','happy','stretch','sleep','wink'];
  var DUR   = {idle:0, dance:3600, rainbow:4000, bounce:2800, spin:3000,
               wave:4000, happy:3200, stretch:3200, sleep:5000, wink:2600};

  /* ── Constructor ─────────────────────────────────────────────────── */
  function SnakeMascot(canvasId) {
    /* Find the placeholder (canvas or old img) */
    var placeholder = document.getElementById(canvasId) ||
                      document.getElementById('snakeImg') ||
                      document.getElementById('snakeSVG');
    if (!placeholder) return;

    /* If SVG already exists, just reuse it */
    if (placeholder.id === 'snakeSVG') { this._wrap = document.getElementById('snakeMascotWrap'); return; }

    /* Build and inject SVG */
    var tmp = document.createElement('div');
    tmp.innerHTML = buildSVG();
    var svg = tmp.firstChild;
    placeholder.parentNode.replaceChild(svg, placeholder);
    this._wrap = document.getElementById('snakeMascotWrap');
  }

  var _cur = null, _timer = null;

  SnakeMascot.prototype.playAnimation = function (name, cb) {
    var wrap = this._wrap;
    if (!wrap) { if (cb) cb(); return; }

    /* Remove previous animation class */
    if (_cur) wrap.classList.remove('snk-' + _cur);
    void wrap.offsetWidth; /* reflow to restart CSS animation */

    _cur = (ANIMS.indexOf(name) >= 0) ? name : 'idle';
    if (_cur !== 'idle') wrap.classList.add('snk-' + _cur);

    var dur = DUR[_cur] || 3500;
    if (_timer) clearTimeout(_timer);
    if (cb) {
      _timer = setTimeout(function () {
        if (_cur !== 'idle') wrap.classList.remove('snk-' + _cur);
        _cur = 'idle';
        cb();
      }, dur + 80);
    }
  };

  SnakeMascot.prototype.stopAnimation = function () {
    var wrap = this._wrap;
    if (_cur && wrap) wrap.classList.remove('snk-' + _cur);
    if (_timer) clearTimeout(_timer);
    _cur = 'idle';
  };

  w.SnakeMascot = SnakeMascot;

})(window);
