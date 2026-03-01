let tableSettings = {
  enabled: false,
  required: false,
  label: "Table Number"
};
let upiConfig = {
  upiId: "",
  payeeName: "",
  autoFillAmount: true
};
let vegModeOnly = false;
let minimumDeliveryMessage = "Minimum order required for delivery";
let orderingEnabled = true;
let minimumDeliveryOrder = 0;
let fullMenuData = [];
let restaurantOpen = true;
let restaurantWhatsapp = "";
let chargesConfig = {
  gst: { enabled: false, percentage: 0 },
  delivery: { enabled: false, amount: 0 },
  packing: { enabled: false, amount: 0 }
};

document.addEventListener("DOMContentLoaded", () => {
  loadBusiness();
});

window.addEventListener("beforeunload", () => {
  if (localStorage.getItem("pendingOrder") === "true") {
    // keep it; user decides on return
  }
});

/* =========================
   LOAD BUSINESS DATA
========================= */
function loadBusiness() {
  fetch("./business.json5")
    .then(res => res.text())
    .then(text => {
      const data = JSON5.parse(text);
      renderBusiness(data);
    })
    .catch(err => console.error("Business JSON5 error:", err));
}

function renderBusiness(data) {

  // ===============================
  // MASTER SITE SWITCH
  // ===============================
  if (data.master && data.master.siteEnabled === false) {
    document.body.innerHTML = `
      <div style="padding:40px;text-align:center;font-family:system-ui">
        <h2>🚫 Restaurant Temporarily Disabled</h2>
        <p>Please check back later.</p>
      </div>
    `;
    return;
  }

  // ===============================
  // WHATSAPP ORDER TOGGLE
  // ===============================
  orderingEnabled = data.master?.whatsAppOrderingEnabled !== false;

  if (!orderingEnabled) {
    showOrderingDisabledBanner();
  }

  // ===============================
  // WHATSAPP NUMBER
  // ===============================
  restaurantWhatsapp = cleanNumber(data.contact?.whatsappNumber || "");

  minimumDeliveryOrder = data.flags?.minimumDeliveryOrder || 0;
  // Load Charges
if (data.charges) {
  chargesConfig.gst.enabled = data.charges.gst?.enabled === true;
  chargesConfig.gst.percentage = data.charges.gst?.percentage || 0;

  chargesConfig.delivery.enabled = data.charges.delivery?.enabled === true;
  chargesConfig.delivery.amount = data.charges.delivery?.amount || 0;

  chargesConfig.packing.enabled = data.charges.packing?.enabled === true;
  chargesConfig.packing.amount = data.charges.packing?.amount || 0;
}
  minimumDeliveryMessage = data.flags?.minimumDeliveryMessage || minimumDeliveryMessage;

  // ===============================
// GOOGLE REVIEW
// ===============================
const reviewLink = data.onlinePlatforms?.googleReview;
const reviewLine = document.getElementById("googleReviewLine");
const reviewBtn = document.getElementById("googleReviewBtn");

if(reviewLink){
  reviewBtn.style.display = "flex";
  reviewBtn.href = reviewLink;
}else{
  reviewBtn.style.display = "none";
}

  // ===============================
  // VEG MODE LOAD
  // ===============================
  vegModeOnly = data.master?.vegModeOnly === true;
const vegToggle = document.getElementById("vegToggle");
const vegSwitch = vegToggle?.closest(".veg-switch");

if (data.identity?.foodType === "veg") {
  vegModeOnly = true;
  if (vegToggle) vegToggle.checked = true;
  if (vegSwitch) vegSwitch.style.display = "none";
} else {
  if (vegSwitch) vegSwitch.style.display = "inline-flex";
}
  // ===============================
  // SERVICE AVAILABILITY CONTROL
  // ===============================
  const services = data.flags?.services || {};

  if (services.dineIn === false) {
    hideServiceOption("optDineIn");
  }
  if (services.delivery === false) {
    hideServiceOption("optDelivery");
  }
  if (services.takeaway === false) {
    hideServiceOption("optTakeaway");
  }
if (services.takeaway === true) {
  const el = document.getElementById("optTakeaway");
  if(el) el.style.display="inline-block";
}
  // ===============================
  // TABLE CONFIG LOAD
  // ===============================
  if (data.flags?.tableConfig) {
    tableSettings = data.flags.tableConfig;

    if (tableSettings.enabled) {
      const label = document.getElementById("tableLabel");
      if (label) {
        label.textContent = tableSettings.required
          ? tableSettings.label + " *"
          : tableSettings.label;
      }
    }
  }

  // Auto-select first available option
  setDefaultService();

  /* ===== LOGO CONTROL ===== */
  const logoEl = document.querySelector("#restaurantLogo");
  if (data.master?.showLogo && data.identity?.hasLogo) {
    setImage("#restaurantLogo", "./assets/logo.png");
  } else if (logoEl) {
    logoEl.style.display = "none";
  }

  /* ===== RESTAURANT NAME ===== */
  setText("#restaurantName", data.identity?.name);
  setText("#categoryLine", data.identity?.categoryLine);

  cartKey = "cart_" + makeSafeId(data.identity?.name || "default");
cart = JSON.parse(localStorage.getItem(cartKey)) || [];

  /* ===== VEG / NON-VEG BADGE ===== */
  const badge = document.createElement("div");
  badge.className =
    data.identity?.foodType === "veg"
      ? "badge veg-badge"
      : "badge nonveg-badge";

  badge.textContent =
    data.identity?.foodType === "veg"
      ? "🟢 Pure Veg Restaurant"
      : data.identity?.foodType === "non-veg"
      ? "🔴 Non-Veg Restaurant"
      : "🔴 Veg & Non-Veg Restaurant";

  const headerEl = document.querySelector(".header");
  if (headerEl) headerEl.appendChild(badge);

  /* ===== CONTACT ===== */
  if (data.master?.showContact === false) {
    hideSection("contactSection");
  }
  setLink("#callPrimary", "tel:" + (data.contact?.primaryPhone || ""));
  setText("#primaryPhoneText", data.contact?.primaryPhone);

  /* Secondary phone (hide if empty) */
  const secondaryRow = document.querySelector("#secondaryPhoneText")?.parentElement;
  if (data.contact?.secondaryPhone) {
    const el = document.querySelector("#secondaryPhoneText");
    if (el) el.textContent = data.contact.secondaryPhone;
  } else if (secondaryRow) {
    secondaryRow.style.display = "none";
  }

  setLink(
    "#whatsappBtn",
    "https://wa.me/" + cleanNumber(data.contact?.whatsappNumber || "")
  );

  /* Email (hide if empty) */
  const emailRow = document.querySelector("#emailText")?.parentElement;
  if (data.contact?.email) {
    const el = document.querySelector("#emailText");
    if (el) el.textContent = data.contact.email;
  } else if (emailRow) {
    emailRow.style.display = "none";
  }

  /* ===== LOCATION (hide if empty) ===== */
  const addressRow = document.querySelector("#fullAddress")?.parentElement;
  if (data.location && data.location.fullAddress) {
    const el = document.querySelector("#fullAddress");
    if (el) el.textContent = data.location.fullAddress;
    setLink("#mapBtn", data.location.googleMapLink);
  } else if (addressRow) {
    addressRow.style.display = "none";
  }

  /* ===== OPENING HOURS ===== */
  if (data.openingHours) {
    renderOpeningHours(data.openingHours);
    checkRestaurantOpen(data.openingHours);
    updateLiveBadge(data.openingHours);

    // Update every minute
    setInterval(() => {
      checkRestaurantOpen(data.openingHours);
      updateLiveBadge(data.openingHours);
    }, 60000);
  }

  if (data.master?.showOpeningHours === false) {
    hideSection("timingSection");
  }

  /* ===== DELIVERY / DINE IN ===== */
  setText(
  "#deliveryInfo",
  data.flags?.deliveryAvailable ? "🚚<br>Delivery<br><span style='font-weight:500;font-size:12px;'>Available</span>" : ""
);
setText(
  "#dineInInfo",
  data.flags?.dineInAvailable ? "🍽️<br>Dine-In<br><span style='font-weight:500;font-size:12px;'>Available</span>" : ""
);
setText(
  "#takeawayInfo",
  data.flags?.services?.takeaway ? "🥡<br>Takeaway<br><span style='font-weight:500;font-size:12px;'>Available</span>" : ""
);

  if (data.master?.showServiceBadges === false) {
    hideSection("serviceSection");
  }

  /* ===== PAYMENT ===== */
  if (data.payment?.enabled) {
    setImage("#paymentQR", "./assets/payment.png");
  }

  if (data.master?.showPaymentSection === false) {
    hideSection("paymentSection");
  }

  // ===============================
  // UPI CONFIG LOAD
  // ===============================
  if (data.payment) {
    upiConfig.upiId = data.payment.upiId || "";
    upiConfig.payeeName = data.payment.payeeName || "";
    upiConfig.autoFillAmount = data.payment.autoFillAmount !== false;
  }

  if (!upiConfig.upiId) {
    const btn = document.getElementById("upiPayBtn");
    if (btn) btn.style.display = "none";
  }

  /* ===== ONLINE PLATFORMS ===== */
  setLink("#zomatoBtn", data.onlinePlatforms?.zomato);
  setLink("#swiggyBtn", data.onlinePlatforms?.swiggy);
// Adjust platform width dynamically
const zomato = data.onlinePlatforms?.zomato;
const swiggy = data.onlinePlatforms?.swiggy;
const wrapper = document.getElementById("platformWrapper");

if(wrapper){
  if(zomato && !swiggy){
    document.getElementById("zomatoBtn").style.flex = "1 1 100%";
    document.getElementById("swiggyBtn").style.display = "none";
  }
  if(swiggy && !zomato){
    document.getElementById("swiggyBtn").style.flex = "1 1 100%";
    document.getElementById("zomatoBtn").style.display = "none";
  }
}
  if (data.master?.showPlatforms === false) {
    hideSection("platformSection");
  }

  // ===============================
// SOCIAL LINKS
// ===============================
setLink("#instaIcon", data.onlinePlatforms?.instagram);
setLink("#facebookIcon", data.onlinePlatforms?.facebook);
setLink("#youtubeIcon", data.onlinePlatforms?.youtube);
setLink("#threadsIcon", data.onlinePlatforms?.threads);
setLink("#snapchatIcon", data.onlinePlatforms?.snapchat);
setLink("#websiteIcon", data.onlinePlatforms?.website);

// Hide empty icons
[
  {id:"#instaIcon",val:data.onlinePlatforms?.instagram},
  {id:"#facebookIcon",val:data.onlinePlatforms?.facebook},
  {id:"#youtubeIcon",val:data.onlinePlatforms?.youtube},
  {id:"#threadsIcon",val:data.onlinePlatforms?.threads},
  {id:"#snapchatIcon",val:data.onlinePlatforms?.snapchat},
  {id:"#websiteIcon",val:data.onlinePlatforms?.website}
].forEach(item=>{
  if(!isVisibleValue(item.val)){
  const el = document.querySelector(item.id);
  if(el) el.style.display="none";
}
});

  if (data.master?.showSocialLinks === false) {
    hideSection("socialSectionCard");
  }

  /* ===== TRUST ===== */
  if (data.trustInfo?.badges) {
    renderBadges(data.trustInfo.badges);
  }
  setText("#aboutText", data.trustInfo?.about);

  if (data.master?.showTrustSection === false) {
    hideSection("trustSection");
  }

  // Load menu after business is ready
  loadMenu();

  // Refresh cart UI now that orderingEnabled is set
  updateCartUI();
}

