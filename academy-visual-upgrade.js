(() => {
  document.body.classList.add('visual-upgrade');

  const hero = document.querySelector('.hero');
  const heroTitle = hero?.querySelector('h1');
  if (heroTitle && !heroTitle.querySelector('em')) {
    const phrase = 'Learn first.';
    if (heroTitle.textContent.includes(phrase)) {
      heroTitle.innerHTML = heroTitle.textContent.replace(phrase, `<em>${phrase}</em>`);
    }
  }

  const trust = hero?.querySelector('.trust');
  if (trust && !hero.querySelector('.hero-support-badge')) {
    const support = document.createElement('div');
    support.className = 'hero-support-badge';
    support.textContent = 'Course guidance available by phone and WhatsApp';
    trust.insertAdjacentElement('afterend', support);
  }

  const icons = ['LEARN', 'LAB', 'ANXB'];
  document.querySelectorAll('.program-card').forEach((card, index) => {
    card.dataset.programIcon = icons[index] || 'NEXA';
    card.addEventListener('pointermove', (event) => {
      const box = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${event.clientX - box.left}px`);
      card.style.setProperty('--my', `${event.clientY - box.top}px`);
    });
  });

  const revealTargets = document.querySelectorAll('.program-card,.course-card,.path-grid article,.value-grid article,.sales-contact');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    revealTargets.forEach((element) => element.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  revealTargets.forEach((element, index) => {
    element.classList.add('visual-reveal');
    element.style.transitionDelay = `${Math.min(index % 3, 2) * 70}ms`;
    observer.observe(element);
  });
})();
