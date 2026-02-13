(() => {
  "use strict";

  const QUESTIONS = [
    "Benimle bugun kucuk bir kutlama yapar misin?",
    "Su an sana sarilmayi hayal edebilir miyim?",
    "Bizim icin bir dilek tutalim mi?",
    "Bu yil birlikte daha cok ani biriktirelim mi?",
    "Sana 'iyi ki varsin' desem, kabul eder misin?",
    "Bir sonraki bulusmamizda surprize hazir misin?",
    "En sevdigin sarkiyi acip birlikte dans edelim mi?",
    "Bugun seni biraz simartmama izin verir misin?",
    "Kalbimdeki yerin sonsuza kadar kalsin mi?",
    "Benim sevgilim olur musun (yine ve yeniden)?"
  ];

  const GALLERY_CAPTIONS = [
    "Birlikte guldigimiz o guzel an.",
    "Bakislarimiz bile ayni hikayeyi anlatiyor.",
    "Seni izlemek, en sevdigim manzara.",
    "Kucuk bir kare, kocaman bir his.",
    "Yaninda her sey daha anlamli.",
    "Kalbim bu ana tekrar tekrar donuyor.",
    "Gulumsemen gunumu aydinlatiyor.",
    "Birlikte oldugumuz her an bir hediye.",
    "Seninle zamanin tadi baska.",
    "Iyi ki varsin sevgilim."
  ];

  const LOVE_MESSAGES = [
    "Seni çok seviyorum ❤️",
    "Seni çoook seviyorum ❤️",
    "İyi ki varsın, seni çok seviyorum ❤️"
  ];

  const WHATSAPP_PHONE_E164 = "905368934908";
  const WHATSAPP_FEATURES = {
    useDeepLinkOnMobile: true,
    deepLinkFallbackDelayMs: 420
  };
  const FEATURE_FLAGS = {
    runawayNoButton: true
  };
  const PHOTO_CANDIDATES = [
    ...Array.from({ length: 10 }, (_, i) => `assets/photos/photo${String(i + 1).padStart(2, "0")}.jpg`),
    "assets/photos/photo_2026-02-13_19-23-28.jpg",
    "assets/photos/photo_2026-02-13_19-23-35.jpg",
    "assets/photos/photo_2026-02-13_19-23-39.jpg",
    "assets/photos/photo_2026-02-13_19-23-42.jpg",
    "assets/photos/photo_2026-02-13_19-23-45.jpg",
    "assets/photos/photo_2026-02-13_19-23-48.jpg",
    "assets/photos/photo_2026-02-13_19-23-51.jpg",
    "assets/photos/photo_2026-02-13_19-23-54.jpg",
    "assets/photos/photo_2026-02-13_19-24-00.jpg",
    "assets/photos/photo_2026-02-13_19-24-03.jpg"
  ];
  const MUSIC_CANDIDATES = [
    "assets/music/romantic.mp3",
    "assets/music/romantic.MP3",
    "Güncel Gürsel Artıktay - uzak yol.mp3"
  ];

  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const reducedMotion = reducedMotionQuery.matches;
  const NAME_SEQ = ["M", "E", "R", "V", "E"];
  let letterIndex = 0;
  const isMobileDevice = (() => {
    const byUAData = !!(navigator.userAgentData && navigator.userAgentData.mobile);
    const byUA = /Android|iPhone|iPad|iPod|Mobile|IEMobile|Opera Mini/i.test(navigator.userAgent || "");
    const byTouch = "maxTouchPoints" in navigator && navigator.maxTouchPoints > 0;
    return byUAData || byUA || byTouch;
  })();

  const state = {
    currentStep: 0,
    answers: [],
    heroNoClicks: 0,
    galleryIndex: 0,
    galleryPlaying: false,
    galleryTimer: 0,
    galleryLoaded: [],
    theme: document.documentElement.getAttribute("data-theme") || "dark",
    audioReady: true,
    audioUnlocked: false,
    audioPlaying: false,
    waIndex: 0,
    paused: false,
    scrollY: 0,
    settings: {
      density: "med",
      trailEnabled: !reducedMotion,
      reducedMotion
    },
    pointers: {
      x: window.innerWidth * 0.5,
      y: window.innerHeight * 0.5,
      active: false
    },
    final: {
      heartTriggered: false
    }
  };

  const dom = {
    body: document.body,
    heroHint: document.getElementById("heroHint"),
    heroActions: document.getElementById("heroActions"),
    yesBtn: document.getElementById("yesBtn"),
    noBtn: document.getElementById("noBtn"),
    questionsSection: document.getElementById("questions"),
    questionText: document.getElementById("questionText"),
    questionFeedback: document.getElementById("questionFeedback"),
    progressText: document.getElementById("progressText"),
    progressBar: document.getElementById("progressBar"),
    progressTrack: document.querySelector(".progress-track"),
    qYesBtn: document.getElementById("qYesBtn"),
    qNoBtn: document.getElementById("qNoBtn"),
    galleryImageA: document.getElementById("galleryImageA"),
    galleryImageB: document.getElementById("galleryImageB"),
    galleryPlaceholder: document.getElementById("galleryPlaceholder"),
    galleryCaption: document.getElementById("galleryCaption"),
    thumbs: document.getElementById("thumbs"),
    prevPhoto: document.getElementById("prevPhoto"),
    nextPhoto: document.getElementById("nextPhoto"),
    playPhoto: document.getElementById("playPhoto"),
    finalSection: document.getElementById("final"),
    replayBtn: document.getElementById("replayBtn"),
    messageBtn: document.getElementById("messageBtn"),
    waBtn: document.getElementById("waBtn"),
    musicToggle: document.getElementById("musicToggle"),
    volumeRange: document.getElementById("volumeRange"),
    trailToggle: document.getElementById("trailToggle"),
    densitySelect: document.getElementById("densitySelect"),
    themeToggle: document.getElementById("themeToggle"),
    toastRegion: document.getElementById("toastRegion"),
    modal: document.getElementById("messageModal"),
    modalPanel: document.querySelector(".modal-panel"),
    closeModalBtn: document.getElementById("closeModalBtn"),
    merveFoil: document.getElementById("merveFoil"),
    audio: document.getElementById("romanticAudio"),
    backgroundCanvas: document.getElementById("backgroundCanvas"),
    fxCanvas: document.getElementById("fxCanvas")
  };

  const ui = {
    toast(message) {
      const el = document.createElement("div");
      el.className = "toast";
      el.textContent = message;
      dom.toastRegion.appendChild(el);
      window.setTimeout(() => {
        el.style.opacity = "0";
        el.style.transform = "translateY(8px)";
      }, 2100);
      window.setTimeout(() => el.remove(), 2500);
    },

    smoothScrollTo(id) {
      const el = document.getElementById(id);
      if (!el) return;
      el.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    },

    spawnMiniHearts(originEl) {
      if (reducedMotion) return;
      const rect = originEl.getBoundingClientRect();
      for (let i = 0; i < 5; i += 1) {
        const heart = document.createElement("span");
        heart.className = "pop-heart";
        heart.textContent = Math.random() > 0.5 ? "💖" : "✨";
        heart.style.setProperty("--x", `${rect.left + rect.width * (0.2 + Math.random() * 0.6)}px`);
        heart.style.setProperty("--y", `${rect.top + rect.height * (0.2 + Math.random() * 0.6)}px`);
        document.body.appendChild(heart);
        window.setTimeout(() => heart.remove(), 760);
      }
    },

    setTheme(nextTheme) {
      state.theme = nextTheme;
      document.documentElement.setAttribute("data-theme", nextTheme);
      loveButtonSystem.setLabel(dom.themeToggle, nextTheme === "dark" ? "Light Mode" : "Dark Mode");
    }
  };

  const loveButtonSystem = (() => {
    const reducedMotionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
    const poolMap = new WeakMap();

    function ensureButtonStructure(btn) {
      if (!btn || btn.dataset.loveReady === "1") return;
      const labelText = btn.textContent.trim();
      btn.textContent = "";

      const shine = document.createElement("span");
      shine.className = "btn__shine";

      const hearts = document.createElement("span");
      hearts.className = "btn__hearts";
      hearts.setAttribute("aria-hidden", "true");

      const label = document.createElement("span");
      label.className = "btn__label";
      label.textContent = labelText;

      btn.appendChild(shine);
      btn.appendChild(hearts);
      btn.appendChild(label);
      btn.dataset.loveReady = "1";
    }

    function setLabel(btn, text) {
      if (!btn) return;
      ensureButtonStructure(btn);
      const label = btn.querySelector(".btn__label");
      if (label) label.textContent = text;
    }

    function getPool(btn) {
      let pool = poolMap.get(btn);
      if (pool) return pool;

      const container = btn.querySelector(".btn__hearts");
      pool = {
        items: [],
        cursor: 0,
        container
      };
      if (!container) return pool;

      for (let i = 0; i < 10; i += 1) {
        const item = document.createElement("span");
        item.className = "btn-burst-item";
        item.textContent = Math.random() > 0.5 ? "💖" : "✨";
        container.appendChild(item);
        pool.items.push(item);
      }

      poolMap.set(btn, pool);
      return pool;
    }

    function spawnHeartBurst(btn) {
      if (!btn || reducedMotionMedia.matches) return;
      const pool = getPool(btn);
      if (!pool.container || !pool.items.length) return;

      const count = isMobileDevice ? 6 : 8 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i += 1) {
        const item = pool.items[pool.cursor % pool.items.length];
        pool.cursor += 1;
        item.classList.remove("is-active");
        item.textContent = Math.random() > 0.4 ? "💗" : "✨";
        item.style.setProperty("--sx", `${Math.round((Math.random() - 0.5) * 10)}px`);
        item.style.setProperty("--tx", `${Math.round((Math.random() - 0.5) * 44)}px`);
        item.style.setProperty("--dy", `${Math.round(24 + Math.random() * 42)}px`);
        item.style.left = `${42 + Math.random() * 16}%`;
        item.style.top = `${44 + Math.random() * 18}%`;
        void item.offsetWidth;
        item.classList.add("is-active");
      }
    }

    function pulse(btn) {
      btn.classList.remove("is-pulse");
      void btn.offsetWidth;
      btn.classList.add("is-pulse");
      window.setTimeout(() => btn.classList.remove("is-pulse"), 260);
    }

    function init() {
      document.querySelectorAll("button.btn").forEach((btn) => ensureButtonStructure(btn));

      document.addEventListener("click", (e) => {
        const btn = e.target && e.target.closest ? e.target.closest(".btn") : null;
        if (!btn || btn.disabled) return;
        pulse(btn);
        spawnHeartBurst(btn);
      });
    }

    return {
      init,
      setLabel,
      spawnHeartBurst
    };
  })();

  const helpers = {
    throttle(fn, wait) {
      let last = 0;
      let timeout = null;
      return (...args) => {
        const now = performance.now();
        const remain = wait - (now - last);
        if (remain <= 0) {
          last = now;
          fn(...args);
        } else if (!timeout) {
          timeout = setTimeout(() => {
            last = performance.now();
            timeout = null;
            fn(...args);
          }, remain);
        }
      };
    },

    clamp(v, min, max) {
      return Math.min(max, Math.max(min, v));
    },

    rand(min, max) {
      return min + Math.random() * (max - min);
    },

    distance(a, b) {
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      return Math.sqrt(dx * dx + dy * dy);
    },

    probeImage(src) {
      return new Promise((resolve) => {
        const img = new Image();
        const done = (ok) => {
          img.onload = null;
          img.onerror = null;
          resolve(ok);
        };
        img.onload = () => done(true);
        img.onerror = () => done(false);
        img.src = src;
      });
    },

    probeAudio(src) {
      return new Promise((resolve) => {
        const audio = new Audio();
        let settled = false;
        const clean = (ok) => {
          if (settled) return;
          settled = true;
          audio.removeEventListener("canplaythrough", onReady);
          audio.removeEventListener("error", onErr);
          resolve(ok);
        };
        const onReady = () => clean(true);
        const onErr = () => clean(false);
        audio.preload = "metadata";
        audio.addEventListener("canplaythrough", onReady, { once: true });
        audio.addEventListener("error", onErr, { once: true });
        audio.src = src;
        audio.load();
        window.setTimeout(() => clean(false), 1300);
      });
    }
  };

  const animationLoop = (() => {
    let rafId = 0;
    let last = performance.now();
    const tasks = new Set();

    function tick(now) {
      const dt = Math.min(34, now - last);
      last = now;
      if (!state.paused) {
        tasks.forEach((task) => task(now, dt));
      }
      rafId = requestAnimationFrame(tick);
    }

    return {
      add(task) {
        tasks.add(task);
      },
      remove(task) {
        tasks.delete(task);
      },
      start() {
        cancelAnimationFrame(rafId);
        last = performance.now();
        rafId = requestAnimationFrame(tick);
      }
    };
  })();

  const cinematicIntro = (() => {
    function run() {
      const introMs = reducedMotion ? 200 : 1200;
      window.setTimeout(() => {
        dom.body.classList.add("open-ready");
        dom.body.classList.remove("opening");
      }, introMs);
    }
    return { run };
  })();

  const modalController = (() => {
    let lastFocus = null;

    function getFocusable() {
      return dom.modal.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
    }

    function trapFocus(event) {
      if (event.key !== "Tab") return;
      const focusable = getFocusable();
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    function close() {
      dom.modal.hidden = true;
      document.removeEventListener("keydown", onKeyDown);
      if (lastFocus) lastFocus.focus();
    }

    function open() {
      lastFocus = document.activeElement;
      dom.modal.hidden = false;
      dom.modalPanel.focus();
      document.addEventListener("keydown", onKeyDown);
    }

    function onKeyDown(event) {
      if (event.key === "Escape") close();
      trapFocus(event);
    }

    dom.messageBtn.addEventListener("click", open);
    dom.closeModalBtn.addEventListener("click", close);
    dom.modal.addEventListener("click", (event) => {
      const target = event.target;
      if (target && target instanceof Element && target.hasAttribute("data-close-modal")) close();
    });

    return { open, close };
  })();

  const questionsController = (() => {
    const positiveOnNo = [
      "O zaman yeni bir ani uretelim 💫",
      "Sorun degil, yine de cok tatlisin 🌷",
      "Tamam, ben yine de sana hayranim 💗",
      "Ne cevap olursa olsun kalbim sende ✨"
    ];

    function render() {
      if (state.currentStep >= QUESTIONS.length) {
        dom.questionText.textContent = "Tum sorular bitti. Simdi anilarimiza gecelim 💞";
        dom.questionFeedback.textContent = "Cevaplarin kalbimde sakli.";
        dom.qYesBtn.disabled = true;
        dom.qNoBtn.disabled = true;
        window.setTimeout(() => ui.smoothScrollTo("gallery"), 500);
        return;
      }

      const idx = state.currentStep;
      const progress = ((idx + 1) / QUESTIONS.length) * 100;
      dom.questionText.textContent = QUESTIONS[idx];
      dom.progressText.textContent = `${idx + 1}/${QUESTIONS.length}`;
      dom.progressBar.style.width = `${progress}%`;
      dom.progressTrack.setAttribute("aria-valuenow", String(idx + 1));
      dom.questionFeedback.textContent = "Cevabin ne olursa olsun gulusune hayranim.";
    }

    function answer(value) {
      state.answers.push({ step: state.currentStep, value });
      ui.spawnMiniHearts(dom.questionText);

      if (value === "yes") {
        dom.questionFeedback.textContent = "Kalbim yerinden cikti, mutluluktan 💖";
      } else {
        dom.questionFeedback.textContent = positiveOnNo[state.currentStep % positiveOnNo.length];
      }

      window.setTimeout(() => {
        state.currentStep += 1;
        render();
      }, reducedMotion ? 120 : 360);
    }

    dom.qYesBtn.addEventListener("click", () => answer("yes"));
    dom.qNoBtn.addEventListener("click", () => answer("no"));

    return { render };
  })();

  const heroController = (() => {
    function continueFlow() {
      ui.smoothScrollTo("questions");
      questionsController.render();
    }

    function moveNoButton() {
      if (!FEATURE_FLAGS.runawayNoButton || state.heroNoClicks >= 2 || reducedMotion) return;
      const container = dom.heroActions.getBoundingClientRect();
      const btn = dom.noBtn.getBoundingClientRect();
      const xMin = 10;
      const yMin = 0;
      const xMax = Math.max(xMin, container.width - btn.width - 10);
      const yMax = Math.max(yMin, 46);
      const x = helpers.rand(xMin, xMax);
      const y = helpers.rand(yMin, yMax);
      dom.noBtn.classList.add("btn-runaway");
      dom.noBtn.style.left = `${x}px`;
      dom.noBtn.style.top = `${y}px`;
      dom.noBtn.style.transition = "left 380ms cubic-bezier(0.2, 1, 0.2, 1), top 380ms cubic-bezier(0.2, 1, 0.2, 1)";
    }

    dom.yesBtn.addEventListener("click", () => {
      ui.toast("Iste bunu duymak istedim! 😍");
      dom.heroHint.textContent = "Kalbim ucuyor...";
      continueFlow();
    });

    dom.noBtn.addEventListener("click", () => {
      state.heroNoClicks += 1;
      dom.heroHint.textContent = "Emin misin? 😅";

      if (FEATURE_FLAGS.runawayNoButton && state.heroNoClicks <= 2) {
        moveNoButton();
        return;
      }

      ui.toast("Tamam... yine de seni cok seviyorum 💗");
      continueFlow();
    });
  })();

  const galleryController = (() => {
    let photos = [];

    let activeLayer = "A";

    function currentImg() {
      return activeLayer === "A" ? dom.galleryImageA : dom.galleryImageB;
    }

    function nextImg() {
      return activeLayer === "A" ? dom.galleryImageB : dom.galleryImageA;
    }

    function preload(indexes) {
      if (!photos.length) return;
      indexes.forEach((i) => {
        const idx = (i + photos.length) % photos.length;
        const src = photos[idx].src;
        if (state.galleryLoaded[src] !== undefined) return;
        const img = new Image();
        img.onload = () => {
          state.galleryLoaded[src] = true;
        };
        img.onerror = () => {
          state.galleryLoaded[src] = false;
        };
        img.src = src;
      });
    }

    function ensureThumbs() {
      dom.thumbs.innerHTML = "";
      photos.forEach((_, idx) => {
        const b = document.createElement("button");
        b.className = "thumb btn btn--ghost btn--sm";
        b.textContent = String(idx + 1);
        b.setAttribute("aria-label", `${idx + 1}. fotograf`);
        b.addEventListener("click", () => show(idx));
        dom.thumbs.appendChild(b);
        loveButtonSystem.setLabel(b, String(idx + 1));
      });
    }

    function markActiveThumb() {
      const thumbs = dom.thumbs.querySelectorAll(".thumb");
      thumbs.forEach((thumb, idx) => {
        thumb.classList.toggle("is-active", idx === state.galleryIndex);
      });
    }

    function show(index) {
      if (!photos.length) {
        dom.galleryPlaceholder.hidden = false;
        dom.galleryCaption.textContent = "Fotograflar yuklenince burada gorunecek";
        return;
      }
      const idx = (index + photos.length) % photos.length;
      const item = photos[idx];
      state.galleryIndex = idx;

      const loaded = state.galleryLoaded[item.src];
      if (loaded === false) {
        let fallback = -1;
        for (let i = 0; i < photos.length; i += 1) {
          const probeIdx = (idx + i + 1) % photos.length;
          if (state.galleryLoaded[photos[probeIdx].src] === true) {
            fallback = probeIdx;
            break;
          }
        }
        if (fallback >= 0) {
          show(fallback);
          return;
        }
        dom.galleryPlaceholder.hidden = false;
        dom.galleryCaption.textContent = "Fotograflar yuklenince burada gorunecek";
        markActiveThumb();
        preload([idx + 1, idx - 1]);
        return;
      }

      const incoming = nextImg();
      const outgoing = currentImg();
      incoming.src = item.src;
      incoming.alt = `Ani fotografi ${idx + 1}`;
      incoming.classList.add("is-active");
      outgoing.classList.remove("is-active");
      activeLayer = activeLayer === "A" ? "B" : "A";
      dom.galleryPlaceholder.hidden = true;
      dom.galleryCaption.textContent = item.caption;
      markActiveThumb();

      preload([idx + 1, idx - 1, idx + 2]);
    }

    function next() {
      show(state.galleryIndex + 1);
    }

    function prev() {
      show(state.galleryIndex - 1);
    }

    function togglePlay() {
      if (!photos.length) return;
      state.galleryPlaying = !state.galleryPlaying;
      loveButtonSystem.setLabel(dom.playPhoto, state.galleryPlaying ? "Duraklat" : "Oynat");
    }

    function tick(_now, dt) {
      if (!state.galleryPlaying) return;
      if (!photos.length) return;
      state.galleryTimer += dt;
      if (state.galleryTimer > 4200) {
        state.galleryTimer = 0;
        next();
      }
    }

    async function resolvePhotos() {
      const found = [];
      for (let i = 0; i < PHOTO_CANDIDATES.length; i += 1) {
        const src = PHOTO_CANDIDATES[i];
        const ok = await helpers.probeImage(src);
        state.galleryLoaded[src] = ok;
        if (ok) found.push(src);
      }
      photos = found.slice(0, 10).map((src, i) => ({
        src,
        caption: GALLERY_CAPTIONS[i] || "Birlikte guzel bir an"
      }));
      ensureThumbs();
      if (!photos.length) {
        dom.galleryPlaceholder.hidden = false;
        dom.galleryCaption.textContent = "Fotograflar yuklenince burada gorunecek";
        dom.playPhoto.disabled = true;
        dom.nextPhoto.disabled = true;
        dom.prevPhoto.disabled = true;
        return;
      }
      dom.playPhoto.disabled = false;
      dom.nextPhoto.disabled = false;
      dom.prevPhoto.disabled = false;
      dom.galleryPlaceholder.hidden = true;
      show(0);
    }

    dom.nextPhoto.addEventListener("click", next);
    dom.prevPhoto.addEventListener("click", prev);
    dom.playPhoto.addEventListener("click", togglePlay);

    resolvePhotos();
    animationLoop.add(tick);

    return { show, next, prev, togglePlay };
  })();

  const audioController = (() => {
    dom.audio.volume = Number(dom.volumeRange.value);

    function setDisabled(disabled) {
      dom.musicToggle.disabled = disabled;
      dom.volumeRange.disabled = disabled;
    }

    async function resolveAudioSource() {
      for (let i = 0; i < MUSIC_CANDIDATES.length; i += 1) {
        const src = MUSIC_CANDIDATES[i];
        const ok = await helpers.probeAudio(src);
        if (ok) {
          dom.audio.src = src;
          state.audioReady = true;
          setDisabled(false);
          return;
        }
      }
      state.audioReady = false;
      setDisabled(true);
    }

    function play() {
      if (!state.audioReady) {
        ui.toast("Muzik dosyasi bulunamadi");
        return;
      }
      const p = dom.audio.play();
      if (p && typeof p.then === "function") {
        p.then(() => {
          state.audioPlaying = true;
          state.audioUnlocked = true;
          loveButtonSystem.setLabel(dom.musicToggle, "❚❚ Muzik");
        }).catch(() => {
          state.audioReady = false;
          setDisabled(true);
          ui.toast("Muzik dosyasi bulunamadi");
        });
      }
    }

    function pause() {
      dom.audio.pause();
      state.audioPlaying = false;
      loveButtonSystem.setLabel(dom.musicToggle, "▶ Muzik");
    }

    function toggle() {
      if (state.audioPlaying) pause();
      else play();
    }

    dom.musicToggle.addEventListener("click", toggle);
    dom.volumeRange.addEventListener("input", () => {
      dom.audio.volume = Number(dom.volumeRange.value);
    });

    dom.audio.addEventListener("error", () => {
      state.audioReady = false;
      setDisabled(true);
      ui.toast("Muzik dosyasi bulunamadi");
    });

    resolveAudioSource().then(() => {
      if (!state.audioReady) ui.toast("Muzik dosyasi bulunamadi");
    });

    return { play, pause, toggle };
  })();

  const backgroundParticles = (() => {
    const canvas = dom.backgroundCanvas;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return { resize() {}, update() {}, setMode() {} };

    const particles = [];
    let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    let width = 1;
    let height = 1;
    let areaScale = 1;
    let mode = "snow";
    let modeElapsed = 0;
    let heartTargets = [];

    function densityFactor() {
      const base = state.settings.density === "low" ? 0.7 : 1;
      return state.settings.reducedMotion ? base * 0.3 : base;
    }

    function makeParticle(layer) {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: helpers.rand(-0.12, 0.12) * (layer + 1),
        vy: helpers.rand(0.2, 0.8) * (layer + 1),
        size: helpers.rand(1.2, 3.2 + layer),
        layer,
        alpha: helpers.rand(0.08, 0.25),
        phase: Math.random() * Math.PI * 2,
        sparkle: Math.random() > 0.96,
        target: { x: width * 0.5, y: height * 0.5 },
        drift: helpers.rand(-0.4, 0.4)
      };
    }

    function rebuildPool() {
      const baseCount = Math.floor((width * height) / 14000);
      const target = Math.max(24, Math.floor(baseCount * densityFactor()));
      while (particles.length < target) {
        const layer = particles.length % 3;
        particles.push(makeParticle(layer));
      }
      while (particles.length > target) particles.pop();
    }

    function buildHeartTargets() {
      const count = particles.length;
      heartTargets = [];
      const cx = width * 0.5;
      const cy = height * 0.46;
      const scale = Math.min(width, height) * 0.022;
      for (let i = 0; i < count; i += 1) {
        const t = (i / count) * Math.PI * 2;
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        heartTargets.push({ x: cx + x * scale, y: cy - y * scale });
      }
      particles.forEach((p, i) => {
        p.target = heartTargets[i] || { x: cx, y: cy };
      });
    }

    function resize() {
      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      areaScale = Math.max(0.8, Math.min(1.3, (width * height) / (1280 * 720)));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      rebuildPool();
      buildHeartTargets();
    }

    function setMode(next) {
      mode = next;
      modeElapsed = 0;
      if (next === "heart") buildHeartTargets();
    }

    function update(_now, dt) {
      if (state.paused) return;
      modeElapsed += dt;
      ctx.clearRect(0, 0, width, height);
      const parallax = state.scrollY * 0.02;

      particles.forEach((p, index) => {
        const sway = Math.sin((p.phase += 0.008 + p.layer * 0.003) + index * 0.01) * 0.32;

        if (mode === "snow") {
          p.x += (p.vx + sway * 0.1) * areaScale;
          p.y += (p.vy + (p.layer * 0.12 + 0.08)) * areaScale;
          if (p.y > height + 20) {
            p.y = -20;
            p.x = Math.random() * width;
          }
          if (p.x < -20) p.x = width + 10;
          if (p.x > width + 20) p.x = -10;
        } else if (mode === "gather") {
          p.x += (width * 0.5 - p.x) * 0.035;
          p.y += (height * 0.46 - p.y) * 0.035;
        } else if (mode === "heart") {
          const target = p.target;
          p.x += (target.x - p.x) * 0.04;
          p.y += (target.y - p.y) * 0.04;
        } else if (mode === "disperse") {
          p.vx += helpers.rand(-0.02, 0.02);
          p.vy += helpers.rand(-0.01, 0.04);
          p.x += p.vx * 1.6;
          p.y += p.vy * 1.6;
          if (modeElapsed > 1200) {
            p.vx = helpers.rand(-0.14, 0.14);
            p.vy = helpers.rand(0.2, 0.9);
          }
        }

        const alpha = p.alpha * (p.sparkle ? 1 + Math.sin((modeElapsed + index * 20) * 0.01) * 0.2 : 1);
        const drawY = p.y + parallax * (0.2 + p.layer * 0.12);

        ctx.beginPath();
        const size = p.size;
        if (p.layer === 0) {
          const x = p.x;
          const y = drawY;
          ctx.moveTo(x, y);
          ctx.bezierCurveTo(x - size, y - size, x - size * 1.8, y + size * 0.8, x, y + size * 1.8);
          ctx.bezierCurveTo(x + size * 1.8, y + size * 0.8, x + size, y - size, x, y);
        } else {
          ctx.arc(p.x, drawY, size, 0, Math.PI * 2);
        }

        const hue = p.sparkle ? "255,240,198" : p.layer === 2 ? "255,224,238" : "255,191,219";
        ctx.fillStyle = `rgba(${hue},${helpers.clamp(alpha, 0.06, 0.4)})`;
        ctx.fill();
      });

      if (mode === "gather" && modeElapsed > 1500) {
        setMode("heart");
      } else if (mode === "heart" && modeElapsed > 3000) {
        setMode("disperse");
      } else if (mode === "disperse" && modeElapsed > 2600) {
        setMode("snow");
      }
    }

    resize();
    return { resize, update, setMode };
  })();

  const fxParticles = (() => {
    const canvas = dom.fxCanvas;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return { resize() {}, update() {}, emitAt() {}, addLetterParticle() {}, setEnabled() {} };
    let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    let width = 1;
    let height = 1;
    let groundY = 1;
    let lastWindAt = 0;
    let nextWindDelay = helpers.rand(8000, 12000);
    const airborne = [];
    const settled = [];
    let anchors = [];

    function resize() {
      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      width = window.innerWidth;
      height = window.innerHeight;
      groundY = height * 0.85;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      anchors = buildMerveAnchors();
    }

    function buildMerveAnchors() {
      if (state.settings.reducedMotion) return [];
      const patterns = {
        M: ["10001", "11011", "10101", "10001", "10001"],
        E: ["11111", "10000", "11110", "10000", "11111"],
        R: ["11110", "10001", "11110", "10100", "10010"],
        V: ["10001", "10001", "01010", "01010", "00100"]
      };
      const word = ["M", "E", "R", "V", "E"];
      const cell = Math.max(6, Math.min(14, width / 120));
      const gap = cell * 1.6;
      const charW = cell * 5;
      const total = word.length * charW + (word.length - 1) * gap;
      const startX = width * 0.5 - total * 0.5;
      const startY = groundY + cell * 0.2;
      const points = [];

      let ox = startX;
      word.forEach((ch) => {
        const p = patterns[ch] || patterns.E;
        p.forEach((row, y) => {
          [...row].forEach((bit, x) => {
            if (bit === "1") {
              points.push({
                x: ox + x * cell,
                y: startY + y * cell,
                occupied: false,
                by: null
              });
            }
          });
        });
        ox += charW + gap;
      });

      return points;
    }

    function nearestFreeAnchor(p) {
      let best = null;
      let bestD = Infinity;
      for (let i = 0; i < anchors.length; i += 1) {
        const a = anchors[i];
        if (a.occupied) continue;
        const dx = p.x - a.x;
        const dy = p.y - a.y;
        const d = dx * dx + dy * dy;
        if (d < bestD) {
          bestD = d;
          best = a;
        }
      }
      return best;
    }

    function addLetterParticle(ch, x, y) {
      if (!state.settings.trailEnabled) return;
      const p = {
        x,
        y,
        vx: helpers.rand(-0.8, 0.8),
        vy: helpers.rand(0.6, 1.6),
        gravity: helpers.rand(0.08, 0.14),
        friction: 0.985,
        life: state.settings.reducedMotion ? helpers.rand(900, 1400) : helpers.rand(1500, 2600),
        age: 0,
        size: state.settings.reducedMotion ? helpers.rand(9, 12) : helpers.rand(10, 16),
        char: ch,
        rot: helpers.rand(-0.436, 0.436),
        settled: false,
        bounceDone: false,
        fadeAt: 0,
        anchor: null,
        jitterSeed: Math.random() * Math.PI * 2,
        glow: 0
      };
      airborne.push(p);
      const movingLimit = state.settings.reducedMotion ? 120 : 500;
      if (airborne.length > movingLimit) airborne.splice(0, airborne.length - movingLimit);
    }

    function emitAt(x, y) {
      const ch = NAME_SEQ[letterIndex];
      letterIndex = (letterIndex + 1) % NAME_SEQ.length;
      addLetterParticle(ch, x, y);
    }

    function applyWind(now) {
      if (state.settings.reducedMotion) return;
      if (now - lastWindAt < nextWindDelay) return;
      lastWindAt = now;
      nextWindDelay = helpers.rand(8000, 12000);

      const count = Math.floor(settled.length * 0.3);
      for (let i = 0; i < count; i += 1) {
        const idx = Math.floor(Math.random() * settled.length);
        const p = settled[idx];
        if (!p) continue;
        if (p.anchor) {
          p.anchor.occupied = false;
          p.anchor.by = null;
        }
        p.anchor = null;
        p.fadeAt = now + helpers.rand(420, 900);
        p.vx = helpers.rand(-0.9, 0.9);
        p.vy = helpers.rand(-1.4, -0.5);
      }
    }

    function update(now, dt) {
      ctx.clearRect(0, 0, width, height);
      applyWind(now);

      for (let i = airborne.length - 1; i >= 0; i -= 1) {
        const p = airborne[i];
        p.age += dt;
        p.vy += p.gravity * (dt / 16);
        p.vx *= p.friction;
        p.vy *= p.friction;
        p.x += p.vx * (dt / 16);
        p.y += p.vy * (dt / 16);

        if (p.y >= groundY && !p.settled) {
          if (!p.bounceDone) {
            p.y = groundY;
            p.vy = -Math.abs(p.vy) * 0.2;
            p.bounceDone = true;
          } else {
            p.settled = true;
            p.fadeAt = now + helpers.rand(3000, 5000);
            p.vx = 0;
            p.vy = 0;
            const anchor = nearestFreeAnchor(p);
            if (anchor) {
              anchor.occupied = true;
              anchor.by = p;
              p.anchor = anchor;
            }
            settled.push(p);
            airborne.splice(i, 1);
          }
        }

        if (p.age >= p.life) {
          airborne.splice(i, 1);
        }
      }

      const settledLimit = state.settings.reducedMotion ? 60 : 220;
      if (settled.length > settledLimit) {
        const removeCount = settled.length - settledLimit;
        for (let i = 0; i < removeCount; i += 1) {
          const old = settled.shift();
          if (old && old.anchor) {
            old.anchor.occupied = false;
            old.anchor.by = null;
          }
        }
      }

      for (let i = settled.length - 1; i >= 0; i -= 1) {
        const p = settled[i];

        if (p.anchor) {
          const jitter = Math.sin(now * 0.002 + p.jitterSeed) * 0.4;
          p.x += (p.anchor.x + jitter - p.x) * 0.08;
          p.y += (p.anchor.y - p.y) * 0.08;
        }

        const near = helpers.distance({ x: p.x, y: p.y }, state.pointers);
        p.glow = near < 80 ? 1 - near / 80 : 0;

        if (p.fadeAt && now > p.fadeAt) {
          if (p.anchor) {
            p.anchor.occupied = false;
            p.anchor.by = null;
          }
          settled.splice(i, 1);
        }
      }

      const drawParticle = (p) => {
        const lifeRatio = 1 - p.age / p.life;
        const movingAlpha = lifeRatio > 0.3 ? 0.94 : (lifeRatio / 0.3) * 0.94;
        const alpha = p.settled ? 0.34 + p.glow * 0.28 : helpers.clamp(movingAlpha, 0, 0.9);
        const scale = p.settled ? 1 + p.glow * 0.08 : 1;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(scale, scale);
        ctx.font = `600 ${p.size + 1}px system-ui, -apple-system, Segoe UI, sans-serif`;
        ctx.fillStyle = `rgba(255,251,252,${alpha})`;
        ctx.strokeStyle = `rgba(255,196,226,${alpha * 0.52})`;
        ctx.lineWidth = 0.8;
        ctx.shadowBlur = 9;
        ctx.shadowColor = "rgba(255,166,216,0.52)";
        if (p.glow > 0) {
          ctx.shadowBlur = 12;
          ctx.shadowColor = "rgba(255,239,188,0.9)";
        }
        ctx.strokeText(p.char, 0, 0);
        ctx.fillText(p.char, 0, 0);
        ctx.restore();
      };

      airborne.forEach(drawParticle);
      settled.forEach(drawParticle);
    }

    resize();
    return {
      resize,
      update,
      emitAt,
      addLetterParticle,
      setEnabled(v) {
        state.settings.trailEnabled = v;
      }
    };
  })();

  const finalController = (() => {
    function triggerHeartFormation() {
      if (state.final.heartTriggered) return;
      state.final.heartTriggered = true;
      backgroundParticles.setMode("gather");
      ui.toast("Kalpler bir araya geliyor... ✨");
    }

    dom.replayBtn.addEventListener("click", () => {
      state.currentStep = 0;
      state.answers = [];
      dom.qYesBtn.disabled = false;
      dom.qNoBtn.disabled = false;
      questionsController.render();
      state.final.heartTriggered = false;
      backgroundParticles.setMode("snow");
      ui.smoothScrollTo("hero");
    });

    return { triggerHeartFormation };
  })();

  const foilController = (() => {
    let targetX = window.innerWidth * 0.5;
    let targetY = window.innerHeight * 0.5;
    let smoothX = targetX;
    let smoothY = targetY;

    function onMove(x, y) {
      targetX = x;
      targetY = y;
    }

    function update() {
      smoothX += (targetX - smoothX) * 0.12;
      smoothY += (targetY - smoothY) * 0.12;
      const x = `${((smoothX / window.innerWidth) * 100).toFixed(2)}%`;
      const y = `${((smoothY / window.innerHeight) * 100).toFixed(2)}%`;
      document.documentElement.style.setProperty("--foil-x", x);
      document.documentElement.style.setProperty("--foil-y", y);
    }

    return { onMove, update };
  })();

  const tiltController = (() => {
    const el = dom.merveFoil;
    if (!el) return { onPointer() {}, update() {} };

    const maxX = reducedMotion ? 0 : 8;
    const maxY = reducedMotion ? 0 : 10;
    let targetRX = 0;
    let targetRY = 0;
    let currentRX = 0;
    let currentRY = 0;

    function onPointer(x, y) {
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const nx = ((x - (rect.left + rect.width / 2)) / (rect.width / 2));
      const ny = ((y - (rect.top + rect.height / 2)) / (rect.height / 2));
      const clampedX = helpers.clamp(nx, -1, 1);
      const clampedY = helpers.clamp(ny, -1, 1);
      if (Math.abs(clampedX) < 0.08 && Math.abs(clampedY) < 0.08) {
        targetRX = 0;
        targetRY = 0;
        return;
      }
      targetRX = -clampedY * maxX;
      targetRY = clampedX * maxY;
    }

    function reset() {
      targetRX = 0;
      targetRY = 0;
    }

    function update() {
      currentRX += (targetRX - currentRX) * 0.12;
      currentRY += (targetRY - currentRY) * 0.12;
      el.style.transform = `rotateX(${currentRX.toFixed(2)}deg) rotateY(${currentRY.toFixed(2)}deg) translateZ(0)`;
    }

    el.addEventListener("mouseleave", reset);
    return { onPointer, update };
  })();

  const whatsappController = (() => {
    const hasTouch = "maxTouchPoints" in navigator && navigator.maxTouchPoints > 0;
    const uaMobile = /Android|iPhone|iPad|iPod|Mobile|IEMobile|Opera Mini/i.test(navigator.userAgent || "");
    const mobileByUAData = !!(navigator.userAgentData && navigator.userAgentData.mobile);
    const isMobile = mobileByUAData || uaMobile || hasTouch;

    if (isMobile) dom.body.classList.add("is-mobile");

    function sanitizePhone(phone) {
      return String(phone || "").replace(/\D/g, "");
    }

    function buildWaMeUrl(phone, text) {
      const encoded = encodeURIComponent(text);
      if (!phone) return `https://api.whatsapp.com/send?text=${encoded}`;
      return `https://wa.me/${phone}?text=${encoded}`;
    }

    function buildWebWhatsAppUrl(phone, text) {
      const encoded = encodeURIComponent(text);
      if (!phone) return `https://web.whatsapp.com/send?text=${encoded}`;
      return `https://web.whatsapp.com/send?phone=${phone}&text=${encoded}`;
    }

    function buildDeepLinkUrl(phone, text) {
      const encoded = encodeURIComponent(text);
      if (!phone) return `whatsapp://send?text=${encoded}`;
      return `whatsapp://send?phone=${phone}&text=${encoded}`;
    }

    function openWithPopupFallback(url, fallbackMessage) {
      const win = window.open(url, "_blank", "noopener,noreferrer");
      if (win) return win;
      ui.toast("Pop-up engellendi. Lütfen yeni sekmelere izin ver.");
      if (fallbackMessage) ui.toast(fallbackMessage);
      window.location.href = url;
      return null;
    }

    function openLoveMessage() {
      const msg = LOVE_MESSAGES[state.waIndex % LOVE_MESSAGES.length];
      state.waIndex = (state.waIndex + 1) % LOVE_MESSAGES.length;

      let phone = sanitizePhone(WHATSAPP_PHONE_E164);
      let waMeUrl = "";
      let webUrl = "";
      let deepUrl = "";

      try {
        waMeUrl = buildWaMeUrl(phone, msg);
        webUrl = buildWebWhatsAppUrl(phone, msg);
        deepUrl = buildDeepLinkUrl(phone, msg);
      } catch (_err) {
        ui.toast("Mesaj hazırlanırken bir hata oluştu.");
        return;
      }

      dom.waBtn.classList.add("is-tap");
      window.setTimeout(() => dom.waBtn.classList.remove("is-tap"), 220);

      if (!phone) {
        ui.toast("Numara ayarlı değil, paylaşım ekranı açılıyor…");
        openWithPopupFallback(buildWaMeUrl("", msg));
        return;
      }

      ui.toast("WhatsApp açılıyor…");

      if (isMobile && WHATSAPP_FEATURES.useDeepLinkOnMobile) {
        const deepWindow = openWithPopupFallback(deepUrl);
        window.setTimeout(() => {
          if (deepWindow && !deepWindow.closed) {
            try {
              deepWindow.location.href = waMeUrl;
            } catch (_err) {
              window.location.href = waMeUrl;
            }
            return;
          }
          const fallbackWindow = window.open(waMeUrl, "_blank", "noopener,noreferrer");
          if (!fallbackWindow) window.location.href = waMeUrl;
        }, WHATSAPP_FEATURES.deepLinkFallbackDelayMs);
        return;
      }

      const opened = openWithPopupFallback(waMeUrl);
      if (!opened) {
        try {
          window.location.href = webUrl;
        } catch (_err) {
          ui.toast("WhatsApp bağlantısı açılamadı.");
        }
      }
    }

    dom.waBtn.addEventListener("click", openLoveMessage);

    return {
      openLoveMessage,
      buildWaMeUrl,
      buildWebWhatsAppUrl,
      buildDeepLinkUrl
    };
  })();

  const revealController = (() => {
    const items = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            if (entry.target.id === "final") finalController.triggerHeartFormation();
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: reducedMotion ? 0.01 : 0.2 }
    );
    items.forEach((item) => io.observe(item));
  })();

  const controls = (() => {
    dom.trailToggle.addEventListener("click", () => {
      state.settings.trailEnabled = !state.settings.trailEnabled;
      fxParticles.setEnabled(state.settings.trailEnabled);
      loveButtonSystem.setLabel(dom.trailToggle, `Iz Efekti: ${state.settings.trailEnabled ? "Acik" : "Kapali"}`);
      ui.toast(state.settings.trailEnabled ? "Iz efekti acildi" : "Iz efekti kapandi");
    });

    dom.densitySelect.addEventListener("change", () => {
      state.settings.density = dom.densitySelect.value;
      backgroundParticles.resize();
    });

    dom.themeToggle.addEventListener("click", () => {
      const next = state.theme === "dark" ? "light" : "dark";
      ui.setTheme(next);
    });
  })();

  const pointerEmitter = (() => {
    const spawnInterval = reducedMotion ? 90 : (isMobileDevice ? 35 : 24);
    const onMove = helpers.throttle((event) => {
      const x = event.clientX ?? (event.touches && event.touches[0]?.clientX);
      const y = event.clientY ?? (event.touches && event.touches[0]?.clientY);
      if (typeof x !== "number" || typeof y !== "number") return;
      state.pointers.x = x;
      state.pointers.y = y;
      state.pointers.active = true;
      foilController.onMove(x, y);
      tiltController.onPointer(x, y);
      if (!state.settings.trailEnabled) return;
      const emitCount = reducedMotion ? 1 : 2;
      for (let i = 0; i < emitCount; i += 1) {
        const ch = NAME_SEQ[letterIndex];
        letterIndex = (letterIndex + 1) % NAME_SEQ.length;
        fxParticles.addLetterParticle(ch, x, y);
      }
    }, spawnInterval);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
  })();

  function addButtonRippleCoords() {
    document.querySelectorAll(".btn").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const rect = btn.getBoundingClientRect();
        const rx = ((e.clientX - rect.left) / rect.width) * 100;
        const ry = ((e.clientY - rect.top) / rect.height) * 100;
        btn.style.setProperty("--rx", `${rx}%`);
        btn.style.setProperty("--ry", `${ry}%`);
      });
    });
  }

  function onResize() {
    backgroundParticles.resize();
    fxParticles.resize();
  }

  const throttledResize = helpers.throttle(onResize, 180);
  window.addEventListener("resize", throttledResize);
  window.addEventListener("scroll", () => {
    state.scrollY = window.scrollY || 0;
  }, { passive: true });

  document.addEventListener("visibilitychange", () => {
    state.paused = document.hidden;
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !dom.modal.hidden) {
      modalController.close();
    }
  });

  if (!(dom.backgroundCanvas.getContext && dom.fxCanvas.getContext)) {
    document.body.classList.add("no-canvas");
    ui.toast("Cihaz canvas desteklemiyor, basit moda gecildi.");
  }

  dom.merveFoil.addEventListener("focus", () => {
    ui.toast("Merve ismi kalbimde altin gibi parliyor ✨");
  });

  animationLoop.add((now, dt) => {
    backgroundParticles.update(now, dt);
    fxParticles.update(now, dt);
    foilController.update(now, dt);
    tiltController.update(now, dt);
  });

  loveButtonSystem.init();
  addButtonRippleCoords();
  questionsController.render();
  cinematicIntro.run();
  animationLoop.start();
})();
