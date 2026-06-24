/* ===== Glowiety App JS ===== */

// Razorpay payment link
const RAZORPAY_LINK = 'https://rzp.io/rzp/FoKbVHzl';

// Loader
window.addEventListener('load', () => {
  setTimeout(() => document.getElementById('loader').classList.add('hide'), 600);
});

// Products
const PRODUCTS = [
  {
    id:'facewash',
    img:'assets/p-facewash.png',
    badge:'Hero',
    cat:'Foaming Face Wash · 100ml',
    title:'Glutathione & Niacinamide',
    desc:'Brightening, pore-refining foam cleanser with active glutathione, niacinamide & green molecular complex. Deeply cleanses, brightens skin and reduces dark spots.',
    price:349, mrp:599,
    tags:['Brighten','Cleanse','Glow','Oil-Free']
  },
  {
    id:'shampoo',
    img:'assets/p-shampoo.png',
    badge:'Hair',
    cat:'Rosemary Shampoo · 300ml',
    title:'Rosemary Shampoo',
    desc:'Infused with rosemary extract for stronger, healthier and shinier hair. Sulphate-free and paraben-free formula suitable for all hair types.',
    price:349, mrp:599,
    tags:['Strengthen','Nourish','Revive']
  },
  {
    id:'conditioner',
    img:'assets/p-conditioner.png',
    badge:'New',
    cat:'Conditioner Shampoo · 300ml',
    title:'Nourishing Conditioner',
    desc:'Paraben-free nourishing conditioner shampoo enriched with botanicals. Locks moisture for soft, silky and easy-to-manage hair.',
    price:349, mrp:599,
    tags:['Smooth','Nourish','Paraben Free']
  },
  {
    id:'loofah',
    img:'assets/p-loofah.png',
    badge:'Eco',
    cat:'Natural Loofah Soap · 125g',
    title:'Natural Loofah Soap',
    desc:'Handmade loofah-infused soap bar with natural extracts. Exfoliates, refreshes and leaves skin soft, smooth and healthy.',
    price:349, mrp:499,
    tags:['Exfoliate','Handmade','Glow']
  },
  {
    id:'coffee',
    img:'assets/p-coffee.png',
    badge:'Bestseller',
    cat:'Coffee Loofah Soap · 125g',
    title:'Coffee Exfoliating Soap',
    desc:'100% handmade coffee soap with natural loofah inside. Deep cleansing, gentle exfoliation, suitable for all skin types.',
    price:349, mrp:499,
    tags:['Exfoliate','Coffee','Deep Cleanse']
  },
  {
    id:'aloevera',
    img:'assets/p-aloevera.png',
    badge:'Hydrate',
    cat:'Aloevera Gel · 100ml',
    title:'Pure Aloevera Gel',
    desc:'Luxury aloevera gel for hydrated, nourished and refreshed skin. Lightweight, fast-absorbing — ideal for face and body, daily.',
    price:349, mrp:549,
    tags:['Hydrate','Nourish','Soothe']
  }
];

// SVG icons
const ICON_PAY = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>';
const ICON_COD = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="14" height="10" rx="2"/><path d="M17 10h3v6a2 2 0 0 1-2 2H5"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="17.5" cy="17.5" r="1.5"/></svg>';

// Inject products
const wrap = document.getElementById('products');
wrap.innerHTML = PRODUCTS.map(p => `
  <article class="pcard reveal" data-id="${p.id}">
    <div class="pcard-brand">
      <div class="pb-mark"><img src="assets/logo.png" alt="Glowiety"></div>
      <div class="pb-text">
        <span class="pb-s">NIRSAP BIOTECH</span>
      </div>
    </div>
    <div class="pimg">
      <span class="badge">${p.badge}</span>
      <span class="price-chip">₹${p.price}</span>
      <img src="${p.img}" alt="${p.title}" loading="lazy">
    </div>
    <div class="pcard-body">
      <div class="pcat">${p.cat}</div>
      <h3 class="ptitle">${p.title}</h3>
      <p class="pdesc">${p.desc}</p>
      <div class="pmeta">${p.tags.map(t=>`<span>${t}</span>`).join('')}</div>
      <div class="pprice-row">
        <div class="pprice">₹${p.price}<s>₹${p.mrp}</s></div>
        <span class="psaver">Save ₹${p.mrp-p.price}</span>
      </div>
      <div class="pcta-row">
        <button class="btn-pay" data-action="pay" data-id="${p.id}">${ICON_PAY}<span>Pay Now</span></button>
        <button class="btn-cod" data-action="cod" data-id="${p.id}">${ICON_COD}<span>Cash on Delivery</span></button>
      </div>
    </div>
  </article>
`).join('');

// ===== Modal logic =====
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);
const formModal = $('#modal-form');
const successModal = $('#modal-success');
const payModal = $('#modal-pay-pending');
const form = $('#shipping-form');
const osProduct = $('#os-product');
const osTotal = $('#os-total');
const osDeliveryRow = $('#os-delivery-row');
const formTitle = $('#form-title');
const formSub = $('#form-sub');
const submitLabel = $('#form-submit-label');
const successMsg = $('#success-msg');
const payRetry = $('#pay-retry');
const payConfirm = $('#pay-confirm');

let currentOrder = null;  // {product, mode:'pay'|'cod'}

