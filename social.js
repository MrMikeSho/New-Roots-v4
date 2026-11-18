/* Post actions: heart, thumb, comment, save, share, repost, edit, hide, delete + city lists */
const ITEMS=new Map(),STATS={},MYR=new Set(),MYS=new Set(),MY=[],LOCALC={};
let HID=new Set();try{HID=new Set(JSON.parse(localStorage.getItem("rr_hidden")||"[]"))}catch(e){}
const key=(t,id)=>t+":"+id;
const cityClass=c=>"c-"+String(c||"").replace(/[^A-Za-z]/g,"");
const sample=id=>String(id).startsWith("s-");

/* ---------- small helpers ---------- */
function toast(m){
  let t=$("#toast");if(!t){document.body.insertAdjacentHTML("beforeend",'<div id="toast"></div>');t=$("#toast")}
  t.textContent=m;t.classList.add("on");clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove("on"),2600);
}
function sheet(html,onClick){
  let d=$("#sheet");
  if(!d){document.body.insertAdjacentHTML("beforeend",'<dialog id="sheet"><button class="x" id="sheetx" aria-label="Close">✕</button><div id="sheetbody"></div></dialog>');d=$("#sheet");
    $("#sheetx").onclick=()=>d.close();d.addEventListener("click",e=>{if(e.target===d)d.close()});
    $("#sheetbody").addEventListener("click",e=>window._sheetClick&&window._sheetClick(e))}
  $("#sheetbody").innerHTML=html;window._sheetClick=onClick||null;if(!d.open)d.showModal();
}
const closeSheet=()=>{const d=$("#sheet");if(d&&d.open)d.close()};
function needAuth(msg){if(LIVE&&!USER){openAuth(msg||"Please log in first.");return true}return false}
function cityOptions(sel,sep){
  const keep=[...sel.options].filter(o=>o.value===""&&o.text).map(o=>o.outerHTML).join("");
  const v=sel.value;sel.innerHTML=keep+CITIES.map(c=>`<option>${c}</option>`).join("");if(v)sel.value=v;
}
const fillCities=()=>$$("select[name=city]").forEach(s=>{if(!s.dataset.filled){s.dataset.filled=1;cityOptions(s)}});

/* ---------- loading counts / my reactions ---------- */
async function loadSocial(){
  if(!db)return;
  const st=await db.from("item_stats").select("*");
  Object.keys(STATS).forEach(k=>delete STATS[k]);MYR.clear();MYS.clear();
  (st.data||[]).forEach(r=>{const k=key(r.item_type,r.item_id),s=STATS[k]||(STATS[k]={h:0,t:0,c:0});s.h+=+r.hearts;s.t+=+r.thumbs;s.c+=+r.comments});
  if(USER){
    const [a,b]=await Promise.all([db.from("reactions").select("item_type,item_id,kind"),db.from("saves").select("item_type,item_id")]);
    (a.data||[]).forEach(r=>MYR.add(key(r.item_type,r.item_id)+":"+r.kind));
    (b.data||[]).forEach(r=>MYS.add(key(r.item_type,r.item_id)));
  }
}
async function loadMine(){
  MY.length=0;if(!USER||!db)return;
  const [a,b]=await Promise.all([db.from("posts").select("*").eq("user_id",USER.id),db.from("listings").select("*").eq("user_id",USER.id)]);
  (a.data||[]).forEach(r=>MY.push({...r,_t:"post"}));(b.data||[]).forEach(r=>MY.push({...r,_t:"listing"}));
  MY.sort((x,y)=>new Date(y.created_at)-new Date(x.created_at));
}
async function refreshAll(){
  await loadData();await loadSocial();if(window.pageRefresh)await pageRefresh();if(window.REDRAW)REDRAW();
}

