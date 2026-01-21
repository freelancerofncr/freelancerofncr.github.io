document.addEventListener("DOMContentLoaded", () => {
  loadBusiness();
  loadMenu();
});

/* =======================
   LOAD BUSINESS DATA
======================= */
function loadBusiness() {
  fetch("./data/business.json")
    .then(res => res.json())
    .then(data => renderBusiness(data))
    .catch(err => console.error("Business JSON error:", err));
}

function renderBusiness(data) {

  /* ===== HEADER ===== */
  setText("#restaurantName", data.identity.name);
  setText("#categoryLine", data.identity.categoryLine);

  if (data.identity.hasLogo && data.flags.showLogo) {
    setImage("#restaurantLogo", "./assets/logo.png");
  } else {
    hide("#restaurantLogo");
  }

  // Veg / Non-Veg badge
  const badge = document.createElement("span");
  badge.className = "badge";
  badge.textContent =
    data.identity.foodType === "veg" ? "🟢 Veg Only" : "🔴 Veg & Non-Veg";
  document.querySelector(".header").appendChild(badge);

  /* ===== CONTACT BUTTONS ===== */
  setLink("#callPrimary", "tel:" + data.contact.primaryPhone, data.contact.primaryPhone);
  setLink("#whatsappBtn", "https://wa.me/" + clean(data.contact.whatsappNumber), data.contact.whatsappNumber);

  /* ===== LOCATION CTA ===== */
  setText("#fullAddress", data.location.fullAddress);
  setLink("#mapBtn", data.location.googleMapLink, data.location.googleMapLink);

  /* ===== OPENING HOURS (CLEAN FORMAT) ===== */
  renderTimings(data.openingHours);

  /* ===== PAYMENT ===== */
  if (data.payment.hasPaymentQR && data.flags.showPaymentQR) {
    setImage("#paymentQR", "./assets/payment.png");
  } else {
    hide("#paymentSection");
  }

  // Payment apps
  toggle("#upiBadge", data.payment.upiAccepted);
  toggle("#onlinePayBadge", data.payment.onlinePaymentAccepted);
  toggle("#cashBadge", data.payment.cashAccepted);

  // Extra UPI apps
  toggle("#gpayIcon", data.payment.supportedUpiApps.googlePay);
  toggle("#phonepeIcon", data.payment.supportedUpiApps.phonePe);
  toggle("#paytmIcon", data.payment.supportedUpiApps.paytm);
  toggle("#bhimIcon", data.payment.supportedUpiApps.bhim);

  /* ===== SWIGGY / ZOMATO CTA ===== */
  setLink("#zomatoBtn", data.onlinePlatforms.zomato, data.onlinePlatforms.zomato);
  setLink("#swiggyBtn", data.onlinePlatforms.swiggy, data.onlinePlatforms.swiggy);

  /* ===== SOCIAL MEDIA ===== */
  social("#instaIcon", data.onlinePlatforms.instagram);
  social("#fbIcon", data.onlinePlatforms.facebook);
  social("#googleIcon", data.onlinePlatforms.google);
  social("#websiteIcon", data.onlinePlatforms.website);

  if (!data.flags.showSocialLinks) hide("#socialSection");

  /* ===== TRUST ===== */
  renderBadges(data.trustInfo.badges);
  setText("#aboutText", data.trustInfo.about);
}

/* =======================
   LOAD MENU DATA
======================= */
function loadMenu() {
  fetch("./data/menu.json")
    .then(res => res.json())
    .then(data => renderMenu(data.categories))
    .catch(err => console.error("Menu JSON error:", err));
}

function renderMenu(categories) {
  const container = document.querySelector("#menuContainer");
  container.innerHTML = "";

  categories.forEach(cat => {
    const vegItems = cat.items.filter(i => i.type === "veg");
    const nonVegItems = cat.items.filter(i => i.type === "non-veg");

    const section = document.createElement("section");
    section.className = "menu-category";

    section.innerHTML = `<h2>${cat.name}</h2>`;

    if (vegItems.length) {
      section.appendChild(buildMenuBlock("Veg Items", vegItems, "green"));
    }
    if (nonVegItems.length) {
      section.appendChild(buildMenuBlock("Non-Veg Items", nonVegItems, "red"));
    }

    container.appendChild(section);
  });
}

function buildMenuBlock(title, items, color) {
  const block = document.createElement("div");
  block.style.borderLeft = `4px solid ${color}`;
  block.style.paddingLeft = "8px";
  block.innerHTML = `<h3 style="color:${color}">${title}</h3>`;

  items.forEach(item => {
    const div = document.createElement("div");
    div.className = "menu-item";

    let prices = "";
    item.prices.forEach(p => {
      prices += `<div class="price-line"><span>${p.label}</span><span>₹${p.price}</span></div>`;
    });

    div.innerHTML = `
      <div class="item-header">
        <img class="food-icon" src="/assets/icons/color-icons/${item.type}.svg">
        <strong>${item.name}</strong>
      </div>
      ${prices}
      ${item.description ? `<div class="item-desc">${item.description}</div>` : ""}
    `;
    block.appendChild(div);
  });

  return block;
}

/* =======================
   HELPERS
======================= */
function setText(sel, val) {
  const el = document.querySelector(sel);
  if (el && val) el.textContent = val;
}

function setImage(sel, src) {
  const el = document.querySelector(sel);
  if (el) el.src = src;
}

function setLink(sel, link, condition) {
  const el = document.querySelector(sel);
  if (!el || !condition) return hide(sel);
  el.href = link;
}

function social(sel, link) {
  const el = document.querySelector(sel);
  if (!link) hide(sel);
  else el.href = link;
}

function toggle(sel, condition) {
  if (!condition) hide(sel);
}

function hide(sel) {
  const el = document.querySelector(sel);
  if (el) el.style.display = "none";
}

function clean(num) {
  return num ? num.replace(/\D/g, "") : "";
}

function renderBadges(badges) {
  const box = document.querySelector("#badgeContainer");
  if (!badges || !badges.length) return hide("#badgeContainer");
  box.innerHTML = "";
  badges.forEach(b => {
    const s = document.createElement("span");
    s.className = "badge";
    s.textContent = b;
    box.appendChild(s);
  });
}

function renderTimings(hours) {
  const box = document.querySelector("#timingBox");
  box.innerHTML = "";

  Object.keys(hours).forEach(day => {
    const d = hours[day];
    let line = capitalize(day) + " : ";

    if (d.isClosed) {
      line += "Closed";
    } else {
      line += d.slots
        .map(s => `${s.open} – ${s.close}`)
        .join(" | ");
    }

    const div = document.createElement("div");
    div.textContent = line;
    box.appendChild(div);
  });
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
