fetch("business.json5")
  .then(r => r.text())
  .then(t => JSON5.parse(t))
  .then(d => render(d));

function render(d){

  // ===== BASIC =====
  setText("pgName", d.identity.name);
  setText("description", d.identity.description);

  if(d.branding?.showLogo){
    setImage("logo","photos/"+d.branding.logoImage);
  }

  const genderMap={
    boys:"👦 Boys PG",
    girls:"👧 Girls PG",
    both:"👦👧 Boys & Girls PG"
  };
  if(d.identity.genderType){
    document.getElementById("genderBadge").innerHTML =
      `<span class="badge">${genderMap[d.identity.genderType]}</span>`;
  }

  // ===== CONTACT =====
  setLink("callBtn","tel:"+d.contact.primaryCall);
  setLink("whatsappBtn","https://wa.me/"+clean(d.contact.whatsapp));

  // ===== ROOMS =====
  const roomBox=document.getElementById("roomsContainer");
  d.rooms.forEach(r=>{
    const div=document.createElement("div");
    div.className="room";

    div.innerHTML=`
      <h3>${r.type}</h3>
      <div class="price">${r.price}</div>
      <div class="facility-list">
        ${(r.roomFacilities||[]).map(f=>`<span>${f}</span>`).join("")}
      </div>
      <div class="photos" id="ph-${r.prefix}"></div>
    `;
    roomBox.appendChild(div);
    loadPhotos(r.prefix,"ph-"+r.prefix);
  });

  // ===== FOOD =====
  if(!d.food || d.food.available===false){
    hide("foodCard");
  }else{
    let t="Food Available";
    if(d.food.price) t+=" ("+d.food.price+")";
    if(d.food.note) t+="<br>"+d.food.note;
    document.getElementById("foodText").innerHTML=t;
  }

  // ===== FACILITIES =====
  if(!d.commonFacilities?.length){
    hide("facilitiesCard");
  }else{
    d.commonFacilities.forEach(f=>{
      const s=document.createElement("span");
      s.textContent=f;
      document.getElementById("facilityList").appendChild(s);
    });
  }

  // ===== RULES =====
  if(!d.rules?.length){
    hide("rulesCard");
  }else{
    d.rules.forEach(r=>{
      const li=document.createElement("li");
      li.textContent=r;
      document.getElementById("rulesList").appendChild(li);
    });
  }

  // ===== PAYMENT =====
  if(d.payment?.show){
    setText("paymentLabel",d.payment.label);
    setImage("paymentQR","photos/"+d.payment.qrImage);
  }else{
    hide("paymentCard");
  }
}

// ===== PHOTO PREFIX LOADER =====
function loadPhotos(prefix,id){
  const box=document.getElementById(id);
  for(let i=1;i<=10;i++){
    const img=new Image();
    img.src=`photos/${prefix}${i}.webp`;
    img.onload=()=>box.appendChild(img);
  }
}

// ===== HELPERS =====
function setText(id,val){ if(val) document.getElementById(id).textContent=val }
function setImage(id,src){
  const e=document.getElementById(id);
  e.src=src; e.style.display="block";
}
function setLink(id,href){ document.getElementById(id).href=href }
function hide(id){ document.getElementById(id)?.remove() }
function clean(n){ return n.replace(/\D/g,"") }
