/* =============================================
   PRESTIGE REALTY – MAIN JS
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Mobile nav ── */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', navLinks.classList.contains('open'));
    });

    // Close on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }

  /* ── Animated stat counters ── */
  const statNumbers = document.querySelectorAll('.stat-number');

  const animateCounter = (el) => {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const step     = Math.ceil(target / (duration / 16));
    let current    = 0;

    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current.toLocaleString();
      if (current >= target) clearInterval(timer);
    }, 16);
  };

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => statsObserver.observe(el));

  /* ── Testimonials slider ── */
  const cards   = Array.from(document.querySelectorAll('.testimonial-card'));
  const dotsContainer = document.getElementById('sliderDots');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  let current   = 0;
  let autoTimer;

  if (cards.length && dotsContainer) {
    // Build dots
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    });

    const goTo = (idx) => {
      cards[current].classList.remove('active');
      dotsContainer.children[current].classList.remove('active');
      current = (idx + cards.length) % cards.length;
      cards[current].classList.add('active');
      dotsContainer.children[current].classList.add('active');
    };

    prevBtn && prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
    nextBtn && nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

    const startAuto = () => { autoTimer = setInterval(() => goTo(current + 1), 5000); };
    const resetAuto = () => { clearInterval(autoTimer); startAuto(); };

    startAuto();
  }

  /* ── Fade-in on scroll ── */
  const fadeEls = document.querySelectorAll('.listing-card, .service-card, .team-card, .stat-card');
  fadeEls.forEach(el => el.classList.add('fade-in'));

  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  fadeEls.forEach(el => fadeObserver.observe(el));

  /* ── Favorite toggle ── */
  document.querySelectorAll('.fav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      const icon = btn.querySelector('i');
      if (btn.classList.contains('active')) {
        icon.className = 'fa-solid fa-heart';
        showToast('Added to favourites!');
      } else {
        icon.className = 'fa-regular fa-heart';
        showToast('Removed from favourites');
      }
    });
  });

  /* ── Listing filter (listings page) ── */
  const filterForm = document.getElementById('filterForm');
  if (filterForm) {
    filterForm.addEventListener('input', applyFilters);
    filterForm.addEventListener('change', applyFilters);
  }

  function applyFilters() {
    const locVal   = (document.getElementById('filterLocation')?.value || '').toLowerCase();
    const typeVal  = document.getElementById('filterType')?.value || '';
    const minPrice = parseFloat(document.getElementById('filterMin')?.value || 0);
    const maxPrice = parseFloat(document.getElementById('filterMax')?.value || Infinity);
    const bedsVal  = document.getElementById('filterBeds')?.value || '';

    const cards = document.querySelectorAll('.listing-card[data-type]');
    let visible = 0;

    cards.forEach(card => {
      const addr  = (card.dataset.address || '').toLowerCase();
      const type  = card.dataset.type || '';
      const price = parseFloat(card.dataset.price || 0);
      const beds  = card.dataset.beds || '';

      const matchLoc   = !locVal  || addr.includes(locVal);
      const matchType  = !typeVal || type === typeVal;
      const matchPrice = price >= minPrice && price <= (maxPrice || Infinity);
      const matchBeds  = !bedsVal || parseInt(beds) >= parseInt(bedsVal);

      const show = matchLoc && matchType && matchPrice && matchBeds;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    const countEl = document.getElementById('listingsCount');
    if (countEl) countEl.textContent = `${visible} properties found`;
  }

  /* ── Contact form ── */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateForm(contactForm)) return;

      const btn = contactForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Sending…';

      // Simulate async submit
      setTimeout(() => {
        contactForm.style.display = 'none';
        const success = document.getElementById('formSuccess');
        if (success) { success.classList.add('show'); }
      }, 1200);
    });
  }

  /* ── Newsletter form ── */
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = newsletterForm.querySelector('input[type="email"]');
      if (!emailInput.value || !emailInput.checkValidity()) {
        emailInput.classList.add('error');
        return;
      }
      emailInput.classList.remove('error');
      showToast('Subscribed! Thanks for signing up.');
      newsletterForm.reset();
    });
  }

  /* ── Form validation helper ── */
  function validateForm(form) {
    let valid = true;
    form.querySelectorAll('[required]').forEach(field => {
      const errEl = field.parentElement.querySelector('.field-error');
      field.classList.remove('error');
      if (errEl) errEl.textContent = '';

      if (!field.value.trim()) {
        field.classList.add('error');
        if (errEl) errEl.textContent = 'This field is required.';
        valid = false;
      } else if (field.type === 'email' && !field.checkValidity()) {
        field.classList.add('error');
        if (errEl) errEl.textContent = 'Please enter a valid email address.';
        valid = false;
      }
    });
    return valid;
  }

  /* ── Toast notification ── */
  window.showToast = function(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="fa-solid fa-bell"></i> ${message}`;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 3200);
  };

});

/* ── Mortgage calculator ── */
function calculateMortgage() {
  const homePrice    = parseFloat(document.getElementById('homePrice').value);
  const downPayment  = parseFloat(document.getElementById('downPayment').value) || 0;
  const loanTerm     = parseInt(document.getElementById('loanTerm').value);
  const interestRate = parseFloat(document.getElementById('interestRate').value);
  const resultEl     = document.getElementById('calcResult');

  if (!homePrice || homePrice <= 0) {
    resultEl.className = 'calc-result show';
    resultEl.innerHTML = '<p style="color:#e74c3c">Please enter a valid home price.</p>';
    return;
  }

  if (!interestRate || interestRate <= 0) {
    resultEl.className = 'calc-result show';
    resultEl.innerHTML = '<p style="color:#e74c3c">Please enter a valid interest rate.</p>';
    return;
  }

  const principal = homePrice - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = loanTerm * 12;

  const monthly = monthlyRate === 0
    ? principal / numPayments
    : principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);

  const totalPaid    = monthly * numPayments;
  const totalInterest = totalPaid - principal;
  const downPct      = homePrice > 0 ? ((downPayment / homePrice) * 100).toFixed(1) : 0;

  resultEl.className = 'calc-result show';
  resultEl.innerHTML = `
    <div class="label">Estimated Monthly Payment</div>
    <div class="monthly">$${monthly.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</div>
    <div class="calc-breakdown">
      <div class="breakdown-item">
        <strong>$${fmt(principal)}</strong> Loan Amount
      </div>
      <div class="breakdown-item">
        <strong>${downPct}%</strong> Down Payment
      </div>
      <div class="breakdown-item">
        <strong>$${fmt(totalInterest)}</strong> Total Interest
      </div>
      <div class="breakdown-item">
        <strong>$${fmt(totalPaid)}</strong> Total Cost
      </div>
    </div>
  `;
}

function fmt(n) {
  return Math.round(n).toLocaleString();
}
