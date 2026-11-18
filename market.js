let fCity="All",fCat="all",q=new URLSearchParams(location.search).get("q")?.toLowerCase()||"";
if(q)$("#q").value=q;
const pc=new URLSearchParams(location.search).get("cat");if(pc&&CATS[pc])fCat=pc;
function render(){
  if(!$("#cityf")){$("#cities").innerHTML='<label class="cityf">📍 <select id="cityf"><option value="All">All cities in Zimbabwe</option>'+CITIES.map(c=>`<option>${c}</option>`).join("")+'</select></label>';$("#cityf").onchange=e=>{fCity=e.target.value;render();armReveal();spot()}}
  $("#cats").innerHTML=[["all","All"],...Object.entries(CATS)].map(([k,v])=>`<button class="chip dark ${fCat===k?"on":""}" data-cat="${k}">${v}</button>`).join("");
  $("#catcards").innerHTML=Object.entries(CATS).map(([k,v])=>`<button class="cat ${fCat===k?"sel":""}" data-cat="${k}"><div class="ic ${k}">${ICON[k]}</div><b>${v}</b><small>${listings.filter(l=>l.category===k).length} listings</small></button>`).join("");
  const rows=listings.filter(l=>(fCity==="All"||l.city===fCity)&&(fCat==="all"||l.category===fCat)&&(!q||(l.title+l.description+l.city).toLowerCase().includes(q)));
  $("#list").innerHTML=rows.map(listingCard).join("")||'<p class="count">No listings match yet.</p>';
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
const mp=filePicker($("#mfile"),$("#mthumbs"));
$("#form").onsubmit=async e=>{
  e.preventDefault();const d=Object.fromEntries(new FormData(e.target));delete d.undefined;
  if(!db){$("#msg").textContent="Preview only — connect Supabase to receive real submissions.";return}
  const btn=e.submitter||e.target.querySelector("[type=submit]");btn.disabled=true;
  try{
    $("#msg").textContent=mp.files.length?"Uploading…":"Sending…";
    const attachments=mp.files.length?await uploadAll(mp.files):[];
    const r=await db.from("listings").insert({...d,approved:false,attachments});
    if(r.error)throw r.error;
    $("#msg").textContent="Thank you! Your listing will appear once approved.";e.target.reset();mp.clear();
  }catch(err){$("#msg").textContent="Could not send: "+(err.message||"please try again.")}
  btn.disabled=false;
};
boot(render);
