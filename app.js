const WA="917095867950",CATS=["पुरुष","महिला","बच्चे","चप्पल","जूते","सैंडल"],STATUS=["नया","भेजा गया","पहुँच गया","रद्द"];
const DEMO=[
{id:"d1",name:"रोज़ाना आरामदायक चप्पल",price:299,cat:"चप्पल",sizes:"6,7,8,9,10",stock:25},
{id:"d2",name:"कैज़ुअल स्नीकर्स",price:999,cat:"जूते",sizes:"6,7,8,9,10",stock:15},
{id:"d3",name:"महिला सैंडल",price:599,cat:"महिला",sizes:"4,5,6,7,8",stock:12},
{id:"d4",name:"बच्चों के स्पोर्ट शूज़",price:499,cat:"बच्चे",sizes:"1,2,3,4,5",stock:10}];
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function ld(k,d){try{return JSON.parse(localStorage.getItem(k))||d}catch(e){return d}}
let db=null,auth=null,products=[],cat="सभी",q="",cart=ld("msf_cart",[]),isAdmin=false;
const find=id=>products.find(p=>p.id===id);
const sizes=p=>String(p.sizes||"").split(",").map(s=>s.trim()).filter(Boolean);

function start(){
  const c=window.FB_CONFIG;
  if(c&&c.projectId&&window.firebase){
    firebase.initializeApp(c);db=firebase.firestore();auth=firebase.auth();
    db.collection("products").orderBy("created","desc").onSnapshot(s=>{products=s.docs.map(d=>({id:d.id,...d.data()}));draw();plist()},e=>{products=DEMO;draw()});
    auth.onAuthStateChanged(authState);
  }else{products=DEMO;$("demo").hidden=false}
  $("pc").innerHTML=CATS.map(x=>`<option>${x}</option>`).join("");
  draw();route();
}

function draw(){
  $("bar").innerHTML='<input id="q" placeholder="खोजें..." value="'+esc(q)+'">'+["सभी",...CATS].map(x=>`<button class="t ${x===cat?"on":""}" data-c="${x}">${x}</button>`).join("");
  const l=products.filter(p=>(cat==="सभी"||p.cat===cat)&&(p.name+p.cat).toLowerCase().includes(q.toLowerCase()));
  $("grid").innerHTML=l.map(p=>`<article class="p">${p.image?`<img src="${esc(p.image)}" alt="${esc(p.name)}">`:'<div class="ph">👟</div>'}
<b>${esc(p.name)}</b><span class="pr">₹${p.price}</span><small>${p.stock>0?"माल है":"खत्म"}</small>
<select data-s="${p.id}" aria-label="साइज़">${sizes(p).map(s=>`<option>${esc(s)}</option>`).join("")}</select>
<button class="btn" data-add="${p.id}" ${p.stock<1?"disabled":""}>कार्ट में डालें</button></article>`).join("")||'<p class="mu">कोई सामान नहीं मिला।</p>';
  $("cnt").textContent=cart.reduce((n,x)=>n+x.qty,0);
  const f=$("q");if(f&&document.activeElement===document.body){}
}
$("bar").onclick=e=>{const c=e.target.dataset.c;if(c){cat=c;draw()}};
$("bar").oninput=e=>{if(e.target.id==="q"){q=e.target.value;const pos=e.target.selectionStart;draw();const n=$("q");n.focus();n.setSelectionRange(pos,pos)}};
$("grid").onclick=e=>{const id=e.target.dataset.add;if(!id)return;const p=find(id),s=document.querySelector(`[data-s="${id}"]`).value;
  const l=cart.find(x=>x.id===id&&x.size===s);if(l){if(l.qty>=p.stock)return alert("इतना माल उपलब्ध नहीं है");l.qty++}else cart.push({id,size:s,qty:1});
  sv();draw();e.target.textContent="जुड़ गया ✓"};
function sv(){try{localStorage.setItem("msf_cart",JSON.stringify(cart))}catch(e){}}
const total=()=>cart.reduce((t,x)=>t+(find(x.id)?.price||0)*x.qty,0);
function showCart(){
  cart=cart.filter(x=>find(x.id));
  $("items").innerHTML=cart.map((x,i)=>{const p=find(x.id);return `<div class="row"><span><b>${esc(p.name)}</b><br><small>साइज़ ${esc(x.size)} · ₹${p.price}</small></span><span><button class="btn s" data-m="${i}">−</button> ${x.qty} <button class="btn s" data-a="${i}">+</button></span></div>`}).join("")||'<p class="mu">कार्ट खाली है।</p>';
  $("tot").textContent="₹"+total();$("cartD").showModal();
}
$("cartBtn").onclick=showCart;$("closeCart").onclick=()=>$("cartD").close();
$("items").onclick=e=>{const a=e.target.dataset.a,m=e.target.dataset.m;
  if(a!=null){const x=cart[+a];if(x.qty<find(x.id).stock)x.qty++}
  if(m!=null){cart[+m].qty--;if(cart[+m].qty<1)cart.splice(+m,1)}
  sv();showCart();draw()};
