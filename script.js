// Simple fade-in on load
document.addEventListener("DOMContentLoaded", () => {
  document.body.style.opacity = 0;
  document.body.style.transition = "opacity 0.8s ease";
  setTimeout(() => {
    document.body.style.opacity = 1;
  }, 100);
});

/* ===============================
   MOBILE MENU TOGGLE
================================ */
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav ul');

if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
  });
}

/* ===============================
   MOBILE DROPDOWN (SERVICES)
================================ */
const dropdown = document.querySelector('.dropdown');

if (dropdown) {
  dropdown.addEventListener('click', function () {
    if (window.innerWidth <= 768) {
      this.querySelector('.dropdown-menu').classList.toggle('active');
    }
  });
}
