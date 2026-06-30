const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.main-nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
}

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

const reveals = document.querySelectorAll('.reveal');
const showReveal = (el) => el.classList.add('visible');
if ('IntersectionObserver' in window && reveals.length) {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        showReveal(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  reveals.forEach(el => observer.observe(el));
  // Safety fallback: if the observer never fires (embedded/offscreen contexts),
  // never leave content invisible.
  window.addEventListener('load', () => {
    setTimeout(() => reveals.forEach(showReveal), 600);
  });
} else {
  reveals.forEach(showReveal);
}

const form = document.getElementById('diagnostic-form');
if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const msg = form.querySelector('.form-message');
    msg.textContent = 'Gracias por contactarnos. El equipo de AYA EC revisará la información y se comunicará contigo para preparar una evaluación preliminar.';
    form.reset();
  });
}


// Compare slider ("telón"): follows the mouse on desktop, drag on touch
const cmp = document.querySelector('.compare-figure');
if (cmp) {
  const setPos = (clientX) => {
    const r = cmp.getBoundingClientRect();
    let pct = ((clientX - r.left) / r.width) * 100;
    pct = Math.max(0, Math.min(100, pct));
    cmp.style.setProperty('--pos', pct + '%');
  };
  let dragging = false;
  cmp.addEventListener('pointerdown', (e) => {
    dragging = true;
    try { cmp.setPointerCapture(e.pointerId); } catch (_) {}
    setPos(e.clientX);
  });
  cmp.addEventListener('pointermove', (e) => {
    if (dragging || e.pointerType === 'mouse') setPos(e.clientX);
  });
  const stop = () => { dragging = false; };
  cmp.addEventListener('pointerup', stop);
  cmp.addEventListener('pointercancel', stop);
}

// Hero image: subtle parallax on mouse move (desktop only, respects reduced motion)
const heroEl = document.querySelector('.hero');
const heroFig = document.querySelector('.hero-figure');
if (heroEl && heroFig && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  heroEl.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = heroEl.getBoundingClientRect();
    const dx = (e.clientX - r.left) / r.width - 0.5;
    const dy = (e.clientY - r.top) / r.height - 0.5;
    heroFig.style.transform = 'translate(' + (dx * 14).toFixed(1) + 'px,' + (dy * 12).toFixed(1) + 'px)';
  });
  heroEl.addEventListener('pointerleave', () => { heroFig.style.transform = ''; });
}
