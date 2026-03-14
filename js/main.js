/**
 * Cosmos — Starfield animation and mobile nav.
 * Design ref: images/design-palette.txt
 */

(function () {
  'use strict';

  /** Starfield canvas: twinkling stars on hero. */
  function initStarfield() {
    const canvas = document.getElementById('starfield');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let stars = [];

    function setSize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.scale(dpr, dpr);
      initStars(w, h);
    }

    function initStars(width, height) {
      const count = Math.min(200, Math.floor((width * height) / 8000));
      stars = [];
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.random() * 1.2 + 0.3,
          twinkle: Math.random() * Math.PI * 2,
          speed: 0.02 + Math.random() * 0.03,
        });
      }
    }

    function draw() {
      const w = canvas.style.width ? parseInt(canvas.style.width, 10) : window.innerWidth;
      const h = canvas.style.height ? parseInt(canvas.style.height, 10) : window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      stars.forEach(function (star) {
        star.twinkle += star.speed;
        const alpha = 0.3 + 0.7 * (Math.sin(star.twinkle) * 0.5 + 0.5);
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, ' + alpha + ')';
        ctx.fill();
      });

      animationId = requestAnimationFrame(draw);
    }

    setSize();
    draw();
    window.addEventListener('resize', function () {
      setSize();
    });
  }

  /** Planet zoom: click to zoom in, stop orbit, hide others, keep axis spin. */
  function initPlanetZoom() {
    const planets = document.querySelectorAll('.planet');
    const overlay = document.querySelector('.planet-zoom-overlay');
    if (!planets.length || !overlay) return;

    // Multi-click state: 0=normal, 1=zoomed, 2=grabbed, 3=released
    let currentState = 0;
    let activePlanetName = null;

    function closeZoom() {
      if (!activePlanetName) return;

      window.dispatchEvent(new CustomEvent('planet-grab-toggle', {
        detail: { planet: activePlanetName, isGrabbed: false }
      }));

      document.body.classList.remove(
        `${activePlanetName}-zoomed`,
        'planet-zoomed-active',
        'planet-grabbed-active',
        'planet-released-active'
      );

      currentState = 0;
      activePlanetName = null;
    }

    planets.forEach(planet => {
      planet.addEventListener('click', (e) => {
        e.preventDefault();
        const planetName = planet.getAttribute('aria-label').toLowerCase();
        
        if (activePlanetName && activePlanetName !== planetName) {
          closeZoom();
        }

        activePlanetName = planetName;

        if (currentState === 0) {
          // 1st click: Zoom in
          currentState = 1;
          document.body.classList.add(`${planetName}-zoomed`, 'planet-zoomed-active');
        } else if (currentState === 1) {
          // 2nd click: Grab
          currentState = 2;
          window.dispatchEvent(new CustomEvent('planet-grab-toggle', { 
            detail: { planet: planetName, isGrabbed: true } 
          }));
          document.body.classList.add('planet-grabbed-active');
        } else if (currentState === 2) {
          // 3rd click: Release
          currentState = 3;
          window.dispatchEvent(new CustomEvent('planet-grab-toggle', { 
            detail: { planet: planetName, isGrabbed: false } 
          }));
          document.body.classList.remove('planet-grabbed-active');
          document.body.classList.add('planet-released-active');
        } else {
          // 4th click: Zoom out
          closeZoom();
        }
      });
    });

    overlay.addEventListener('click', closeZoom);
  }

  /** Auto-hide header: hide after inactivity, show on mouse move or click. */
  function initHeaderAutoHide() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    const INACTIVITY_MS = 2000;
    let hideTimeout = null;

    function scheduleHide() {
      if (hideTimeout) clearTimeout(hideTimeout);
      hideTimeout = setTimeout(function () {
        const links = document.querySelector('.nav-links');
        if (links && links.classList.contains('is-open')) return;
        header.classList.add('is-hidden');
        hideTimeout = null;
      }, INACTIVITY_MS);
    }

    function show() {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
      header.classList.remove('is-hidden');
      scheduleHide();
    }

    ['mousemove', 'mousedown', 'click', 'touchstart', 'touchmove', 'keydown'].forEach(function (evt) {
      document.addEventListener(evt, show, { passive: true });
    });

    scheduleHide();
  }

  /** Zoom info box: typed facts in Polish for Sun, planets and Moon (left side, menu-style). */
  function initZoomInfoBox() {
    var box = document.getElementById('zoom-info-box');
    var textEl = box ? box.querySelector('.zoom-info-text') : null;
    if (!box || !textEl) return;

    var ZOOM_FACTS_PL = {
      sun: 'Słońce to gwiazda w centrum Układu Słonecznego.\n\n' +
        'Średnica: ok. 1,4 mln km. Składa się głównie z wodoru i helu.\n\n' +
        'Temperatura powierzchni: ok. 5500°C. W jądrze zachodzą reakcje termojądrowe.\n\n' +
        'Zapewnia Ziemi światło i ciepło. Bez niego nie byłoby życia (NASA).',
      mercury: 'Merkury to najmniejsza i najbliższa Słońcu planeta.\n\n' +
        'Średnica: ok. 4880 km. Okres obiegu: 88 dni ziemskich.\n\n' +
        'Skrajne temperatury: od ok. -180°C w nocy do 430°C w dzień.\n\n' +
        'Brak księżyców. Sonda MESSENGER zbadała go z orbity (NASA).',
      venus: 'Wenus to druga planeta od Słońca, często nazywana „gwiazdą poranną”.\n\n' +
        'Średnica: ok. 12 100 km. Gęsta atmosfera z dwutlenkiem węgla.\n\n' +
        'Efekt cieplarniany — średnia temp. ok. 465°C. Obraca się w przeciwnym kierunku.\n\n' +
        'Wiele misji sond (m.in. Magellan, Venus Express) badało Wenus (NASA).',
      earth: 'Ziemia to trzecia planeta, jedyna znana z występowaniem życia.\n\n' +
        'Średnica: ok. 12 742 km. Około 71% powierzchni pokrywają oceany.\n\n' +
        'Atmosfera z tlenem i azotem. Naturalny satelita: Księżyc.\n\n' +
        'Misje NASA i innych agencji badają Ziemię z kosmosu (NASA).',
      moon: 'Księżyc to najbliższy sąsiad Ziemi.\n\n' +
        'Ma trzy warstwy: skorupę, płaszcz i jądro — jak Ziemia.\n\n' +
        'Jego grawitacja powoduje pływy morskie na Ziemi.\n\n' +
        'Po niewidocznej stronie jest tyle samo światła słonecznego co po widocznej.\n\n' +
        'Dziś nie ma tam wulkanów; miliardy lat temu płynęła lawa.\n\n' +
        'Pył księżycowy utrudnia misje. LRO zmapował powierzchnię. Artemis — powrót na Księżyc (NASA).',
      mars: 'Mars to czwarta planeta, „Czerwona Planeta”.\n\n' +
        'Średnica: ok. 6779 km. Dwa księżyce: Fobos i Deimos.\n\n' +
        'Ślady dawnych rzek i jezior. Olympus Mons — najwyższa góra w Układzie Słonecznym.\n\n' +
        'Łaziki (Curiosity, Perseverance) i orbiter NASA badają Marsa (NASA).',
      jupiter: 'Jowisz to największa planeta, gazowy olbrzym.\n\n' +
        'Średnica: ok. 140 000 km. Ma ponad 80 księżyców (m.in. Europa, Ganimedes).\n\n' +
        'Wielka Czerwona Plama to gigantyczna burza. Chroni Ziemię, przyciągając komety i asteroidy.\n\n' +
        'Sonda Juno bada Jowisza (NASA).',
      saturn: 'Saturn to druga największa planeta, znana z pierścieni.\n\n' +
        'Średnica: ok. 116 000 km. Gęstość mniejsza niż wody.\n\n' +
        'Księżyce: Tytan (gęsta atmosfera), Enceladus (gejzery). Pierścienie z lodu i skał.\n\n' +
        'Misja Cassini badała Saturn i jego księżyce (NASA).',
      uranus: 'Uran to lodowy olbrzym, siódma planeta od Słońca.\n\n' +
        'Średnica: ok. 51 000 km. Oś obrotu nachylona „na boku” (ok. 98°).\n\n' +
        'Składa się głównie z lodu i gazu. Odkryty w 1781 r. przez W. Herschela.\n\n' +
        'Jedna misja (Voyager 2) przeleciała obok Urana (NASA).',
      neptune: 'Neptun to najdalsza planeta, lodowy olbrzym.\n\n' +
        'Średnica: ok. 49 000 km. Istnienie przewidziano matematycznie, zanim go zaobserwowano.\n\n' +
        'Silne wiatry w atmosferze. Księżyc Tryton — gejzery azotu.\n\n' +
        'Voyager 2 jedyną sondą, która odwiedziła Neptuna (NASA).'
    };

    var ZOOM_CLASSES = [
      'sun-zoomed', 'mercury-zoomed', 'venus-zoomed', 'earth-zoomed', 'moon-zoomed',
      'mars-zoomed', 'jupiter-zoomed', 'saturn-zoomed', 'uranus-zoomed', 'neptune-zoomed'
    ];

    function getZoomedBody() {
      for (var i = 0; i < ZOOM_CLASSES.length; i++) {
        if (document.body.classList.contains(ZOOM_CLASSES[i])) {
          return ZOOM_CLASSES[i].replace('-zoomed', '');
        }
      }
      return null;
    }

    var lastBodyKey = null;

    function clearText() {
      lastBodyKey = null;
      textEl.textContent = '';
      box.setAttribute('aria-hidden', 'true');
    }

    var observer = new MutationObserver(function () {
      if (!document.body.classList.contains('planet-zoomed-active')) {
        clearText();
        return;
      }
      var bodyKey = getZoomedBody();
      if (!bodyKey) {
        clearText();
        return;
      }
      var text = ZOOM_FACTS_PL[bodyKey];
      if (!text) {
        clearText();
        return;
      }
      box.setAttribute('aria-hidden', 'false');
      if (bodyKey !== lastBodyKey) {
        lastBodyKey = bodyKey;
        textEl.textContent = text;
      }
    });

    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  /** Planet hover tag: show menu-style label with typed name on mouseenter. */
  function initPlanetHoverTag() {
    var tagEl = document.getElementById('planet-hover-tag');
    var textEl = document.getElementById('planet-hover-tag-text');
    if (!tagEl || !textEl) return;

    var CHAR_DELAY_MS = 50;
    var typeTimeout = null;

    function typeText(text, el) {
      el.textContent = '';
      el.classList.remove('typing-done');
      var i = 0;
      function typeChar() {
        if (i < text.length) {
          el.textContent += text[i];
          i++;
          typeTimeout = setTimeout(typeChar, CHAR_DELAY_MS);
        } else {
          el.classList.add('typing-done');
        }
      }
      typeChar();
    }

    function positionTag(planetRect) {
      var x = planetRect.left + planetRect.width / 2;
      var y = planetRect.top - 8;
      tagEl.style.left = x + 'px';
      tagEl.style.top = y + 'px';
      tagEl.style.transform = 'translate(-50%, -100%)';
    }

    function showTag(name, planetEl) {
      if (document.body.classList.contains('planet-zoomed-active')) return;
      if (typeTimeout) clearTimeout(typeTimeout);
      typeTimeout = null;
      textEl.textContent = '';
      textEl.classList.remove('typing-done');
      positionTag(planetEl.getBoundingClientRect());
      tagEl.classList.add('is-visible');
      tagEl.setAttribute('aria-hidden', 'false');
      typeText(name, textEl);
    }

    function hideTag() {
      if (typeTimeout) clearTimeout(typeTimeout);
      typeTimeout = null;
      tagEl.classList.remove('is-visible');
      tagEl.setAttribute('aria-hidden', 'true');
      textEl.textContent = '';
    }

    document.querySelectorAll('.planet').forEach(function (planet) {
      var name = planet.getAttribute('aria-label') || 'Planet';
      planet.addEventListener('mouseenter', function () { showTag(name, planet); });
      planet.addEventListener('mouseleave', hideTag);
    });
  }

  /** Mobile nav: toggle menu open/close. */
  function initNav() {
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    if (!toggle || !links) return;

    toggle.addEventListener('click', function () {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', !expanded);
      links.classList.toggle('is-open', !expanded);
    });

    links.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        toggle.setAttribute('aria-expanded', 'false');
        links.classList.remove('is-open');
      });
    });
  }

  function init() {
    initStarfield();
    initPlanetZoom();
    initHeaderAutoHide();
    initZoomInfoBox();
    initPlanetHoverTag();
    initNav();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