/* =========================
   LOAD MENU DATA
========================= */
function loadMenu() {
  fetch("./menu.json5")
    .then(res => res.text())
    .then(text => {
      const parsed = JSON5.parse(text);
      fullMenuData = parsed.categories;
      renderMenu(fullMenuData);
    })
    .catch(err => console.error("Menu JSON5 error:", err));
}

function makeSafeId(text){
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-");
}

function renderMenu(categories) {
  const container = document.querySelector("#menuContainer");
  container.innerHTML = "";

  categories.forEach(category => {
    let items = category.items;

    if (vegModeOnly) {
      items = items.filter(i => i.type === "veg");
    }

   if (!items.length) {
  return; // hides empty category
}

    const section = document.createElement("section");
    section.className = "menu-category";
    section.id = "cat-" + category.name.replace(/\s+/g, "-").toLowerCase();
    section.innerHTML = `<h2 class="category-title">${category.name}</h2>`;

    const vegItems = items.filter(i => i.type === "veg");
    const nonVegItems = items.filter(i => i.type === "non-veg");

    if (vegItems.length) {
      section.appendChild(buildMenuBlock("Veg Items", vegItems, "veg"));
    }

    if (nonVegItems.length && !vegModeOnly) {
      section.appendChild(buildMenuBlock("Non-Veg Items", nonVegItems, "nonveg"));
    }

    const divider = document.createElement("div");
    divider.className = "menu-section-divider";
    section.appendChild(divider);

    container.appendChild(section);
  });

  generateCategoryNav();
}

