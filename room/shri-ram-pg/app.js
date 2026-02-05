// Load JSON5 (simple parser)
fetch("business.json5")
  .then(r => r.text())
  .then(t => JSON5.parse(t))
  .then(data => init(data));

function init(d) {

  // ---------- IDENTITY ----------
  setText("#pgName", d.identity?.name);
  setText("#description", d.identity?.description);

  if (d.branding?.showLogo && d.branding.logoImage) {
    setImage("#logo", "photos/" + d.branding.logoImage);
  } else hide("#logo");

  if (d.identity?.genderType) {
    const map = { boys: "👦 Boys", girls: "👧 Girls", both: "👦👧 Boys & Girls" };
    setHTML("#genderBadge", `<span class="badge">${map[d.identity.genderType]}</span>`);
  }

  // ---------- CONTACT ----------
  if (d.contact?.primaryCall) {
    setLink("#callBtn", "tel:" + d.contact.primaryCall);
  } else hide("#contactCard");

  if (d.contact?.whatsapp) {
    setLink("#whatsappBtn", "https://wa.me/" + clean(d.contact.whatsapp));
  }

  // ---------- ROOMS ----------
  const roomBox = qs("#roomsContainer");
  if (!d.rooms || !d.rooms.length) {
    hide("#roomsCard");
  } else {
    d.rooms.forEach(r => {
      const div = document.createElement("div");
      div.className = "room";
      div.innerHTML = `
        <h3>${r.type}</h3>
        <strong>${r.price}</strong>
        <div class="muted">${(r.roomFacilities || []).join(", ")}</div>
        <div class="photos" id="ph-${r.prefix}"></div>
      `;
      roomBox.appendChild(div);
      loadPhotos(r.prefix, `ph-${r.prefix}`);
    });
  }

  // ---------- FOOD ----------
  if (!d.food || d.food.available === false) {
    hide("#foodCard");
  } else {
    let txt = "Food Available";
    if (d.food.price) txt += " (" + d.food.price + ")";
    if (d.food.note) txt += "<br>" + d.food.note;
    setHTML("#foodText", txt);
  }

  // ---------- FACILITIES ----------
  if (!d.commonFacilities?.length) {
    hide("#facilitiesCard");
  } else {
    d.commonFacilities.forEach(f => {
      const s = document.createElement("span");
      s.textContent = f;
      qs("#facilityList").appendChild(s);
    });
  }

  // ---------- PAYMENT ----------
  if (d.payment?.show && d.payment.qrImage) {
    setText("#paymentLabel", d.payment.label || "Payment");
    setImage("#paymentQR", "photos/" + d.payment.qrImage);
  } else hide("#paymentCard");
}

// ---------- PHOTO PREFIX LOGIC ----------
function loadPhotos(prefix, containerId) {
  const box = qs("#" + containerId);
  // testing placeholders
  for (let i = 1; i <= 3; i++) {
    const img = document.createElement("img");
    img.src = "https://via.placeholder.com/200x140?text=" + prefix + i;
    box.appendChild(img);
  }
}

// ---------- HELPERS ----------
function qs(s){ return document.querySelector(s) }
function hide(s){ qs(s)?.remove() }
function setText(s,v){ if(v) qs(s).textContent=v }
function setHTML(s,v){ if(v) qs(s).innerHTML=v }
function setImage(s,src){ const e=qs(s); e.src=src; e.style.display="block" }
function setLink(s,href){ qs(s).href=href }
function clean(n){ return n.replace(/\D/g,"") }
