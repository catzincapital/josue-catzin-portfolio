(() => {
  'use strict';

  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
  const panels = Array.from(document.querySelectorAll('[role="tabpanel"]'));
  const tablist = document.querySelector('[role="tablist"]');

  function selectTab(tab, focus = false) {
    tabs.forEach(item => {
      const active = item === tab;
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
    });
    panels.forEach(panel => {
      panel.hidden = panel.id !== tab.getAttribute('aria-controls');
    });
    if (focus) tab.focus();
  }

  if (tabs.length && tablist) {
    selectTab(tabs[0]);
    tablist.hidden = false;
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => selectTab(tab));
      tab.addEventListener('keydown', event => {
        let target;
        if (event.key === 'ArrowRight') target = tabs[(index + 1) % tabs.length];
        if (event.key === 'ArrowLeft') target = tabs[(index - 1 + tabs.length) % tabs.length];
        if (event.key === 'Home') target = tabs[0];
        if (event.key === 'End') target = tabs[tabs.length - 1];
        if (target) {
          event.preventDefault();
          selectTab(target, true);
        }
      });
    });
  }

  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const revealItems = Array.from(document.querySelectorAll('.reveal'));
  let revealObserver;

  function updateMotion() {
    if (revealObserver) revealObserver.disconnect();
    revealItems.forEach(item => item.classList.remove('will-reveal'));
    if (motionPreference.matches || !('IntersectionObserver' in window)) return;
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06 });
    revealItems.forEach(item => {
      if (item.getBoundingClientRect().top > window.innerHeight) {
        item.classList.add('will-reveal');
        revealObserver.observe(item);
      }
    });
  }

  document.addEventListener('focusin', event => {
    const container = event.target.closest('.reveal');
    if (container) container.classList.add('is-visible');
  });
  updateMotion();
  if (motionPreference.addEventListener) motionPreference.addEventListener('change', updateMotion);

  const navigation = Array.from(document.querySelectorAll('.navigation a'));
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting);
      if (!visible.length) return;
      navigation.forEach(link => {
        if (link.getAttribute('href') === '#' + visible[0].target.id) {
          link.setAttribute('aria-current', 'location');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    }, { rootMargin: '-15% 0px -60% 0px', threshold: 0 });
    navigation.forEach(link => {
      const section = document.querySelector(link.getAttribute('href'));
      if (section) sectionObserver.observe(section);
    });
  }
})();