// ===============================
// UPI DEEP LINK
// ===============================
function handleUpiPayment() {
  if (!upiConfig.upiId) {
    showDialog("UPI ID not configured");
    return;
  }

  const type = document.querySelector('input[name="orderType"]:checked')?.value || "Dine-In";
const bill = calculateFinalBill(type);
let amount = upiConfig.autoFillAmount ? bill.finalTotal.toFixed(2) : "";

  let upiUrl = `upi://pay?pa=${encodeURIComponent(upiConfig.upiId)}`;

  if (upiConfig.payeeName) {
    upiUrl += `&pn=${encodeURIComponent(upiConfig.payeeName)}`;
  }

  if (amount) {
    upiUrl += `&am=${amount}&cu=INR`;
  }

  window.location.href = upiUrl;
}

function buildMenuBlock(title, items, type) {
  const block = document.createElement("div");
  block.className = `menu-block ${type}`;
  block.innerHTML = `<h3 class="${type}-title">${title}</h3>`;

  items.forEach(item => {
    const div = document.createElement("div");
    div.className = "menu-item";

    const hasMultiplePrices = item.prices.length > 1;
    const singlePrice = item.prices[0];

    const priceLine = hasMultiplePrices
      ? `<div class="price-line muted">Select option below</div>`
      : `<div class="price-line">₹ ${singlePrice.price}</div>`;

    const priceOptions = hasMultiplePrices
      ? item.prices.map((p, idx) => `
          <label>
            <input type="radio"
              name="price-${makeSafeId(item.name)}"
              value="${p.price}"
              data-label="${p.label}"
              ${idx === 0 ? "checked" : ""}>
            <span>${p.label} – ₹${p.price}</span>
          </label>
        `).join("")
      : "";

    div.innerHTML = `
      <div class="item-header">
        <img class="food-icon" src="/assets/icons/color-icons/${item.type}.svg">
        <div class="item-title-wrap">
          <div class="item-name">${item.name}</div>
          ${priceLine}
        </div>
      </div>

      ${hasMultiplePrices ? `<div class="price-options">${priceOptions}</div>` : ""}

      <div class="cart-actions">
        <button class="qty-btn"
          onclick="${
            hasMultiplePrices
              ? `addSelectedToCart('${item.name}')`
              : `addSinglePriceToCart('${item.name}', '${singlePrice.label}', ${singlePrice.price})`
          }">
          <img src="/assets/icons/black-icons/plus.svg">
        </button>

        <span class="qty-count" id="qty-${makeSafeId(item.name)}">0</span>

        <button class="qty-btn" onclick="removeFromCart('${item.name}')">
          <img src="/assets/icons/black-icons/minus.svg">
        </button>
      </div>

      ${item.description ? `<div class="item-desc">${item.description}</div>` : ""}
    `;

    block.appendChild(div);
  });

  return block;
}

