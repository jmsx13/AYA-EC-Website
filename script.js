const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.main-nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
}

document.getElementById('year').textContent = new Date().getFullYear();

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const form = document.getElementById('diagnostic-form');
if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const msg = form.querySelector('.form-message');
    msg.textContent = 'Gracias por contactarnos. El equipo de AYA EC revisará la información y se comunicará contigo para preparar una evaluación preliminar.';
    form.reset();
  });
}
