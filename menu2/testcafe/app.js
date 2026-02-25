/* =====================================================
   GLOBAL STATE
===================================================== */

let businessData = {};
let menuData = {};
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let vegOnlyMode = false;

/* =====================================================
   INIT
===================================================== */

document.addEventListener("DOMContentLoaded", async () => {
  await loadBusiness();
  await loadMenu();
  renderCartBar();
});

/* =====================================================
   JSON5 LOADER
===================================================== */

async function loadBusiness() {
  const res = await fetch("./business.json5");
  const text = await res.text();
  businessData = JSON5.parse(text);

  applyBusinessData();
}

async function loadMenu() {
  const res = await fetch("./menu.json5");
  const text = await res.text();
  menuData = JSON5.parse(text);

  renderMenu();
}

/* =====================================================
   UTILITY
===================================================== */

function isNO(val){
  return !val || val === "NO";
}

function cleanNumber(num){
  return num.replace(/\D/g,'');
}

/* =====================================================
   APPLY BUSINESS DATA
===================================================== */

function applyBusinessData(){

  const id = businessData.identity;

  /* Dynamic Title */
  document.title = id.name;

  /* Name & Subtitle */
  document.getElementById("restaurantName").textContent = id.name;
  document.getElementById("categoryLine").textContent = id.categoryLine;

  /* Logo */
  if(id.showLogo === "YES"){
    document.getElementById("restaurantLogo").src = "./assets/logo.png";
  }else{
    document.getElementById("restaurantLogo").style.display="none";
  }

  renderLiveStatus();
  renderServices();
  renderPlatforms();
  renderSocial();
  renderGoogleReview();
  renderPayment();
}

/* =====================================================
   LIVE OPEN STATUS
===================================================== */

function renderLiveStatus(){
  const box = document.getElementById("liveStatus");
  const now = new Date();
  const day = now.toLocaleDateString("en-US",{weekday:"long"}).toLowerCase();

  const today = businessData.openingHours[day];

  if(!today || today.closed){
    box.innerHTML = `<span style="color:#dc2626;font-weight:600">Closed Today</span>`;
    return;
  }

  const current = now.getHours()*60 + now.getMinutes();
  const [oh,om] = today.open.split(":").map(Number);
  const [ch,cm] = today.close.split(":").map(Number);

  const openMin = oh*60+om;
  const closeMin = ch*60+cm;

  const isOpen = current >= openMin && current <= closeMin;

  if(isOpen){
    box.innerHTML = `
      <span class="live-dot"></span>
      <span style="color:#16a34a;font-weight:600">
      Open Now • ${formatTime(today.open)} - ${formatTime(today.close)}
      </span>
    `;
  }else{
    box.innerHTML = `
      <span style="color:#dc2626;font-weight:600">
      Closed • Opens ${formatTime(today.open)}
      </span>
    `;
  }
}

function formatTime(t){
  let [h,m] = t.split(":").map(Number);
  const ap = h>=12?"PM":"AM";
  h = h%12 || 12;
  return `${h}:${m.toString().padStart(2,"0")} ${ap}`;
}

/* =====================================================
   SERVICES
===================================================== */

function renderServices(){
  const s = businessData.services;
  const row = document.getElementById("serviceRow");
  row.innerHTML="";

  ["delivery","dineIn","takeaway"].forEach(type=>{
    if(s[type] === "YES"){
      const div = document.createElement("div");
      div.className="service-badge";
      div.textContent = type.toUpperCase();
      row.appendChild(div);
    }
  });
}

/* =====================================================
   PLATFORMS
===================================================== */

function renderPlatforms(){
  const p = businessData.platforms;
  const section = document.getElementById("platformSection");

  const valid = Object.entries(p).filter(([k,v])=>!isNO(v));

  if(valid.length===0){
    section.style.display="none";
    return;
  }

  const grid = document.createElement("div");
  grid.className="platform-grid";

  valid.forEach(([k,v])=>{
    const a = document.createElement("a");
    a.href = v;
    a.target="_blank";
    a.className=`platform-btn ${k}`;
    a.textContent = k.toUpperCase();
    grid.appendChild(a);
  });

  section.appendChild(grid);
}

/* =====================================================
   SOCIAL
===================================================== */

function renderSocial(){
  const s = businessData.social;
  const section = document.getElementById("socialSection");

  const icons = {
    instagram:"instagram.svg",
    facebook:"facebook.svg",
    youtube:"youtube.svg",
    x:"twitter.svg",
    threads:"threads.svg",
    snapchat:"snapchat.svg",
    google:"google-color.svg",
    website:"globe.svg"
  };

  const valid = Object.entries(s).filter(([k,v])=>!isNO(v));

  if(valid.length===0){
    section.style.display="none";
    return;
  }

  valid.forEach(([k,v])=>{
    const a=document.createElement("a");
    a.href=v;
    a.target="_blank";
    a.innerHTML=`<img src="/assets/icons/color-icons/${icons[k]||icons.website}">`;
    section.appendChild(a);
  });
}

