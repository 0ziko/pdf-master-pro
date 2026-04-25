/* ── SnakeConverter SEO Content Engine ─────────────────────────────
   Injects per-page:
     1. FAQPage JSON-LD into <head>
     2. Descriptive "About this tool" section at bottom of .main-card
     3. Internal "Related tools" links
   All text is indexed by Google (no hidden/display:none).
──────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  /* ── Page content data ──────────────────────────────────────────── */
  var PAGES = {

    /* ─── PDF Tools ─── */
    'pdf': {
      title: 'PDF Tools',
      intro: 'SnakeConverter PDF Tools let you merge, split, encrypt, convert and share PDF files entirely in your browser — no uploads to a server, no account required. Your files stay on your device at all times. Built with PDF-lib and jsPDF, every feature supports Unicode including Turkish, Arabic, Greek and Cyrillic characters.',
      howTo: [
        'Choose a tool from the left sidebar — Excel to PDF, Merge, Split, Encrypt/Decrypt, Image to PDF, or Share PDF.',
        'Drag & drop your files into the highlighted drop zone, or click to open a file picker.',
        'Adjust any settings (page range, password, quality) and click the action button.',
        'Your processed PDF downloads automatically — nothing is sent to a server.'
      ],
      faqs: [
        { q: 'Is the PDF converter free?', a: 'Yes. All PDF tools are completely free with no usage limits. No sign-up is required.' },
        { q: 'Are my PDF files uploaded to a server?', a: 'No. All processing happens locally in your browser using JavaScript. Your files never leave your device (except for the PDF Share feature, which stores files in Cloudflare for 7 days).' },
        { q: 'Can I convert Excel files with Turkish characters to PDF?', a: 'Yes. SnakeConverter embeds the DejaVu Sans font to ensure correct rendering of all Unicode characters including Turkish (ğ, ş, ı, ö, ü, ç), Arabic, Greek and more.' },
        { q: 'What is the maximum PDF file size?', a: 'There is no hard size limit for local operations. Very large files (100 MB+) may be slow depending on your device. The PDF Share feature has a 10 MB limit.' },
        { q: 'Can I merge more than two PDFs?', a: 'Yes. You can merge as many PDFs as you like in a single operation by selecting or dropping multiple files.' }
      ],
      related: [
        { label: 'Unit Converters', href: 'units.html' },
        { label: 'Developer Tools', href: 'dev.html' },
        { label: 'Calculators', href: 'calc.html' }
      ]
    },

    /* ─── Unit Converters ─── */
    'units': {
      title: 'Unit Converters',
      intro: 'SnakeConverter Unit Converters cover 13 categories and 90+ units, all calculated instantly in your browser. Convert length, weight, temperature, area, volume, speed, data storage, pressure, energy, time, cooking measurements, shoe sizes and typography units without any sign-up or app install. Results update live as you type.',
      howTo: [
        'Scroll or click a category badge to jump to the converter you need.',
        'Type a value into the input field and select the source unit.',
        'All equivalent values appear instantly in the result grid.',
        'Click any result row to copy the value to your clipboard.'
      ],
      faqs: [
        { q: 'How accurate are the unit conversions?', a: 'Conversions use exact scientific factors (e.g. 1 mile = 1.60934 km) and display up to 8 significant figures. Results are rounded to remove floating-point noise.' },
        { q: 'Can I convert Celsius to Fahrenheit?', a: 'Yes. Go to the Temperature section and type your Celsius value. All Fahrenheit, Kelvin and Rankine equivalents appear immediately.' },
        { q: 'Does the currency converter use live rates?', a: 'The currency converter fetches live exchange rates from a public API when you open the page. Rates refresh each session.' },
        { q: 'Is there a kg to lbs converter?', a: 'Yes. In the Weight / Mass section, enter kilograms and see pounds, ounces, stones, metric tons and more instantly.' },
        { q: 'Do I need an account to use the unit converters?', a: 'No. All converters work without any sign-up, account or app installation.' }
      ],
      related: [
        { label: 'Calculators', href: 'calc.html' },
        { label: 'PDF Tools', href: 'pdf.html' },
        { label: 'Text & Utility Tools', href: 'tools.html' }
      ]
    },

    /* ─── Calculators ─── */
    'calc': {
      title: 'Calculators',
      intro: 'SnakeConverter Calculators give you instant answers for everyday health, finance and math problems. Calculate your BMI, estimate loan repayments, find percentage changes, track calories, check currency rates and more — all in one place, entirely free. No spreadsheets, no sign-up, no installation.',
      howTo: [
        'Select a calculator from the sidebar — BMI, Percentage, Loan, Calorie Robot, Currency and more.',
        'Fill in the input fields. Results update instantly or appear after clicking the Calculate button.',
        'For the Calorie Robot, add meals from the food database and track daily intake and exercise burn.',
        'Use the loan calculator to compare different interest rates and repayment terms side by side.'
      ],
      faqs: [
        { q: 'Is the BMI calculator accurate?', a: 'The BMI calculator uses the standard WHO formula (weight in kg ÷ height in m²). It also shows your BMI category (underweight, healthy, overweight, obese) with a visual gauge.' },
        { q: 'Can the loan calculator show monthly repayments?', a: 'Yes. Enter your principal, annual interest rate and loan term. The calculator shows monthly EMI, total interest paid and total amount due.' },
        { q: 'How does the Calorie Robot work?', a: 'Calorie Robot calculates your daily calorie need (BMR × activity level), lets you add meals from a built-in food database, log exercise and shows your net calorie balance for the day.' },
        { q: 'Does the currency converter use real exchange rates?', a: 'Yes. Currency rates are fetched from a live public API when you load the page. Rates are updated every session.' },
        { q: 'Are my health calculations stored anywhere?', a: 'No. All calculations happen in your browser and are not sent to any server. Calorie tracking data is saved only in your browser\'s localStorage.' }
      ],
      related: [
        { label: 'Unit Converters', href: 'units.html' },
        { label: 'Text & Utility Tools', href: 'tools.html' },
        { label: 'PDF Tools', href: 'pdf.html' }
      ]
    },

    /* ─── Text & Utility Tools ─── */
    'tools': {
      title: 'Text & Utility Tools',
      intro: 'SnakeConverter Text & Utility Tools pack 30+ everyday browser utilities into one fast, ad-light page. Count words and characters, generate secure passwords, create QR codes, encode Base64, flip a coin, roll dice, run a stopwatch and much more — all without any sign-up or install.',
      howTo: [
        'Jump to the tool you need via the category navigation at the top of the page.',
        'Paste or type your text into the input area. Results appear instantly.',
        'For the QR code generator, type a URL or text and click Download to save the PNG.',
        'The password generator lets you set length, character sets and generates a strength-meter score.'
      ],
      faqs: [
        { q: 'Can I generate a QR code for free?', a: 'Yes. The QR Code Generator creates a QR code from any URL or text instantly. You can download it as a PNG — no watermarks, no sign-up.' },
        { q: 'How does the word counter work?', a: 'The word counter shows word count, character count (with and without spaces), sentence count, paragraph count and estimated reading time in real time as you type.' },
        { q: 'Is the password generator secure?', a: 'Passwords are generated using the browser\'s built-in cryptographic random number generator (crypto.getRandomValues). No passwords are transmitted or stored.' },
        { q: 'What is Base64 encoding used for?', a: 'Base64 is used to encode binary data (images, files) as ASCII text, commonly seen in email attachments, data URIs and API authentication tokens.' },
        { q: 'Does the stopwatch work offline?', a: 'Yes. All tools on this page, including the stopwatch and countdown timer, work entirely offline once the page is loaded.' }
      ],
      related: [
        { label: 'Developer Tools', href: 'dev.html' },
        { label: 'Calculators', href: 'calc.html' },
        { label: 'Unit Converters', href: 'units.html' }
      ]
    },

    /* ─── Developer Tools ─── */
    'dev': {
      title: 'Developer Tools',
      intro: 'SnakeConverter Developer Tools are a collection of free browser-based utilities built for developers and engineers. Format and validate JSON, test regular expressions, generate SHA/MD5 hashes, encode URLs, decode JWTs, generate UUIDs, minify CSS and more — all without pasting sensitive data into a third-party server.',
      howTo: [
        'Select a tool from the top navigation bar or scroll to the section you need.',
        'Paste your code, JSON, URL or text into the input area.',
        'The output updates instantly. Click "Copy" to send the result to your clipboard.',
        'For the Regex Tester, write a pattern and test string to see all matches highlighted in real time.'
      ],
      faqs: [
        { q: 'Is the JSON formatter safe to use with production data?', a: 'Yes. JSON formatting and validation happens entirely in your browser. No data is sent to any server, making it safe for sensitive payloads.' },
        { q: 'Can I test regular expressions with flags?', a: 'Yes. The Regex Tester supports global (g), case-insensitive (i), multiline (m) and other standard JavaScript regex flags. Matches are highlighted in the test string.' },
        { q: 'What hash algorithms does the hash generator support?', a: 'The hash generator supports MD5, SHA-1, SHA-256, SHA-384 and SHA-512, using the browser\'s native Web Crypto API.' },
        { q: 'What is a JWT and how do I decode one?', a: 'A JSON Web Token (JWT) is a compact, URL-safe token used for authentication. The JWT decoder splits the header, payload and signature and displays them as readable JSON — useful for debugging auth flows.' },
        { q: 'Can I convert JSON to CSV?', a: 'Yes. The JSON → CSV converter accepts a JSON array of objects and outputs a properly formatted CSV file that you can download or copy.' }
      ],
      related: [
        { label: 'Text & Utility Tools', href: 'tools.html' },
        { label: 'Color Tools', href: 'color.html' },
        { label: 'PDF Tools', href: 'pdf.html' }
      ]
    },

    /* ─── Color Tools ─── */
    'color': {
      title: 'Color Tools',
      intro: 'SnakeConverter Color Tools help designers and developers work with colour effortlessly. Convert between HEX, RGB and HSL, check WCAG contrast ratios, generate palettes, build CSS gradients, simulate colour blindness and more — directly in your browser, with instant live previews.',
      howTo: [
        'Type or paste a HEX colour code (e.g. #1e40af) into the HEX converter to see RGB and HSL equivalents.',
        'Use the Contrast Checker to paste a foreground and background colour and see your WCAG AA / AAA compliance score.',
        'The Gradient Builder lets you pick two or more colours and generates the CSS linear-gradient code to copy.',
        'Click the colour swatch in any tool to open a native colour picker for precise colour selection.'
      ],
      faqs: [
        { q: 'How do I convert HEX to RGB?', a: 'Enter your HEX colour code in the converter (with or without the # symbol) and the RGB, HSL and CMYK equivalents appear instantly.' },
        { q: 'What is WCAG contrast ratio?', a: 'WCAG (Web Content Accessibility Guidelines) defines contrast ratios to ensure text is readable for people with visual impairments. AA standard requires 4.5:1 for normal text; AAA requires 7:1.' },
        { q: 'Can I generate a complete colour palette from one colour?', a: 'Yes. The Tint & Shade Generator takes any base colour and produces a full range of lighter tints and darker shades, making it easy to build a design system palette.' },
        { q: 'What is colour blindness simulation used for?', a: 'Developers and designers use colour blindness simulation to check that their UI is accessible to users with protanopia, deuteranopia or tritanopia.' },
        { q: 'Can I generate random colour palettes?', a: 'Yes. The Random Palette Generator produces harmonious colour combinations (complementary, triadic, analogous) at the click of a button.' }
      ],
      related: [
        { label: 'Developer Tools', href: 'dev.html' },
        { label: 'Text & Utility Tools', href: 'tools.html' },
        { label: 'PDF Tools', href: 'pdf.html' }
      ]
    }
  };

  /* ── Detect current page ─────────────────────────────────────────── */
  function getPageKey() {
    var path = location.pathname.replace(/\//g, '').replace('.html', '');
    return path || 'index';
  }

  /* ── Inject FAQPage JSON-LD into <head> ─────────────────────────── */
  function injectFAQSchema(pageData) {
    if (!pageData || !pageData.faqs || !pageData.faqs.length) return;
    var schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": pageData.faqs.map(function (f) {
        return {
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": { "@type": "Answer", "text": f.a }
        };
      })
    };
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(schema);
    document.head.appendChild(s);
  }

  /* ── Inject visible SEO content block ───────────────────────────── */
  function injectContentBlock(pageData) {
    if (!pageData) return;
    var target = document.querySelector('.main-card') || document.body;

    /* Build HTML */
    var faqHtml = pageData.faqs.map(function (f, i) {
      return (
        '<details class="sc-faq-item" ' + (i === 0 ? 'open' : '') + '>' +
          '<summary class="sc-faq-q">' + f.q + '</summary>' +
          '<p class="sc-faq-a">' + f.a + '</p>' +
        '</details>'
      );
    }).join('');

    var stepsHtml = (pageData.howTo || []).map(function (s, i) {
      return '<li><span class="sc-step-n">' + (i + 1) + '</span>' + s + '</li>';
    }).join('');

    var relatedHtml = (pageData.related || []).map(function (r) {
      return '<a href="' + r.href + '" class="sc-rel-link">' + r.label + '</a>';
    }).join('');

    var block = document.createElement('section');
    block.className = 'sc-seo-block';
    block.innerHTML = [
      '<div class="sc-seo-inner">',
        '<h2 class="sc-seo-h2">About ' + pageData.title + '</h2>',
        '<p class="sc-seo-intro">' + pageData.intro + '</p>',

        stepsHtml ? (
          '<h3 class="sc-seo-h3">How to use</h3>' +
          '<ol class="sc-how-list">' + stepsHtml + '</ol>'
        ) : '',

        '<h3 class="sc-seo-h3">Frequently Asked Questions</h3>',
        '<div class="sc-faq-wrap">' + faqHtml + '</div>',

        relatedHtml ? (
          '<div class="sc-related">' +
            '<span class="sc-related-label">Explore more tools:</span>' +
            relatedHtml +
          '</div>'
        ) : '',
      '</div>'
    ].join('');

    target.appendChild(block);
  }

  /* ── Inject CSS ─────────────────────────────────────────────────── */
  function injectStyles() {
    var css = [
      '.sc-seo-block{',
        'margin-top:3rem;padding:2rem 0 1rem;',
        'border-top:1px solid rgba(130,80,255,.12);',
      '}',
      '.sc-seo-inner{max-width:720px;margin:0 auto;padding:0 1rem;}',
      '.sc-seo-h2{',
        'font-size:1.25rem;font-weight:800;color:#e2d9f3;',
        'margin:0 0 .75rem;letter-spacing:-.02em;',
      '}',
      '.sc-seo-h3{',
        'font-size:1rem;font-weight:700;color:#c4b5fd;',
        'margin:1.5rem 0 .6rem;',
      '}',
      '.sc-seo-intro{',
        'color:#94a3b8;font-size:.9rem;line-height:1.7;margin:0 0 .5rem;',
      '}',
      '.sc-how-list{',
        'list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:.55rem;',
      '}',
      '.sc-how-list li{',
        'display:flex;gap:.65rem;align-items:flex-start;',
        'color:#94a3b8;font-size:.88rem;line-height:1.6;',
      '}',
      '.sc-step-n{',
        'flex-shrink:0;width:22px;height:22px;border-radius:50%;',
        'background:rgba(130,80,255,.22);border:1px solid rgba(130,80,255,.35);',
        'color:#c4b5fd;font-size:.72rem;font-weight:700;',
        'display:flex;align-items:center;justify-content:center;margin-top:1px;',
      '}',
      '.sc-faq-wrap{display:flex;flex-direction:column;gap:.4rem;}',
      '.sc-faq-item{',
        'border:1px solid rgba(255,255,255,.07);border-radius:.65rem;',
        'background:rgba(255,255,255,.025);overflow:hidden;',
      '}',
      '.sc-faq-q{',
        'cursor:pointer;padding:.75rem 1rem;',
        'font-size:.88rem;font-weight:600;color:#c4b5fd;',
        'list-style:none;display:flex;justify-content:space-between;align-items:center;',
        'user-select:none;',
      '}',
      '.sc-faq-q::-webkit-details-marker{display:none;}',
      '.sc-faq-q::after{content:"﹢";font-size:.9rem;color:#8b5cf6;flex-shrink:0;}',
      'details[open] .sc-faq-q::after{content:"﹣";}',
      '.sc-faq-a{',
        'padding:.1rem 1rem .75rem;color:#94a3b8;font-size:.85rem;line-height:1.65;margin:0;',
      '}',
      '.sc-related{',
        'margin-top:1.5rem;display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;',
      '}',
      '.sc-related-label{',
        'font-size:.78rem;color:#6b7280;font-weight:600;',
      '}',
      '.sc-rel-link{',
        'font-size:.78rem;color:#8b5cf6;text-decoration:none;',
        'background:rgba(139,92,246,.1);border:1px solid rgba(139,92,246,.2);',
        'padding:.2rem .6rem;border-radius:.4rem;transition:all .15s;',
      '}',
      '.sc-rel-link:hover{background:rgba(139,92,246,.2);color:#c4b5fd;}',
    ].join('');

    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);
  }

  /* ── Boot ───────────────────────────────────────────────────────── */
  function boot() {
    var key  = getPageKey();
    var data = PAGES[key];
    if (!data) return;

    injectStyles();
    injectFAQSchema(data);

    /* Inject content block after page content is ready */
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { injectContentBlock(data); });
    } else {
      injectContentBlock(data);
    }
  }

  boot();

})();
