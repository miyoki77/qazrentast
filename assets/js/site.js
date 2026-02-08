function setActiveNav(){
  const path = (location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('[data-nav]').forEach(a=>{
    if(a.getAttribute('href') === path) a.classList.add('active');
  });
}
document.addEventListener('DOMContentLoaded', setActiveNav);


function setupMobileNav(){
  const header = document.querySelector('header.nav');
  const burger = document.querySelector('.burger');
  const menu = document.querySelector('nav.menu');
  if(!header || !burger || !menu) return;

  burger.addEventListener('click', ()=>{
    header.classList.toggle('open');
    burger.setAttribute('aria-expanded', header.classList.contains('open') ? 'true' : 'false');
  });

  // Close when clicking a link
  menu.querySelectorAll('a').forEach(a=>{
    a.addEventListener('click', ()=> header.classList.remove('open'));
  });

  // Close when clicking outside
  document.addEventListener('click', (e)=>{
    if(!header.classList.contains('open')) return;
    const t = e.target;
    if(header.contains(t)) return;
    header.classList.remove('open');
    burger.setAttribute('aria-expanded','false');
  });
}
document.addEventListener('DOMContentLoaded', setupMobileNav);
