/* =====================================================
 LOAD business.json5 (JSON5 REQUIRED)
===================================================== */
fetch("business.json5")
  .then(r => r.text())
  .then(t => JSON5.parse(t))
  .then(d => init(d))
  .catch(e => console.error("JSON5 load error:", e));


/* =====================================================
 INIT
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

  /* ================= BASIC ================= */
  setText("pgName", d.identity?.name);
  setText("description", d.identity?.description);

  /* ================= LOGO ================= */
  if(d.branding?.logoImage && d.branding.showLogo !== false){
    setImage("logo", "photos/" + d.branding.logoImage, true);
  }else{
    hide("logo");
  }

  /* ================= GENDER ================= */
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

  /* ================= CONTACT ================= */
  let hasContact = false;
  if(d.contact?.primaryCall){
    addPill("contactNumbers","black-icons/mobile.svg",d.contact.primaryCall);
    hasContact = true;
  }
  d.contact?.otherNumbers?.forEach(n=>{
    addPill("contactNumbers","black-icons/mobile.svg",n);
    hasContact = true;
  });
  if(!hasContact) hide("contactCard");

  /* ================= ADDRESS ================= */
  if(d.location?.addressShort){
    setText("addressText", d.location.addressShort);
  }else{
    hide("addressWrap");
  }

  /* ================= SOCIAL ================= */
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

  /* ================= AMENITIES ================= */
  if(d.amenities){
    Object.entries(d.amenities).forEach(([k,v])=>{
      if(v){
        addAmenity(k);
      }
    });
  }else{
    hide("amenitiesCard");
  }

  /* ================= FOOD ================= */
  let foodShown = false;
  if(d.food?.veg){
    show("vegFood"); foodShown = true;
  }else hide("vegFood");

  if(d.food?.nonVeg){
    show("nonVegFood"); foodShown = true;
  }else hide("nonVegFood");

  if(d.food?.timing){
    setSpan("foodTiming", d.food.timing);
    foodShown = true;
  }else hide("foodTiming");

  if(!foodShown) hide("foodCard");

  /* ================= ROOMS ================= */
  if(d.rooms?.length){
    d.rooms.forEach(r=>{
      const card = document.createElement("div");
      card.className = "room-card";
      card.innerHTML = `
        <div class="room-head">
          <div class="room-title">${r.type}</div>
          <div class="room-price">
            <img src="/assets/icons/black-icons/rupee-coin-solid.svg">
            ${r.price}
          </div>
        </div>

        <div class="room-features" id="rf-${r.prefix}"></div>
        <div class="room-photos" id="rp-${r.prefix}"></div>
      `;
      safeAppend("roomsContainer", card);

      r.features?.forEach(f=>{
        addRoomFeature("rf-"+r.prefix, f);
      });

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
      d.charges.waterIncluded ? "Water Included" : "Extra"
    );
    setSpan("maintenanceCharge",
      d.charges.maintenanceIncluded ? "Maintenance Included" : "Extra"
    );
  }else{
    hide("chargesCard");
  }

  /* ================= PAYMENT ================= */
  if(d.payment?.show && d.payment.qrImage){
    setText("paymentLabel", d.payment.label || "Payment");
    setImage("paymentQR", "photos/" + d.payment.qrImage, true);
  }else{
    hide("paymentCard");
  }
}


/* =====================================================
 ROOM PHOTOS AUTO FETCH (0 → N)
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
  })();

  setTimeout(()=>{
    if(!found) box.remove();
  },800);
}


/* =====================================================
 HELPERS
===================================================== */
function $(id){ return document.getElementById(id); }

function hide(id){ const e=$(id); if(e) e.style.display="none"; }
function show(id){ const e=$(id); if(e) e.style.display=""; }

function setText(id,val){ const e=$(id); if(e && val) e.textContent=val; }
function setHref(id,val){ const e=$(id); if(e && val) e.href=val; }

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
    if(s && val) s.textContent=val;
    else e.style.display="none";
  }
}

function safeAppend(id,node){
  const e=$(id); if(e) e.appendChild(node);
}

function addPill(box,icon,text){
  const d=document.createElement("div");
  d.className="pill";
  d.innerHTML=`<img src="/assets/icons/${icon}">${text}`;
  safeAppend(box,d);
}

function addLinkPill(box,icon,text,href){
  const a=document.createElement("a");
  a.className="pill";
  a.href=href;
  a.target="_blank";
  a.innerHTML=`<img src="/assets/icons/${icon}">${text}`;
  safeAppend(box,a);
}

function addAmenity(k){
  const map={
    wifi:"black-icons/wifi.svg",
    ac:"black-icons/ac.svg",
    fridge:"black-icons/fridge.svg",
    washingMachine:"black-icons/washing-machine.svg",
    powerBackup:"black-icons/power-backup.svg",
    cctv:"black-icons/cctv.svg"
  };
  if(!map[k]) return;
  const d=document.createElement("div");
  d.className="amenity";
  d.innerHTML=`<img src="/assets/icons/${map[k]}">${capitalize(k)}`;
  safeAppend("amenitiesList",d);
}

function addRoomFeature(box,f){
  const d=document.createElement("div");
  d.className="room-feature";
  d.innerHTML=`<img src="/assets/icons/black-icons/check-mark-box.svg">${f}`;
  safeAppend(box,d);
}

function digits(n){ return n.replace(/\D/g,""); }
function capitalize(s){ return s.charAt(0).toUpperCase()+s.slice(1); }

/* ================= ICON MAPS ================= */
function iconSuitable(v){
  if(v.includes("Student")) return "black-icons/student.svg";
  if(v.includes("Working")) return "black-icons/Working-Professional.svg";
  if(v.includes("Family")) return "black-icons/family.svg";
  if(v.includes("Couple")) return "black-icons/couple.svg";
  return "black-icons/check-mark-box.svg";
}

function iconSocial(k){
  if(k==="instagram") return "color-icons/instagram.svg";
  if(k==="facebook") return "color-icons/facebook.svg";
  if(k==="youtube") return "color-icons/youtube.svg";
  return "";
}
