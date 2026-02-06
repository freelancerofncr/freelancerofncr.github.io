/* =====================================================
   LOAD business.json5 (JSON5 REQUIRED)
===================================================== */
fetch("business.json5")
  .then(res => res.text())
  .then(text => JSON5.parse(text))
  .then(data => renderPage(data))
  .catch(err => console.error("JSON5 Load Error:", err));


/* =====================================================
   MAIN RENDER FUNCTION
===================================================== */
function renderPage(d){

  /* ---------- BASIC INFO ---------- */
  setText("pgName", d.identity?.name);
  setText("description", d.identity?.description);

  if(d.branding?.showLogo && d.branding.logoImage){
    setImage("logo", "photos/" + d.branding.logoImage);
  } else {
    hide("logo");
  }

  /* ---------- GENDER BADGE ---------- */
  if(d.identity?.genderType){
    const g = d.identity.genderType;
    const badge = document.createElement("div");

    badge.className =
      "gender " +
      (g === "boys" ? "boys" : g === "girls" ? "girls" : "both");

    badge.textContent =
      g === "boys" ? "Boys" :
      g === "girls" ? "Girls" :
      "Boys & Girls";

    qs("genderBadge").appendChild(badge);
  }

  /* ---------- ACTION BUTTONS ---------- */
  if(d.contact?.primaryCall){
    setLink("callBtn", "tel:" + d.contact.primaryCall);
  } else {
    hide("callBtn");
  }

  if(d.contact?.whatsapp){
    setLink("whatsappBtn", "https://wa.me/" + clean(d.contact.whatsapp));
  } else {
    hide("whatsappBtn");
  }

  if(d.location?.mapLink){
    setLink("mapBtn", d.location.mapLink);
  } else {
    hide("mapBtn");
  }

  /* ---------- SUITABLE FOR ---------- */
  if(d.identity?.suitableFor?.length){
    d.identity.suitableFor.forEach(item=>{
      const pill = document.createElement("div");
      pill.className = "pill";
      pill.innerHTML = `
        <img src="/assets/icons/black-icons/${iconForSuitable(item)}">
        ${item}
      `;
      qs("suitableForList").appendChild(pill);
    });
  } else {
    hide("suitableForCard");
  }

  /* ---------- CONTACT NUMBERS ---------- */
  let hasContact = false;

  if(d.contact?.primaryCall){
    addNumber(d.contact.primaryCall);
    hasContact = true;
  }

  if(d.contact?.otherNumbers?.length){
    d.contact.otherNumbers.forEach(n=>{
      addNumber(n);
      hasContact = true;
    });
  }

  if(!hasContact){
    hide("contactDetailsCard");
  }

  /* ---------- ADDRESS ---------- */
  if(d.location?.addressShort){
    qs("addressText").innerHTML = `
      <img src="/assets/icons/color-icons/google-map.svg" width="18">
      ${d.location.addressShort}
    `;
  } else {
    hide("addressText");
  }

  /* ---------- SOCIAL LINKS ---------- */
  let socialCount = 0;

  Object.entries(d.socialLinks || {}).forEach(([key,val])=>{
    if(val){
      socialCount++;
      const a = document.createElement("a");
      a.className = "pill";
      a.href = val;
      a.target = "_blank";
      a.innerHTML = `
        <img src="/assets/icons/${socialIcon(key)}">
        ${capitalize(key)}
      `;
      qs("socialLinks").appendChild(a);
    }
  });

  if(!socialCount){
    hide("socialCard");
  }

  /* ---------- PROPERTY INFO ---------- */
  if(d.property){
    setPill("propertyType", d.property.type);
    setPill("totalFloors", d.property.totalFloors + " Floors");
    setPill(
      "liftInfo",
      d.property.liftAvailable ? "Lift Available" : "No Lift"
    );
  } else {
    hide("propertyInfoCard");
  }

  /* ---------- ROOMS ---------- */
  if(d.rooms?.length){
    d.rooms.forEach(room=>{
      const box = document.createElement("div");
      box.className = "room";

      box.innerHTML = `
        <h3>${room.type}</h3>

        <div class="price">
          <img src="/assets/icons/black-icons/rupee-coin-solid.svg" width="18">
          ${room.price}
        </div>

        <div class="pill-list">
          ${(room.roomFacilities || []).map(f=>`
            <span class="pill">
              <img src="/assets/icons/black-icons/${iconForRoom(f)}">
              ${f}
            </span>
          `).join("")}
        </div>

        <div class="photos" id="photos-${room.prefix}"></div>

        <div class="swipe">
          <img src="/assets/icons/black-icons/long-arrow-right.svg" width="16">
          Swipe for more photos
        </div>
      `;

      qs("roomsContainer").appendChild(box);
      loadRoomPhotos(room.prefix, "photos-" + room.prefix);
    });
  } else {
    hide("roomsCard");
  }

  /* ---------- CHARGES ---------- */
  if(d.charges){
    setPill(
      "electricityCharge",
      d.charges.electricityIncluded
        ? "Electricity Included"
        : d.charges.electricityRate
    );

    setPill(
      "waterCharge",
      d.charges.waterIncluded
        ? "Water Included"
        : "Water Charges Extra"
    );

    setPill(
      "maintenanceCharge",
      d.charges.maintenanceIncluded
        ? "Maintenance Included"
        : "Maintenance Extra"
    );
  } else {
    hide("chargesCard");
  }

  /* ---------- PAYMENT ---------- */
  if(d.payment?.show){
    setText("paymentLabel", d.payment.label || "Payment");
    setImage("paymentQR", "photos/" + d.payment.qrImage);
  } else {
    hide("paymentCard");
  }
}


