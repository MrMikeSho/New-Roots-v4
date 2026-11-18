/* Shared by every page: layout, auth, data, animations */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const LIVE=!!(CONFIG.SUPABASE_URL&&CONFIG.SUPABASE_ANON_KEY&&window.supabase);
const db=LIVE?supabase.createClient(CONFIG.SUPABASE_URL,CONFIG.SUPABASE_ANON_KEY):null;
let USER=null,PROFILE=null;
const here=(location.pathname.split("/").pop()||"index.html").replace(/\.html$/,"")||"index";

/* ---------- layout ---------- */
function layout(){
  document.body.insertAdjacentHTML("afterbegin",`
<header id="top"><div class="bar">
  <a class="logo" href="index.html" aria-label="Home"><img src="${esc(CONFIG.LOGO)}" alt="Rudo Roots logo"></a>
  <a class="brand" href="index.html" style="text-decoration:none;color:inherit"><b>Rudo Roots</b><span>The Village</span></a>
  <button class="burger" id="burger" aria-label="Menu">☰</button>
</div></header>
<div id="scrim"></div>
<aside id="drawer" aria-label="Menu">
  <button class="x" id="dclose" aria-label="Close">✕</button>
  <div id="acct"></div>
  <nav>
    <a href="index.html">🏠 Home</a>
    <a href="news.html">📰 Village Updates</a>
    <a data-board="gathering">📅 Parenting Gatherings</a>
    <a data-board="help">⚠️ Support Requests</a>
    <a href="marketplace.html">🛍 Marketplace</a>
  </nav>
  <a class="emerg" href="support.html">📞 Emergency Support</a>
</aside>`);
  document.body.insertAdjacentHTML("beforeend",`
<footer><div class="wrap">
  <div class="g">
    <div><h4>Community</h4><a data-board="gathering">Parenting Gatherings</a><a data-board="help">Support Requests</a><a href="news.html">Village Updates</a><a data-board="member">Member Profiles</a></div>
    <div><h4>Resources</h4><a data-board="swap">Childcare Swaps</a><a data-board="donation">Donations &amp; Support</a><a href="marketplace.html">Marketplace</a><a data-board="resource">Resources</a></div>
    <div><h4>About</h4><a href="index.html#stats">Our Mission</a><a href="index.html#join">How It Works</a><a href="#" data-auth>Join The Village</a><a href="news.html">Community News</a></div>
    <div><h4>Contact</h4><a href="support.html">📞 Emergency Support</a><span>Harare, Zimbabwe</span><br><span>Rudo Roots Community</span></div>
  </div>
  <div class="c">© ${new Date().getFullYear()} The Village: Rudo Roots. All rights reserved.<br><a href="privacy.html" style="display:inline;margin:8px">Privacy Policy</a><a href="guidelines.html" style="display:inline;margin:8px">Community Guidelines</a><a href="terms.html" style="display:inline;margin:8px">Terms</a></div>
</div></footer>
<dialog id="board">
  <h3 id="bt" style="margin:0 0 2px;font-size:24px"></h3>
  <small id="bb" style="color:#6b7280"></small>
  <div id="bl" style="margin:14px 0;max-height:34vh;overflow:auto"></div>
  <form id="bform" method="dialog">
    <b>Add yours</b>
    <label>Title</label><input name="title" required maxlength="90">
    <label>Details</label><textarea name="body" rows="3" required maxlength="400"></textarea>
    <label>City</label><select name="city"><option>Harare</option><option>Bulawayo</option><option>Mutare</option></select>
    <label>Your name</label><input name="contact_name" required maxlength="40">
    <label>Phone / WhatsApp</label><input name="phone" required inputmode="tel" placeholder="+2637...">
    <div class="row" style="margin-top:16px"><button class="btn" type="submit">Submit</button><button class="chip" type="button" id="bclose">Close</button></div>
    <div class="msg" id="bmsg"></div>
  </form>
</dialog>`);
  $("#drawer").addEventListener("click",e=>{if(e.target.closest("a,button.logout"))dOpen(false)});
  $("#burger").onclick=()=>dOpen(true);$("#dclose").onclick=()=>dOpen(false);$("#scrim").onclick=()=>dOpen(false);
  $$("#drawer nav a[href]").forEach(a=>{if(a.getAttribute("href").replace(".html","")===here+"")a.classList.add("nav-on")});
  addEventListener("scroll",()=>$("header").classList.toggle("scrolled",scrollY>10),{passive:true});
}
function authDialog(){
  document.body.insertAdjacentHTML("beforeend",`<dialog id="authdlg">
  <button class="x" id="authx" aria-label="Close">✕</button>
  <div class="logo big"><img src="logo.png" alt="Rudo Roots"></div>
  <h2 id="at">Join the Village</h2>
  <p class="sub" id="as">Log in or create your account in seconds</p>
  <div class="notice" id="aprev" hidden>Preview mode: sign-in goes live once Supabase is connected (see README).</div>
  <button class="gbtn" data-prov="google"><svg width="22" height="22" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/></svg> Continue with Google</button>
  <button class="gbtn fb" data-prov="facebook"><svg width="22" height="22" viewBox="0 0 48 48"><path fill="#1877F2" d="M24 4C12.95 4 4 12.95 4 24c0 9.99 7.32 18.27 16.88 19.77V29.78h-5.08V24h5.08v-4.41c0-5.02 2.99-7.79 7.56-7.79 2.19 0 4.48.39 4.48.39v4.93h-2.52c-2.49 0-3.26 1.54-3.26 3.13V24h5.55l-.89 5.78h-4.66v13.99C36.68 42.27 44 33.99 44 24c0-11.05-8.95-20-20-20z"/></svg> Continue with Facebook</button>
  <div class="or">or</div>
  <div id="astep0"><button class="gbtn" id="aphone">📱 Continue with phone number</button></div>
  <div id="astep1" hidden>
    <label for="aph">Phone number</label>
    <div class="phrow"><input class="cc" id="acc" value="+263" inputmode="tel" aria-label="Country code"><input id="aph" type="tel" inputmode="tel" placeholder="712 345 678" autocomplete="tel-national"></div>
    <button class="btn" id="asend">Send code</button>
  </div>
  <div id="astep2" hidden>
    <label for="acode">Enter the 6-digit code we sent</label>
    <input class="codein" id="acode" inputmode="numeric" maxlength="6" placeholder="······" autocomplete="one-time-code">
    <button class="btn" id="averify">Verify &amp; continue</button>
    <button class="linkbtn" id="aback">Use a different number</button>
  </div>
  <div class="err" id="aerr"></div><div class="okm" id="aok"></div>
  <p class="fine">By continuing you agree to our <a href="terms.html">Terms</a>, <a href="privacy.html">Privacy Policy</a> and <a href="guidelines.html">Community Guidelines</a>.</p>
</dialog>`);
  const err=m=>{$("#aerr").textContent=m||"";$("#aok").textContent=""},ok=m=>{$("#aok").textContent=m;$("#aerr").textContent=""};
  let phone="";
  $("#authx").onclick=()=>$("#authdlg").close();
  $("#authdlg").addEventListener("click",e=>{if(e.target.id==="authdlg")$("#authdlg").close()});
  $$("#authdlg [data-prov]").forEach(b=>b.onclick=async()=>{
    if(!LIVE)return err("Connect Supabase first — see README.");
    const r=await db.auth.signInWithOAuth({provider:b.dataset.prov,options:{redirectTo:location.href.split("#")[0]}});
    if(r.error)err(r.error.message);
  });
  $("#aphone").onclick=()=>{$("#astep0").hidden=true;$("#astep1").hidden=false;$("#aph").focus()};
  $("#asend").onclick=async()=>{
    const cc=$("#acc").value.replace(/[^\d+]/g,"")||CONFIG.COUNTRY_CODE;
    phone=(cc.startsWith("+")?cc:"+"+cc)+$("#aph").value.replace(/\D/g,"").replace(/^0+/,"");
    if(phone.length<11)return err("Enter a valid phone number.");
    if(!LIVE)return err("Connect Supabase first — see README.");
    $("#asend").disabled=true;const r=await db.auth.signInWithOtp({phone});$("#asend").disabled=false;
    if(r.error)return err(r.error.message);
    $("#astep1").hidden=true;$("#astep2").hidden=false;ok("Code sent to "+phone);$("#acode").focus();
  };
  $("#aback").onclick=()=>{$("#astep2").hidden=true;$("#astep1").hidden=false;err("")};
  $("#averify").onclick=async()=>{
    const token=$("#acode").value.trim();if(token.length<6)return err("Enter the 6-digit code.");
    const r=await db.auth.verifyOtp({phone,token,type:"sms"});
    if(r.error)return err(r.error.message);
    location.reload();
  };
  document.addEventListener("click",e=>{
    const a=e.target.closest("[data-auth]");if(!a)return;
    e.preventDefault();dOpen(false);
    if(USER)return location.href="profile.html";
    openAuth();
  });
}
function openAuth(msg){
  if(!LIVE)$("#aprev").hidden=false;
  $("#as").textContent=msg||"Log in or create your account in seconds";
  $("#authdlg").showModal();
}
const dOpen=o=>{$("#drawer").classList.toggle("on",o);$("#scrim").classList.toggle("on",o)};