/* =====================================================
   GOOGLE REVIEW
===================================================== */

function renderGoogleReview(){
  const g = businessData.googleReview;
  const section = document.getElementById("googleReviewSection");

  if(g.show !== "YES" || isNO(g.reviewLink)){
    section.style.display="none";
    return;
  }

  section.innerHTML=`
    <a href="${g.reviewLink}" target="_blank" class="google-review-btn">
    Write a Google Review
    </a>
  `;
}

/* =====================================================
   PAYMENT
===================================================== */

function renderPayment(){
  const p = businessData.payment;
  const section = document.getElementById("paymentSection");

  if(p.showQR==="YES"){
    section.innerHTML += `<img id="paymentQR" src="./assets/payment.png">`;
  }

  if(!isNO(p.upiId)){
    const link=`upi://pay?pa=${p.upiId}&pn=${encodeURIComponent(businessData.identity.name)}`;
    section.innerHTML+=`
      <a id="upiPayBtn" href="${link}">
      Pay Now
      </a>
    `;
  }

  if(section.innerHTML===""){
    section.style.display="none";
  }
}

/* =====================================================
   MENU RENDER
===================================================== */

function renderMenu(){
  const container=document.getElementById("menuContainer");
  const nav=document.getElementById("categoryNav");

  container.innerHTML="";
  nav.innerHTML="";

  menuData.categories.forEach(cat=>{
    const btn=document.createElement("button");
    btn.textContent=cat.name;
    btn.onclick=()=>scrollToCategory(cat.name);
    nav.appendChild(btn);

    const section=document.createElement("div");
    section.className="menu-category";
    section.id=cat.name;

    section.innerHTML=`<div class="category-title">${cat.name}</div>`;

    cat.items.forEach(item=>{
      if(vegOnlyMode && item.type==="nonveg") return;

      const div=document.createElement("div");
      div.className="menu-item";
      div.innerHTML=`
        <div class="item-name">${item.name}</div>
        <div class="item-price">₹ ${item.prices[0].price}</div>
        <button onclick="addToCart('${item.name}',${item.prices[0].price})">
        Add
        </button>
      `;
      section.appendChild(div);
    });

    container.appendChild(section);
  });
}

/* =====================================================
   SCROLL
===================================================== */

function scrollToCategory(name){
  document.getElementById(name).scrollIntoView({behavior:"smooth"});
}

/* =====================================================
   SEARCH
===================================================== */

document.getElementById("searchInput").addEventListener("input", function(){
  const val=this.value.toLowerCase();

  document.querySelectorAll(".menu-item").forEach(item=>{
    const text=item.innerText.toLowerCase();
    item.style.display=text.includes(val)?"block":"none";
  });
});

/* =====================================================
   VEG FILTER
===================================================== */

document.getElementById("vegFilterBtn").onclick=function(){
  vegOnlyMode=!vegOnlyMode;
  renderMenu();
};

/* =====================================================
   CART
===================================================== */

function addToCart(name,price){
  const existing=cart.find(i=>i.name===name);

  if(existing){
    existing.qty+=1;
  }else{
    cart.push({name,price,qty:1});
  }

  saveCart();
}

function saveCart(){
  localStorage.setItem("cart",JSON.stringify(cart));
  renderCartBar();
}

function renderCartBar(){
  const bar=document.getElementById("cartBar");
  const count=cart.reduce((s,i)=>s+i.qty,0);

  if(count===0){
    bar.classList.add("hidden");
    return;
  }

  bar.classList.remove("hidden");
  document.getElementById("cartCount").textContent=count;
}

function clearCart(){
  cart=[];
  saveCart();
  document.getElementById("cartModal").classList.add("hidden");
}

/* =====================================================
   OPEN CART
===================================================== */

function openCart(){
  const modal=document.getElementById("cartModal");
  const itemsBox=document.getElementById("cartItems");
  const totalBox=document.getElementById("cartTotal");

  itemsBox.innerHTML="";
  let total=0;

  cart.forEach(i=>{
    total+=i.price*i.qty;
    itemsBox.innerHTML+=`
      <div>
        ${i.name} x ${i.qty}
      </div>
    `;
  });

  totalBox.textContent=total;
  modal.classList.remove("hidden");
}
/* =====================================================
   CHECKOUT MODAL CREATION
===================================================== */

