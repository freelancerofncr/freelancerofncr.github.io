
/* =========================================================
   QR MENU MASTER ENGINE
   Single File Production Build
   JSON5 Supported
   Swiggy Inspired
   Multi Restaurant Ready
========================================================= */

let BUSINESS = {};
let MENU = {};
let CART = [];
let VEG_MODE = false;

/* =========================================================
   INIT
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
  await loadConfig();
  initCart();
  renderBusiness();
  renderMenu();
  setupSearch();
  setupVegToggle();
  renderCategoryNav();
  updateLiveStatus();
});

/* =========================================================
   LOAD JSON5 FILES
========================================================= */

async function loadConfig(){
  const businessText = await fetch("business.json5").then(r=>r.text());
  const menuText = await fetch("menu.json5").then(r=>r.text());
  BUSINESS = JSON5.parse(businessText);
  MENU = JSON5.parse(menuText);
  document.title = BUSINESS.identity.name;
}

/* =========================================================
   MASTER CONTROL CHECK
========================================================= */

function isEnabled(key){
  return BUSINESS.controls[key] === "YES";
}

/* =========================================================
   RENDER BUSINESS
========================================================= */

function renderBusiness(){
  if(!isEnabled("header")) return;

  document.getElementById("restaurantName").textContent =
    BUSINESS.identity.name;

  document.getElementById("restaurantLogo").src =
    BUSINESS.identity.logo;

  if(!isEnabled("search")){
    document.getElementById("searchBar").remove();
  }
}

/* =========================================================
   LIVE OPEN STATUS
========================================================= */

function updateLiveStatus(){
  const now = new Date();
  const day = now.toLocaleDateString("en-US",{weekday:"long"}).toLowerCase();
  const today = BUSINESS.openingHours[day];
  const statusEl = document.getElementById("liveStatus");

  if(!today || today.closed === "YES"){
    statusEl.innerHTML = "🔴 Closed Today";
    return;
  }

  const current = now.getHours()*60 + now.getMinutes();
  const openM = toMin(today.open);
  const closeM = toMin(today.close);

  if(current >= openM && current <= closeM){
    statusEl.innerHTML =
      "🟢 Open Now • " + formatTime(today.open) + " - " + formatTime(today.close);
  }else{
    statusEl.innerHTML =
      "🔴 Closed • Opens " + formatTime(today.open);
  }
}

function toMin(t){
  const [h,m] = t.split(":").map(Number);
  return h*60+m;
}

function formatTime(t){
  let [h,m] = t.split(":").map(Number);
  const ap = h>=12?"PM":"AM";
  h = h%12||12;
  return h+":"+m.toString().padStart(2,"0")+" "+ap;
}

/* =========================================================
   RENDER MENU
========================================================= */

function renderMenu(){
  const container = document.getElementById("menuContainer");
  container.innerHTML = "";

  MENU.categories.forEach(cat=>{

    const section = document.createElement("div");
    section.className = "menu-section";
    section.id = "cat-"+slug(cat.name);

    const title = document.createElement("div");
    title.className = "category-title";
    title.textContent = cat.name;

    section.appendChild(title);

    cat.items.forEach(item=>{
      if(VEG_MODE && item.type==="nonveg") return;

      const card = document.createElement("div");
      card.className = "menu-item";

      const header = document.createElement("div");
      header.className = "menu-item-header";

      const name = document.createElement("div");
      name.className = "item-name";
      name.textContent = item.name;

      const price = document.createElement("div");
      price.textContent = "₹ "+item.prices[0].price;

      header.appendChild(name);
      header.appendChild(price);

      card.appendChild(header);

      if(item.description){
        const desc = document.createElement("div");
        desc.className = "item-desc";
        desc.textContent = item.description;
        card.appendChild(desc);
      }

      card.addEventListener("click",()=>addToCart(item));

      section.appendChild(card);
    });

    container.appendChild(section);
  });
}

/* =========================================================
   CATEGORY NAV
========================================================= */

function renderCategoryNav(){
  if(!isEnabled("categoryNav")) return;

  const nav = document.getElementById("categoryNav");
  nav.innerHTML = "";

  MENU.categories.forEach(cat=>{
    const btn = document.createElement("button");
    btn.textContent = cat.name;
    btn.onclick = ()=>{
      document.getElementById("cat-"+slug(cat.name))
        .scrollIntoView({behavior:"smooth"});
    };
    nav.appendChild(btn);
  });
}

function slug(str){
  return str.replace(/\s+/g,"-").toLowerCase();
}

/* =========================================================
   SEARCH SYSTEM (Debounced)
========================================================= */

function setupSearch(){
  const input = document.getElementById("searchInput");
  if(!input) return;

  let timer;
  input.addEventListener("input",e=>{
    clearTimeout(timer);
    timer = setTimeout(()=>{
      const q = e.target.value.toLowerCase();
      filterMenu(q);
    },300);
  });
}

function filterMenu(query){
  document.querySelectorAll(".menu-item").forEach(item=>{
    const text = item.innerText.toLowerCase();
    item.style.display = text.includes(query)?"block":"none";
  });
}

/* =========================================================
   VEG TOGGLE
========================================================= */

function setupVegToggle(){
  if(!isEnabled("vegToggle")) return;

  const btn = document.getElementById("vegToggle");

  btn.addEventListener("click",()=>{
    VEG_MODE = !VEG_MODE;
    btn.textContent = VEG_MODE?"Veg Mode ON":"Veg Mode OFF";
    btn.style.background = VEG_MODE?"#2ecc71":"#eee";
    renderMenu();
  });
}

/* =========================================================
   CART SYSTEM
========================================================= */

function initCart(){
  CART = JSON.parse(localStorage.getItem("cart")) || [];
  updateCartUI();
}

function addToCart(item){
  const found = CART.find(i=>i.name===item.name);
  if(found){
    found.qty++;
  }else{
    CART.push({name:item.name,price:item.prices[0].price,qty:1});
  }
  saveCart();
}

function saveCart(){
  localStorage.setItem("cart",JSON.stringify(CART));
  updateCartUI();
}

function updateCartUI(){
  const count = CART.reduce((s,i)=>s+i.qty,0);
  const total = CART.reduce((s,i)=>s+i.qty*i.price,0);

  document.getElementById("cartCount").textContent = count;
  document.getElementById("cartTotal").textContent = total;

  const bar = document.getElementById("cartBar");
  if(count>0) bar.classList.remove("hidden");
  else bar.classList.add("hidden");
}

/* =========================================================
   WHATSAPP ORDER
========================================================= */

function placeOrder(){
  let msg = "New Order\n\n";
  let total = 0;

  CART.forEach((i,idx)=>{
    total += i.qty*i.price;
    msg += (idx+1)+". "+i.name+" x "+i.qty+" = ₹"+(i.qty*i.price)+"\n";
  });

  msg += "\nTotal: ₹"+total;

  const phone = BUSINESS.contact.whatsappNumber.replace(/\D/g,"");
  window.open("https://wa.me/"+phone+"?text="+encodeURIComponent(msg));
}

/* =========================================================
   UPI PAYMENT
========================================================= */

function payNow(){
  if(!BUSINESS.payment.upiId || BUSINESS.payment.upiId==="NO") return;
  const total = CART.reduce((s,i)=>s+i.qty*i.price,0);
  window.location.href =
    "upi://pay?pa="+BUSINESS.payment.upiId+
    "&pn="+encodeURIComponent(BUSINESS.identity.name)+
    "&am="+total+
    "&cu=INR";
}

/* =========================================================
   CLEAR CART
========================================================= */

function clearCart(){
  CART=[];
  saveCart();
}
