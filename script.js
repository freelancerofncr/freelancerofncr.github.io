// ================= MOBILE MENU TOGGLE =================
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const body = document.body;

if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    
    // Change icon
    const icon = menuToggle.querySelector('img');
    if (navMenu.classList.contains('active')) {
      icon.src = 'assets/icons/black-icons/close-line.svg';
    } else {
      icon.src = 'assets/icons/black-icons/three-horizontal-lines.svg';
    }
  });
}

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  if (navMenu.classList.contains('active') && 
      !navMenu.contains(e.target) && 
      !menuToggle.contains(e.target)) {
    navMenu.classList.remove('active');
    body.style.overflow = '';
    const icon = menuToggle.querySelector('img');
    icon.src = 'assets/icons/black-icons/three-horizontal-lines.svg';
  }
});

// Close menu when clicking nav links
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    if (window.innerWidth <= 992) {
      navMenu.classList.remove('active');
      body.style.overflow = '';
      const icon = menuToggle.querySelector('img');
      icon.src = 'assets/icons/black-icons/three-horizontal-lines.svg';
    }
  });
});

// ================= DROPDOWN MENU (MOBILE) =================
const dropdowns = document.querySelectorAll('.dropdown');

dropdowns.forEach(dropdown => {
  const dropdownLink = dropdown.querySelector('.nav-link');
  
  dropdownLink.addEventListener('click', (e) => {
    if (window.innerWidth <= 992) {
      e.preventDefault();
      dropdown.classList.toggle('active');
    }
  });
});

// ================= HEADER SCROLL EFFECT =================
const header = document.querySelector('.header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  
  if (currentScroll > 100) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
  
  lastScroll = currentScroll;
});

// ================= SMOOTH SCROLL =================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    
    if (href !== '#' && href.length > 1) {
      const target = document.querySelector(href);
      
      if (target) {
        e.preventDefault();
        const headerHeight = header.offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    }
  });
});

// ================= ANIMATE ON SCROLL =================
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observe feature cards and trust cards
const animateElements = document.querySelectorAll('.feature-card, .trust-card');
animateElements.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// ================= BUTTON RIPPLE EFFECT =================
const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-whatsapp, .btn-primary-large');

buttons.forEach(button => {
  button.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    this.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  });
});

// Add ripple CSS dynamically
const style = document.createElement('style');
style.textContent = `
  .btn-primary, .btn-secondary, .btn-whatsapp, .btn-primary-large {
    position: relative;
    overflow: hidden;
  }
  
  .ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    transform: scale(0);
    animation: ripple-animation 0.6s ease-out;
    pointer-events: none;
  }
  
  @keyframes ripple-animation {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// ================= LAZY LOAD IMAGES =================
const images = document.querySelectorAll('img[data-src]');

const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
      imageObserver.unobserve(img);
    }
  });
});

images.forEach(img => imageObserver.observe(img));

// ================= PAGE LOAD ANIMATION =================
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
});

// Add loaded state CSS
const loadStyle = document.createElement('style');
loadStyle.textContent = `
  body {
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  body.loaded {
    opacity: 1;
  }
`;
document.head.appendChild(loadStyle);
