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

  setRestaurantWhatsapp(cleanNumber(data.contact.whatsappNumber));
  checkRestaurantOpen(data.openingHours);
  updateOrderAvailability();
  /* ===== BASIC INFO ===== */
  setText("#restaurantName", data.identity.name);
  setText("#categoryLine", data.identity.categoryLine);

  if (data.identity.hasLogo) {
    setImage("#restaurantLogo", "./assets/logo.png");
  }

  /* ===== VEG / NON-VEG BADGE ===== */
  const badge = document.createElement("div");
  badge.className =
    data.identity.foodType === "veg"
      ? "badge veg-badge"
      : data.identity.foodType === "non-veg"
      ? "badge nonveg-badge"
      : "badge nonveg-badge";

  badge.textContent =
    data.identity.foodType === "veg"
      ? "🟢 Pure Veg Restaurant"
      : data.identity.foodType === "non-veg"
      ? "🔴 Non-Veg Restaurant"
      : "🔴 Veg & Non-Veg Restaurant";

  document.querySelector(".header").appendChild(badge);

  /* ===== CONTACT ===== */
  setLink("#callPrimary", "tel:" + data.contact.primaryPhone);
  setText("#primaryPhoneText", data.contact.primaryPhone);

  /* Secondary phone (hide if empty) */
  const secondaryRow = document.querySelector("#secondaryPhoneText")?.parentElement;
  if (data.contact.secondaryPhone) {
    document.querySelector("#secondaryPhoneText").textContent = data.contact.secondaryPhone;
  } else if (secondaryRow) {
    secondaryRow.style.display = "none";
  }

  setLink(
    "#whatsappBtn",
    "https://wa.me/" + cleanNumber(data.contact.whatsappNumber)
  );

  /* Email (hide if empty) */
  const emailRow = document.querySelector("#emailText")?.parentElement;
  if (data.contact.email) {
    document.querySelector("#emailText").textContent = data.contact.email;
  } else if (emailRow) {
    emailRow.style.display = "none";
  }

  /* ===== LOCATION (hide if empty) ===== */
  const addressRow = document.querySelector("#fullAddress")?.parentElement;
  if (data.location && data.location.fullAddress) {
    document.querySelector("#fullAddress").textContent = data.location.fullAddress;
    setLink("#mapBtn", data.location.googleMapLink);
  } else if (addressRow) {
    addressRow.style.display = "none";
  }

  /* ===== OPENING HOURS ===== */
  renderOpeningHours(data.openingHours);

  /* ===== DELIVERY / DINE IN ===== */
  setText(
    "#deliveryInfo",
    data.flags.deliveryAvailable ? "🚚 Delivery Available" : ""
  );
  setText(
    "#dineInInfo",
    data.flags.dineInAvailable ? "🍽️ Dine-In Available" : ""
  );

  /* ===== PAYMENT ===== */
  if (data.payment.enabled) {
    setImage("#paymentQR", "./assets/payment.png");
  }

  /* ===== ONLINE PLATFORMS (NO CHANGE) ===== */
  setLink("#zomatoBtn", data.onlinePlatforms.zomato);
  setLink("#swiggyBtn", data.onlinePlatforms.swiggy);
  setLink("#instaIcon", data.onlinePlatforms.instagram);
  setLink("#fbIcon", data.onlinePlatforms.facebook);
  setLink("#googleIcon", data.onlinePlatforms.google);
  setLink("#websiteIcon", data.onlinePlatforms.website);

  /* ===== TRUST ===== */
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

    section.innerHTML = `<h2 class="category-title">${category.name}</h2>`;

    const vegItems = category.items.filter(i => i.type === "veg");
    const nonVegItems = category.items.filter(i => i.type === "non-veg");

    if (vegItems.length) {
      section.appendChild(buildMenuBlock("Veg Items", vegItems, "veg"));
    }
    if (nonVegItems.length) {
      section.appendChild(buildMenuBlock("Non-Veg Items", nonVegItems, "nonveg"));
    }

    const divider = document.createElement("div");
    divider.className = "menu-section-divider";
    section.appendChild(divider);

    container.appendChild(section);
  });
}

