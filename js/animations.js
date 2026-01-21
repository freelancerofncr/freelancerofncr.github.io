/* =========================
   TYPING EFFECT (HERO)
========================= */
document.addEventListener("DOMContentLoaded", () => {
  const typingEl = document.querySelector(".typing-text");
  if (!typingEl) return;

  const texts = BUSINESS_CONFIG.heroTypingText;
  let textIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function typeLoop() {
    const currentText = texts[textIndex];

    if (!isDeleting) {
      typingEl.textContent = currentText.slice(0, charIndex++);
      if (charIndex > currentText.length) {
        setTimeout(() => isDeleting = true, 1200);
      }
    } else {
      typingEl.textContent = currentText.slice(0, charIndex--);
      if (charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % texts.length;
      }
    }

    setTimeout(typeLoop, isDeleting ? 50 : 80);
  }

  typeLoop();
});


/* =========================
   COUNT UP ANIMATION
========================= */
document.addEventListener("DOMContentLoaded", () => {
  const counters = document.querySelectorAll(".trust-number");

  const runCounter = (el) => {
    const target = +el.dataset.count;
    let count = 0;
    const increment = Math.ceil(target / 60);

    const timer = setInterval(() => {
      count += increment;
      if (count >= target) {
        el.textContent = target + "+";
        clearInterval(timer);
      } else {
        el.textContent = count;
      }
    }, 20);
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        runCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  counters.forEach(counter => observer.observe(counter));
});


/* =========================
   TESTIMONIAL AUTO SCROLL
========================= */
document.addEventListener("DOMContentLoaded", () => {
  const slider = document.querySelector(".testimonials-slider");
  if (!slider) return;

  let scrollAmount = 0;

  setInterval(() => {
    scrollAmount += 1;
    slider.scrollLeft += scrollAmount;

    if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth) {
      slider.scrollLeft = 0;
      scrollAmount = 0;
    }
  }, 40);
});