/* =========================
   HELPERS
========================= */
function setText(sel, val) {
  const el = document.querySelector(sel);
  if (!el) return;

  if (!val || (typeof val === "string" && val.trim() === "NO")) {
    const parent = el.parentElement;
    if (parent) parent.style.display = "none";
    return;
  }

  el.innerHTML = val;
}
function isVisibleValue(val) {
  if (!val) return false;
  if (typeof val === "string" && val.trim() === "NO") return false;
  return true;
}
function setImage(sel, src) {
  const el = document.querySelector(sel);
  if (el) el.src = src;
}
function setLink(sel, href) {
  const el = document.querySelector(sel);
  if (el && href) el.href = href;
}
function cleanNumber(num) {
  if (!num) return "";

  // Remove all non-digits
  let cleaned = num.replace(/\D/g, "");

  // If already has country code (more than 10 digits), keep it
  if (cleaned.length > 10) {
    return cleaned;
  }

  // If exactly 10 digits, assume India and add 91
  if (cleaned.length === 10) {
    return "91" + cleaned;
  }

  return cleaned;
}
function renderBadges(badges) {
  const box = document.querySelector("#badgeContainer");
  if (!box) return;
  box.innerHTML = "";
  badges.forEach(b => {
    const s = document.createElement("span");
    s.className = "badge";
    s.textContent = b;
    box.appendChild(s);
  });
}

/* ===== OPENING HOURS ===== */
function renderOpeningHours(hours) {
  const box = document.querySelector("#timingBox");
  if (!box) return;
  box.innerHTML = "";

  Object.keys(hours).forEach(day => {
    const d = hours[day];
    const row = document.createElement("div");
    row.className = "timing-row";

    const left = document.createElement("span");
    left.textContent = capitalize(day);

    const right = document.createElement("span");
    right.textContent = d.isClosed
      ? "Closed"
      : d.slots.map(s => `${toAMPM(s.open)} – ${toAMPM(s.close)}`).join(" | ");

    row.append(left, right);
    box.appendChild(row);
  });
}

