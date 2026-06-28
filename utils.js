// ============================================================
//  utils.js — DhupQwik Shared Utilities
//  Built by Joyankush Roy
// ============================================================

const API_BASE = "https://dhupqwik-backend.onrender.com";

function getImageUrl(src) {
  if (!src) return null;
  if (src.startsWith('http')) return src;
  const clean = src.replace(/\\/g, '/');
  if (clean.startsWith('uploads/')) return `${API_BASE}/${clean}`;
  return `${API_BASE}/uploads/${clean}`;
}

function formatPrice(amount) {
  return '₹' + Number(amount || 0).toLocaleString('en-IN');
}

function formatDate(dateString) {
  const d = new Date(dateString);
  return d.toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function showToast(message, type = '') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = message;
  document.body.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('show')));
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 300);
  }, 3000);
}

// ── Cart ─────────────────────────────────────────────────
function getCart() {
  try { return JSON.parse(localStorage.getItem('dq_cart') || '[]'); }
  catch { return []; }
}
function saveCart(cart) {
  localStorage.setItem('dq_cart', JSON.stringify(cart));
  updateCartCount();
}
function addToCart(product, size, quantity = 1) {
  const cart = getCart();
  const existing = cart.find(i => i.productId === product._id && i.size === size);
  if (existing) {
    existing.quantity += quantity;
  } else {
    // Support both images[] array and legacy image field
    const img = product.images?.[0] || product.image || null;
    cart.push({
      productId: product._id,
      name:      product.name,
      price:     product.price,
      image:     img,
      size,
      quantity
    });
  }
  saveCart(cart);
  showToast(`${product.name} added to cart!`, 'success');
}
function removeFromCart(productId, size) {
  saveCart(getCart().filter(i => !(i.productId === productId && i.size === size)));
}
function updateCartItemQty(productId, size, newQty) {
  const cart = getCart();
  const item = cart.find(i => i.productId === productId && i.size === size);
  if (item) {
    item.quantity = newQty;
    if (item.quantity <= 0) { removeFromCart(productId, size); return; }
  }
  saveCart(cart);
}
function getCartTotal()  { return getCart().reduce((s, i) => s + i.price * i.quantity, 0); }
function getCartCount()  { return getCart().reduce((s, i) => s + i.quantity, 0); }
function clearCart()     { localStorage.removeItem('dq_cart'); updateCartCount(); }
function updateCartCount() {
  document.querySelectorAll('[data-cart-count]').forEach(el => {
    el.textContent = getCartCount();
  });
}

// ── Customer Session ─────────────────────────────────────
function getCustomerPhone() { return localStorage.getItem('dq_phone') || null; }
function setCustomerPhone(p){ localStorage.setItem('dq_phone', p); }
function logoutCustomer()   { localStorage.removeItem('dq_phone'); }

// ── Status Badge ─────────────────────────────────────────
function statusBadgeHTML(status) {
  const icons = {
    'pending':          '<i class="fa-regular fa-clock"></i>',
    'confirmed':        '<i class="fa-solid fa-check"></i>',
    'out for delivery': '<i class="fa-solid fa-bicycle"></i>',
    'delivered':        '<i class="fa-solid fa-box"></i>',
    'cancelled':        '<i class="fa-solid fa-circle-xmark"></i>'
  };
  const cls = status.replace(/\s+/g, '-');
  return `<span class="status-badge status-${cls}">${icons[status]||'<i class="fa-solid fa-list"></i>'} ${status}</span>`;
}

// ── Init on every page ───────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();

  // Mark active bottom nav item
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.bnav-item[data-page]').forEach(item => {
    if (item.dataset.page === page) item.classList.add('active');
  });
});
