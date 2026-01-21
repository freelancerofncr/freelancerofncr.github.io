/* =========================
   DOM READY
========================= */
document.addEventListener("DOMContentLoaded", () => {

  /* ===== HEADER WHATSAPP LINKS ===== */
  const whatsappLinks = document.querySelectorAll(".btn-whatsapp, .btn-primary");

  whatsappLinks.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const url = `https://wa.me/91${BUSINESS_CONFIG.whatsapp}`;
      window.open(url, "_blank");
    });
  });

  /* ===== CONTACT DETAILS ===== */
  const phoneEls = document.querySelectorAll(".phone-number");
  const whatsappEls = document.querySelectorAll(".whatsapp-number");

  phoneEls.forEach(el => el.textContent = BUSINESS_CONFIG.phone);
  whatsappEls.forEach(el => el.textContent = BUSINESS_CONFIG.whatsapp);

  /* ===== MOBILE MENU TOGGLE ===== */
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      nav.classList.toggle("open");
    });
  }

});
