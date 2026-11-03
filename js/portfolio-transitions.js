/* Continuous project-image transitions, with a light fallback for older browsers. */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nativeTransitions = 'onpageswap' in window && 'onpagereveal' in window;
  const slug = url => new URL(url, location.href).searchParams.get('slug');
  const name = value => 'project-' + value.replace(/[^a-z0-9-]/gi, '-');
  const cards = () => [...document.querySelectorAll('a.card[href]')];
  const projectHero = document.getElementById('ppHero');
  const projectSlug = slug(location.href);
  function clearNames() {
    document.querySelectorAll('[data-project-transition]').forEach(el => {
      el.style.viewTransitionName = '';
      delete el.dataset.projectTransition;
    });
  }
  function mark(el, id) {
    if (!el || !id) return;
    el.style.viewTransitionName = name(id);
    el.dataset.projectTransition = id;
  }
  function markDestination() {
    if (!reduce && nativeTransitions && projectHero && projectSlug) mark(projectHero, projectSlug);
  }
  markDestination();
  document.addEventListener('portfolio:content-ready', markDestination);
  window.addEventListener('pageswap', event => {
    if (reduce || !event.viewTransition) return;
    const target = event.activation?.entry?.url;
    if (!target) return;
    const targetSlug = slug(target);
    if (targetSlug) {
      const card = cards().find(a => slug(a.href) === targetSlug);
      clearNames();
      mark(card?.querySelector('.card__img'), targetSlug);
    } else if (projectHero && projectSlug) {
      clearNames();
      mark(projectHero, projectSlug);
    }
    event.viewTransition.finished.finally(clearNames).catch(() => {});
  });
  window.addEventListener('pagereveal', event => {
    if (reduce || !event.viewTransition) return;
    const from = window.navigation?.activation?.from?.url;
    const fromSlug = from && slug(from);
    if (projectHero && projectSlug) mark(projectHero, projectSlug);
    else if (fromSlug) {
      const card = cards().find(a => slug(a.href) === fromSlug);
      mark(card?.querySelector('.card__img'), fromSlug);
    }
    event.viewTransition.finished.finally(clearNames).catch(() => {});
  });
  window.addEventListener('pageshow', () => {
    document.querySelector('.project-flight')?.remove();
    document.querySelector('.pt-curtain')?.classList.remove('is-in', 'is-out');
  });
  const curtain = document.createElement('div');
  curtain.className = 'pt-curtain';
  curtain.setAttribute('aria-hidden', 'true');
  curtain.innerHTML = '<span class="pt-curtain__mark">MC</span>';
  document.body.appendChild(curtain);
  let leaving = false;
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href]');
    if (!link || link.target === '_blank' || link.hasAttribute('download') || document.body.classList.contains('mc-editing')) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || !/^https?:$/.test(url.protocol)) return;
    if (url.pathname === location.pathname && url.search === location.search) return;
    if (reduce || nativeTransitions) return;
    event.preventDefault();
    if (leaving) return;
    leaving = true;
    const image = link.matches('.card') && link.querySelector('.card__img');
    if (image) {
      const rect = link.getBoundingClientRect();
      const flight = document.createElement('div');
      flight.className = 'project-flight';
      flight.style.backgroundImage = getComputedStyle(image).backgroundImage;
      Object.assign(flight.style, { left: rect.left + 'px', top: rect.top + 'px', width: rect.width + 'px', height: rect.height + 'px' });
      document.body.appendChild(flight);
      const endWidth = Math.min(innerWidth, 1400);
      flight.animate([
        { left: rect.left + 'px', top: rect.top + 'px', width: rect.width + 'px', height: rect.height + 'px', borderRadius: '18px' },
        { left: ((innerWidth - endWidth) / 2) + 'px', top: '15vh', width: endWidth + 'px', height: '70vh', borderRadius: '0' }
      ], { duration: 480, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' });
    } else curtain.classList.add('is-in');
    setTimeout(() => location.assign(url.href), image ? 480 : 300);
  });
})();
