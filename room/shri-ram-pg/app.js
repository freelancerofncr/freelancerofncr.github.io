/* =====================================================
 LOAD business.json5 (JSON5 REQUIRED)
===================================================== */
fetch("business.json5")
  .then(r => r.text())
  .then(t => JSON5.parse(t))
  .then(d => init(d))
  .catch(e => console.error("JSON5 load error:", e));


/* =====================================================
 INIT - MAIN FUNCTION
===================================================== */
function init(d){

  /* ================= SEO ================= */
  if(d.identity?.name){
    document.title = d.identity.name;
    const t = document.getElementById("seo-title");
    if(t) t.textContent = d.identity.name;
  }

  if(d.identity?.description){
    const m = document.getElementById("seo-desc");
    if(m) m.setAttribute("content", d.identity.description);
  }

  /* ================= BASIC INFO ================= */
  setText("pgName", d.identity?.name);
  setText("description", d.identity?.description);

  /* ================= LOGO ================= */
  if(d.branding?.logoImage && d.branding.showLogo !== false){
    setImage("logo", "photos/" + d.branding.logoImage, true);
  }else{
    hide("logo");
  }

  /* ================= GENDER BADGE ================= */
  if(d.identity?.genderType){
    const g = d.identity.genderType;
    const el = document.createElement("div");
    el.className = "gender-badge " + (
      g === "boys" ? "gender-boys" :
      g === "girls" ? "gender-girls" :
      "gender-both"
    );
    el.textContent =
      g === "boys" ? "Boys Only" :
      g === "girls" ? "Girls Only" :
      "Boys & Girls";
    safeAppend("genderBadge", el);
  }

  /* ================= ACTION BUTTONS ================= */
  d.contact?.primaryCall
    ? setHref("callBtn","tel:"+digits(d.contact.primaryCall))
    : hide("callBtn");

  d.contact?.whatsapp
    ? setHref("whatsappBtn","https://wa.me/"+digits(d.contact.whatsapp))
    : hide("whatsappBtn");

  d.location?.mapLink
    ? setHref("mapBtn", d.location.mapLink)
    : hide("mapBtn");

  /* ================= SUITABLE FOR ================= */
  if(d.identity?.suitableFor?.length){
    d.identity.suitableFor.forEach(v=>{
      addPill("suitableForList", iconSuitable(v), v);
    });
  }else{
    hide("suitableForCard");
  }

  /* ================= CONTACT NUMBERS ================= */
let hasContact = false;
const contactBox = document.getElementById("contactNumbers");
if(contactBox && d.contact?.primaryCall){
  const numbers = [d.contact.primaryCall];
  if(d.contact.otherNumbers){
    numbers.push(...d.contact.otherNumbers);
  }
  
  const phoneRow = document.createElement("div");
  phoneRow.className = "contact-row";
  phoneRow.innerHTML = `
    <img src="/assets/icons/black-icons/mobile.svg" alt="">
    <span>${numbers.join(", ")}</span>
  `;
  contactBox.appendChild(phoneRow);
  hasContact = true;
}
if(!hasContact) hide("contactCard");

  /* ================= ADDRESS ================= */
  if(d.location?.addressShort){
    setText("addressText", d.location.addressShort);
  }else{
    hide("addressWrap");
  }

  /* ================= SOCIAL MEDIA ================= */
  let sc = 0;
  Object.entries(d.socialLinks || {}).forEach(([k,v])=>{
    if(v){
      sc++;
      addLinkPill("socialLinks", iconSocial(k), capitalize(k), v);
    }
  });
  if(!sc) hide("socialCard");

  /* ================= PROPERTY INFO ================= */
  if(d.property){
    setSpan("propertyType", d.property.type);
    setSpan("totalFloors", d.property.totalFloors ? d.property.totalFloors+" Floors" : "");
    setSpan("liftInfo", d.property.liftAvailable ? "Lift Available" : "");
    setSpan("parkingInfo", d.property.parkingAvailable ? "Parking Available" : "");
  }else{
    hide("propertyInfoCard");
  }

  /* ================= COMMON FACILITIES (NEW) ================= */
  if(d.commonFacilities && d.commonFacilities.length > 0){
    d.commonFacilities.forEach(facility => {
      addFacility(facility);
    });
  }else{
    hide("facilitiesCard");
  }

  /* ================= FOOD SYSTEM (UPDATED) ================= */
  if(d.food && d.food.available){
    const foodWrap = document.getElementById("foodWrap");
    if(foodWrap){
      // Clear existing content
      foodWrap.innerHTML = "";
      
      // Food availability indicator
      const availRow = document.createElement("div");
      availRow.className = "food-row highlight";
      availRow.innerHTML = `
        <img src="/assets/icons/black-icons/check-mark-box.svg" alt="">
        <span>Food Available</span>
      `;
      foodWrap.appendChild(availRow);
      
      // Food price (if charged separately)
      if(d.food.price){
        const priceRow = document.createElement("div");
        priceRow.className = "food-row";
        priceRow.innerHTML = `
          <img src="/assets/icons/black-icons/rupee-coin-solid.svg" alt="">
          <span>${d.food.price}</span>
        `;
        foodWrap.appendChild(priceRow);
      }
      
      // Food note/timing
      if(d.food.note){
        const noteRow = document.createElement("div");
        noteRow.className = "food-row";
        noteRow.innerHTML = `
          <img src="/assets/icons/black-icons/clock.svg" alt="">
          <span>${d.food.note}</span>
        `;
        foodWrap.appendChild(noteRow);
      }
    }
  }else{
    hide("foodCard");
  }

  /* ================= ROOMS & PRICING ================= */
  if(d.rooms?.length){
    d.rooms.forEach(r=>{
      const card = document.createElement("div");
card.className = "room-card";
card.innerHTML = `
  <div class="room-title">${r.type}</div>
  <div class="room-photos" id="rp-${r.prefix}"></div>
  <div class="room-features" id="rf-${r.prefix}"></div>
  <div class="room-price">
    <img src="/assets/icons/black-icons/rupee-coin-solid.svg" alt="">
    ${r.price}
  </div>
`;
      safeAppend("roomsContainer", card);

      // Add room facilities (not "features")
      r.roomFacilities?.forEach(f=>{
        addRoomFeature("rf-"+r.prefix, f);
      });

      // Load room photos
      loadRoomPhotos(r.prefix, "rp-"+r.prefix);
    });
  }else{
    hide("roomsCard");
  }

  /* ================= CHARGES ================= */
  if(d.charges){
    setSpan("electricityCharge",
      d.charges.electricityIncluded ? "Electricity Included" : d.charges.electricityRate
    );
    setSpan("waterCharge",
      d.charges.waterIncluded ? "Water Included" : "Water Extra"
    );
    setSpan("maintenanceCharge",
      d.charges.maintenanceIncluded ? "Maintenance Included" : "Maintenance Extra"
    );
  }else{
    hide("chargesCard");
  }

  /* ================= RULES / POLICIES (NEW) ================= */
  if(d.rules && d.rules.length > 0){
    const rulesList = document.getElementById("rulesList");
    d.rules.forEach(rule => {
      const ruleEl = document.createElement("div");
      ruleEl.className = "rule-item";
      ruleEl.innerHTML = `
        <img src="/assets/icons/black-icons/info-black.svg" alt="">
        <span>${rule}</span>
      `;
      rulesList.appendChild(ruleEl);
    });
  }else{
    hide("rulesCard");
  }

  /* ================= PAYMENT QR ================= */
  if(d.payment?.show && d.payment.qrImage){
    setText("paymentLabel", d.payment.label || "Payment");
    setImage("paymentQR", "photos/" + d.payment.qrImage, true);
  }else{
    hide("paymentCard");
  }
}


/* =====================================================
 ROOM PHOTOS AUTO FETCH (1 → N)
===================================================== */
function loadRoomPhotos(prefix, boxId){
  const box = document.getElementById(boxId);
  if(!box) return;

  let i = 1, found = 0;

  (function next(){
    const img = new Image();
    img.src = `photos/${prefix}${i}.webp`;
    img.onload = ()=>{
      found++;
      box.appendChild(img);
      i++;
      next();
    };
    img.onerror = ()=>{
      // Stop trying after first failure
      if(found === 0){
        box.remove();
      }
    };
  })();
}


/* =====================================================
 HELPER FUNCTIONS
===================================================== */
function $(id){ 
  return document.getElementById(id); 
}

function hide(id){ 
  const e=$(id); 
  if(e) e.style.display="none"; 
}

function show(id){ 
  const e=$(id); 
  if(e) e.style.display=""; 
}

function setText(id,val){ 
  const e=$(id); 
  if(e && val) e.textContent=val; 
}

function setHref(id,val){ 
  const e=$(id); 
  if(e && val) e.href=val; 
}

function setImage(id,src,showIt){
  const e=$(id);
  if(e && src){
    e.src=src;
    if(showIt) e.style.display="block";
  }
}

function setSpan(id,val){
  const e=$(id);
  if(e){
    const s=e.querySelector("span");
    if(s && val){
      s.textContent=val;
    }else{
      e.style.display="none";
    }
  }
}

