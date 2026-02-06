fetch("business.json5")
  .then(r => r.text())
  .then(t => JSON5.parse(t))
  .then(d => render(d))
  .catch(e => console.error("JSON5 error:", e));

function render(d){

  text("pgName", d.identity?.name);
  text("description", d.identity?.description);

  if(d.branding?.showLogo && d.branding.logoImage){
    image("logo", "photos/" + d.branding.logoImage);
  }

  if(d.identity?.genderType){
    const g=d.identity.genderType;
    const el=document.createElement("div");
    el.className="gender "+(g==="boys"?"boys":g==="girls"?"girls":"both");
    el.textContent=g==="boys"?"Boys":g==="girls"?"Girls":"Boys & Girls";
    $("genderBadge").appendChild(el);
  }

  if(d.contact?.primaryCall) link("callBtn","tel:"+d.contact.primaryCall); else hide("callBtn");
  if(d.contact?.whatsapp) link("whatsappBtn","https://wa.me/"+clean(d.contact.whatsapp)); else hide("whatsappBtn");
  if(d.location?.mapLink) link("mapBtn",d.location.mapLink); else hide("mapBtn");

  if(d.identity?.suitableFor?.length){
    d.identity.suitableFor.forEach(v=>pill("suitableForList",iconSuit(v),v));
  } else hide("suitableForCard");

  if(d.contact?.primaryCall) number(d.contact.primaryCall);
  d.contact?.otherNumbers?.forEach(number);

  if(d.location?.addressShort){
    $("addressText").innerHTML=`<img src="/assets/icons/color-icons/google-map.svg" width="18">${d.location.addressShort}`;
  }

  let sc=0;
  Object.entries(d.socialLinks||{}).forEach(([k,v])=>{
    if(v){sc++;pill("socialLinks",iconSocial(k),cap(k),v)}
  });
  if(!sc) hide("socialCard");

  if(d.property){
    span("propertyType",d.property.type);
    span("totalFloors",d.property.totalFloors+" Floors");
    span("liftInfo",d.property.liftAvailable?"Lift Available":"No Lift");
  } else hide("propertyInfoCard");

  if(d.rooms?.length){
    d.rooms.forEach(r=>{
      const box=document.createElement("div");
      box.className="room";
      box.innerHTML=`
        <h3>${r.type}</h3>
        <div class="price"><img src="/assets/icons/black-icons/rupee-coin-solid.svg">${r.price}</div>
        <div class="photos" id="ph-${r.prefix}"></div>
        <div class="swipe"><img src="/assets/icons/black-icons/long-arrow-right.svg" width="16">Swipe for photos</div>
      `;
      $("roomsContainer").appendChild(box);
      loadPhotos(r.prefix,"ph-"+r.prefix);
    });
  } else hide("roomsCard");

  if(d.charges){
    span("electricityCharge",d.charges.electricityIncluded?"Electricity Included":d.charges.electricityRate);
    span("waterCharge",d.charges.waterIncluded?"Water Included":"Extra");
    span("maintenanceCharge",d.charges.maintenanceIncluded?"Included":"Extra");
  } else hide("chargesCard");

  if(d.payment?.show){
    text("paymentLabel",d.payment.label||"Payment");
    image("paymentQR","photos/"+d.payment.qrImage);
  } else hide("paymentCard");
}

/* PHOTO AUTO 0→N */
function loadPhotos(p,id){
  const box=$(id);
  let i=1,found=0;
  (function next(){
    const img=new Image();
    img.src=`photos/${p}${i}.webp`;
    img.onload=()=>{found++;box.appendChild(img);i++;next();}
  })();
  setTimeout(()=>{if(!found)box.remove()},600);
}

/* HELPERS */
const $=id=>document.getElementById(id);
const hide=id=>$(id)?.remove();
const text=(i,v)=>v&&($(i).textContent=v);
const image=(i,s)=>{const e=$(i);e.src=s;e.style.display="block";}
const link=(i,h)=>$(i).href=h;
const span=(i,t)=>$(i).querySelector("span").textContent=t;
const clean=n=>n.replace(/\D/g,"");
const cap=s=>s[0].toUpperCase()+s.slice(1);

function pill(box,icon,text,href){
  const e=document.createElement(href?"a":"div");
  e.className="pill";
  if(href){e.href=href;e.target="_blank";}
  e.innerHTML=`<img src="/assets/icons/${icon}">${text}`;
  $(box).appendChild(e);
}
function number(n){pill("contactNumbers","black-icons/mobile.svg",n);}

function iconSuit(v){
  return v.includes("Student")?"black-icons/student.svg":
         v.includes("Working")?"black-icons/Working-Professional.svg":
         v.includes("Family")?"black-icons/family.svg":
         v.includes("Couple")?"black-icons/couple.svg":
         "black-icons/check-mark-box.svg";
}
function iconSocial(k){
  return k==="instagram"?"color-icons/instagram.svg":
         k==="facebook"?"color-icons/facebook.svg":
         "black-icons/globe.svg";
}