/* ---------- auth ---------- */
const initials=n=>(n||"?").trim().split(/\s+/).map(w=>w[0]).slice(0,2).join("").toUpperCase();
async function loadUser(){
  if(!db)return;
  const {data}=await db.auth.getSession();USER=data.session?.user||null;
  if(USER){const r=await db.from("profiles").select("*").eq("id",USER.id).maybeSingle();PROFILE=r.data||null}
  db.auth.onAuthStateChange((_e,s)=>{USER=s?.user||null;paintAccount()});
}
function displayName(){return PROFILE?.full_name||USER?.user_metadata?.full_name||USER?.user_metadata?.name||USER?.phone||USER?.email||""}
function paintAccount(){
  const box=$("#acct");if(!box)return;
  if(USER){
    const n=displayName(),pic=PROFILE?.avatar_url||USER.user_metadata?.avatar_url;
    box.innerHTML=`<a class="acct" href="profile.html"><div class="av">${pic?`<img src="${esc(pic)}" alt="">`:esc(initials(n))}</div><div><b>${esc(n||"My profile")}</b><small>View &amp; edit profile</small></div></a><button class="logout" id="logout">Log out</button>`;
    $("#logout").onclick=async()=>{await db.auth.signOut();location.href="index.html"};
  }else{
    box.innerHTML=`<a class="acct" data-auth href="#"><div class="av">👤</div><div><b>Log in / Sign up</b><small>Join the village</small></div></a>`;
  }
}
/* send to login if posting needs an account (preview mode lets you try the forms) */
function needLogin(){
  if(!LIVE||USER)return false;
  openAuth("Please log in to post — it keeps the village safe.");return true;
}

