document.addEventListener("DOMContentLoaded", () => {
  loadBusiness();
  loadMenu();
});

/* =========================
   LOAD BUSINESS DATA
========================= */
function loadBusiness() {
  fetch("./data/business.json")
    .then(res => res.json())
    .then(data => renderBusiness(data))
    .catch(err => console.error("Business JSON error:", err));
}

function renderBusiness(data) {

  /* ===== BASIC INFO ===== */
  setText("#restaurantName", data.identity.name);
  setText("#categoryLine", data.identity.categoryLine);

  // Logo
  if (data.identity.hasLogo) {
    setImage("#restaurantLogo", "./assets/logo.png");
  }

  /* ===== VEG / NON-VEG BADGE ===== */
  const badge = document.createElement("div");
  badge.className = "badge";
  badge.textContent =
    data.identity.foodType === "veg"
      ? "🟢 Pure Veg Restaurant"
      : "🔴 Veg & Non-Veg Restaurant";
  document.querySelector(".header").appendChild(badge);

  /* ===== CONTACT (SHOW ALL IF PRESENT) ===== */
  setLink("#callPrimary", "tel:" + data.contact.primaryPhone);
  setText("#primaryPhoneText", data.contact.primaryPhone);

  if (data.contact.secondaryPhone) {
    setText("#secondaryPhoneText", data.contact.secondaryPhone);
  }

  setLink(
    "#whatsappBtn",
    "https://wa.me/" + cleanNumber(data.contact.whatsappNumber)
  );

  if (data.contact.email) {
    setText("#emailText", data.contact.email);
  }

  /* ===== LOCATION ===== */
  setText("#fullAddress", data.location.fullAddress);
  setLink("#mapBtn", data.location.googleMapLink);

  /* ===== OPENING HOURS (AM/PM + COLUMN LOOK) ===== */
  renderOpeningHours(data.openingHours);

  /* ===== PAYMENT (SIMPLE LOGIC) ===== */
  if (data.payment.enabled) {
    setImage("#paymentQR", "./assets/payment.png");
  }

  /* ===== ONLINE PLATFORMS ===== */
  setLink("#zomatoBtn", data.onlinePlatforms.zomato);
  setLink("#swiggyBtn", data.onlinePlatforms.swiggy);

  setLink("#instaIcon", data.onlinePlatforms.instagram);
  setLink("#fbIcon", data.onlinePlatforms.facebook);
  setLink("#googleIcon", data.onlinePlatforms.google);
  setLink("#websiteIcon", data.onlinePlatforms.website);

  /* ===== TRUST INFO ===== */
  renderBadges(data.trustInfo.badges);
  setText("#aboutText", data.trustInfo.about);
}

/* =========================
   LOAD MENU DATA
========================= */
function loadMenu() {
  fetch("./data/menu.json")
    .then(res => res.json())
    .then(data => renderMenu(data.categories))
    .catch(err => console.error("Menu JSON error:", err));
}

function renderMenu(categories) {
  const container = document.querySelector("#menuContainer");
  container.innerHTML = "";

  categories.forEach(category => {
    const section = document.createElement("section");
    section.className = "menu-category";

    // Category Title (bigger handled by CSS)
    section.innerHTML = `<h2>${category.name}</h2>`;

    const vegItems = category.items.filter(i => i.type === "veg");
    const nonVegItems = category.items.filter(i => i.type === "non-veg");

    if (vegItems.length) {
      section.appendChild(buildMenuBlock("Veg Items", vegItems, "veg"));
    }

    if (nonVegItems.length) {
      section.appendChild(buildMenuBlock("Non-Veg Items", nonVegItems, "nonveg"));
    }

    // Divider after category
    const divider = document.createElement("div");
    divider.className = "menu-divider";
    divider.textContent = `— End of ${category.name} —`;
    section.appendChild(divider);

    container.appendChild(section);
  });
}

function buildMenuBlock(title, items, type) {
  const block = document.createElement("div");
  block.className = `menu-block ${type}`;

  block.innerHTML = `<h3>${title}</h3>`;

  items.forEach(item => {
    const itemDiv = document.createElement("div");
    itemDiv.className = "menu-item";

    let pricesHTML = "";
    item.prices.forEach(p => {
      pricesHTML += `
        <div class="price-line">
          <span>${p.label}</span>
          <span>₹${p.price}</span>
        </div>
      `;
    });

    itemDiv.innerHTML = `
      <div class="item-header">
        <img class="food-icon" src="/assets/icons/color-icons/${item.type}.svg">
        <strong>${item.name}</strong>
      </div>
      ${pricesHTML}
      ${item.description ? `<div class="item-desc">${item.description}</div>` : ""}
    `;

    block.appendChild(itemDiv);
  });

  return block;
}

/* =========================
   HELPERS
========================= */

function setText(selector, value) {
  const el = document.querySelector(selector);
  if (el && value) el.textContent = value;
}

function setImage(selector, src) {
  const el = document.querySelector(selector);
  if (el) el.src = src;
}

function setLink(selector, href) {
  const el = document.querySelector(selector);
  if (el && href) el.href = href;
}

function cleanNumber(num) {
  return num ? num.replace(/\D/g, "") : "";
}

function renderBadges(badges) {
  const box = document.querySelector("#badgeContainer");
  box.innerHTML = "";
  badges.forEach(b => {
    const span = document.createElement("span");
    span.className = "badge";
    span.textContent = b;
    box.appendChild(span);
  });
}

/* ===== OPENING HOURS (AM/PM + ALIGNMENT) ===== */
function renderOpeningHours(hours) {
  const box = document.querySelector("#timingBox");
  box.innerHTML = "";

  Object.keys(hours).forEach(day => {
    const d = hours[day];
    const row = document.createElement("div");
    row.className = "timing-row";

    const dayCol = document.createElement("span");
    dayCol.className = "timing-day";
    dayCol.textContent = capitalize(day);

    const timeCol = document.createElement("span");
    timeCol.className = "timing-time";

    if (d.isClosed) {
      timeCol.textContent = "Closed";
    } else {
      timeCol.textContent = d.slots
        .map(s => `${toAMPM(s.open)} – ${toAMPM(s.close)}`)
        .join(" | ");
    }

    row.appendChild(dayCol);
    row.appendChild(timeCol);
    box.appendChild(row);
  });
}

function toAMPM(time) {
  let [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
