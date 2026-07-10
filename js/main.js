const typedText = document.getElementById("typed-text");

// Navbar blur on scroll + mobile menu toggle
const navbar = document.querySelector(".navbar");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".nav-links a");

function toggleNavbarBlur() {
  if (!navbar) return;
  navbar.classList.toggle("scrolled", window.scrollY > 10);
}
toggleNavbarBlur();
window.addEventListener("scroll", toggleNavbarBlur, { passive: true });

function setMenuState(isOpen) {
  if (!navbar) return;
  navbar.classList.toggle("open", isOpen);
  if (menuToggle) menuToggle.setAttribute("aria-expanded", String(isOpen));
}

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    const isOpen = !navbar.classList.contains("open");
    setMenuState(isOpen);
  });
}

navLinks.forEach(link => {
  link.addEventListener("click", () => setMenuState(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenuState(false);
});
const phrases = [
  "Ingeniero de software",
  "Especialista en automatización",
  "Java · Spring Boot · React",
  "APIs robustas y CI/CD"
];

let phraseIndex = 0;
let charIndex = 0;
let deleting = false;

function typeLoop() {
  if (!typedText) return;
  const current = phrases[phraseIndex];
  const speed = deleting ? 50 : 90;

  typedText.textContent = current.slice(0, charIndex);

  if (!deleting && charIndex === current.length) {
    deleting = true;
    setTimeout(typeLoop, 1200);
    return;
  }

  if (deleting && charIndex === 0) {
    deleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
  }

  charIndex += deleting ? -1 : 1;
  setTimeout(typeLoop, speed);
}

typeLoop();

/* Contact chips: highlight on load + copy to clipboard */
const contactChips = document.querySelectorAll(".contact-chip");

function copyValue(chip) {
  const value = (chip?.dataset.copy || chip?.textContent || "").trim();
  if (!value) return;

  const showCopied = () => {
    chip.classList.add("copied");
    chip.setAttribute("aria-label", `${value} copiado`);
    setTimeout(() => chip.classList.remove("copied"), 1600);
  };

  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(value).then(showCopied).catch(() => fallbackCopy(value, showCopied));
  } else {
    fallbackCopy(value, showCopied);
  }
}

function fallbackCopy(text, onDone) {
  const area = document.createElement("textarea");
  area.value = text;
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.focus();
  area.select();
  try { document.execCommand("copy"); } catch (e) { /* noop */ }
  document.body.removeChild(area);
  if (typeof onDone === "function") onDone();
}

if (contactChips.length) {
  contactChips.forEach(chip => {
    const value = (chip.dataset.copy || chip.textContent || "").trim();
    chip.dataset.copy = value;
    chip.setAttribute("role", "button");
    chip.setAttribute("tabindex", "0");

    chip.addEventListener("click", (e) => {
      e.preventDefault();
      copyValue(chip);
    });

    chip.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        copyValue(chip);
      }
    });
  });

  // Resaltar al cargar
  contactChips.forEach(chip => chip.classList.add("callout"));
  setTimeout(() => contactChips.forEach(chip => chip.classList.remove("callout")), 4200);
}

/* Reveal on scroll */
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

document.querySelectorAll(".card, .hero-content, .hero-visual, .section-header, .stat").forEach(el => {
  el.classList.add("reveal");
  observer.observe(el);
});

/* Parallax orbs */
const orbs = document.querySelectorAll(".orb");
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (orbs.length && !prefersReduced) {
  let orbRaf = null;
  let orbX = 0;
  let orbY = 0;
  window.addEventListener("pointermove", (e) => {
    orbX = e.clientX;
    orbY = e.clientY;
    if (orbRaf) return;
    orbRaf = requestAnimationFrame(() => {
      orbRaf = null;
      const x = (orbX / window.innerWidth - 0.5) * 12;
      const y = (orbY / window.innerHeight - 0.5) * 12;
      orbs.forEach((orb, i) => {
        const intensity = (i + 1) * 4;
        orb.style.transform = `translate(${x / intensity}px, ${y / intensity}px)`;
      });
    });
  }, { passive: true });
}

/* Interactive background initialization based on preference */
function initVectorFieldBackground() {
  const canvas = document.getElementById("vector-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let particles = [];
  let w, h, dpr;
  const mouse = { x: null, y: null };
  const maxDist = 140;
  const maxDistSq = maxDist * maxDist;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Buckets de alpha: agrupa las líneas por opacidad para dibujarlas en
  // pocos trazos en lugar de un stroke por línea
  const ALPHA_BUCKETS = 10;
  const lineBuckets = new Array(ALPHA_BUCKETS);

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    spawnParticles();
    if (reducedMotion) drawFrame();
  }

  function spawnParticles() {
    const count = Math.min(90, Math.floor((w * h) / 15000));
    particles = new Array(count).fill(0).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.7,
      vy: (Math.random() - 0.5) * 0.7
    }));
  }

  function drawFrame() {
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 1;

    for (let i = 0; i < ALPHA_BUCKETS; i++) lineBuckets[i] = null;

    particles.forEach((p, i) => {
      // Move
      p.x += p.vx;
      p.y += p.vy;

      // Bounce
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      // Mouse repulsion
      if (mouse.x !== null) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 120 && dist > 0) {
          const force = (120 - dist) / 120;
          p.vx += (dx / dist) * force * 0.08;
          p.vy += (dy / dist) * force * 0.08;
        }
      }

      // Connection lines (distancia al cuadrado: evita sqrt fuera de rango)
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < maxDistSq) {
          const alpha = 1 - Math.sqrt(distSq) / maxDist;
          let bucket = Math.floor(alpha * ALPHA_BUCKETS);
          if (bucket >= ALPHA_BUCKETS) bucket = ALPHA_BUCKETS - 1;
          if (!lineBuckets[bucket]) lineBuckets[bucket] = [];
          lineBuckets[bucket].push(p.x, p.y, p2.x, p2.y);
        }
      }
    });

    // Un solo stroke por nivel de opacidad
    for (let b = 0; b < ALPHA_BUCKETS; b++) {
      const lines = lineBuckets[b];
      if (!lines) continue;
      const alpha = (b + 0.5) / ALPHA_BUCKETS;
      ctx.strokeStyle = `rgba(93,214,255,${0.35 * alpha})`;
      ctx.beginPath();
      for (let k = 0; k < lines.length; k += 4) {
        ctx.moveTo(lines[k], lines[k + 1]);
        ctx.lineTo(lines[k + 2], lines[k + 3]);
      }
      ctx.stroke();
    }

    // Partículas en un solo path/fill
    ctx.fillStyle = "rgba(46,211,162,0.85)";
    ctx.beginPath();
    particles.forEach(p => {
      ctx.moveTo(p.x + 2.1, p.y);
      ctx.arc(p.x, p.y, 2.1, 0, Math.PI * 2);
    });
    ctx.fill();
  }

  function step() {
    // Only continue animation if vector background is still active
    if (!document.body.classList.contains("bg-vector-active")) return;
    drawFrame();
    requestAnimationFrame(step);
  }

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  }, { passive: true });

  window.addEventListener("pointermove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }, { passive: true });
  window.addEventListener("pointerleave", () => {
    mouse.x = mouse.y = null;
  });

  resize();
  if (reducedMotion) {
    drawFrame(); // un solo frame estático
  } else {
    step();
  }
}

