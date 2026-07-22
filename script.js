document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('primary-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length) {
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
      revealEls.forEach(el => io.observe(el));
    } else {
      revealEls.forEach(el => el.classList.add('in-view'));
    }
  }

  const spinner = document.getElementById('spinnerToy');
  const spinnerSvg = document.getElementById('spinnerSvg');
  if (spinner && spinnerSvg) {
    let angle = 0;
    let velocity = 6;
    let dragging = false;
    let lastAngle = 0;
    let lastTime = 0;
    let momentumFrame = null;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const angleFromEvent = (e) => {
      const rect = spinner.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      return Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
    };

    const render = () => { spinnerSvg.style.transform = `rotate(${angle}deg)`; };

    const baseVelocity = 6;
    const idleTick = () => {
      if (!dragging) {
        angle += velocity * 0.08;
        velocity += (Math.sign(velocity || 1) * baseVelocity - velocity) * 0.02;
        render();
      }
      momentumFrame = requestAnimationFrame(idleTick);
    };

    if (!reduceMotion) {
      momentumFrame = requestAnimationFrame(idleTick);
    } else {
      render();
    }

    spinner.addEventListener('pointerdown', (e) => {
      dragging = true;
      spinner.setPointerCapture(e.pointerId);
      lastAngle = angleFromEvent(e);
      lastTime = performance.now();
    });

    spinner.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const now = performance.now();
      const current = angleFromEvent(e);
      let delta = current - lastAngle;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      angle += delta;
      const dt = Math.max(now - lastTime, 1);
      velocity = (delta / dt) * 220;
      lastAngle = current;
      lastTime = now;
      render();
    });

    const stopDrag = () => {
      if (!dragging) return;
      dragging = false;
      velocity = Math.max(Math.min(velocity, 60), -60) || 6;
    };
    spinner.addEventListener('pointerup', stopDrag);
    spinner.addEventListener('pointercancel', stopDrag);
    spinner.addEventListener('pointerleave', () => { if (dragging) stopDrag(); });

    spinner.addEventListener('click', () => {
      if (dragging) return;
      velocity = velocity >= 0 ? velocity + 24 : -(Math.abs(velocity) + 24);
    });
  }

  const chips = document.querySelectorAll('.filter-chip');
  const cards = document.querySelectorAll('#productGrid .card');
  if (chips.length && cards.length) {
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.setAttribute('aria-pressed', 'false'));
        chip.setAttribute('aria-pressed', 'true');
        const filter = chip.dataset.filter;
        cards.forEach(card => {
          const show = filter === 'all' || card.dataset.category === filter;
          card.style.display = show ? '' : 'none';
        });
      });
    });
  }
});