function toAMPM(t) {
  let [h, m] = t.split(":").map(Number);
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m.toString().padStart(2, "0")} ${ap}`;
}
function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function calculateFinalBill(orderType) {

  const subtotal = cart.reduce((s, i) => s + i.qty * i.price, 0);

  let gstAmount = 0;
  let deliveryAmount = 0;
  let packingAmount = 0;

  if (chargesConfig.gst.enabled) {
    gstAmount = (subtotal * chargesConfig.gst.percentage) / 100;
  }

  if (orderType === "Delivery" && chargesConfig.delivery.enabled) {
    deliveryAmount = chargesConfig.delivery.amount;
  }

  if (chargesConfig.packing.enabled) {
    packingAmount = chargesConfig.packing.amount;
  }

  const finalTotal = subtotal + gstAmount + deliveryAmount + packingAmount;

  return {
    subtotal,
    gstAmount,
    deliveryAmount,
    packingAmount,
    finalTotal
  };
}
/* =========================
   CART LOGIC
========================= */
let cartKey = "cart_default";
let cart = [];

function addToCart(name, label, price) {
  if (!restaurantOpen) {
    showDialog("Restaurant is currently closed");
    return;
  }
  const existing = cart.find(i => i.name === name && i.label === label);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name, label, price, qty: 1 });
  }
  saveCart();
}

function removeFromCart(name) {
  for (let i = cart.length - 1; i >= 0; i--) {
    if (cart[i].name === name) {
      cart[i].qty -= 1;
      if (cart[i].qty <= 0) {
        cart.splice(i, 1);
      }
      break;
    }
  }
  saveCart();
}

function saveCart() {
  localStorage.setItem(cartKey, JSON.stringify(cart));
  updateCartUI();
}

function updateCartUI() {
  let totalQty = 0;
  let totalPrice = 0;

  document.querySelectorAll(".qty-count").forEach(el => {
    el.textContent = "0";
  });

cart.forEach(i => {
  totalQty += i.qty;
  totalPrice += i.qty * i.price;
});

document.querySelectorAll(".menu-item").forEach(itemEl => {

  const nameEl = itemEl.querySelector(".item-name");
  if (!nameEl) return;

  const itemName = nameEl.textContent.trim();
  const safeId = makeSafeId(itemName);
  const qtyEl = document.getElementById("qty-" + safeId);
  if (!qtyEl) return;

  const selectedRadio = itemEl.querySelector("input[type='radio']:checked");

  if (selectedRadio) {
    const selectedLabel = selectedRadio.dataset.label;

    const cartItem = cart.find(
      c => c.name === itemName && c.label === selectedLabel
    );

    qtyEl.textContent = cartItem ? cartItem.qty : 0;
  } else {
    const cartItem = cart.find(c => c.name === itemName);
    qtyEl.textContent = cartItem ? cartItem.qty : 0;
  }

});

  updateDeliveryNotice();

  const cartItemCount = document.getElementById("cartItemCount");
  const cartTotal = document.getElementById("cartTotal");
  const cartBar = document.getElementById("cartBar");

  if (cartItemCount) cartItemCount.textContent = totalQty;
  if (cartTotal) cartTotal.textContent = totalPrice;

  if (cartBar) {
    if (totalQty > 0 && restaurantOpen && orderingEnabled) {
      cartBar.classList.remove("hidden");
    } else {
      cartBar.classList.add("hidden");
    }
  }
}

// ===============================
// CATEGORY NAV GENERATOR
// ===============================
function generateCategoryNav() {
  const nav = document.getElementById("categoryNav");
  if (!nav) return;

  nav.innerHTML = "";

  const sections = document.querySelectorAll(".menu-category");

  sections.forEach(section => {
    const btn = document.createElement("button");
    btn.textContent = section.querySelector(".category-title").textContent;

    btn.onclick = () => {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    nav.appendChild(btn);
  });

  observeActiveCategory();
}

// ===============================
// ACTIVE CATEGORY OBSERVER
// ===============================
function observeActiveCategory() {
  const buttons = document.querySelectorAll("#categoryNav button");
  const sections = document.querySelectorAll(".menu-category");

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        buttons.forEach(btn => {
          btn.classList.remove("active");
        });

        const activeBtn = Array.from(buttons).find(btn =>
          entry.target.querySelector(".category-title").textContent === btn.textContent
        );

        if (activeBtn) {
          activeBtn.classList.add("active");
        }
      }
    });
  }, {
    rootMargin: "-40% 0px -55% 0px",
    threshold: 0
  });

  sections.forEach(section => observer.observe(section));
}

/* =========================
   RESTAURANT OPEN CHECK
========================= */
function checkRestaurantOpen(hours) {
  const now = new Date();
  const day = now.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const today = hours[day];
  if (!today || today.isClosed) {
    restaurantOpen = false;
    return;
  }

  restaurantOpen = today.slots.some(slot => {
    const [oh, om] = slot.open.split(":").map(Number);
    const [ch, cm] = slot.close.split(":").map(Number);
    const openM = oh * 60 + om;
    const closeM = ch * 60 + cm;
    return currentMinutes >= openM && currentMinutes <= closeM;
  });
}

function updateOrderAvailability() {
  const cartBar = document.getElementById("cartBar");
  if (!restaurantOpen) {
    if (cartBar) cartBar.classList.add("hidden");
  }
}

/* =========================
   WHATSAPP ORDER
========================= */
function setRestaurantWhatsapp(number) {
  restaurantWhatsapp = number;
}

function addSelectedToCart(itemName) {
  if (!restaurantOpen) {
    showDialog("Restaurant is currently closed");
    return;
  }

  const radios = document.querySelectorAll(
  `input[name="price-${makeSafeId(itemName)}"]`
);

  let selectedPrice = null;
  let selectedLabel = "";

  radios.forEach(r => {
    if (r.checked) {
      selectedPrice = Number(r.value);
      selectedLabel = r.dataset.label;
    }
  });

  if (selectedPrice === null) {
    showDialog("Please select a price option");
    return;
  }

  const existing = cart.find(
    i => i.name === itemName && i.label === selectedLabel
  );

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      name: itemName,
      label: selectedLabel,
      price: selectedPrice,
      qty: 1
    });
  }

  saveCart();
}

/* =========================
   CART MODAL
========================= */
function openCartModal() {
  if (cart.length === 0) return;

  renderCartModal();
  document.body.style.overflowY = "hidden";
  document.getElementById("cartModal").classList.remove("hidden");
}

function closeCartModal() {
  document.body.style.overflowY = "auto";
  document.getElementById("cartModal").classList.add("hidden");
}

function renderCartModal() {
  const box = document.getElementById("cartItems");
  box.innerHTML = "";

  let total = 0;

  cart.forEach((item, idx) => {
    total += item.qty * item.price;

    const row = document.createElement("div");
    row.className = "cart-item-row";

    row.innerHTML = `
      <div>
        <strong>${item.name}</strong><br>
        <small>${item.label} – ₹${item.price}</small>
      </div>

      <div class="cart-item-actions">
        <img src="/assets/icons/black-icons/minus.svg" onclick="decreaseFromModal(${idx})">
        <strong>${item.qty}</strong>
        <img src="/assets/icons/black-icons/plus.svg" onclick="increaseFromModal(${idx})">
      </div>
    `;

    box.appendChild(row);
  });

  document.getElementById("modalCartTotal").textContent = total;
}

// ===============================
// LIVE OPEN BADGE
// ===============================
function updateLiveBadge(hours) {
  const badge = document.getElementById("liveOpenBadge");
  if (!badge) return;

  const now = new Date();
  const day = now.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const today = hours[day];

  if (!today || today.isClosed) {
    badge.innerHTML = `
      <span style="background:#fdecea;color:#c62828;padding:5px 12px;border-radius:999px;font-size:13px;font-weight:600;">
        🔴 Closed Today
      </span>
    `;
    return;
  }

  let isOpen = false;
  let nextChange = "";

  today.slots.forEach(slot => {
    const [oh, om] = slot.open.split(":").map(Number);
    const [ch, cm] = slot.close.split(":").map(Number);
    const openM = oh * 60 + om;
    const closeM = ch * 60 + cm;

    if (currentMinutes >= openM && currentMinutes <= closeM) {
      isOpen = true;
      nextChange = `Closes at ${toAMPM(slot.close)}`;
    } else if (currentMinutes < openM && !isOpen) {
      nextChange = `Opens at ${toAMPM(slot.open)}`;
    }
  });

  if (isOpen) {
    badge.innerHTML = `
  <span style="background:#e8f5e9;color:#2e7d32;padding:6px 14px;border-radius:999px;font-size:13px;font-weight:600;display:inline-flex;align-items:center;">
    <span class="live-dot"></span>
    Open Now • ${nextChange}
  </span>
