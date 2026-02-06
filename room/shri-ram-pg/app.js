/* =====================================================
   LOAD business.json5 (JSON5 REQUIRED)
===================================================== */
fetch("business.json5")
  .then(r => r.text())
  .then(t => JSON5.parse(t))
  .then(d => init(d))
  .catch(e => console.error("JSON5 LOAD ERROR:", e));


/* =====================================================
   INIT
===================================================== */
function init(d){

  /* ---------- BASIC ---------- */
  setText("pgName", d.identity?.name);
  setText("description", d.identity?.description);

  if(d.branding?.showLogo && d.branding.logoImage){
    setImage("logo", "photos/" + d.branding.logoImage);
  } else {
    remove("logo");
  }

  /* ---------- GENDER ---------- */
  if(d.identity?.genderType){
    const g = d.identity.genderType;
    const el = document.createElement("div");
    el.className = "gender " + (g==="boys"?"boys":g==="girls"?"girls":"both");
    el.textContent = g==="boys"?"Boys":g==="girls"?"Girls":"Boys & Girls";
    safeAppend("genderBadge", el);
  }

  /* ---------- ACTION BUTTONS ---------- */
  d.contact?.primaryCall
    ? setHref("callBtn","tel:"+d.contact.primaryCall)
    : remove("callBtn");

  d.contact?.whatsapp
    ? setHref("whatsappBtn","https://wa.me/"+digits(d.contact.whatsapp))
    : remove("whatsappBtn");

  d.location?.mapLink
    ? setHref("mapBtn", d.location.mapLink)
    : remove("mapBtn");

  /* ---------- SUITABLE FOR ---------- */
  if(d.identity?.suitableFor?.length){
    d.identity.suitableFor.forEach(v=>{
      addPill("suitableForList", iconSuitable(v), v);
    });
  } else {
    remove("suitableForCard");
  }

  /* ---------- CONTACT ---------- */
  let hasContact = false;
  if(d.contact?.primaryCall){
    addContact(d.contact.primaryCall);
    hasContact = true;
  }
  d.contact?.otherNumbers?.forEach(n=>{
    addContact(n);
    hasContact = true;
  });
  if(!hasContact) remove("contactDetailsCard");

  /* ---------- ADDRESS ---------- */
  if(d.location?.addressShort){
    setHTML(
      "addressText",
      `<img src="/assets/icons/color-icons/google-map.svg" width="18">${d.location.addressShort}`
    );
  } else {
    remove("addressText");
  }

  /* ---------- SOCIAL ---------- */
  let socialCount = 0;
  Object.entries(d.socialLinks||{}).forEach(([k,v])=>{
    if(v){
      socialCount++;
      addLinkPill("socialLinks", iconSocial(k), capitalize(k), v);
    }
  });
  if(!socialCount) remove("socialCard");

  /* ---------- PROPERTY INFO ---------- */
  if(d.property){
    setSpan("propertyType", d.property.type);
    setSpan("totalFloors", d.property.totalFloors + " Floors");
    setSpan("liftInfo", d.property.liftAvailable ? "Lift Available" : "No Lift");
  } else {
    remove("propertyInfoCard");
  }

  /* ---------- ROOMS ---------- */
  if(d.rooms?.length){
    d.rooms.forEach(r=>{
      const room = document.createElement("div");
      room.className = "room";
      room.innerHTML = `
        <h3>${r.type}</h3>
        <div class="price">
          <img src="/assets/icons/black-icons/rupee-coin-solid.svg" width="18">
          ${r.price}
        </div>
        <div class="photos" id="ph-${r.prefix}"></div>
        <div class="swipe">
          <img src="/assets/icons/black-icons/long-arrow-right.svg" width="16">
          Swipe for more photos
        </div>
      `;
      safeAppend("roomsContainer", room);
      loadPhotos(r.prefix, "ph-"+r.prefix);
    });
  } else {
    remove("roomsCard");
  }

  /* ---------- CHARGES ---------- */
  if(d.charges){
    setSpan("electricityCharge",
      d.charges.electricityIncluded ? "Electricity Included" : d.charges.electricityRate
    );
    setSpan("waterCharge",
      d.charges.waterIncluded ? "Water Included" : "Extra"
    );
    setSpan("maintenanceCharge",
      d.charges.maintenanceIncluded ? "Included" : "Extra"
    );
  } else {
    remove("chargesCard");
  }

  /* ---------- PAYMENT ---------- */
  if(d.payment?.show){
    setText("paymentLabel", d.payment.label || "Payment");
    setImage("paymentQR", "photos/" + d.payment.qrImage);
  } else {
    remove("paymentCard");
  }
}


/* =====================================================
   ROOM PHOTOS (0 → N SAFE)
===================================================== */
function loadPhotos(prefix, boxId){
  const box = document.getElementById(boxId);
  if(!box) return;

  let i = 1;
  let found = 0;

  (function next(){
    const img = new Image();
    img.src = `photos/${prefix}${i}.webp`;
    img.onload = ()=>{
      found++;
      box.appendChild(img);
      i++;
      next();
    };
  })();

  setTimeout(()=>{
    if(!found) box.remove();
  }, 700);
}


/* =====================================================
   SAFE HELPERS
===================================================== */
function $(id){ return document.getElementById(id); }

function remove(id){
  const el = $(id);
  if(el) el.remove();
}

function setText(id,val){
  const el = $(id);
  if(el && val) el.textContent = val;
}

function setHTML(id,html){
  const el = $(id);
  if(el) el.innerHTML = html;
}

function setImage(id,src){
  const el = $(id);
  if(el){
    el.src = src;
    el.style.display = "block";
  }
}

function setHref(id,href){
  const el = $(id);
  if(el) el.href = href;
}

function setSpan(id,text){
  const el = $(id);
  if(el){
    const span = el.querySelector("span");
    if(span) span.textContent = text;
  }
}

function safeAppend(id,node){
  const el = $(id);
  if(el) el.appendChild(node);
}

function addContact(num){
  addPill("contactNumbers","black-icons/mobile.svg",num);
}

function addPill(box,icon,text){
  const el = document.createElement("div");
  el.className = "pill";
  el.innerHTML = `<img src="/assets/icons/${icon}">${text}`;
  safeAppend(box, el);
}

function addLinkPill(box,icon,text,href){
  const a = document.createElement("a");
  a.className = "pill";
  a.href = href;
  a.target = "_blank";
  a.innerHTML = `<img src="/assets/icons/${icon}">${text}`;
  safeAppend(box, a);
}

function digits(n){ return n.replace(/\D/g,""); }
function capitalize(s){ return s.charAt(0).toUpperCase()+s.slice(1); }


/* =====================================================
   ICON MAPS
===================================================== */
function iconSuitable(v){
  return v.includes("Student") ? "black-icons/student.svg" :
         v.includes("Working") ? "black-icons/Working-Professional.svg" :
         v.includes("Family") ? "black-icons/family.svg" :
         v.includes("Couple") ? "black-icons/couple.svg" :
         "black-icons/check-mark-box.svg";
}

function iconSocial(k){
  return k==="instagram" ? "color-icons/instagram.svg" :
         k==="facebook"  ? "color-icons/facebook.svg" :
         "black-icons/globe.svg";
}