/* ---------- the action bar ---------- */
function actionBar(t,r){
  if(!r||!r.id)return"";
  ITEMS.set(key(t,r.id),r);
  const k=key(t,r.id),s=STATS[k]||{h:0,t:0,c:0},on=x=>MYR.has(k+":"+x);
  return `<div class="acts" data-t="${t}" data-id="${esc(r.id)}">
 <button data-a="heart" class="${on("heart")?"on heart":""}" aria-label="Love"><span class="i">${on("heart")?"♥":"♡"}</span><b>${s.h||""}</b></button>
 <button data-a="thumb" class="${on("thumb")?"on thumb":""}" aria-label="Like"><span class="i">👍</span><b>${s.t||""}</b></button>
 <button data-a="comment" aria-label="Comments"><span class="i">💬</span><b>${s.c||""}</b></button>
 <button data-a="save" class="${MYS.has(k)?"on save":""}" aria-label="Save"><span class="i">${MYS.has(k)?"🔖":"🏷"}</span></button>
 <button data-a="share" aria-label="Share"><span class="i">↗</span></button>
 <button data-a="more" aria-label="More options"><span class="i">⋯</span></button>
</div>`;
}
function paint(k){
  const [t,...rest]=k.split(":"),id=rest.join(":"),s=STATS[k]||{h:0,t:0,c:0};
  $$(".acts").forEach(el=>{
    if(el.dataset.t!==t||el.dataset.id!==id)return;
    const q=a=>el.querySelector(`[data-a=${a}]`),h=MYR.has(k+":heart"),u=MYR.has(k+":thumb"),sv=MYS.has(k);
    q("heart").className=h?"on heart":"";q("heart").innerHTML=`<span class="i">${h?"♥":"♡"}</span><b>${s.h||""}</b>`;
    q("thumb").className=u?"on thumb":"";q("thumb").innerHTML=`<span class="i">👍</span><b>${s.t||""}</b>`;
    q("comment").innerHTML=`<span class="i">💬</span><b>${s.c||""}</b>`;
    q("save").className=sv?"on save":"";q("save").innerHTML=`<span class="i">${sv?"🔖":"🏷"}</span>`;
  });
}
const statusBadge=r=>r.hidden?'<span class="badge hid">🙈 Hidden from everyone</span>':!r.approved?'<span class="badge wait">⏳ Waiting for approval</span>':'<span class="badge live">✅ Live</span>';

/* ---------- react / save ---------- */
async function toggleReact(t,id,kind){
  if(needAuth("Log in to love or like posts."))return;
  const k=key(t,id),rk=k+":"+kind,was=MYR.has(rk),s=STATS[k]||(STATS[k]={h:0,t:0,c:0}),f=kind==="heart"?"h":"t";
  was?MYR.delete(rk):MYR.add(rk);s[f]+=was?-1:1;paint(k);
  if(!LIVE||sample(id))return;
  const r=was?await db.from("reactions").delete().match({user_id:USER.id,item_type:t,item_id:id,kind}):await db.from("reactions").insert({item_type:t,item_id:id,kind});
  if(r.error){was?MYR.add(rk):MYR.delete(rk);s[f]+=was?1:-1;paint(k);toast("Could not update. Try again.")}
}
async function toggleSave(t,id){
  if(needAuth("Log in to save posts for later."))return;
  const k=key(t,id),was=MYS.has(k);was?MYS.delete(k):MYS.add(k);paint(k);
  toast(was?"Removed from saved":"Saved — find it under Saved posts");
  if(!LIVE||sample(id))return;
  const r=was?await db.from("saves").delete().match({user_id:USER.id,item_type:t,item_id:id}):await db.from("saves").insert({item_type:t,item_id:id});
  if(r.error){was?MYS.add(k):MYS.delete(k);paint(k);toast("Could not save. Try again.")}
  else if(was&&window.pageRefresh)pageRefresh();
}

/* ---------- comments ---------- */
async function openComments(t,id){
  const k=key(t,id),r=ITEMS.get(k);
  const draw=list=>{
    sheet(`<h3>💬 Comments</h3><p class="sheetsub">${esc(r?.title||"")}</p>
<div class="clist">${list.map(c=>`<div class="cm"><span class="fp-av sm">${esc(initials(c.author_name))}</span><div><b>${esc(c.author_name)}</b> <small>${ago(c.created_at)}</small><div>${esc(c.body)}</div>${USER&&c.user_id===USER.id?`<button class="linkbtn dl" data-del="${esc(c.id)}">Delete</button>`:""}</div></div>`).join("")||'<p class="empty2">No comments yet — start the conversation.</p>'}</div>
<form id="cform"><input name="body" placeholder="Write a comment…" maxlength="500" required autocomplete="off"><button class="btn" type="submit">Send</button></form>`,
    async e=>{const b=e.target.closest("[data-del]");if(!b)return;
      if(LIVE){await db.from("comments").delete().eq("id",b.dataset.del)}else{LOCALC[k]=(LOCALC[k]||[]).filter(c=>c.id!==b.dataset.del)}
      const s=STATS[k]||(STATS[k]={h:0,t:0,c:0});s.c=Math.max(0,s.c-1);paint(k);load()});
    $("#cform").onsubmit=async e=>{
      e.preventDefault();if(needAuth("Log in to comment."))return;
      const body=e.target.body.value.trim();if(!body)return;
      const name=displayName()||"Member";
      if(LIVE&&!sample(id)){const x=await db.from("comments").insert({item_type:t,item_id:id,author_name:name,body});if(x.error)return toast("Could not post comment.")}
      else{(LOCALC[k]=LOCALC[k]||[]).push({id:"c"+Date.now(),author_name:name,body,created_at:new Date().toISOString(),user_id:USER?.id})}
      const s=STATS[k]||(STATS[k]={h:0,t:0,c:0});s.c++;paint(k);load();
    };
  };
  const load=async()=>{
    if(LIVE&&!sample(id)){const x=await db.from("comments").select("*").match({item_type:t,item_id:id}).order("created_at");draw(x.data||[])}
    else draw(LOCALC[k]||[]);
  };
  load();
}

/* ---------- share ---------- */
const itemUrl=(t,id)=>location.origin+"/post.html?t="+t+"&id="+encodeURIComponent(id);
async function shareItem(t,id){
  const r=ITEMS.get(key(t,id));if(!r)return;
  const url=itemUrl(t,id),text=`${r.title} — on Rudo Roots, The Village`;
  if(navigator.share){try{await navigator.share({title:r.title,text,url});return}catch(e){if(e.name==="AbortError")return}}
  const u=encodeURIComponent(url),x=encodeURIComponent(text+" "+url);
  sheet(`<h3>↗ Share</h3><div class="menu">
<a class="mi" target="_blank" rel="noopener" href="https://wa.me/?text=${x}">🟢 WhatsApp</a>
<a class="mi" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=${u}">🔵 Facebook</a>
<a class="mi" target="_blank" rel="noopener" href="https://t.me/share/url?url=${u}&text=${encodeURIComponent(text)}">✈️ Telegram</a>
<a class="mi" target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?text=${x}">𝕏 X / Twitter</a>
<a class="mi" href="mailto:?subject=${encodeURIComponent(r.title)}&body=${x}">✉️ Email</a>
<button class="mi" data-m="copy">🔗 Copy link</button></div>`,
  async e=>{if(e.target.closest("[data-m=copy]")){try{await navigator.clipboard.writeText(url);toast("Link copied")}catch(_){prompt("Copy this link:",url)}closeSheet()}});
}

/* ---------- more menu: repost / edit / hide / delete ---------- */
function openMore(t,id){
  const k=key(t,id),r=ITEMS.get(k);if(!r)return;
  const mine=!!USER&&r.user_id===USER.id;
  sheet(`<h3>Options</h3><div class="menu">
<button class="mi" data-m="repost">🔁 Repost to the feed</button>
<button class="mi" data-m="share">↗ Share to other apps</button>
${mine?`<button class="mi" data-m="edit">✏️ Edit</button><button class="mi" data-m="hide">${r.hidden?"👁 Show again":"🙈 Hide from everyone"}</button><button class="mi danger" data-m="del">🗑 Delete</button>`
:`<button class="mi" data-m="myhide">🙈 Hide from my feed</button>`}</div>`,
  async e=>{
    const b=e.target.closest("[data-m]");if(!b)return;const m=b.dataset.m;
    if(m==="share"){closeSheet();return shareItem(t,id)}
    if(m==="repost")return repost(t,id);
    if(m==="myhide"){HID.add(k);try{localStorage.setItem("rr_hidden",JSON.stringify([...HID]))}catch(_){}closeSheet();toast("Hidden from your feed");return window.REDRAW&&REDRAW()}
    if(m==="edit")return editItem(t,id);
    if(m==="hide")return toggleHidden(t,id);
    if(m==="del")return deleteItem(t,id);
  });
}
async function repost(t,id){
  if(needAuth("Log in to repost."))return;
  const r=ITEMS.get(key(t,id)),name=displayName()||"Member",phone=PROFILE?.phone||r.phone;
  if(!LIVE||sample(id)){
    posts.unshift({id:"s-r"+Date.now(),type:t==="post"?r.type:"resource",title:r.title,body:r.body||r.description,city:r.city,contact_name:name,phone,created_at:new Date().toISOString(),repost_of:r.id,orig_author:r.orig_author||r.contact_name,attachments:r.attachments});
    closeSheet();toast("Reposted to the feed ✓");return window.REDRAW&&REDRAW();
  }
  const x=await db.rpc("repost_item",{p_type:t,p_id:id,p_name:name,p_phone:phone});
  closeSheet();if(x.error)return toast("Could not repost: "+x.error.message);
  toast("Reposted to the feed ✓");refreshAll();
}
function editItem(t,id){
  const r=ITEMS.get(key(t,id)),inp=(n,l,v)=>`<label>${l}</label><input name="${n}" value="${esc(v)}" maxlength="90" required>`,ta=(n,l,v)=>`<label>${l}</label><textarea name="${n}" rows="3" maxlength="400" required>${esc(v)}</textarea>`;
  const city=`<label>City</label><select name="city">${CITIES.map(c=>`<option ${c===r.city?"selected":""}>${c}</option>`).join("")}</select>`;
  const cat=t==="listing"?`<label>Category</label><select name="category">${Object.entries(CATS).map(([k,v])=>`<option value="${k}" ${k===r.category?"selected":""}>${v}</option>`).join("")}</select>`:"";
  sheet(`<form id="editf"><h3>✏️ Edit</h3>${inp("title","Title",r.title)}${t==="post"?ta("body","Details",r.body):ta("description","Description",r.description)+cat+`<label>Price</label><input name="price" value="${esc(r.price||"")}" maxlength="40">`}${city}${inp("contact_name","Your name",r.contact_name)}<label>Phone / WhatsApp</label><input name="phone" value="${esc(r.phone)}" required>
<div class="notice">After saving, your post goes back to the village team for approval before it shows again.</div><button class="btn" type="submit">Save changes</button><div class="msg" id="emsg"></div></form>`);
  $("#editf").onsubmit=async e=>{
    e.preventDefault();const d=Object.fromEntries(new FormData(e.target));
    const x=await db.from(t==="post"?"posts":"listings").update(d).eq("id",id);
    if(x.error)return $("#emsg").textContent="Could not save: "+x.error.message;
    closeSheet();toast("Saved — waiting for approval");refreshAll();
  };
}
async function toggleHidden(t,id){
  const r=ITEMS.get(key(t,id)),x=await db.from(t==="post"?"posts":"listings").update({hidden:!r.hidden}).eq("id",id);
  closeSheet();if(x.error)return toast("Could not update.");
  toast(r.hidden?"Visible again":"Hidden from everyone");refreshAll();
}
async function deleteItem(t,id){
  if(!confirm("Delete this for good? This cannot be undone."))return;
  const x=await db.from(t==="post"?"posts":"listings").delete().eq("id",id);
  closeSheet();if(x.error)return toast("Could not delete.");
  toast("Deleted");refreshAll();
}

/* ---------- click wiring ---------- */
document.addEventListener("click",e=>{
  const b=e.target.closest(".acts [data-a]");if(!b)return;
  const bar=b.closest(".acts"),t=bar.dataset.t,id=bar.dataset.id,a=b.dataset.a;
  if(a==="heart"||a==="thumb")toggleReact(t,id,a);
  else if(a==="save")toggleSave(t,id);
  else if(a==="comment")openComments(t,id);
  else if(a==="share")shareItem(t,id);
  else if(a==="more")openMore(t,id);
});
