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
window.addEventListener("scroll", toggleNavbarBlur);

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
  window.addEventListener("pointermove", (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 12;
    const y = (e.clientY / window.innerHeight - 0.5) * 12;
    orbs.forEach((orb, i) => {
      const intensity = (i + 1) * 4;
      orb.style.transform = `translate(${x / intensity}px, ${y / intensity}px)`;
    });
  });
}

/* Interactive vector field background */
(function vectorField() {
  const canvas = document.getElementById("vector-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let particles = [];
  let w, h, dpr;
  const mouse = { x: null, y: null };
  const maxDist = 140;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    spawnParticles();
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

  function step() {
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 1;

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

      // Connection lines
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.hypot(dx, dy);
        if (dist < maxDist) {
          const alpha = 1 - dist / maxDist;
          ctx.strokeStyle = `rgba(93,214,255,${0.35 * alpha})`;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    });

    // Draw particles
    particles.forEach(p => {
      ctx.fillStyle = "rgba(46,211,162,0.85)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.1, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(step);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  window.addEventListener("pointerleave", () => {
    mouse.x = mouse.y = null;
  });

  resize();
  step();
})();