/* =====================================================
   ROOM PHOTO AUTO LOADER (0 → N)
===================================================== */
function loadRoomPhotos(prefix, containerId){
  const box = document.getElementById(containerId);
  let index = 1;
  let found = 0;

  function tryLoad(){
    const img = new Image();
    img.src = `photos/${prefix}${index}.webp`;

    img.onload = ()=>{
      found++;
      box.appendChild(img);
      index++;
      tryLoad();
    };
  }

  tryLoad();

  setTimeout(()=>{
    if(!found){
      box.remove();
    }
  }, 600);
}


/* =====================================================
   HELPERS
===================================================== */
function qs(id){ return document.getElementById(id); }

function hide(id){
  const el = qs(id);
  if(el) el.remove();
}

function setText(id,val){
  if(val) qs(id).textContent = val;
}

function setImage(id,src){
  const el = qs(id);
  if(!el) return;
  el.src = src;
  el.style.display = "block";
}

function setLink(id,href){
  const el = qs(id);
  if(el) el.href = href;
}

function setPill(id,text){
  const el = qs(id);
  if(el) el.querySelector("span").textContent = text;
}

function clean(num){
  return num.replace(/\D/g,"");
}

function addNumber(num){
  const div = document.createElement("div");
  div.className = "pill";
  div.innerHTML = `
    <img src="/assets/icons/black-icons/mobile.svg">
    ${num}
  `;
  qs("contactNumbers").appendChild(div);
}

function capitalize(str){
  return str.charAt(0).toUpperCase() + str.slice(1);
}


/* =====================================================
   ICON MAPPERS (NO HARDCODED TEXT)
===================================================== */
function iconForSuitable(v){
  return v.includes("Student") ? "student.svg" :
         v.includes("Working") ? "Working-Professional.svg" :
         v.includes("Family") ? "family.svg" :
         v.includes("Couple") ? "couple.svg" :
         "check-mark-box.svg";
}

function iconForRoom(v){
  const map = {
    "Bed":"bed.svg",
    "Almirah":"almirah.svg",
    "Mattress":"bed.svg",
    "Balcony":"balcony.svg",
    "Kitchen":"kitchen.svg",
    "Attached Bathroom":"bathroom.svg",
    "AC":"infinity.svg",
    "WiFi":"wifi.svg",
    "Fridge":"fridge.svg"
  };
  return map[v] || "check-mark-box.svg";
}

function socialIcon(k){
  return k === "instagram" ? "color-icons/instagram.svg" :
         k === "facebook"  ? "color-icons/facebook.svg" :
         k === "youtube"   ? "color-icons/youtube.svg" :
         "black-icons/globe.svg";
}
