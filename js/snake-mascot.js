/* ── SnakeMascot v6 — Pro SVG snake, lush 3-D body + expressive face ─ */
(function (w) {
  'use strict';

  /* ── CSS injected once ──────────────────────────────────────────── */
  if (!document.getElementById('__snkCSS__')) {
    var st = document.createElement('style');
    st.id  = '__snkCSS__';
    st.textContent = `
      /* ── Idle float ── */
      #snakeMascotWrap {
        transform-origin: 95px 160px;
        animation: snkFloat 3.4s ease-in-out infinite;
      }
      @keyframes snkFloat {
        0%,100% { transform: translateY(0)    rotate(0deg);    }
        35%     { transform: translateY(-8px)  rotate(-1.2deg); }
        70%     { transform: translateY(-10px) rotate(1.2deg);  }
      }

      /* ── Tongue flick ── */
      #snakeTongue {
        transform-origin: 40px 25px;
        animation: snkTongue 4.2s ease-in-out infinite;
      }
      @keyframes snkTongue {
        0%,50%,100% { opacity:0; transform:scaleY(0) scaleX(0); }
        56%,90%     { opacity:1; transform:scaleY(1) scaleX(1); }
      }

      /* ── Pupil micro-look-around (idle life) ── */
      #smPupilL, #smPupilR {
        animation: snkPupilIdle 5.5s ease-in-out infinite;
      }
      #smPupilR { animation-delay: .3s; }
      @keyframes snkPupilIdle {
        0%,40%,100% { transform: translate(0,0);         }
        50%,90%     { transform: translate(1.5px,-1px);  }
        70%         { transform: translate(-1px,1.5px);  }
      }

      /* ── Named animations ── */

      .snk-dance {
        animation: snkDance 3.8s ease-in-out !important;
        transform-origin: 95px 160px;
      }
      @keyframes snkDance {
        0%    { transform:rotate(0deg)   translateX(0);    }
        10%   { transform:rotate(-18deg) translateX(-20px); }
        25%   { transform:rotate(18deg)  translateX(20px);  }
        40%   { transform:rotate(-13deg) translateX(-14px); }
        55%   { transform:rotate(13deg)  translateX(14px);  }
        70%   { transform:rotate(-6deg)  translateX(-6px);  }
        85%   { transform:rotate(6deg)   translateX(6px);   }
        100%  { transform:rotate(0deg)   translateX(0);    }
      }

      .snk-rainbow { animation: snkRainbow 4.2s linear !important; }
      @keyframes snkRainbow {
        0%   { filter: hue-rotate(0deg)   saturate(1.3) brightness(1.05); }
        25%  { filter: hue-rotate(90deg)  saturate(2)   brightness(1.2);  }
        50%  { filter: hue-rotate(180deg) saturate(2.4) brightness(1.15); }
        75%  { filter: hue-rotate(270deg) saturate(2)   brightness(1.2);  }
        100% { filter: hue-rotate(360deg) saturate(1.3) brightness(1.05); }
      }

      .snk-bounce {
        animation: snkBounce 2.9s cubic-bezier(.36,.07,.19,.97) !important;
        transform-origin: 95px 160px;
      }
      @keyframes snkBounce {
        0%   { transform:translateY(0)    scaleX(1)    scaleY(1);    }
        18%  { transform:translateY(-46px)scaleX(0.86) scaleY(1.14); }
        33%  { transform:translateY(0)    scaleX(1.2)  scaleY(0.8);  }
        48%  { transform:translateY(-26px)scaleX(0.92) scaleY(1.08); }
        62%  { transform:translateY(0)    scaleX(1.1)  scaleY(0.9);  }
        76%  { transform:translateY(-11px)scaleX(0.97) scaleY(1.03); }
        88%  { transform:translateY(0)    scaleX(1.04) scaleY(0.96); }
        100% { transform:translateY(0)    scaleX(1)    scaleY(1);    }
      }

      .snk-spin {
        animation: snkSpin 3.2s ease-in-out !important;
        transform-origin: 95px 80px;
      }
      @keyframes snkSpin {
        0%   { transform:rotate(0deg);   }
        70%  { transform:rotate(378deg); }
        85%  { transform:rotate(352deg); }
        100% { transform:rotate(360deg); }
      }

      .snk-wave {
        animation: snkWave 4.2s ease-in-out !important;
        transform-origin: 95px 160px;
      }
      @keyframes snkWave {
        0%   { transform:translateX(0)    skewY(0deg);  }
        14%  { transform:translateX(-22px)skewY(-7deg); }
        28%  { transform:translateX(22px) skewY(7deg);  }
        42%  { transform:translateX(-17px)skewY(-5deg); }
        56%  { transform:translateX(17px) skewY(5deg);  }
        70%  { transform:translateX(-8px) skewY(-2deg); }
        84%  { transform:translateX(8px)  skewY(2deg);  }
        100% { transform:translateX(0)    skewY(0deg);  }
      }

      .snk-happy {
        animation: snkHappy 3.4s ease-in-out !important;
        transform-origin: 95px 160px;
      }
      @keyframes snkHappy {
        0%,100%{ transform:scale(1)    translateY(0);    filter:brightness(1);    }
        18%    { transform:scale(1.14) translateY(-9px); filter:brightness(1.28); }
        32%    { transform:scale(0.96) translateY(0);    filter:brightness(1);    }
        52%    { transform:scale(1.11) translateY(-7px); filter:brightness(1.22); }
        68%    { transform:scale(0.98) translateY(0);    filter:brightness(1);    }
        82%    { transform:scale(1.06) translateY(-4px); filter:brightness(1.12); }
      }

      .snk-stretch {
        animation: snkStretch 3.4s ease-in-out !important;
        transform-origin: 95px 160px;
      }
      @keyframes snkStretch {
        0%   { transform:scaleY(1)    scaleX(1);    }
        22%  { transform:scaleY(1.6)  scaleX(0.75); }
        42%  { transform:scaleY(1.65) scaleX(0.73); }
        58%  { transform:scaleY(0.8)  scaleX(1.25); }
        74%  { transform:scaleY(1.1)  scaleX(0.93); }
        100% { transform:scaleY(1)    scaleX(1);    }
      }

      .snk-sleep {
        animation: snkSleep 5.2s ease-in-out !important;
        transform-origin: 95px 160px;
      }
      @keyframes snkSleep {
        0%   { transform:translateY(0)    rotate(0deg);  filter:brightness(1);    }
        20%  { transform:translateY(9px)  rotate(-6deg); filter:brightness(0.8);  }
        40%  { transform:translateY(16px) rotate(-9deg); filter:brightness(0.6);  }
        60%  { transform:translateY(16px) rotate(-9deg); filter:brightness(0.58); }
        80%  { transform:translateY(9px)  rotate(-4deg); filter:brightness(0.78); }
        100% { transform:translateY(0)    rotate(0deg);  filter:brightness(1);    }
      }

      .snk-wink {
        animation: snkWink 2.8s ease-in-out !important;
        transform-origin: 95px 160px;
      }
      @keyframes snkWink {
        0%,100%{ transform:translateY(0)  scaleX(1);    }
        20%    { transform:translateY(-7px) scaleX(1.06); }
        40%    { transform:translateY(0)  scaleX(1);    }
      }

      /* ── Eye lids ── */
      .eye-lid {
        transform-origin: center;
        transform: scaleY(0);
        transition: transform .15s;
      }
      .snk-sleep .eye-lid { animation: snkLidClose 5.2s ease-in-out; }
      @keyframes snkLidClose {
        0%,18%  { transform:scaleY(0); }
        28%,100%{ transform:scaleY(1); }
      }
      .snk-wink #smEyeRLid { animation: snkWinkLid 2.8s ease-in-out; }
      @keyframes snkWinkLid {
        0%,38%,82%,100%{ transform:scaleY(0); }
        46%,74%        { transform:scaleY(1); }
      }

      /* ── Happy teeth reveal ── */
      .snk-happy #smTeeth { animation: snkTeeth 3.4s ease-in-out; }
      @keyframes snkTeeth {
        0%,15%,85%,100%{ opacity:0; }
        25%,75%        { opacity:1; }
      }

      /* ── Blush appear on happy ── */
      .snk-happy #smBlushL,
      .snk-happy #smBlushR { animation: snkBlush 3.4s ease-in-out; }
      @keyframes snkBlush {
        0%,12%,88%,100%{ opacity:0; }
        22%,78%        { opacity:0.55; }
      }
    `;
    document.head.appendChild(st);
  }

  /* ── Build SVG ──────────────────────────────────────────────────── */
  function buildSVG() {
    /* Body path — tail bottom-right → head upper-left (nice S-curve) */
    var p   = 'M 190,165 C 140,152 38,148 28,112 C 18,76 108,60 100,34 C 92,8 44,0 36,-8';
    var sw  = 30;     /* body stroke width (mid layer) */
    var hx  = 36,  hy = -8,  hr = 31;          /* head centre + radius */
    var er  = hr * 0.31;                         /* eye radius */
    var elx = hx - hr*0.35, ely = hy - hr*0.12; /* left eye */
    var erx = hx + hr*0.35, ery = hy - hr*0.12; /* right eye */
    var brow_y = ely - er*1.4;                   /* eyebrow y baseline */

    return [
      '<svg id="snakeSVG" xmlns="http://www.w3.org/2000/svg"',
      ' viewBox="-8 -48 215 225" width="210" height="196"',
      ' style="display:block;overflow:visible;',
        'filter:drop-shadow(0 8px 22px rgba(39,174,96,.35)) drop-shadow(0 2px 10px rgba(0,0,0,.4))"',
      ' aria-label="Snake mascot">',

      '<defs>',
        /* Body gradient: dark-to-vivid green from bottom to top */
        '<linearGradient id="smBdyG" x1="100%" y1="100%" x2="0%" y2="0%">',
          '<stop offset="0%"   stop-color="#145A32"/>',
          '<stop offset="30%"  stop-color="#1E8449"/>',
          '<stop offset="65%"  stop-color="#27AE60"/>',
          '<stop offset="100%" stop-color="#58D68D"/>',
        '</linearGradient>',

        /* Body highlight stripe: white-to-transparent */
        '<linearGradient id="smHilG" x1="0%" y1="0%" x2="0%" y2="100%">',
          '<stop offset="0%"   stop-color="rgba(255,255,255,.55)"/>',
          '<stop offset="100%" stop-color="rgba(255,255,255,.0)"/>',
        '</linearGradient>',

        /* Head radial gradient: bright top-left → dark bottom-right */
        '<radialGradient id="smHdG" cx="30%" cy="26%" r="70%">',
          '<stop offset="0%"   stop-color="#82E0AA"/>',
          '<stop offset="38%"  stop-color="#27AE60"/>',
          '<stop offset="76%"  stop-color="#1E8449"/>',
          '<stop offset="100%" stop-color="#145A32"/>',
        '</radialGradient>',

        /* Eye white: subtle gradient */
        '<radialGradient id="smEwG" cx="28%" cy="24%" r="72%">',
          '<stop offset="0%"   stop-color="#ffffff"/>',
          '<stop offset="100%" stop-color="#d5edf8"/>',
        '</radialGradient>',

        /* Iris gradient: teal/blue vivid */
        '<radialGradient id="smIrisG" cx="28%" cy="26%" r="72%">',
          '<stop offset="0%"   stop-color="#48C9B0"/>',
          '<stop offset="45%"  stop-color="#1A9D8E"/>',
          '<stop offset="100%" stop-color="#0E6655"/>',
        '</radialGradient>',

        /* Scale texture pattern */
        '<pattern id="smScales" x="0" y="0" width="18" height="12" patternUnits="userSpaceOnUse"',
          ' patternTransform="rotate(0)">',
          '<ellipse cx="9" cy="6" rx="7.5" ry="4.5"',
            ' fill="none" stroke="rgba(0,0,0,.11)" stroke-width="1.1"/>',
        '</pattern>',

        /* Drop-shadow filter for head */
        '<filter id="smHdSh" x="-30%" y="-30%" width="160%" height="160%">',
          '<feDropShadow dx="2" dy="4" stdDeviation="4" flood-color="#0D5016" flood-opacity=".45"/>',
        '</filter>',

        /* Glow filter for body */
        '<filter id="smBdyGlow" x="-20%" y="-20%" width="140%" height="140%">',
          '<feGaussianBlur stdDeviation="5" result="b"/>',
          '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>',
        '</filter>',
      '</defs>',

      '<g id="snakeMascotWrap">',

        /* ── Body (5 layers for 3-D tube illusion) ── */

        /* Layer 1: deep shadow/outline */
        '<path d="'+p+'" stroke="#0D3B20" stroke-width="'+(sw+9)+'"',
          ' stroke-linecap="round" fill="none" opacity=".55"/>',

        /* Layer 2: dark mid-tone edge */
        '<path d="'+p+'" stroke="#145A32" stroke-width="'+(sw+4)+'"',
          ' stroke-linecap="round" fill="none"/>',

        /* Layer 3: main body colour */
        '<path d="'+p+'" stroke="url(#smBdyG)" stroke-width="'+sw+'"',
          ' stroke-linecap="round" fill="none"/>',

        /* Layer 4: scale texture overlay */
        '<path d="'+p+'" stroke="url(#smScales)" stroke-width="'+(sw-2)+'"',
          ' stroke-linecap="round" fill="none"/>',

        /* Layer 5: belly/centre shimmer */
        '<path d="'+p+'" stroke="rgba(162,221,180,.30)" stroke-width="'+(sw*0.45|0)+'"',
          ' stroke-linecap="round" fill="none"/>',

        /* Layer 6: top specular highlight */
        '<path d="'+p+'" stroke="rgba(255,255,255,.28)" stroke-width="'+(sw*0.28|0)+'"',
          ' stroke-linecap="round" fill="none"/>',

        /* ── Tail rattler tip ── */
        '<ellipse cx="192" cy="164" rx="9" ry="6"',
          ' fill="#145A32" stroke="#0D3B20" stroke-width="1.5" opacity=".85"/>',
        '<ellipse cx="192" cy="164" rx="5.5" ry="3.5" fill="#27AE60" opacity=".7"/>',

        /* ── Head ── */
        '<g id="smHead" filter="url(#smHdSh)"',
          ' style="transform-origin:'+hx+'px '+hy+'px">',

          /* Head sphere */
          '<circle cx="'+hx+'" cy="'+hy+'" r="'+hr+'"',
            ' fill="url(#smHdG)" stroke="#0D3B20" stroke-width="1.8"/>',

          /* Face belly patch (lighter area gives dimensional feel) */
          '<ellipse cx="'+hx+'" cy="'+(hy+hr*0.26)+'"',
            ' rx="'+(hr*0.54)+'" ry="'+(hr*0.40)+'"',
            ' fill="#A9DFBF" opacity=".40"/>',

          /* Primary specular shine (top-left glint) */
          '<ellipse cx="'+(hx-hr*0.26)+'" cy="'+(hy-hr*0.32)+'"',
            ' rx="'+(hr*0.22)+'" ry="'+(hr*0.13)+'"',
            ' fill="rgba(255,255,255,.52)" transform="rotate(-30 '+hx+' '+hy+')"/>',
          /* Secondary micro-glint */
          '<circle cx="'+(hx-hr*0.08)+'" cy="'+(hy-hr*0.18)+'"',
            ' r="'+(hr*0.07)+'" fill="rgba(255,255,255,.38)"/>',

          /* ── Left eyebrow ── */
          '<path d="M '+(elx-er*1.0)+','+(brow_y+1.5)+' Q '+elx+','+(brow_y-3)+' '+(elx+er*1.0)+','+(brow_y+1.5)+'"',
            ' stroke="#0D3B20" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".8"/>',

          /* ── Right eyebrow ── */
          '<path d="M '+(erx-er*1.0)+','+(brow_y+1.5)+' Q '+erx+','+(brow_y-3)+' '+(erx+er*1.0)+','+(brow_y+1.5)+'"',
            ' stroke="#0D3B20" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".8"/>',

          /* ── Left eye ── */
          '<g id="smEyeL" style="transform-origin:'+elx+'px '+ely+'px">',
            /* Sclera with subtle rim */
            '<circle cx="'+elx+'" cy="'+ely+'" r="'+er+'"',
              ' fill="url(#smEwG)" stroke="#0D3B20" stroke-width="1"/>',
            /* Iris */
            '<circle cx="'+(elx+er*0.12)+'" cy="'+(ely+er*0.12)+'" r="'+(er*0.70)+'"',
              ' fill="url(#smIrisG)"/>',
            /* Pupil */
            '<circle id="smPupilL" cx="'+(elx+er*0.28)+'" cy="'+(ely+er*0.22)+'" r="'+(er*0.34)+'"',
              ' fill="#050e05"/>',
            /* Catchlight 1 (main) */
            '<circle cx="'+(elx-er*0.05)+'" cy="'+(ely-er*0.18)+'" r="'+(er*0.20)+'"',
              ' fill="rgba(255,255,255,.95)"/>',
            /* Catchlight 2 (small secondary) */
            '<circle cx="'+(elx+er*0.28)+'" cy="'+(ely+er*0.42)+'" r="'+(er*0.10)+'"',
              ' fill="rgba(255,255,255,.60)"/>',
            /* Eyelid */
            '<rect class="eye-lid" id="smEyeLLid"',
              ' x="'+(elx-er)+'" y="'+(ely-er)+'" width="'+(er*2)+'" height="'+(er*2)+'"',
              ' rx="'+er+'" fill="#27AE60"',
              ' style="transform-origin:'+elx+'px '+ely+'px"/>',
          '</g>',

          /* ── Right eye ── */
          '<g id="smEyeR" style="transform-origin:'+erx+'px '+ery+'px">',
            '<circle cx="'+erx+'" cy="'+ery+'" r="'+er+'"',
              ' fill="url(#smEwG)" stroke="#0D3B20" stroke-width="1"/>',
            '<circle cx="'+(erx+er*0.12)+'" cy="'+(ery+er*0.12)+'" r="'+(er*0.70)+'"',
              ' fill="url(#smIrisG)"/>',
            '<circle id="smPupilR" cx="'+(erx+er*0.28)+'" cy="'+(ery+er*0.22)+'" r="'+(er*0.34)+'"',
              ' fill="#050e05"/>',
            '<circle cx="'+(erx-er*0.05)+'" cy="'+(ery-er*0.18)+'" r="'+(er*0.20)+'"',
              ' fill="rgba(255,255,255,.95)"/>',
            '<circle cx="'+(erx+er*0.28)+'" cy="'+(ery+er*0.42)+'" r="'+(er*0.10)+'"',
              ' fill="rgba(255,255,255,.60)"/>',
            '<rect class="eye-lid" id="smEyeRLid"',
              ' x="'+(erx-er)+'" y="'+(ery-er)+'" width="'+(er*2)+'" height="'+(er*2)+'"',
              ' rx="'+er+'" fill="#27AE60"',
              ' style="transform-origin:'+erx+'px '+ery+'px"/>',
          '</g>',

          /* ── Cheek blush (hidden; shown on happy) ── */
          '<ellipse id="smBlushL" cx="'+(elx-er*0.5)+'" cy="'+(ely+er*1.5)+'"',
            ' rx="'+(er*1.1)+'" ry="'+(er*0.6)+'"',
            ' fill="rgba(255,100,100,.42)" opacity="0"/>',
          '<ellipse id="smBlushR" cx="'+(erx+er*0.5)+'" cy="'+(ery+er*1.5)+'"',
            ' rx="'+(er*1.1)+'" ry="'+(er*0.6)+'"',
            ' fill="rgba(255,100,100,.42)" opacity="0"/>',

          /* ── Smile ── */
          '<path id="smSmile"',
            ' d="M '+(hx-9)+','+(hy+hr*0.38)+' Q '+hx+','+(hy+hr*0.70)+' '+(hx+9)+','+(hy+hr*0.38)+'"',
            ' stroke="#0D3B20" stroke-width="2.4" fill="none" stroke-linecap="round"/>',

          /* ── Happy teeth (revealed via CSS) ── */
          '<g id="smTeeth" opacity="0">',
            '<path d="M '+(hx-11)+','+(hy+hr*0.42)+' Q '+hx+','+(hy+hr*0.75)+' '+(hx+11)+','+(hy+hr*0.42)+'"',
              ' stroke="#0D3B20" stroke-width="11" fill="none" stroke-linecap="round"/>',
            '<path d="M '+(hx-11)+','+(hy+hr*0.42)+' Q '+hx+','+(hy+hr*0.75)+' '+(hx+11)+','+(hy+hr*0.42)+'"',
              ' stroke="white" stroke-width="8" fill="none" stroke-linecap="round"',
              ' stroke-dasharray="5 3"/>',
          '</g>',

          /* ── Nostrils ── */
          '<ellipse cx="'+(hx-4)+'" cy="'+(hy+hr*0.53)+'" rx="2.2" ry="1.5"',
            ' fill="rgba(0,0,0,.38)"/>',
          '<ellipse cx="'+(hx+4)+'" cy="'+(hy+hr*0.53)+'" rx="2.2" ry="1.5"',
            ' fill="rgba(0,0,0,.38)"/>',

          /* ── Tongue ── */
          '<g id="snakeTongue">',
            /* Stem */
            '<path d="M '+hx+','+(hy+hr+1)+' L '+hx+','+(hy+hr+13)+'"',
              ' stroke="#C0392B" stroke-width="3.2" stroke-linecap="round"/>',
            /* Fork left */
            '<path d="M '+hx+','+(hy+hr+13)+' L '+(hx-7)+','+(hy+hr+22)+'"',
              ' stroke="#C0392B" stroke-width="2.4" stroke-linecap="round"/>',
            /* Fork right */
            '<path d="M '+hx+','+(hy+hr+13)+' L '+(hx+7)+','+(hy+hr+22)+'"',
              ' stroke="#C0392B" stroke-width="2.4" stroke-linecap="round"/>',
            /* Tongue tips (small circles for realism) */
            '<circle cx="'+(hx-7)+'" cy="'+(hy+hr+22)+'" r="2.5" fill="#C0392B"/>',
            '<circle cx="'+(hx+7)+'" cy="'+(hy+hr+22)+'" r="2.5" fill="#C0392B"/>',
          '</g>',

        '</g>', /* /smHead */

      '</g>', /* /snakeMascotWrap */
      '</svg>'
    ].join('');
  }

  /* ── Animation registry ─────────────────────────────────────────── */
  var ANIMS = ['idle','dance','rainbow','bounce','spin','wave','happy','stretch','sleep','wink'];
  var DUR   = {idle:0, dance:3800, rainbow:4200, bounce:2900, spin:3200,
               wave:4200, happy:3400, stretch:3400, sleep:5200, wink:2800};

  /* ── Constructor ─────────────────────────────────────────────────── */
  function SnakeMascot(canvasId) {
    var placeholder = document.getElementById(canvasId) ||
                      document.getElementById('snakeImg') ||
                      document.getElementById('snakeSVG');
    if (!placeholder) return;

    /* If already an SVG, reuse */
    if (placeholder.id === 'snakeSVG') {
      this._wrap = document.getElementById('snakeMascotWrap');
      return;
    }

    /* Build and inject SVG, replacing the placeholder element */
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

    if (_cur) wrap.classList.remove('snk-' + _cur);
    void wrap.offsetWidth; /* force reflow to restart CSS animation */

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