function openModal(m){ m.classList.add('open'); document.body.style.overflow='hidden'; }
function closeModal(m){ m.classList.remove('open'); document.body.style.overflow=''; }
function closeAll(){ [formModal,successModal,payModal].forEach(closeModal); }

document.addEventListener('click', e => {
  const close = e.target.closest('[data-close]');
  if (close) { closeAll(); return; }
  if (e.target.classList && e.target.classList.contains('modal-back')) { closeAll(); return; }
});

// Open form on Pay Now / COD
document.addEventListener('click', e => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;
  const product = PRODUCTS.find(p => p.id === btn.dataset.id);
  if (!product) return;
  currentOrder = { product, mode: action };
  osProduct.textContent = product.title;
  if (action === 'pay') {
    formTitle.textContent = 'Shipping Details';
    formSub.textContent = 'Please fill in your shipping address. You\'ll be redirected to secure payment.';
    submitLabel.textContent = 'Proceed to Pay ₹' + product.price;
    osDeliveryRow.classList.remove('show');
    osTotal.textContent = '₹' + product.price;
  } else {
    formTitle.textContent = 'Cash on Delivery';
    formSub.textContent = 'Please fill in your shipping address. ₹100 delivery charge applies for COD orders.';
    submitLabel.textContent = 'Place COD Order';
    osDeliveryRow.classList.add('show');
    osTotal.textContent = '₹' + (product.price + 100);
  }
  openModal(formModal);
});

// Submit shipping form
form.addEventListener('submit', e => {
  e.preventDefault();
  if (!currentOrder) return;
  const data = Object.fromEntries(new FormData(form).entries());
  // Persist locally so user has a record
  try {
    const orders = JSON.parse(localStorage.getItem('glowiety_orders') || '[]');
    orders.push({
      product: currentOrder.product.title,
      price: currentOrder.product.price,
      mode: currentOrder.mode,
      delivery: currentOrder.mode === 'cod' ? 100 : 0,
      total: currentOrder.product.price + (currentOrder.mode === 'cod' ? 100 : 0),
      shipping: data,
      at: new Date().toISOString()
    });
    localStorage.setItem('glowiety_orders', JSON.stringify(orders));
  } catch(_) {}

  closeModal(formModal);

  if (currentOrder.mode === 'pay') {
    // Open Razorpay payment link in new tab, show pending modal
    payRetry.href = RAZORPAY_LINK;
    window.open(RAZORPAY_LINK, '_blank', 'noopener');
    openModal(payModal);
  } else {
    // COD: show success immediately
    successMsg.innerHTML = `Your order for <b>${currentOrder.product.title}</b> has been placed via <b>Cash on Delivery</b>. Total payable on delivery: <b style="color:var(--green-3)">₹${currentOrder.product.price + 100}</b> (includes ₹100 delivery charge).`;
    openModal(successModal);
  }
});

// User confirms payment success
payConfirm.addEventListener('click', () => {
  closeModal(payModal);
  if (!currentOrder) return;
  successMsg.innerHTML = `Payment received for <b>${currentOrder.product.title}</b>. Total: <b style="color:var(--green-3)">₹${currentOrder.product.price}</b>. Your order is being processed and we'll reach out with tracking details shortly.`;
  openModal(successModal);
});

// ===== Scroll reveal =====
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  });
}, { threshold: 0.12 });
$$('.reveal').forEach(el => io.observe(el));

// Nav scrolled
const nav = $('#nav');
window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 30));

// Cursor
const dot = $('.cursor-dot');
const ring = $('.cursor-ring');
let mx=0,my=0,rx=0,ry=0;
window.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY;
  dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
});
(function loop(){ rx+=(mx-rx)*.18; ry+=(my-ry)*.18;
  ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
  requestAnimationFrame(loop);
})();
$$('a, button, .pcard, .c-card').forEach(el => {
  el.addEventListener('mouseenter', () => ring.classList.add('hover'));
  el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
});

// Particles
const canvas = $('#particles');
const ctx = canvas.getContext('2d');
let W,H,particles=[];
function resize(){ W=canvas.width=innerWidth; H=canvas.height=innerHeight; }
resize(); addEventListener('resize', resize);
function spawn(){
  particles = [];
  const n = Math.min(80, Math.floor(W/22));
  for(let i=0;i<n;i++){
    particles.push({ x:Math.random()*W, y:Math.random()*H, r:Math.random()*1.6+0.4,
      vx:(Math.random()-.5)*.25, vy:(Math.random()-.5)*.25 - 0.05,
      a:Math.random()*.6+.2, c:Math.random()>.85 ? 'rgba(212,176,106,' : 'rgba(134,239,172,' });
  }
}
spawn(); addEventListener('resize', spawn);
(function tick(){
  ctx.clearRect(0,0,W,H);
  particles.forEach(p=>{
    p.x+=p.vx; p.y+=p.vy;
    if(p.x<0)p.x=W; if(p.x>W)p.x=0;
    if(p.y<0)p.y=H; if(p.y>H)p.y=0;
    ctx.beginPath();
    ctx.fillStyle = p.c + p.a + ')';
    ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fill();
  });
  requestAnimationFrame(tick);
})();

// Smooth nav
$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length > 1) {
      const el = document.querySelector(id);
      if (el) { e.preventDefault(); el.scrollIntoView({behavior:'smooth', block:'start'}); }
    }
  });
});

// ESC to close modal
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });
