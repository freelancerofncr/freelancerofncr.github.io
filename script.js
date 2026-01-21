// Typing effect
const texts = [
  "Digital QR Menu for Restaurants",
  "Google Business Profile Management",
  "Affordable Business Websites"
];
let i=0,j=0,del=false;
const el=document.querySelector(".typing");

function type(){
  if(!el) return;
  el.textContent=texts[i].slice(0,j);
  if(!del){ j++; if(j>texts[i].length){ del=true; setTimeout(()=>{},800);} }
  else{ j--; if(j===0){ del=false; i=(i+1)%texts.length; } }
  setTimeout(type,del?60:100);
}
type();

// Counter
document.querySelectorAll(".count").forEach(el=>{
  let t=+el.dataset.count,c=0;
  let int=setInterval(()=>{
    c+=Math.ceil(t/40);
    if(c>=t){ el.textContent=t; clearInterval(int); }
    else el.textContent=c;
  },30);
});