$("co").onsubmit=async e=>{e.preventDefault();
  if(!cart.length){$("coErr").textContent="कार्ट खाली है";return}
  if($("cp").value.replace(/\D/g,"").length<10){$("coErr").textContent="10 अंकों का मोबाइल नंबर डालिए";return}
  const items=cart.map(x=>{const p=find(x.id);return{pid:x.id,name:p.name,size:x.size,qty:x.qty,price:p.price}});
  const o={name:$("cn").value.trim(),phone:$("cp").value.trim(),addr:$("ca").value.trim(),pay:$("pay").value,items,total:total(),status:"नया"};
  if(db){try{await db.collection("orders").add({...o,created:firebase.firestore.FieldValue.serverTimestamp()})}catch(err){}}
  const msg=`नया ऑर्डर - MS Footwear\nनाम: ${o.name}\nमोबाइल: ${o.phone}\nपता: ${o.addr}\nभुगतान: ${o.pay}\n\n`+items.map(i=>`• ${i.name} | साइज़ ${i.size} | ${i.qty} x Rs.${i.price}`).join("\n")+`\n\nकुल: Rs.${o.total}`;
  window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`,"_blank");
  cart=[];sv();draw();$("cartD").close();$("co").reset()};

/* ---------- मालिक पैनल ---------- */
function route(){const a=location.hash==="#admin";$("admin").hidden=!a;$("store").hidden=a;
  if(a){if(!auth){$("login").hidden=true;$("panel").hidden=true;$("admin").querySelector(".wrap").innerHTML='<p>पहले Firebase जोड़िए (README देखें)।</p>'}else authState(auth.currentUser)}}
window.onhashchange=route;
function authState(u){
  isAdmin=!!u&&!!window.ADMIN_EMAIL&&u.email===window.ADMIN_EMAIL;
  $("login").hidden=isAdmin;$("panel").hidden=!isAdmin;
  if(isAdmin){$("who").textContent=u.email;watchOrders();plist()}
}
$("login").onsubmit=async e=>{e.preventDefault();$("lErr").textContent="";
  try{await auth.signInWithEmailAndPassword($("le").value,$("lp").value)}catch(err){$("lErr").textContent="ईमेल या पासवर्ड गलत है"}};
$("logout").onclick=()=>auth.signOut();
document.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{const o=b.dataset.tab==="o";$("tO").hidden=!o;$("tP").hidden=o;
  document.querySelectorAll("[data-tab]").forEach(x=>x.className="btn "+(x===b?"d":"s"))});
let unsub=null;
function watchOrders(){if(unsub)return;
  unsub=db.collection("orders").orderBy("created","desc").limit(100).onSnapshot(s=>{
    const os=s.docs.map(d=>({id:d.id,...d.data()}));
    $("sN").textContent=os.filter(o=>o.status==="नया").length;$("sA").textContent=os.length;
    $("sS").textContent="₹"+os.filter(o=>o.status!=="रद्द").reduce((t,o)=>t+o.total,0);
    $("orders").innerHTML=os.map(o=>`<div class="card"><div class="row"><b>${esc(o.name)}</b><small>${o.created?o.created.toDate().toLocaleString("hi-IN"):""}</small></div>
<div><a href="tel:${esc(o.phone)}">${esc(o.phone)}</a> · <a href="https://wa.me/91${esc(o.phone.replace(/\D/g,"").slice(-10))}" target="_blank">WhatsApp</a></div>
<div class="mu">${esc(o.addr)}</div>${o.items.map(i=>`<div>• ${esc(i.name)} | साइज़ ${esc(i.size)} | ${i.qty} × ₹${i.price}</div>`).join("")}
<div class="row"><b>कुल ₹${o.total}</b><small>${esc(o.pay)}</small></div>
<select data-o="${o.id}">${STATUS.map(s=>`<option ${s===o.status?"selected":""}>${s}</option>`).join("")}</select></div>`).join("")||'<p class="mu">अभी कोई ऑर्डर नहीं।</p>'},()=>{unsub=null})}
$("orders").onchange=e=>{const id=e.target.dataset.o;if(id)db.collection("orders").doc(id).update({status:e.target.value})};
function plist(){if(!isAdmin)return;
  $("plist").innerHTML=products.map(p=>`<div class="card row"><span><b>${esc(p.name)}</b><br><small>₹${p.price} · ${esc(p.cat)} · माल ${p.stock}</small></span>
<span><button class="btn s" data-st="${p.id}:-1">−</button> <button class="btn s" data-st="${p.id}:1">+</button> <button class="btn s" data-pr="${p.id}">दाम</button> <button class="btn s" data-del="${p.id}">हटाएँ</button></span></div>`).join("")}
$("plist").onclick=async e=>{const d=e.target.dataset;
  if(d.st){const[id,n]=d.st.split(":");db.collection("products").doc(id).update({stock:firebase.firestore.FieldValue.increment(+n)})}
  if(d.pr){const v=prompt("नया दाम ₹",find(d.pr).price);if(v&&+v>0)db.collection("products").doc(d.pr).update({price:+v})}
  if(d.del&&confirm("पक्का हटाना है?"))db.collection("products").doc(d.del).delete()};
function shrink(f){return new Promise(r=>{const i=new Image();i.onload=()=>{const k=Math.min(1,500/Math.max(i.width,i.height)),c=document.createElement("canvas");c.width=i.width*k;c.height=i.height*k;c.getContext("2d").drawImage(i,0,0,c.width,c.height);r(c.toDataURL("image/jpeg",.7))};i.src=URL.createObjectURL(f)})}
$("pf").onsubmit=async e=>{e.preventDefault();$("pErr").textContent="";
  try{const f=$("pi").files[0];
    await db.collection("products").add({name:$("pn").value.trim(),price:+$("pp").value,cat:$("pc").value,sizes:$("ps").value,stock:+$("pk").value,image:f?await shrink(f):"",created:firebase.firestore.FieldValue.serverTimestamp()});
    $("pf").reset()}catch(err){$("pErr").textContent="जुड़ नहीं पाया। लॉगिन और नियम (rules) जाँचिए।"}};
start();