/* ---------- data ---------- */
let posts=[];
async function loadData(){
  if(!db)return;
  try{
    const l=await db.from("listings").select("*").eq("approved",true).order("created_at",{ascending:false});
    if(l.data?.length)window.listings=l.data;
    const n=await db.from("news").select("*").order("published",{ascending:false});
    if(n.data?.length)window.news=n.data.map(x=>({...x,date:x.published}));
    const p=await db.from("posts").select("*").eq("approved",true).order("created_at",{ascending:false});
    if(p.data)posts=p.data;
  }catch(e){console.warn(e)}
}

/* ---------- community boards (dialog on every page) ---------- */
let curBoard="help";
function openBoard(t){
  curBoard=t;const B=BOARDS[t];$("#bt").textContent=B.t;$("#bb").textContent=B.b;$("#bmsg").textContent="";
  const rows=posts.filter(p=>p.type===t);
  $("#bl").innerHTML=rows.map(p=>`<div class="post"><b>${esc(p.title)}</b><div>${esc(p.body)}</div><small>📍 ${esc(p.city)} · 👤 ${esc(p.contact_name)} · <a href="tel:${esc(p.phone)}">${esc(p.phone)}</a></small></div>`).join("")||'<p style="color:#6b7280">Nothing here yet — be the first to post.</p>';
  const f=$("#bform");f.contact_name.value=displayName()&&!/^\+?\d/.test(displayName())?displayName():f.contact_name.value;
  if(PROFILE?.phone&&!f.phone.value)f.phone.value=PROFILE.phone;
  if(PROFILE?.city)f.city.value=PROFILE.city;
  $("#board").showModal();
}
function wireBoards(){
  document.addEventListener("click",e=>{const b=e.target.closest("[data-board]");if(b){e.preventDefault();dOpen(false);openBoard(b.dataset.board)}});
  $("#bclose").onclick=()=>$("#board").close();
  $("#bform").onsubmit=async e=>{
    e.preventDefault();
    if(needLogin())return;
    const d=Object.fromEntries(new FormData(e.target));
    if(!db){$("#bmsg").textContent="Preview only — connect Supabase to receive real posts.";return}
    const r=await db.from("posts").insert({...d,type:curBoard,approved:false});
    $("#bmsg").textContent=r.error?"Something went wrong. Please try again.":"Thank you! It will appear once approved.";
    if(!r.error)e.target.reset();
  };
}

/* ---------- animation engine ---------- */
const fmt=n=>n>=1000?n.toLocaleString("en-US"):String(n);
function countUp(el){
  const to=+el.dataset.count,suf=el.dataset.suffix||"",t0=performance.now(),dur=1600;
  const step=t=>{const k=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-k,3);el.textContent=fmt(Math.round(to*e))+(k<1?"":suf);if(k<1)requestAnimationFrame(step)};
  requestAnimationFrame(step);
}
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");e.target.querySelectorAll?.("[data-count]").forEach(countUp);if(e.target.dataset.count)countUp(e.target);io.unobserve(e.target)}}),{threshold:.15});
function armReveal(){
  $$(".gc,.qc,.hc,.card,.ncard,.scard,.stat,.cat,.join,.eyebrow,.band h2,.glance h2,.sub,.hero,.panel,.support h2,.sic,.page-head,.authbox,.profbox").forEach(el=>{
    if(el.dataset.armed||el.closest(".vhero"))return;el.dataset.armed=1;
    const i=[...el.parentElement.children].indexOf(el);
    el.style.setProperty("--d",(Math.min(i,6)*.09)+"s");el.classList.add("rv");io.observe(el);
  });
  $$(".hstats b[data-count]").forEach(b=>setTimeout(()=>countUp(b),1100));
}
function spot(){
  const mid=innerHeight/2;
  $$(".qgrid,.hub,.g4,#list,#newslist").forEach(box=>{
    let best=null,bd=1e9;
    [...box.children].forEach(el=>{const r=el.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;const d=Math.abs((r.top+r.bottom)/2-mid);if(d<bd-1){bd=d;best=el}});
    [...box.children].forEach(el=>el.classList.toggle("active",el===best&&bd<innerHeight*.34));
  });
}
function particles(){
  const w=$("#pts");if(!w)return;
  for(let i=0;i<24;i++){const e=document.createElement("i");
    e.style.cssText=`--x:${Math.random()*100}%;--y:${Math.random()*100}%;--s:${2+Math.random()*5}px;--tm:${6+Math.random()*8}s;--dl:${-Math.random()*10}s;--dx:${(Math.random()-.5)*60}px`;w.appendChild(e)}
}
let tick=false;
function onScroll(){
  if(tick)return;tick=true;
  requestAnimationFrame(()=>{
    tick=false;const h=$(".vhero");
    if(h){const p=Math.min(1,Math.max(0,scrollY/(h.offsetHeight*.75)));h.style.setProperty("--ho",1-p*1.15);h.style.setProperty("--hy",(-p*50)+"px");h.style.setProperty("--hs",1-p*.06)}
    spot();
  });
}
function applyConfigLinks(){
  if(CONFIG.HELPLINE&&$("#callnow"))$("#callnow").href="tel:"+CONFIG.HELPLINE;
  if(CONFIG.WHATSAPP_LINK&&$("#wa"))$("#wa").href=CONFIG.WHATSAPP_LINK;
  if(CONFIG.EMAIL&&$("#mail"))$("#mail").href="mailto:"+CONFIG.EMAIL;
  if(CONFIG.HERO_IMAGE&&$(".vhero"))$(".vhero").style.setProperty("--hero-img",`url(${CONFIG.HERO_IMAGE})`);
}

/* ---------- boot: pages call boot(renderFn) ---------- */
async function boot(pageRender){
  layout();authDialog();wireBoards();particles();
  const draw=()=>{pageRender&&pageRender();armReveal();spot()};
  draw();paintAccount();applyConfigLinks();
  addEventListener("scroll",onScroll,{passive:true});addEventListener("resize",onScroll);setTimeout(spot,300);
  await Promise.all([loadUser(),loadData()]);
  paintAccount();draw();
}
