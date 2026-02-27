document.addEventListener("DOMContentLoaded", () => {
  loadBusiness();
  loadMenu();
});
let tableSettings = {
  enabled: false,
  required: false,
  label: "Table Number"
};
let orderingEnabled = true;
let minimumDeliveryOrder = 0;
/* =========================
   LOAD BUSINESS DATA
========================= */
fetch("./business.json5")
  .then(res => res.text())
  .then(text => {
    const data = JSON5.parse(text);
    renderBusiness(data);
  })
  .catch(err => console.error("Business JSON5 error:", err));

window.addEventListener("beforeunload", ()=>{
  if(localStorage.getItem("pendingOrder")==="true"){
    // keep it; user decides on return
  }
});

function renderBusiness(data) {

  // ===============================
  // MASTER SITE SWITCH
  // ===============================
  if(data.master && data.master.siteEnabled === false){
    document.body.innerHTML = `
      <div style="padding:40px;text-align:center;font-family:system-ui">
        <h2>🚫 Restaurant Temporarily Disabled</h2>
        <p>Please check back later.</p>
      </div>
    `;
    return;
    // ===============================
// WHATSAPP ORDER TOGGLE
// ===============================
orderingEnabled = data.master?.whatsAppOrderingEnabled !== false;

if(!orderingEnabled){
  showOrderingDisabledBanner();
}
  }

  minimumDeliveryOrder = data.flags?.minimumDeliveryOrder || 0;
// ===============================
// SERVICE AVAILABILITY CONTROL
// ===============================
const services = data.flags?.services || {};

if(services.dineIn === false){
  hideServiceOption("optDineIn");
}

if(services.delivery === false){
  hideServiceOption("optDelivery");
}

if(services.takeaway === false){
  hideServiceOption("optTakeaway");
}
// ===============================
// TABLE CONFIG LOAD
// ===============================
if(data.flags?.tableConfig){
  tableSettings = data.flags.tableConfig;

  if(tableSettings.enabled){
    const label = document.getElementById("tableLabel");
    if(label){
      label.textContent = tableSettings.required
        ? tableSettings.label + " *"
        : tableSettings.label;
    }
  }
}
// Auto-select first available option
setDefaultService();
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
  // CONTACT MASTER CONTROL
if(data.master?.showContact === false){
  hideSection("contactSection");
}
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
if(data.master?.showOpeningHours === false){
  hideSection("timingSection");
}
  /* ===== DELIVERY / DINE IN ===== */
  setText(
    "#deliveryInfo",
    data.flags.deliveryAvailable ? "🚚 Delivery Available" : ""
  );
  setText(
    "#dineInInfo",
    data.flags.dineInAvailable ? "🍽️ Dine-In Available" : ""
  );
if(data.master?.showServiceBadges === false){
  hideSection("serviceSection");
}
  /* ===== PAYMENT ===== */
  if (data.payment.enabled) {
    setImage("#paymentQR", "./assets/payment.png");
  }
if(data.master?.showPaymentSection === false){
  hideSection("paymentSection");
}
  /* ===== ONLINE PLATFORMS (NO CHANGE) ===== */
  setLink("#zomatoBtn", data.onlinePlatforms.zomato);
  setLink("#swiggyBtn", data.onlinePlatforms.swiggy);
  if(data.master?.showPlatforms === false){
  hideSection("platformSection");
}
  setLink("#instaIcon", data.onlinePlatforms.instagram);
  setLink("#fbIcon", data.onlinePlatforms.facebook);
  setLink("#googleIcon", data.onlinePlatforms.google);
  setLink("#websiteIcon", data.onlinePlatforms.website);
  if(data.master?.showSocialLinks === false){
  hideSection("socialSectionCard");
}

  /* ===== TRUST ===== */
  renderBadges(data.trustInfo.badges);
  setText("#aboutText", data.trustInfo.about);
}
if(data.master?.showTrustSection === false){
  hideSection("trustSection");
}
/* =========================
   LOAD MENU DATA
========================= */
fetch("./menu.json5")
  .then(res => res.text())
  .then(text => {
    const data = JSON5.parse(text);
    renderMenu(data.categories);
  })
  .catch(err => console.error("Menu JSON5 error:", err));

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
    const singlePrice = item.prices[0];

    // Price display line (ALWAYS visible)
    const priceLine = hasMultiplePrices
      ? `<div class="price-line muted">Select option below</div>`
      : `<div class="price-line">₹ ${singlePrice.price}</div>`;

    // Variant pills (ONLY if multiple prices)
    const priceOptions = hasMultiplePrices
      ? item.prices.map((p, idx) => `
          <label>
            <input type="radio"
              name="price-${item.name.replace(/\s/g,'')}"
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
  // remove LAST matching item (variant-safe)
  for(let i = cart.length - 1; i >= 0; i--){
    if(cart[i].name === name){
      cart[i].qty -= 1;
      if(cart[i].qty <= 0){
        cart.splice(i,1);
      }
      break;
    }
  }
  saveCart();
}

// ===============================
// LOGO CONTROL
// ===============================
const logoEl = document.querySelector("#restaurantLogo");

if (data.master?.showLogo && data.identity.hasLogo) {
  setImage("#restaurantLogo", "./assets/logo.png");
} else if (logoEl) {
  logoEl.style.display = "none";
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

 if(totalQty > 0 && restaurantOpen && orderingEnabled){
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
if(!orderingEnabled){
  showDialog("Online ordering is currently disabled");
  return;
}
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
if(!orderingEnabled){
  showDialog("Online ordering is currently disabled");
  return;
}
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

  // ❌ BLOCK if cart is empty
  if(!cart || cart.length === 0){
    alert("Your cart is empty. Please add items before checkout.");
    return;
  }

  // ❌ BLOCK if total is zero
  const total = cart.reduce((s,i)=>s+i.qty*i.price,0);
    

  // ❌ DELIVERY MINIMUM ORDER CHECK
  if(total <= 0){
    alert("Please add valid items to proceed.");
    return;
  }

  
  closeCartModal();

  const checkout = document.getElementById("checkoutModal");
  const addressBox = document.getElementById("addressBox");

  checkout.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  // Force reset address every time
  addressBox.classList.add("hidden");
  addressBox.style.display = "none";

  // Force Dine-In default
  const dineIn = document.querySelector('input[name="orderType"][value="Dine-In"]');
  if(dineIn){
    dineIn.checked = true;
  }

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

  const addressBox = document.getElementById("addressBox");
  const tableBox = document.getElementById("tableBox");
  const selected = document.querySelector('input[name="orderType"]:checked');

  // Always hide first
  addressBox.classList.add("hidden");
  addressBox.style.display = "none";

  tableBox.classList.add("hidden");
  tableBox.style.display = "none";

  if(!selected) return;

  // DELIVERY
  if(selected.value === "Delivery"){
    addressBox.classList.remove("hidden");
    addressBox.style.display = "block";
  }

  // DINE-IN
  if(selected.value === "Dine-In" && tableSettings.enabled){
    tableBox.classList.remove("hidden");
    tableBox.style.display = "block";
  }
}
if(!orderingEnabled){
  showDialog("Online ordering is currently disabled");
  return;
}
function finalPlaceOrder(){

  if(!restaurantOpen){
    showDialog("Restaurant is currently closed");
    return;
  }

  if(!cart || cart.length === 0){
    showDialog("Your cart is empty. Please add items.");
    return;
  }

  const total = cart.reduce((s,i)=>s+i.qty*i.price,0);
  if(total <= 0){
    showDialog("Invalid order. Please add items again.");
    return;
  }

  const name = document.getElementById("customerName").value.trim();
  if(!name){
    showDialog("Please enter customer name");
    return;
  }

  const type = document.querySelector('input[name="orderType"]:checked')?.value;
let tableNumber = "";

if(type === "Dine-In" && tableSettings.enabled){
  tableNumber = document.getElementById("tableNumber").value.trim();

  if(tableSettings.required && !tableNumber){
    showDialog("Please enter table number");
    return;
  }
}
  // ✅ DELIVERY MINIMUM ORDER CHECK (FIXED)
  if(type === "Delivery" && minimumDeliveryOrder > 0 && total < minimumDeliveryOrder){
    showDialog(`Minimum order for delivery is Rs ${minimumDeliveryOrder}. Please add more items.`);
    return;
  }

  let address = "";
  if(type === "Delivery"){
    address = document.getElementById("deliveryAddress").value.trim();
    if(!address){
      showDialog("Please enter delivery address");
      return;
    }
  }

  // -------- WHATSAPP MESSAGE --------
  let message = "New Order\n\n";

  cart.forEach((item, index) => {
    message += `${index+1}. ${item.name} (${item.label}) x ${item.qty} = Rs ${item.qty * item.price}\n`;
  });

  message += `\nTotal: Rs ${total}\n`;
  message += `Customer: ${name}\n`;
  message += `Order Type: ${type}\n`;
  if(type === "Dine-In" && tableNumber){
  message += `Table: ${tableNumber}\n`;
}
if(type === "Takeaway"){
  message += "Pickup at Restaurant\n";
}
  if(type === "Delivery"){
    message += `Address: ${address}\n`;
  }

  localStorage.setItem("pendingOrder", "true");

  const url =
    "https://wa.me/" +
    restaurantWhatsapp +
    "?text=" +
    encodeURIComponent(message);

  window.open(url, "_blank");
}
if(!orderingEnabled){
  showDialog("Online ordering is currently disabled");
  return;
}
function addSinglePriceToCart(name, label, price){
  if(!restaurantOpen){
    showDialog("Restaurant is currently closed")
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

function showWaConfirm(){
  document.getElementById("waConfirmModal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeWaConfirm(){
  document.getElementById("waConfirmModal").classList.add("hidden");
  document.body.style.overflow = "";
}



function waNotSent(){
  closeWaConfirm();
  // keep cart as-is
}

function showDialog(message, title="Notice"){
  document.getElementById("dialogTitle").textContent = title;
  document.getElementById("dialogMessage").textContent = message;
  document.getElementById("appDialog").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeDialog(){
  document.getElementById("appDialog").classList.add("hidden");
  document.body.style.overflow = "";
}

function waSent(){

  // 1️⃣ CLEAR CART DATA
  cart = [];
  localStorage.removeItem("cart");
  localStorage.removeItem("pendingOrder");
  saveCart();

  // 2️⃣ CLOSE ALL MODALS (VERY IMPORTANT)
  closeWaConfirm();

  const cartModal = document.getElementById("cartModal");
  if(cartModal) cartModal.classList.add("hidden");

  const checkoutModal = document.getElementById("checkoutModal");
  if(checkoutModal) checkoutModal.classList.add("hidden");

  document.body.style.overflow = "";

  // 3️⃣ HIDE CART BAR COMPLETELY
  const cartBar = document.getElementById("cartBar");
  if(cartBar) cartBar.classList.add("hidden");

  // 4️⃣ SHOW SUCCESS OVERLAY (CENTER, ABOVE EVERYTHING)
  showOrderSuccess();
}
function showOrderSuccess(){

  // safety: agar already open ho
  if(document.getElementById("orderSuccessOverlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "orderSuccessOverlay";

  overlay.innerHTML = `
    <div class="order-success-box">
      <h2>✅ Order Sent Successfully</h2>
      <p>
        Aapka order WhatsApp par send ho chuka hai.<br>
        Restaurant aapse jaldi contact karega.
      </p>
      <button onclick="closeOrderSuccess()">OK</button>
    </div>
  `;

  document.body.appendChild(overlay);
}
function closeOrderSuccess(){
  const el = document.getElementById("orderSuccessOverlay");
  if(el) el.remove();
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
function hideSection(id){
  const el = document.getElementById(id);
  if(el){
    el.style.display = "none";
  }
}
// ===============================
// ORDER DISABLED BANNER
// ===============================
function showOrderingDisabledBanner(){
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
function hideServiceOption(id){
  const el = document.getElementById(id);
  if(el){
    el.style.display = "none";
  }
}

function setDefaultService(){
  const radios = document.querySelectorAll('input[name="orderType"]');
  for(let r of radios){
    if(r.closest("label").style.display !== "none"){
      r.checked = true;
      break;
    }
  }
}
