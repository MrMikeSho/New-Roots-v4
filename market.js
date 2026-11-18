let fCity="All",fCat="all",q=new URLSearchParams(location.search).get("q")?.toLowerCase()||"";
if(q)$("#q").value=q;
const pc=new URLSearchParams(location.search).get("cat");if(pc&&CATS[pc])fCat=pc;
function render(){
  $("#cities").innerHTML='<span style="color:var(--brand)">⛉</span>'+["All",...CITIES].map(c=>`<button class="chip ${fCity===c?"on":""}" data-city="${c}">${c==="All"?"📍 All Cities":c}</button>`).join("");
  $("#cats").innerHTML=[["all","All"],...Object.entries(CATS)].map(([k,v])=>`<button class="chip dark ${fCat===k?"on":""}" data-cat="${k}">${v}</button>`).join("");
  $("#catcards").innerHTML=Object.entries(CATS).map(([k,v])=>`<button class="cat ${fCat===k?"sel":""}" data-cat="${k}"><div class="ic ${k}">${ICON[k]}</div><b>${v}</b><small>${listings.filter(l=>l.category===k).length} listings</small></button>`).join("");
  const rows=listings.filter(l=>(fCity==="All"||l.city===fCity)&&(fCat==="all"||l.category===fCat)&&(!q||(l.title+l.description+l.city).toLowerCase().includes(q)));
  $("#list").innerHTML=rows.map(l=>`<article class="card"><div class="top"><div class="ic ${l.category}">${ICON[l.category]}</div><div><h3>${esc(l.title)}</h3><span class="tag t-${l.category}">${CATS[l.category]}</span><span class="tag c-${l.city}">📍 ${l.city}</span></div></div><p>${esc(l.description)}</p><div class="row"><span class="price">$ ${esc((l.price||"").replace(/^\$/,""))}</span><span style="color:#6b7280">👤 ${esc(l.contact_name)}</span></div><div style="margin-top:10px"><a class="phone" href="tel:${esc(l.phone)}">📞 ${esc(l.phone)}</a></div></article>`).join("")||'<p class="count">No listings match yet.</p>';
  $("#count").textContent=`Showing ${rows.length} listings across ${fCity==="All"?"all cities":fCity}`;
}
document.addEventListener("click",e=>{
  const c=e.target.closest("[data-city]"),k=e.target.closest("[data-cat]");
  if(c){fCity=c.dataset.city;render();armReveal();spot()}
  if(k){fCat=fCat===k.dataset.cat&&k.classList.contains("cat")?"all":k.dataset.cat;render();armReveal();spot()}
});
$("#q").addEventListener("input",e=>{q=e.target.value.trim().toLowerCase();render();armReveal();spot()});
$("#post").onclick=()=>{if(needLogin())return;$("#msg").textContent="";
  const f=$("#form");if(PROFILE){f.contact_name.value=PROFILE.full_name||"";f.phone.value=PROFILE.phone||"";if(PROFILE.city)f.city.value=PROFILE.city}
  $("#dlg").showModal()};
$("#cancel").onclick=()=>$("#dlg").close();
$("#form").onsubmit=async e=>{
  e.preventDefault();const d=Object.fromEntries(new FormData(e.target));
  if(!db){$("#msg").textContent="Preview only — connect Supabase to receive real submissions.";return}
  const r=await db.from("listings").insert({...d,approved:false});
  $("#msg").textContent=r.error?"Something went wrong. Please try again.":"Thank you! Your listing will appear once approved.";
  if(!r.error)e.target.reset();
};
boot(render);
