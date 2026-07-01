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
document.querySelectorAll('.compare-figure').forEach((cmp) => {
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
});

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


// ===== Reference-inspired scroll behaviour (adapted) =====
// Header hides on scroll down / returns on scroll up, gains a solid state,
// drives a top progress bar, and parallaxes the hero background.
(function(){
  const header = document.querySelector('.site-header');
  const progress = document.querySelector('.scroll-progress span');
  const heroBg = document.querySelector('.hero .hero-bg');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lastY = window.scrollY || 0;
  let ticking = false;

  function update(){
    const y = window.scrollY || 0;
    const doc = document.documentElement;
    const max = (doc.scrollHeight - doc.clientHeight) || 1;
    if (progress) progress.style.width = Math.min(100, (y / max) * 100) + '%';
    if (header){
      header.classList.toggle('scrolled', y > 14);
      // condense to logo-only when scrolling down past the hero-ish threshold; restore on scroll up
      if (y > lastY && y > 170) header.classList.add('logo-only');
      else header.classList.remove('logo-only');
    }
    if (heroBg && !reduce && y < window.innerHeight){
      heroBg.style.transform = 'translateY(' + (y * 0.18).toFixed(1) + 'px)';
    }
    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', function(){
    if (!ticking){ requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
})();


// ===== Soluciones catalog carousel (drag + arrows + dots + autoplay) =====
(function(){
  const track = document.getElementById('catalog');
  if (!track) return;
  const wrap = track.closest('.catalog-wrap');
  const prev = wrap.querySelector('.cat-prev');
  const next = wrap.querySelector('.cat-next');
  const dotsWrap = document.getElementById('catalog-dots');
  const cards = Array.prototype.slice.call(track.children);
  const stepW = () => { const c = track.querySelector('.cat-card'); const gap = parseFloat(getComputedStyle(track).gap) || 22; return c ? c.offsetWidth + gap : 320; };
  const activeIndex = () => Math.round(track.scrollLeft / stepW());

  if (dotsWrap){
    cards.forEach((c, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.addEventListener('click', () => track.scrollTo({ left: stepW() * i, behavior: 'smooth' }));
      dotsWrap.appendChild(b);
    });
  }
  const dots = dotsWrap ? Array.prototype.slice.call(dotsWrap.children) : [];
  const sync = () => { const a = activeIndex(); dots.forEach((d, i) => d.classList.toggle('active', i === a)); };
  track.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
  if (prev) prev.addEventListener('click', () => track.scrollBy({ left: -stepW(), behavior: 'smooth' }));
  if (next) next.addEventListener('click', () => track.scrollBy({ left: stepW(), behavior: 'smooth' }));

  // drag to scroll
  let down = false, startX = 0, startL = 0, moved = false;
  track.addEventListener('pointerdown', (e) => { down = true; moved = false; startX = e.clientX; startL = track.scrollLeft; track.classList.add('dragging'); try{track.setPointerCapture(e.pointerId);}catch(_){} stopAuto(); });
  track.addEventListener('pointermove', (e) => { if (!down) return; const dx = e.clientX - startX; if (Math.abs(dx) > 4) moved = true; track.scrollLeft = startL - dx; });
  const endDrag = () => { if(!down) return; down = false; track.classList.remove('dragging'); startAuto(); };
  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointercancel', endDrag);
  track.addEventListener('click', (e) => { if (moved) { e.preventDefault(); } }, true);

  // autoplay (pauses on hover / interaction)
  let timer = null;
  const advance = () => { const a = activeIndex(); if (a >= cards.length - 1) track.scrollTo({ left: 0, behavior: 'smooth' }); else track.scrollBy({ left: stepW(), behavior: 'smooth' }); };
  function startAuto(){ stopAuto(); timer = setInterval(advance, 4200); }
  function stopAuto(){ if (timer) { clearInterval(timer); timer = null; } }
  wrap.addEventListener('pointerenter', stopAuto);
  wrap.addEventListener('pointerleave', startAuto);
  sync(); startAuto();
})();

// ===== Animated process: scroll-driven progress + step activation =====
(function(){
  const steps = document.getElementById('proc-steps');
  if (!steps) return;
  const fill = document.getElementById('proc-meter-fill');
  const items = Array.prototype.slice.call(steps.querySelectorAll('.proc-step'));
  function update(){
    const r = steps.getBoundingClientRect();
    const vh = window.innerHeight;
    const total = r.height || 1;
    const seen = Math.min(Math.max(vh * 0.78 - r.top, 0), total);
    const pct = Math.min(1, seen / total);
    if (fill) fill.style.width = (pct * 100).toFixed(1) + '%';
    const activeCount = Math.round(pct * items.length + 0.18);
    items.forEach((it, i) => it.classList.toggle('active', i < activeCount));
  }
  window.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
  window.addEventListener('resize', update);
  update();
})();


// ===== Values accordion (Sobre AYA) =====
(function(){
  const heads = document.querySelectorAll('.values-accordion .val-head');
  if (!heads.length) return;
  heads.forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.val-item');
      const open = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
})();