function initStitchBackground() {
  const canvas = document.getElementById("stitch-canvas");
  const blob = document.querySelector(".stitch-aurora-blob");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let w, h, dpr;
  const gridSpacing = 40; // spacing between dots in pixels
  const influenceRadius = 180;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const currentCursor = { x: 0, y: 0 };
  const targetCursor = { x: 0, y: 0 };
  let isIdle = true;
  let lastMoveTime = Date.now();

  const auroraPos = { x: 0, y: 0 };
  let cols = 0;
  let rows = 0;
  let blockedSet = new Set(); // índices de puntos tapados por tarjetas
  let blobHalfW = 0;
  let blobHalfH = 0;

  // Capa base cacheada: todos los puntos estáticos se dibujan una sola vez
  // aquí y cada frame solo se compone con drawImage. Se reconstruye en
  // resize/scroll, no en cada frame.
  const baseLayer = document.createElement("canvas");
  const baseCtx = baseLayer.getContext("2d");

  function rebuildBaseLayer() {
    baseLayer.width = canvas.width;
    baseLayer.height = canvas.height;
    baseCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Puntos normales: un solo path/fill
    baseCtx.fillStyle = "rgba(255, 255, 255, 0.22)";
    baseCtx.beginPath();
    for (let c = 0; c <= cols; c++) {
      for (let r = 0; r <= rows; r++) {
        if (blockedSet.has(c * 10000 + r)) continue;
        const x = c * gridSpacing;
        const y = r * gridSpacing;
        baseCtx.moveTo(x + 1.4, y);
        baseCtx.arc(x, y, 1.4, 0, Math.PI * 2);
      }
    }
    baseCtx.fill();

    // Puntos tapados (muy tenues): otro path/fill
    baseCtx.fillStyle = "rgba(255, 255, 255, 0.02)";
    baseCtx.beginPath();
    blockedSet.forEach(key => {
      const c = Math.floor(key / 10000);
      const r = key % 10000;
      const x = c * gridSpacing;
      const y = r * gridSpacing;
      baseCtx.moveTo(x + 0.8, y);
      baseCtx.arc(x, y, 0.8, 0, Math.PI * 2);
    });
    baseCtx.fill();
  }

  function updateBlockingRects() {
    blockedSet = new Set();
    const selectors = ['.card', '.navbar.scrolled', '.footer', '.contact-card', '.stat', '.tech-card'];
    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          // Marca directamente los índices de grilla cubiertos por el rect
          const cMin = Math.max(0, Math.ceil(rect.left / gridSpacing));
          const cMax = Math.min(cols, Math.floor(rect.right / gridSpacing));
          const rMin = Math.max(0, Math.ceil(rect.top / gridSpacing));
          const rMax = Math.min(rows, Math.floor(rect.bottom / gridSpacing));
          for (let c = cMin; c <= cMax; c++) {
            for (let r = rMin; r <= rMax; r++) {
              blockedSet.add(c * 10000 + r);
            }
          }
        }
      });
    });
    rebuildBaseLayer();
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    cols = Math.ceil(w / gridSpacing);
    rows = Math.ceil(h / gridSpacing);

    if (blob) {
      blobHalfW = blob.offsetWidth / 2;
      blobHalfH = blob.offsetHeight / 2;
    }

    if (currentCursor.x === 0 && currentCursor.y === 0) {
      currentCursor.x = targetCursor.x = w / 2;
      currentCursor.y = targetCursor.y = h / 2;
      auroraPos.x = w / 2;
      auroraPos.y = h / 2;
    }
    updateBlockingRects();
  }

  function dotColor(dx, dy, opacity) {
    // Color rotation based on angle around target
    const angle = Math.atan2(dy, dx);
    const normAngle = (angle + Math.PI) / (2 * Math.PI);

    // Interpolate Teal (#2ed3a2) -> Cyan (#5dd6ff) -> Purple (#a142f4) -> Teal
    let red, green, blue;
    if (normAngle < 0.33) {
      const p = normAngle / 0.33;
      red = Math.round(46 + (93 - 46) * p);
      green = Math.round(211 + (214 - 211) * p);
      blue = Math.round(162 + (255 - 162) * p);
    } else if (normAngle < 0.66) {
      const p = (normAngle - 0.33) / 0.33;
      red = Math.round(93 + (161 - 93) * p);
      green = Math.round(214 + (66 - 214) * p);
      blue = Math.round(255 + (244 - 255) * p);
    } else {
      const p = (normAngle - 0.66) / 0.34;
      red = Math.round(161 + (46 - 161) * p);
      green = Math.round(66 + (211 - 66) * p);
      blue = Math.round(244 + (162 - 244) * p);
    }

    return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
  }

  function drawPoints() {
    ctx.clearRect(0, 0, w, h);
    const time = Date.now();

    // Switch to idle drifting if mouse has not moved for 2 seconds
    if (time - lastMoveTime > 2000) {
      isIdle = true;
    }

    if (isIdle) {
      const t = time * 0.001;
      targetCursor.x = (w / 2) + Math.sin(t * 0.8) * (w * 0.22) + Math.cos(t * 0.3) * (w * 0.08);
      targetCursor.y = (h / 2) + Math.cos(t * 0.7) * (h * 0.18) + Math.sin(t * 0.4) * (h * 0.06);
    }

    // Lerp cursor position
    currentCursor.x += (targetCursor.x - currentCursor.x) * 0.05;
    currentCursor.y += (targetCursor.y - currentCursor.y) * 0.05;

    // Lerp Aurora position
    auroraPos.x += (currentCursor.x - auroraPos.x) * 0.08;
    auroraPos.y += (currentCursor.y - auroraPos.y) * 0.08;

    if (blob) {
      blob.style.transform = `translate3d(${auroraPos.x - blobHalfW}px, ${auroraPos.y - blobHalfH}px, 0)`;
    }

    // Capa base cacheada (puntos estáticos)
    ctx.drawImage(baseLayer, 0, 0, w, h);

    // Solo se recalculan y dibujan los puntos dentro del radio de influencia
    const cMin = Math.max(0, Math.floor((currentCursor.x - influenceRadius) / gridSpacing));
    const cMax = Math.min(cols, Math.ceil((currentCursor.x + influenceRadius) / gridSpacing));
    const rMin = Math.max(0, Math.floor((currentCursor.y - influenceRadius) / gridSpacing));
    const rMax = Math.min(rows, Math.ceil((currentCursor.y + influenceRadius) / gridSpacing));

    for (let c = cMin; c <= cMax; c++) {
      for (let r = rMin; r <= rMax; r++) {
        if (blockedSet.has(c * 10000 + r)) continue;

        const dotX = c * gridSpacing;
        const dotY = r * gridSpacing;
        const dx = dotX - currentCursor.x;
        const dy = dotY - currentCursor.y;
        const dist = Math.hypot(dx, dy);
        if (dist >= influenceRadius) continue;

        const factor = 1 - dist / influenceRadius;
        const smoothFactor = Math.sin(factor * Math.PI / 2);
        const opacity = 0.22 + 0.78 * smoothFactor; // ranges up to 1.0
        const radius = 1.4 + 2.0 * smoothFactor;     // ranges up to 3.4

        ctx.fillStyle = dotColor(dx, dy, opacity);
        ctx.beginPath();
        ctx.arc(dotX, dotY, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function step() {
    if (!document.body.classList.contains("bg-stitch-active")) return;
    drawPoints();
    requestAnimationFrame(step);
  }

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  }, { passive: true });

  // Scroll: recalcula los rects como máximo una vez por frame (rAF-throttle)
  let rectsScheduled = false;
  window.addEventListener("scroll", () => {
    if (rectsScheduled) return;
    rectsScheduled = true;
    requestAnimationFrame(() => {
      rectsScheduled = false;
      updateBlockingRects();
    });
  }, { passive: true });

  window.addEventListener("pointermove", (e) => {
    isIdle = false;
    lastMoveTime = Date.now();
    targetCursor.x = e.clientX;
    targetCursor.y = e.clientY;
  }, { passive: true });

  window.addEventListener("pointerleave", () => {
    isIdle = true;
  });

  resize();
  // Set initial cursors centered
  currentCursor.x = targetCursor.x = w / 2;
  currentCursor.y = targetCursor.y = h / 2;
  auroraPos.x = w / 2;
  auroraPos.y = h / 2;

  if (reducedMotion) {
    drawPoints(); // un solo frame estático
  } else {
    step();
  }
}

// Background preferences manager
(function runActiveBackground() {
  const activeBg = localStorage.getItem("background-preference") || "stitch";
  
  if (activeBg === "stitch") {
    document.body.classList.add("bg-stitch-active");
    document.body.classList.remove("bg-vector-active");
    initStitchBackground();
  } else {
    document.body.classList.add("bg-vector-active");
    document.body.classList.remove("bg-stitch-active");
    initVectorFieldBackground();
  }
})();