function openCheckout(){

  if(cart.length === 0){
    alert("Your cart is empty.");
    return;
  }

  const modal = document.createElement("div");
  modal.className="modal";
  modal.id="checkoutModal";

  modal.innerHTML = `
    <div class="modal-box">
      <h3>Checkout</h3>

      <div style="margin-top:14px;">
        <label>Name *</label>
        <input id="customerName" style="width:100%;padding:10px;margin-top:6px;">
      </div>

      <div style="margin-top:14px;">
        <label>Order Type *</label>
        <select id="orderType" style="width:100%;padding:10px;margin-top:6px;">
        </select>
      </div>

      <div id="tableField" style="margin-top:14px;display:none;">
        <label>Table Number *</label>
        <input id="tableNumber" style="width:100%;padding:10px;margin-top:6px;">
      </div>

      <div id="addressField" style="margin-top:14px;display:none;">
        <label>Delivery Address *</label>
        <textarea id="deliveryAddress" rows="3" style="width:100%;padding:10px;margin-top:6px;"></textarea>
      </div>

      <div style="margin-top:18px;display:flex;gap:10px;">
        <button onclick="closeCheckout()">Back</button>
        <button class="cart-btn" onclick="finalPlaceOrder()">Place Order</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  populateOrderTypes();

  document.getElementById("orderType").addEventListener("change", toggleFields);
}

function closeCheckout(){
  document.getElementById("checkoutModal")?.remove();
}

/* =====================================================
   ORDER TYPE OPTIONS
===================================================== */

function populateOrderTypes(){
  const select = document.getElementById("orderType");
  const services = businessData.services;

  select.innerHTML="";

  if(services.delivery==="YES"){
    select.innerHTML+=`<option value="Delivery">Delivery</option>`;
  }

  if(services.dineIn==="YES"){
    select.innerHTML+=`<option value="Dine-In">Dine-In</option>`;
  }

  if(services.takeaway==="YES"){
    select.innerHTML+=`<option value="Takeaway">Takeaway</option>`;
  }

  toggleFields();
}

function toggleFields(){
  const type = document.getElementById("orderType").value;

  document.getElementById("addressField").style.display =
    type==="Delivery" ? "block":"none";

  document.getElementById("tableField").style.display =
    (type==="Dine-In" && businessData.services.requireTableNumber==="YES")
    ? "block":"none";
}

/* =====================================================
   FINAL PLACE ORDER
===================================================== */

function finalPlaceOrder(){

  const name = document.getElementById("customerName").value.trim();
  const type = document.getElementById("orderType").value;

  if(!name){
    alert("Please enter your name.");
    return;
  }

  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);

  if(type==="Delivery"){
    const min = businessData.services.minimumDeliveryOrder;
    if(total < min){
      alert(`Minimum delivery order is ₹${min}`);
      return;
    }

    const address = document.getElementById("deliveryAddress").value.trim();
    if(!address){
      alert("Please enter delivery address.");
      return;
    }
  }

  if(type==="Dine-In" && businessData.services.requireTableNumber==="YES"){
    const table = document.getElementById("tableNumber").value.trim();
    if(!table){
      alert("Please enter table number.");
      return;
    }
  }

  sendWhatsAppOrder(name,type);
}

/* =====================================================
   WHATSAPP ORDER MESSAGE
===================================================== */

function sendWhatsAppOrder(name,type){

  let message = `New Order\n\n`;

  cart.forEach((item,i)=>{
    message+=`${i+1}. ${item.name} x ${item.qty} = ₹${item.qty*item.price}\n`;
  });

  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);

  message+=`\nTotal: ₹${total}\n`;
  message+=`Customer: ${name}\n`;
  message+=`Order Type: ${type}\n`;

  if(type==="Delivery"){
    const address = document.getElementById("deliveryAddress").value.trim();
    message+=`Address: ${address}\n`;
  }

  if(type==="Dine-In" && businessData.services.requireTableNumber==="YES"){
    const table = document.getElementById("tableNumber").value.trim();
    message+=`Table No: ${table}\n`;
  }

  localStorage.setItem("pendingOrder","true");

  const number = cleanNumber(businessData.contact.whatsappNumber);

  const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

  window.open(url,"_blank");

  closeCheckout();
}

/* =====================================================
   RETURN DETECTION
===================================================== */

document.addEventListener("visibilitychange",()=>{

  if(document.visibilityState==="visible" &&
     localStorage.getItem("pendingOrder")==="true"){

    const confirmReset = confirm(
      "Did you successfully send the order on WhatsApp?"
    );

    if(confirmReset){
      cart=[];
      localStorage.removeItem("cart");
      localStorage.removeItem("pendingOrder");
      renderCartBar();
    }
  }

});