function buildMenuBlock(title, items, type) {
  const block = document.createElement("div");
  block.className = `menu-block ${type}`;
  block.innerHTML = `<h3 class="${type}-title">${title}</h3>`;

  items.forEach(item => {
    const div = document.createElement("div");
    div.className = "menu-item";

    const hasMultiplePrices = item.prices.length > 1;

    // RADIO OPTIONS (sirf jab 2+ prices ho)
    const priceOptions = hasMultiplePrices
      ? item.prices.map((p, idx) => `
          <label style="display:flex;align-items:center;gap:6px;font-size:13px;">
            <input type="radio"
                   name="price-${item.name.replace(/\s/g,'')}"
                   value="${p.price}"
                   data-label="${p.label}"
                   ${idx === 0 ? "checked" : ""}>
            ${p.label} – ₹${p.price}
          </label>
        `).join("")
      : "";

    div.innerHTML = `
      <div class="item-header">
        <img class="food-icon" src="/assets/icons/color-icons/${item.type}.svg">
        <strong>${item.name}</strong>
      </div>

      ${hasMultiplePrices ? `<div class="price-options">${priceOptions}</div>` : ""}

      <div class="cart-actions">
        <button class="qty-btn"
          onclick="${
            hasMultiplePrices
              ? `addSelectedToCart('${item.name}')`
              : `addSinglePriceToCart('${item.name}', '${item.prices[0].label}', ${item.prices[0].price})`
          }">
          <img src="/assets/icons/black-icons/plus.svg">
        </button>

        <span class="qty-count" id="qty-${item.name.replace(/\s/g,'')}">0</span>

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
  if (el && val !== undefined) el.textContent = val;
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
  return num ? num.replace(/\D/g, "") : "";
}
function renderBadges(badges) {
  const box = document.querySelector("#badgeContainer");
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

/* =========================
   CART LOGIC (BASIC)
========================= */

let cart = JSON.parse(localStorage.getItem("cart")) || [];

function addToCart(name, label, price){
  if(!restaurantOpen){
  alert("Restaurant is currently closed");
  return;
}
  const existing = cart.find(i => i.name === name);

  if(existing){
    existing.qty += 1;
  } else {
    cart.push({ name, label, price, qty: 1 });
  }

  saveCart();
}

function removeFromCart(name){
  const index = cart.findIndex(i => i.name === name);
  if(index > -1){
    cart[index].qty -= 1;
    if(cart[index].qty <= 0){
      cart.splice(index, 1);
    }
    saveCart();
  }
}

function saveCart(){
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();
}

function updateCartUI(){
  let totalQty = 0;
  let totalPrice = 0;

  // reset all qty labels to 0
  document.querySelectorAll(".qty-count").forEach(el=>{
    el.textContent = "0";
  });

  cart.forEach(i => {
    totalQty += i.qty;
    totalPrice += i.qty * i.price;

    const id = "qty-" + i.name.replace(/\s/g,'');
    const qtyEl = document.getElementById(id);
    if(qtyEl){
      qtyEl.textContent = i.qty;
    }
  });

  document.getElementById("cartItemCount").textContent = totalQty;
  document.getElementById("cartTotal").textContent = totalPrice;

  if(totalQty > 0 && restaurantOpen){
    document.getElementById("cartBar").classList.remove("hidden");
  } else {
    document.getElementById("cartBar").classList.add("hidden");
  }
}

/* =========================
   RESTAURANT OPEN CHECK
========================= */

let restaurantOpen = true;

function checkRestaurantOpen(hours){
  const now = new Date();
  const day = now.toLocaleDateString("en-US",{ weekday:"long" }).toLowerCase();
  const currentMinutes = now.getHours()*60 + now.getMinutes();

  const today = hours[day];
  if(!today || today.isClosed){
    restaurantOpen = false;
    return;
  }

  restaurantOpen = today.slots.some(slot=>{
    const [oh,om] = slot.open.split(":").map(Number);
    const [ch,cm] = slot.close.split(":").map(Number);
    const openM = oh*60+om;
    const closeM = ch*60+cm;
    return currentMinutes >= openM && currentMinutes <= closeM;
  });
}

function updateOrderAvailability(){
  const cartBar = document.getElementById("cartBar");
  const msgId = "closedMsg";

  let msg = document.getElementById(msgId);
  if(!restaurantOpen){
    if(!msg){
      msg = document.createElement("div");
      msg.id = msgId;
      msg.style.background = "#fdecea";
      msg.style.color = "#c62828";
      msg.style.padding = "12px";
      msg.style.margin = "12px";
      msg.style.borderRadius = "12px";
      msg.style.fontWeight = "700";
      msg.textContent = "🚫 Restaurant Closed – Please visit during opening hours";
      document.body.insertBefore(msg, document.body.firstChild);
    }
    cartBar.classList.add("hidden");
  } else {
    if(msg) msg.remove();
  }
}

/* =========================
   WHATSAPP ORDER
========================= */

let restaurantWhatsapp = "";

function setRestaurantWhatsapp(number){
  restaurantWhatsapp = number;
}



updateCartUI();
function addSelectedToCart(itemName){
  if(!restaurantOpen){
    alert("Restaurant is currently closed");
    return;
  }

  const radios = document.querySelectorAll(
    `input[name="price-${itemName.replace(/\s/g,'')}"]`
  );

  let selectedPrice = null;
  let selectedLabel = "";

  radios.forEach(r=>{
    if(r.checked){
      selectedPrice = Number(r.value);
      selectedLabel = r.dataset.label;
    }
  });

  if(selectedPrice === null){
    alert("Please select a price option");
    return;
  }

  const existing = cart.find(
    i => i.name === itemName && i.label === selectedLabel
  );

  if(existing){
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

function openCartModal(){
  
  if(cart.length === 0) return;

  renderCartModal();
  document.body.style.overflow = "hidden";
  document.getElementById("cartModal").classList.remove("hidden");
}

function closeCartModal(){
  document.body.style.overflow = "";
  document.getElementById("cartModal").classList.add("hidden");
}

function renderCartModal(){
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

function increaseFromModal(index){
  cart[index].qty += 1;
  saveCart();
  renderCartModal();
}

function decreaseFromModal(index){
  cart[index].qty -= 1;
  if(cart[index].qty <= 0){
    cart.splice(index,1);
  }
  saveCart();
  renderCartModal();
}
/* =========================
   CHECKOUT LOGIC
========================= */

function openCheckout(){
  closeCartModal();

  const checkout = document.getElementById("checkoutModal");
  const addressBox = document.getElementById("addressBox");

  checkout.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  // 🔒 HARD RESET (IMPORTANT)
  addressBox.classList.add("hidden");

  // force Dine-In checked (safety)
  const dineInRadio = document.querySelector('input[name="orderType"][value="Dine-In"]');
  if(dineInRadio){
    dineInRadio.checked = true;
  }

  // now apply logic
  toggleAddress();
}

function closeCheckout(){
  document.getElementById("checkoutModal").classList.add("hidden");
  document.body.style.overflow = "";
}

document.addEventListener("change", function(e){
  if(e.target.name === "orderType"){
    toggleAddress();
  }
});

function toggleAddress(){
  const box = document.getElementById("addressBox");
  const selected = document.querySelector('input[name="orderType"]:checked');

  // default safe state
  box.classList.add("hidden");

  if(selected && selected.value === "Delivery"){
    box.classList.remove("hidden");
  }
}

function finalPlaceOrder(){
  if(!restaurantOpen){
    alert("Restaurant is currently closed");
    return;
  }

  const name = document.getElementById("customerName").value.trim();
  if(!name){
    alert("Please enter customer name");
    return;
  }

  const type = document.querySelector('input[name="orderType"]:checked').value;
  let address = "";

  if(type === "Delivery"){
    address = document.getElementById("deliveryAddress").value.trim();
    if(!address){
      alert("Please enter delivery address");
      return;
    }
  }

  // -------- CLEAN WHATSAPP MESSAGE (NO EMOJI) --------
  let message = "New Order\n\n";

  cart.forEach((item, index) => {
    message += `${index+1}. ${item.name} (${item.label}) x ${item.qty} = Rs ${item.qty * item.price}\n`;
  });

  const total = cart.reduce((s,i)=>s+i.qty*i.price,0);

  message += `\nTotal: Rs ${total}\n`;
  message += `\nCustomer: ${name}\n`;
  message += `Order Type: ${type}\n`;

  if(type === "Delivery"){
    message += `Address: ${address}\n`;
  }

  const url =
    "https://wa.me/" +
    restaurantWhatsapp +
    "?text=" +
    encodeURIComponent(message);

  window.open(url, "_blank");
}
function addSinglePriceToCart(name, label, price){
  if(!restaurantOpen){
    alert("Restaurant is currently closed");
    return;
  }

  const existing = cart.find(i => i.name === name && i.label === label);

  if(existing){
    existing.qty += 1;
  } else {
    cart.push({ name, label, price, qty: 1 });
  }

  saveCart();
}