`;
  } else {
    badge.innerHTML = `
      <span style="background:#fdecea;color:#c62828;padding:5px 12px;border-radius:999px;font-size:13px;font-weight:600;">
        🔴 Closed • ${nextChange}
      </span>
    `;
  }
}

function increaseFromModal(index) {
  cart[index].qty += 1;
  saveCart();
  renderCartModal();
}

function decreaseFromModal(index) {
  cart[index].qty -= 1;
  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }
  saveCart();
  renderCartModal();
}

// ===============================
// MENU SEARCH ENGINE
// ===============================
function handleMenuSearch(query) {
  const q = query.trim().toLowerCase();

  if (!q) {
    renderMenu(fullMenuData);
    return;
  }

  const filtered = fullMenuData.map(category => {
    const categoryMatch = category.name.toLowerCase().includes(q);

    const items = category.items.filter(item => {
      if (vegModeOnly && item.type !== "veg") {
        return false;
      }

      const nameMatch = item.name.toLowerCase().includes(q);
      const descMatch = item.description
        ? item.description.toLowerCase().includes(q)
        : false;

      return nameMatch || descMatch || categoryMatch;
    });

    return {
      name: category.name,
      items
    };
  }).filter(cat => cat.items.length > 0);

  renderMenu(filtered);
  if (filtered.length === 0) {
  const container = document.querySelector("#menuContainer");
  container.innerHTML = `
    <div style="text-align:center;padding:30px 10px;font-weight:600;color:#888;">
      No Result Found
    </div>
  `;
}
}

/* =========================
   CHECKOUT LOGIC
========================= */
function openCheckout() {
  if (!cart || cart.length === 0) {
    showDialog("Your cart is empty. Please add items before checkout.");
    return;
  }

  const total = cart.reduce((s, i) => s + i.qty * i.price, 0);

  if (total <= 0) {
    showDialog("Please add valid items to proceed.");
    return;
  }

  closeCartModal();

  const checkout = document.getElementById("checkoutModal");
  const addressBox = document.getElementById("addressBox");

  checkout.classList.remove("hidden");
  document.body.style.overflowY = "hidden";

  addressBox.classList.add("hidden");
  addressBox.style.display = "none";

  const dineIn = document.querySelector('input[name="orderType"][value="Dine-In"]');
  if (dineIn) {
    dineIn.checked = true;
  }

  toggleAddress();
}

function closeCheckout() {
  document.getElementById("checkoutModal").classList.add("hidden");
  document.body.style.overflowY = "auto";
}

document.addEventListener("change", function (e) {
  if (e.target.name === "orderType") {
    toggleAddress();
  }
});

function toggleAddress() {
  const addressBox = document.getElementById("addressBox");
  const tableBox = document.getElementById("tableBox");
  const selected = document.querySelector('input[name="orderType"]:checked');

  if (addressBox) {
    addressBox.classList.add("hidden");
    addressBox.style.display = "none";
  }

  if (tableBox) {
    tableBox.classList.add("hidden");
    tableBox.style.display = "none";
  }

  if (!selected) return;

  if (selected.value === "Delivery" && addressBox) {
    addressBox.classList.remove("hidden");
    addressBox.style.display = "block";
  }

  if (selected.value === "Dine-In" && tableSettings.enabled && tableBox) {
    tableBox.classList.remove("hidden");
    tableBox.style.display = "block";
  }

  updateDeliveryNotice();
}

function finalPlaceOrder() {
  if (!orderingEnabled) {
    showDialog("Online ordering is currently disabled");
    return;
  }

  if (!restaurantOpen) {
    showDialog("Restaurant is currently closed");
    return;
  }

  if (!cart || cart.length === 0) {
    showDialog("Your cart is empty. Please add items.");
    return;
  }

  const total = cart.reduce((s, i) => s + i.qty * i.price, 0);
  if (total <= 0) {
    showDialog("Invalid order. Please add items again.");
    return;
  }

  const name = document.getElementById("customerName").value.trim();
  if (!name) {
    showDialog("Please enter customer name");
    return;
  }

  const type = document.querySelector('input[name="orderType"]:checked')?.value;
  let tableNumber = "";

  if (type === "Dine-In" && tableSettings.enabled) {
    tableNumber = document.getElementById("tableNumber")?.value.trim() || "";

    if (tableSettings.required && !tableNumber) {
      showDialog("Please enter table number");
      return;
    }
  }

  if (type === "Delivery" && minimumDeliveryOrder > 0 && total < minimumDeliveryOrder) {
    const remaining = minimumDeliveryOrder - total;
    showDialog(
      `${minimumDeliveryMessage}: ₹${minimumDeliveryOrder}\nAdd ₹${remaining} more to proceed.`
    );
    return;
  }

  let address = "";
  if (type === "Delivery") {
    address = document.getElementById("deliveryAddress")?.value.trim() || "";
    if (!address) {
      showDialog("Please enter delivery address");
      return;
    }
  }

  showOrderPreview(name, type, tableNumber, address);
}

function showOrderPreview(name, type, tableNumber, address) {

  const bill = calculateFinalBill(type);

  let html = "";

  cart.forEach((item, index) => {
    html += `
      <div style="margin-bottom:6px;">
        ${index + 1}. ${item.name} (${item.label}) x ${item.qty}
        <div style="font-size:12px;color:#666;">
          ₹${item.qty * item.price}
        </div>
      </div>
    `;
  });

  html += `<hr style="margin:10px 0;">`;

  html += `<div>Subtotal: ₹${bill.subtotal}</div>`;

  if (bill.gstAmount > 0) {
    html += `<div>GST (${chargesConfig.gst.percentage}%): ₹${bill.gstAmount.toFixed(2)}</div>`;
  }

  if (bill.deliveryAmount > 0) {
    html += `<div>Delivery Charge: ₹${bill.deliveryAmount}</div>`;
  }

  if (bill.packingAmount > 0) {
    html += `<div>Packing Charge: ₹${bill.packingAmount}</div>`;
  }

  html += `<hr style="margin:10px 0;">`;
  html += `<div style="font-weight:800;">Total: ₹${bill.finalTotal.toFixed(2)}</div>`;

  document.getElementById("previewContent").innerHTML = html;

  window.previewData = { name, type, tableNumber, address, bill };

  document.getElementById("orderPreviewModal").classList.remove("hidden");
}

function closeOrderPreview() {
  document.getElementById("orderPreviewModal").classList.add("hidden");
}
function confirmAndSend() {

  const { name, type, tableNumber, address, bill } = window.previewData;

  let message = "🛒 *NEW ORDER* \n\n";

  cart.forEach((item, index) => {
    message += `${index + 1}. ${item.name} (${item.label}) x ${item.qty} = ₹${item.qty * item.price}\n`;
  });

  message += `\n*--------------------------------------*\n`;
  message += `Subtotal: ₹${bill.subtotal}\n`;

  if (bill.gstAmount > 0)
    message += `GST (${chargesConfig.gst.percentage}%): ₹${bill.gstAmount.toFixed(2)}\n`;

  if (bill.deliveryAmount > 0)
    message += `Delivery: ₹${bill.deliveryAmount}\n`;

  if (bill.packingAmount > 0)
    message += `Packing: ₹${bill.packingAmount}\n`;

  message += `*=====================================*\n`;
  message += `*Total Amount: ₹${bill.finalTotal.toFixed(2)}*\n`;
  message += `*=====================================*\n\n`;

  message += `*Customer Name:* ${name}\n`;
  message += `*Order Type:* ${type}\n`;

  if (type === "Dine-In" && tableNumber)
    message += `*Table Number:* ${tableNumber}\n`;

  if (type === "Delivery")
    message += `*Delivery Address:* ${address}\n`;

  localStorage.setItem("pendingOrder", "true");

  const url = "https://wa.me/" +
    restaurantWhatsapp +
    "?text=" +
    encodeURIComponent(message);

  window.open(url, "_blank");

  closeOrderPreview();
}
function addSinglePriceToCart(name, label, price) {
  if (!restaurantOpen) {
    showDialog("Restaurant is currently closed");
    return;
  }

  const existing = cart.find(i => i.name === name && i.label === label);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name, label, price, qty: 1 });
  }

  saveCart();
}

function showWaConfirm() {
  document.getElementById("waConfirmModal").classList.remove("hidden");
  document.body.style.overflowY = "hidden";
}

function closeWaConfirm() {
  document.getElementById("waConfirmModal").classList.add("hidden");
  document.body.style.overflowY = "auto";
}

function waNotSent() {
  closeWaConfirm();
}

function showDialog(message, title = "Notice") {
  document.getElementById("dialogTitle").textContent = title;
  document.getElementById("dialogMessage").textContent = message;
  document.getElementById("appDialog").classList.remove("hidden");
  document.body.style.overflowY = "hidden";
}

function closeDialog() {
  document.getElementById("appDialog").classList.add("hidden");
  document.body.style.overflowY = "auto";
}

function waSent() {
  cart = [];
  localStorage.removeItem(cartKey);
  localStorage.removeItem("pendingOrder");
  saveCart();

  closeWaConfirm();

  const cartModal = document.getElementById("cartModal");
  if (cartModal) cartModal.classList.add("hidden");

  const checkoutModal = document.getElementById("checkoutModal");
  if (checkoutModal) checkoutModal.classList.add("hidden");

  document.body.style.overflowY = "auto";

  const cartBar = document.getElementById("cartBar");
  if (cartBar) cartBar.classList.add("hidden");

  showOrderSuccess();
  waPopupShown = false;
localStorage.removeItem("pendingWhatsAppOrder");
}

// ===============================
// SAFE CLEAR CART
// ===============================

function clearCart() {
  cart = [];
  localStorage.removeItem(cartKey);
  localStorage.removeItem("pendingOrder");
  updateCartUI();
  closeCartModal();
  localStorage.removeItem("pendingWhatsAppOrder");
}

function showOrderSuccess() {
  if (document.getElementById("orderSuccessOverlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "orderSuccessOverlay";

  overlay.innerHTML = `
    <div class="order-success-box">
      <h2>✅ Order Sent Successfully</h2>
      <p>
        Order sent successfully via WhatsApp.<br>We will contact you shortly.
      </p>
      <button onclick="closeOrderSuccess()">OK</button>
    </div>
  `;

  document.body.appendChild(overlay);
}

function closeOrderSuccess() {
  const el = document.getElementById("orderSuccessOverlay");
  if (el) el.remove();
}

// ===============================
// WHATSAPP RETURN DETECTION (MOBILE SAFE)
// ===============================
let waPopupShown = false;

document.addEventListener("visibilitychange", () => {
  if (
    document.visibilityState === "visible" &&
    localStorage.getItem("pendingOrder") === "true" &&
    !waPopupShown
  ) {
    waPopupShown = true;
    setTimeout(showWaConfirm, 400);
  }
});


// ===============================
// UNIVERSAL SECTION HIDE
// ===============================
function hideSection(id) {
  const el = document.getElementById(id);
  if (el) {
    el.style.display = "none";
  }
}

// ===============================
// ORDER DISABLED BANNER
// ===============================
function showOrderingDisabledBanner() {
  const banner = document.createElement("div");
  banner.style.background = "#fff3cd";
  banner.style.color = "#856404";
  banner.style.padding = "12px";
  banner.style.margin = "12px";
  banner.style.borderRadius = "12px";
  banner.style.fontWeight = "600";
  banner.style.textAlign = "center";
  banner.textContent = "⚠ Online ordering is currently disabled.";

  document.body.insertBefore(banner, document.body.firstChild);
}

// ===============================
// SERVICE OPTION CONTROL
// ===============================
function hideServiceOption(id) {
  const el = document.getElementById(id);
  if (el) {
    el.style.display = "none";
  }
}

function setDefaultService() {
  const radios = document.querySelectorAll('input[name="orderType"]');
  for (let r of radios) {
    if (r.closest("label").style.display !== "none") {
      r.checked = true;
      break;
    }
  }
}

// ===============================
// DELIVERY MINIMUM LIVE CHECK
// ===============================
function updateDeliveryNotice() {
  const selected = document.querySelector('input[name="orderType"]:checked');
  const notice = document.getElementById("deliveryNotice");

  if (!selected || !notice) {
    return;
  }

  const total = cart.reduce((s, i) => s + i.qty * i.price, 0);

  if (selected.value === "Delivery" && minimumDeliveryOrder > 0) {
    if (total < minimumDeliveryOrder) {
      const remaining = minimumDeliveryOrder - total;
      notice.style.display = "block";
      notice.textContent =
        `${minimumDeliveryMessage}: ₹${minimumDeliveryOrder} | Add ₹${remaining} more`;
    } else {
      notice.style.display = "none";
    }
  } else {
    notice.style.display = "none";
  }
}

// ===============================
// SEARCH LISTENER
// ===============================
document.addEventListener("input", function (e) {
  if (e.target.id === "menuSearch") {
    handleMenuSearch(e.target.value);
  }
});

document.addEventListener("click", function (e) {
  if (e.target.id === "upiPayBtn") {
    handleUpiPayment();
  }
  if (e.target.id === "clearCartBtn") {
  clearCart();
}
});
// ===============================
// VEG TOGGLE SWITCH
// ===============================
document.addEventListener("change", function(e){
  if (e.target.matches(".price-options input[type='radio']")) {
  updateCartUI();
}
  if(e.target.id === "vegToggle"){
    vegModeOnly = e.target.checked;
    renderMenu(fullMenuData);
  }
});