function safeAppend(id,node){
  const e=$(id); 
  if(e) e.appendChild(node);
}

function addPill(box,icon,text){
  const d=document.createElement("div");
  d.className="pill";
  d.innerHTML=`<img src="/assets/icons/${icon}" alt="">${text}`;
  safeAppend(box,d);
}

function addLinkPill(box,icon,text,href){
  const a=document.createElement("a");
  a.className="pill";
  a.href=href;
  a.target="_blank";
  a.rel="noopener noreferrer";
  a.innerHTML=`<img src="/assets/icons/${icon}" alt="">${text}`;
  safeAppend(box,a);
}

/* ================= ADD COMMON FACILITY ================= */
function addFacility(facilityName){
  // Icon mapping for common facilities
  const iconMap = {
    "Lift": "black-icons/lift.svg",
    "Washing Machine": "black-icons/washing-machine.svg",
    "Fridge": "black-icons/fridge.svg",
    "RO Water": "black-icons/ro-water.svg",
    "Power Backup": "black-icons/power-backup.svg",
    "Parking": "black-icons/parking.svg",
    "CCTV": "black-icons/cctv.svg",
    "Housekeeping": "black-icons/check-mark-box.svg",
    "WiFi": "black-icons/wifi.svg",
    "AC": "black-icons/ac.svg",
    "Security Guard": "black-icons/check-mark-box.svg",
    "Water Dispenser": "black-icons/ro-water.svg"
  };

  const icon = iconMap[facilityName] || "black-icons/check-mark-box.svg";
  
  const d = document.createElement("div");
  d.className = "facility-item";
  d.innerHTML = `<img src="/assets/icons/${icon}" alt="">${facilityName}`;
  safeAppend("facilitiesList", d);
}

function addRoomFeature(box,f){
  const d=document.createElement("div");
  d.className="room-feature";
  d.innerHTML=`<img src="/assets/icons/black-icons/check-mark-box.svg" alt="">${f}`;
  safeAppend(box,d);
}

function digits(n){ 
  return n.replace(/\D/g,""); 
}

function capitalize(s){ 
  return s.charAt(0).toUpperCase()+s.slice(1); 
}

/* ================= ICON MAPPING FUNCTIONS ================= */
function iconSuitable(v){
  if(v.includes("Student")) return "black-icons/student.svg";
  if(v.includes("Working")) return "black-icons/Working-Professional.svg";
  if(v.includes("Family") || v.includes("Families")) return "black-icons/family.svg";
  if(v.includes("Couple")) return "black-icons/couple.svg";
  if(v.includes("Bachelor") || v.includes("Bachlore")) return "black-icons/Working-Professional.svg";
  return "black-icons/check-mark-box.svg";
}

function iconSocial(k){
  const key = k.toLowerCase();
  if(key === "instagram") return "color-icons/instagram.svg";
  if(key === "facebook") return "color-icons/facebook.svg";
  if(key === "youtube") return "color-icons/youtube.svg";
  if(key === "website") return "black-icons/globe.svg";
  return "black-icons/check-mark-box.svg";
}
