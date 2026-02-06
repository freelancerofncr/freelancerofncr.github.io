/* =====================================================
   LOAD business.json5
===================================================== */
fetch("business.json5")
  .then(res => res.text())
  .then(text => JSON5.parse(text))
  .then(data => renderPage(data))
  .catch(err => console.error("JSON5 Load Error:", err));

/* =====================================================
   MAIN RENDER
===================================================== */
function renderPage(d){

  /* ---------- IDENTITY ---------- */
  setText("pgName", d.identity?.name);
  setText("description", d.identity?.description);

  if(d.branding?.showLogo && d.branding.logoImage){
    setImage("logo", "photos/" + d.branding.logoImage);
  } else {
    hide("logo");
  }

  /* ---------- GENDER ---------- */
  if(d.identity?.genderType){
    const g = d.identity.genderType;
    const badge = document.createElement("div");
    badge.className = "gender " + g;
    badge.textContent =
      g === "boys" ? "Boys" :
      g === "girls" ? "Girls" :
      "Boys & Girls";
    document.getElementById("genderBadge").appendChild(badge);
  }

  /* ---------- ACTION BUTTONS ---------- */
  if(d.contact?.primaryCall){
    setLink("callBtn", "tel:" + d.contact.primaryCall);
  }
  if(d.contact?.whatsapp){
    setLink("whatsappBtn", "https://wa.me/" + clean(d.contact.whatsapp));
  }
  if(d.location?.mapLink){
    setLink("mapBtn", d.location.mapLink);
  }

  /* ---------- SUITABLE FOR ---------- */
  if(d.identity?.suitableFor?.length){
    d.identity.suitableFor.forEach(item => {
      const div = document.createElement("div");
      div.className = "pill";
      div.innerHTML = `
        <img src="/assets/icons/black-icons/${iconForSuitable(item)}" />
        ${item}
      `;
      qs("suitableForList").appendChild(div);
    });
  } else {
    hide("suitableForCard");
  }

  /* ---------- CONTACT NUMBERS ---------- */
  if(d.contact?.primaryCall){
    addNumber(d.contact.primaryCall);
  }
  if(d.contact?.otherNumbers?.length){
    d.contact.otherNumbers.forEach(n => addNumber(n));
  }

  /* ---------- ADDRESS ---------- */
  if(d.location?.addressShort){
    qs("addressText").innerHTML = `
      <img src="/assets/icons/color-icons/google-map.svg" width="18" />
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
        <img src="/assets/icons/${socialIcon(key)}" />
        ${capitalize(key)}
      `;
      qs("socialLinks").appendChild(a);
    }
  });
  if(!socialCount) hide("socialCard");

  /* ---------- PROPERTY INFO ---------- */
  if(d.property){
    setPill("propertyType", d.property.type);
    setPill("totalFloors", d.property.totalFloors + " Floors");
    setPill("liftInfo", d.property.liftAvailable ? "Lift Available" : "No Lift");
  } else {
    hide("propertyInfoCard");
  }

  /* ---------- ROOMS ---------- */
  if(d.rooms?.length){
    d.rooms.forEach(r=>{
      const room = document.createElement("div");
      room.className = "room";

      room.innerHTML = `
        <h3>${r.type}</h3>
        <div class="price">
          <img src="/assets/icons/black-icons/indian-rupee-coin.svg" width="18" />
          ${r.price}
        </div>

        <div class="facility-list">
          ${(r.roomFacilities||[]).map(f=>`
            <span>
              <img src="/assets/icons/black-icons/${iconForRoom(f)}" />
              ${f}
            </span>
          `).join("")}
        </div>

        <div class="photos" id="ph-${r.prefix}"></div>

        <div class="muted" style="margin-top:8px;display:flex;align-items:center;gap:6px">
          <img src="/assets/icons/black-icons/long-arrow-right.svg" width="18" />
          Swipe for more photos
        </div>
      `;

      qs("roomsContainer").appendChild(room);
      loadPhotos(r.prefix, "ph-" + r.prefix);
    });
  } else {
    hide("roomsCard");
  }

  /* ---------- FOOD ---------- */
  if(!d.food || d.food.available === false){
    hide("foodCard");
  } else {
    let t = "Food Available";
    if(d.food.price) t += " (" + d.food.price + ")";
    if(d.food.note) t += "<br>" + d.food.note;
    qs("foodText").innerHTML = t;
  }

  /* ---------- CHARGES ---------- */
  if(d.charges){
    setCharge("electricityCharge",
      d.charges.electricityIncluded
        ? "Electricity Included"
        : "Electricity: " + d.charges.electricityRate
    );

    setCharge("waterCharge",
      d.charges.waterIncluded ? "Water Included" : "Water Charges Extra"
    );

    setCharge("maintenanceCharge",
      d.charges.maintenanceIncluded ? "Maintenance Included" : "Maintenance Extra"
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
   PHOTO PREFIX LOADER
===================================================== */
function loadPhotos(prefix, boxId){
  const box = document.getElementById(boxId);
  let found = false;

  for(let i=1;i<=20;i++){
    const img = new Image();
    img.src = `photos/${prefix}${i}.webp`;
    img.onload = () => {
      found = true;
      box.appendChild(img);
    };
  }

  // If no photos found, hide gallery later
  setTimeout(()=>{
    if(!box.children.length){
      box.remove();
    }
  },500);
}

/* =====================================================
   HELPERS
===================================================== */
function qs(id){ return document.getElementById(id); }
function hide(id){ qs(id)?.remove(); }

function setText(id,val){
  if(val) qs(id).textContent = val;
}

function setImage(id,src){
  const el = qs(id);
  el.src = src;
  el.style.display = "block";
}

function setLink(id,href){
  qs(id).href = href;
}

function clean(n){
  return n.replace(/\D/g,"");
}

function addNumber(num){
  const d = document.createElement("div");
  d.className = "pill";
  d.innerHTML = `
    <img src="/assets/icons/black-icons/mobile.svg" />
    ${num}
  `;
  qs("contactNumbers").appendChild(d);
}

function setPill(id,text){
  qs(id).querySelector("span").textContent = text;
}

function setCharge(id,text){
  qs(id).querySelector("span").textContent = text;
}

function capitalize(s){
  return s.charAt(0).toUpperCase()+s.slice(1);
}

/* =====================================================
   ICON MAPPERS
===================================================== */
function iconForSuitable(v){
  return v.includes("Student") ? "student.svg" :
         v.includes("Working") ? "Working-Professional.svg" :
         v.includes("Family") ? "family.svg" :
         v.includes("Couple") ? "couple.svg" :
         "check-mark-box.svg";
}

function iconForRoom(v){
  const map={
    Bed:"bed.svg",
    Almirah:"almirah.svg",
    Mattress:"bed.svg",
    Balcony:"balcony.svg",
    Kitchen:"kitchen.svg",
    "Attached Bathroom":"bathroom.svg",
    AC:"infinity.svg"
  };
  return map[v] || "check-mark-box.svg";
}

function socialIcon(k){
  return k==="instagram" ? "color-icons/instagram.svg" :
         k==="facebook" ? "color-icons/facebook.svg" :
         k==="youtube" ? "color-icons/youtube.svg" :
         "black-icons/globe.svg";
}
