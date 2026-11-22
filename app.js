const STORE={name:"MS Footwear",whatsapp:"917095867950",currency:"₹",adminPin:"1234",upiId:"YOUR_UPI_ID"};
const starter=[
{id:1,name:"Classic Daily Sneakers",price:999,cat:"Men",stock:15,image:"",size:"6-10"},
{id:2,name:"Everyday Comfort Chappal",price:299,cat:"Chappals",stock:25,image:"",size:"6-10"},
{id:3,name:"Women Casual Sandals",price:599,cat:"Women",stock:12,image:"",size:"4-8"},
{id:4,name:"Kids Sport Shoes",price:499,cat:"Kids",stock:10,image:"",size:"1-5"},
{id:5,name:"Lightweight Running Shoes",price:1299,cat:"Shoes",stock:8,image:"",size:"6-10"},
{id:6,name:"Soft Home Slippers",price:199,cat:"Chappals",stock:30,image:"",size:"6-10"},
{id:7,name:"Classic Everyday Sandals",price:449,cat:"Sandals",stock:14,image:"",size:"5-10"},
{id:8,name:"Women Walking Shoes",price:899,cat:"Women",stock:9,image:"",size:"4-8"}
];
let products=JSON.parse(localStorage.getItem("msf_products")||"null")||starter;
let cart=JSON.parse(localStorage.getItem("msf_cart")||"[]"),category="All";
const $=id=>document.getElementById(id);
function persist(){localStorage.setItem("msf_products",JSON.stringify(products));localStorage.setItem("msf_cart",JSON.stringify(cart))}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function render(){let q=$("search").value.toLowerCase();let list=products.filter(p=>(category==="All"||p.cat===category||(category==="Shoes"&&p.name.toLowerCase().includes("shoe")))&&(p.name.toLowerCase().includes(q)||p.cat.toLowerCase().includes(q)));$("products").innerHTML=list.map(p=>`<article class="product">${p.image?`<img src="${esc(p.image)}" alt="${esc(p.name)}">`:`<div class="placeholder">👟</div>`}<div class="product-info"><p class="muted">${esc(p.cat)} · ${p.stock>0?`In stock: ${p.stock}`:"Out of stock"}</p><h3>${esc(p.name)}</h3><div class="price">₹${p.price}</div><button ${p.stock<1?"disabled":""} onclick="addToCart(${p.id})">${p.stock<1?"Out of stock":"Add to cart"}</button></div></article>`).join("")||"<p>No products found.</p>";$("cartCount").textContent=cart.reduce((n,x)=>n+x.qty,0)}
window.addToCart=id=>{let p=products.find(x=>x.id===id);if(!p||p.stock<1)return alert("Currently out of stock.");let line=cart.find(x=>x.id===id);if(line){if(line.qty>=p.stock)return alert("Only "+p.stock+" available.");line.qty++}else cart.push({id,qty:1});persist();render()};
function cartTotal(){return cart.reduce((s,x)=>s+(products.find(p=>p.id===x.id)?.price||0)*x.qty,0)}
function showCart(){$("cartItems").innerHTML=cart.map(x=>{let p=products.find(p=>p.id===x.id);return p?`<div class="cart-row"><span>${esc(p.name)} × ${x.qty}<br><button onclick="changeQty(${p.id},-1)">−</button> <button onclick="changeQty(${p.id},1)">+</button> <button onclick="removeItem(${p.id})">Remove</button></span><b>₹${p.price*x.qty}</b></div>`:""}).join("")||"<p>Your cart is empty.</p>";$("cartTotal").textContent=cartTotal();$("cartDialog").showModal()}
window.changeQty=(id,d)=>{let line=cart.find(x=>x.id===id),p=products.find(x=>x.id===id);if(!line||!p)return;line.qty+=d;if(line.qty<1)cart=cart.filter(x=>x.id!==id);else if(line.qty>p.stock){line.qty=p.stock;alert("Available stock: "+p.stock)}persist();showCart();render()};window.removeItem=id=>{cart=cart.filter(x=>x.id!==id);persist();showCart();render()};
$("cartBtn").onclick=showCart;$("closeCart").onclick=()=>$("cartDialog").close();$("search").oninput=render;
document.querySelectorAll(".filter").forEach(b=>b.onclick=()=>{category=b.dataset.cat;document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x===b));render()});
$("checkoutForm").onsubmit=e=>{e.preventDefault();if(!cart.length)return alert("Your cart is empty.");for(let x of cart){let p=products.find(p=>p.id===x.id);if(!p||p.stock<x.qty)return alert("Stock changed for an item. Please update your cart.")};let lines=cart.map(x=>{let p=products.find(p=>p.id===x.id);return `${p.name} | Qty ${x.qty} | Rs.${p.price*x.qty}`});let msg=`NEW ORDER - ${STORE.name}\nCustomer: ${$("customerName").value}\nPhone: ${$("customerPhone").value}\nAddress: ${$("customerAddress").value}\nPayment: ${$("paymentMethod").value}\n\n${lines.join("\n")}\n\nTOTAL: Rs.${cartTotal()}\nPlease confirm availability and delivery.`;let url=`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(msg)}`;window.open(url,"_blank");$("cartDialog").close()};
function openAdmin(){let pin=prompt("Enter store manager PIN (demo default: 1234)");if(pin!==STORE.adminPin)return alert("Incorrect PIN");refreshAdmin();$("adminDialog").showModal()}
$("adminBtn").onclick=openAdmin;$("closeAdmin").onclick=()=>$("adminDialog").close();
function refreshAdmin(){$("totalProducts").textContent=products.length;$("totalStock").textContent=products.reduce((s,p)=>s+Number(p.stock||0),0);$("adminList").innerHTML=products.map(p=>`<div class="admin-row"><span><b>${esc(p.name)}</b><small>₹${p.price} · ${esc(p.cat)} · Stock ${p.stock}</small></span><span><button onclick="adjustStock(${p.id},-1)">−</button><button onclick="adjustStock(${p.id},1)">+</button><button onclick="deleteProduct(${p.id})">Delete</button></span></div>`).join("")}
window.adjustStock=(id,d)=>{let p=products.find(x=>x.id===id);if(p){p.stock=Math.max(0,Number(p.stock)+d);persist();refreshAdmin();render()}};window.deleteProduct=id=>{if(confirm("Delete this product?")){products=products.filter(p=>p.id!==id);cart=cart.filter(x=>x.id!==id);persist();refreshAdmin();render()}};
$("productForm").onsubmit=e=>{e.preventDefault();products.push({id:Date.now(),name:$("pName").value.trim(),price:Number($("pPrice").value),cat:$("pCat").value,stock:Number($("pStock").value),image:$("pImage").value.trim(),size:""});persist();e.target.reset();$("pStock").value=10;refreshAdmin();render()};
$("exportBtn").onclick=()=>{let rows=[["Name","Category","Price","Stock"],...products.map(p=>[p.name,p.cat,p.price,p.stock])];let csv=rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(",")).join("\n");let a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="ms-footwear-products.csv";a.click();URL.revokeObjectURL(a.href)};
$("resetBtn").onclick=()=>{if(confirm("Restore demo products? This replaces your current product list.")){products=starter.map(p=>({...p}));persist();refreshAdmin();render()}};
$("year").textContent=new Date().getFullYear();render();
