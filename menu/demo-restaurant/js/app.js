document.addEventListener("DOMContentLoaded", () => {
  loadBusinessData();
  loadMenuData();
});

/* =========================
   LOAD BUSINESS DATA
========================= */
function loadBusinessData() {
  fetch("./data/business.json")
    .then(res => res.json())
    .then(data => renderBusiness(data))
    .catch(err => console.error("Business data error:", err));
}

function renderBusiness(data) {
  /* ---------- IDENTITY ---------- */
  setText("#restaurantName", data.identity.name);
  setText("#categoryLine", data.identity.categoryLine);

  if (data.identity.hasLogo && data.flags.showLogo) {
    setImage("#restaurantLogo", "./assets/logo.png");
  } else {
    hideElement("#restaurantLogoWrapper");
  }

  /* ---------- CONTACT ---------- */
  setLink("#callPrimary", "tel:" + data.contact.primaryPhone, !!data.contact.primaryPhone);
  setLink("#callSecondary", "tel:" + data.contact.secondaryPhone, !!data.contact.secondaryPhone);
  setLink("#whatsappBtn", "https://wa.me/" + cleanNumber(data.contact.whatsappNumber), !!data.contact.whatsappNumber);
  setLink("#emailBtn", "mailto:" + data.contact.email, !!data.contact.email);

  /* ---------- LOCATION ---------- */
  setText("#fullAddress", data.location.fullAddress);
  setLink("#mapBtn", data.location.googleMapLink, !!data.location.googleMapLink);

  /* ---------- OPENING HOURS ---------- */
  renderOpeningHours(data.openingHours);

  /* ---------- ONLINE PLATFORMS ---------- */
  const platforms = data.onlinePlatforms;
  togglePlatform("#instaIcon", platforms.instagram);
  togglePlatform("#fbIcon", platforms.facebook);
  togglePlatform("#googleIcon", platforms.google);
  togglePlatform("#zomatoIcon", platforms.zomato);
  togglePlatform("#swiggyIcon", platforms.swiggy);
  togglePlatform("#websiteIcon", platforms.website);

  if (!data.flags.showSocialLinks) {
    hideElement("#socialSection");
  }

  /* ---------- PAYMENT ---------- */
  if (data.payment.hasPaymentQR && data.flags.showPaymentQR) {
    setImage("#paymentQR", "./assets/payment.png");
  } else {
    hideElement("#paymentSection");
  }

  toggleBadge("#upiBadge", data.payment.upiAccepted);
  toggleBadge("#onlinePayBadge", data.payment.onlinePaymentAccepted);
  toggleBadge("#cashBadge", data.payment.cashAccepted);

  /* ---------- TRUST INFO ---------- */
  renderBadges(data.trustInfo.badges);
  if (!data.trustInfo.showQualityIcons) hideElement("#qualityIcons");
  setText("#aboutText", data.trustInfo.about);

  /* ---------- FLAGS ---------- */
  if (!data.flags.deliveryAvailable) hideElement("#deliveryInfo");
  if (!data.flags.dineInAvailable) hideElement("#dineInInfo");
}

/* =========================
   LOAD MENU DATA
========================= */
function loadMenuData() {
  fetch("./data/menu.json")
    .then(res => res.json())
    .then(data => renderMenu(data.categories))
    .catch(err => console.error("Menu data error:", err));
}

function renderMenu(categories) {
  const container = document.querySelector("#menuContainer");
  container.innerHTML = "";

  categories.forEach(category => {
    const section = document.createElement("section");
    section.className = "menu-category";

    section.innerHTML = `<h2>${category.name}</h2>`;

    category.items.forEach(item => {
      const itemDiv = document.createElement("div");
      itemDiv.className = "menu-item";

      const icon =
        item.type === "veg"
          ? "/assets/icons/color-icons/veg.svg"
          : "/assets/icons/color-icons/non-veg.svg";

      let pricesHTML = "";
      item.prices.forEach(p => {
        pricesHTML += `<div class="price-line">
            <span>${p.label}</span>
            <span>₹${p.price}</span>
          </div>`;
      });

      itemDiv.innerHTML = `
        <div class="item-header">
          <img src="${icon}" class="food-icon" alt="${item.type}">
          <h3>${item.name}</h3>
        </div>
        <div class="price-box">${pricesHTML}</div>
        ${item.description ? `<p class="item-desc">${item.description}</p>` : ""}
      `;

      section.appendChild(itemDiv);
    });

    container.appendChild(section);
  });
}

/* =========================
   HELPERS
========================= */
function setText(selector, text) {
  const el = document.querySelector(selector);
  if (el && text) el.textContent = text;
}

function setImage(selector, src) {
  const el = document.querySelector(selector);
  if (el) el.src = src;
}

function setLink(selector, href, condition) {
  const el = document.querySelector(selector);
  if (!el || !condition) {
    hideElement(selector);
    return;
  }
  el.href = href;
}

function togglePlatform(selector, link) {
  if (!link) hideElement(selector);
  else document.querySelector(selector).href = link;
}

function toggleBadge(selector, condition) {
  if (!condition) hideElement(selector);
}

function hideElement(selector) {
  const el = document.querySelector(selector);
  if (el) el.style.display = "none";
}

function cleanNumber(num) {
  return num ? num.replace(/\D/g, "") : "";
}

function renderBadges(badges) {
  const box = document.querySelector("#badgeContainer");
  if (!badges || badges.length === 0) {
    hideElement("#badgeContainer");
    return;
  }
  box.innerHTML = "";
  badges.forEach(b => {
    const span = document.createElement("span");
    span.className = "badge";
    span.textContent = b;
    box.appendChild(span);
  });
}

function renderOpeningHours(hours) {
  const box = document.querySelector("#timingBox");
  box.innerHTML = "";

  Object.keys(hours).forEach(day => {
    const d = hours[day];
    if (d.isClosed) {
      box.innerHTML += `<div>${capitalize(day)}: Closed</div>`;
    } else {
      const slots = d.slots
        .map(s => `${s.open} - ${s.close}`)
        .join(", ");
      box.innerHTML += `<div>${capitalize(day)}: ${slots}</div>`;
    }
  });
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
