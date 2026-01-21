/*--- script.js ---
```javascript
 =====================================================
   HERO TYPING EFFECT
===================================================== 
const typingTexts = [
  "Digital QR Menu for Restaurants",
  "Google Business Profile Management",
  "Affordable Business Websites",
  "Simple Digital Solutions for Businesses"
];
let textIndex = 0;
let charIndex = 0;
let deleting = false;
const typingElement = document.querySelector(".typing-text");
function typingLoop() {
  if (!typingElement) return;
  const currentText = typingTexts[textIndex];
  if (!deleting) {
    typingElement.textContent = currentText.substring(0, charIndex + 1);
    charIndex++;
    if (charIndex === currentText.length) {
      setTimeout(() => (deleting = true), 1200);
    }
  } else {
    typingElement.textContent = currentText.substring(0, charIndex - 1);
    charIndex--;
    if (charIndex === 0) {
      deleting = false;
      textIndex = (textIndex + 1) % typingTexts.length;
    }
  }
  setTimeout(typingLoop, deleting ? 60 : 90);
}
typingLoop();

/* =====================================================
   TRUST COUNTER ANIMATION
===================================================== 
const counters = document.querySelectorAll(".count");
const runCounter = (counter) => {
  const target = +counter.dataset.count;
  let current = 0;
  const step = Math.ceil(target / 50);
  const interval = setInterval(() => {
    current += step;
    if (current >= target) {
      counter.textContent = target;
      clearInterval(interval);
    } else {
      counter.textContent = current;
    }
  }, 30);
};
const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        runCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.6 }
);
counters.forEach((counter) => counterObserver.observe(counter));

/* =====================================================
   TESTIMONIAL AUTO SCROLL (GOOGLE STYLE FEEL)
===================================================== 
const testimonialTrack = document.querySelector(".testimonials-wrapper");
let scrollPosition = 0;
if (testimonialTrack) {
  setInterval(() => {
    scrollPosition += 1;
    testimonialTrack.scrollLeft = scrollPosition;
    if (
      scrollPosition >=
      testimonialTrack.scrollWidth - testimonialTrack.clientWidth
    ) {
      scrollPosition = 0;
    }
  }, 40);
}

/* =====================================================
   MOBILE MENU TOGGLE
===================================================== 
const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    mainNav.classList.toggle("open");
  });
}

/* =====================================================
   OPTIONAL: CLOSE MENU ON LINK CLICK (MOBILE)
===================================================== 
const navLinks = document.querySelectorAll(".main-nav a");
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (mainNav.classList.contains("open")) {
      mainNav.classList.remove("open");
    }
  });
});

/* =====================================================
   SMOOTH SCROLL FOR NAVIGATION LINKS
===================================================== 
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if(target){
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

/* =====================================================
   ADD SCROLL REVEAL ANIMATION TO CARDS
===================================================== 
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const fadeInObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

document.querySelectorAll('.service-card, .pricing-card, .trust-item').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  fadeInObserver.observe(el);
});
```
*/
