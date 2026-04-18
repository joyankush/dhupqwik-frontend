// ============================================================
//  utils.js — Shared utilities for all DhupQwik pages
// ============================================================

const API_BASE = "https://dhupqwik-backend.onrender.com";

function getImageUrl(filename) {
  if (!filename) return null;
  if (filename.startsWith('http')) return filename;
  const cleanPath = filename.replace(/\\/g, '/');
  if (cleanPath.startsWith('uploads/')) return `${API_BASE}/${cleanPath}`;
  return `${API_BASE}/uploads/${cleanPath}`;
}

function formatPrice(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN');
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
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

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
  const existing = cart.find(item => item.productId === product._id && item.size === size);

  if (existing) {
    existing.quantity += quantity;
  } else {
    // ✅ FIX: products now use images[] array — save first image for cart display
    // Fall back to product.image for any old products that still have single image
    const cartImage = product.images?.[0] || product.image || null;

    cart.push({
      productId: product._id,
      name:      product.name,
      price:     product.price,
      image:     cartImage,
      size:      size,
      quantity:  quantity
    });
  }

  saveCart(cart);
  showToast(`${product.name} added to cart!`, 'success');
}

function removeFromCart(productId, size) {
  saveCart(getCart().filter(item => !(item.productId === productId && item.size === size)));
}

function updateCartItemQty(productId, size, newQty) {
  const cart = getCart();
  const item = cart.find(i => i.productId === productId && i.size === size);
  if (item) {
    item.quantity = newQty;
    if (item.quantity <= 0) return removeFromCart(productId, size);
  }
  saveCart(cart);
}

function getCartTotal() {
  return getCart().reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

function clearCart() {
  localStorage.removeItem('dq_cart');
  updateCartCount();
}

function updateCartCount() {
  const badge = document.getElementById('cart-count');
  if (badge) badge.textContent = getCartCount();
}

function getCustomerPhone() { return localStorage.getItem('dq_phone') || null; }
function setCustomerPhone(phone) { localStorage.setItem('dq_phone', phone); }
function logoutCustomer() { localStorage.removeItem('dq_phone'); }

function statusBadgeHTML(status) {
  const cls = status.replace(/\s+/g, '-');
  const icons = {
    'pending': '🕐', 'confirmed': '✅',
    'out for delivery': '🚴', 'delivered': '📦', 'cancelled': '❌'
  };
  return `<span class="status-badge status-${cls}">${icons[status] || '📋'} ${status}</span>`;
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();

  const currentPage = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-links a').forEach(link => {
    if (link.getAttribute('href') === currentPage) link.classList.add('active');
  });

  const phone     = getCustomerPhone();
  const loginBtn  = document.getElementById('nav-login-btn');
  const logoutBtn = document.getElementById('nav-logout-btn');
  const navPhone  = document.getElementById('nav-phone');

  if (phone) {
    if (loginBtn)  loginBtn.style.display  = 'none';
    if (logoutBtn) logoutBtn.style.display = 'inline-flex';
    if (navPhone)  navPhone.textContent    = phone;
  } else {
    if (loginBtn)  loginBtn.style.display  = 'inline-flex';
    if (logoutBtn) logoutBtn.style.display = 'none';
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      logoutCustomer();
      showToast('Logged out successfully');
      setTimeout(() => window.location.reload(), 800);
    });
  }
});
