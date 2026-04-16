// ============================================================
//  utils.js — Shared utilities for all DhupQwik pages
// ============================================================

// ── Config ──────────────────────────────────────────────────
// This is the address of your backend server.
// Change this if your backend runs on a different port.

const API_BASE = "https://dhupqwik-backend.onrender.com";
// ── Image URL helper ─────────────────────────────────────────
// Converts a stored filename into a full URL
// e.g. "123-shirt.jpg" → "http://localhost:5000/uploads/123-shirt.jpg"
function getImageUrl(filename) {
  if (!filename) return null;

  // Convert Windows "\" to "/"
  const cleanPath = filename.replace(/\\/g, '/');

  // If already starts with uploads/, don't duplicate
  if (cleanPath.startsWith('uploads/')) {
    return `${API_BASE}/${cleanPath}`;
  }

  return `${API_BASE}/uploads/${cleanPath}`;
}

// ── Format price ──────────────────────────────────────────────
// e.g. 1500 → "₹1,500"
function formatPrice(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN');
}

// ── Format date ───────────────────────────────────────────────
// e.g. "2024-06-12T10:30:00Z" → "12 Jun 2024, 10:30 AM"
function formatDate(dateString) {
  const d = new Date(dateString);
  return d.toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

// ── Toast notification ────────────────────────────────────────
// Shows a small popup message at the bottom right
// type: 'success' | 'error' | '' (default dark)
function showToast(message, type = '') {
  // Remove any existing toast
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });

  // Auto-remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ── Cart (stored in localStorage) ────────────────────────────
// Cart is an array of objects:
// { productId, name, price, image, size, quantity }

function getCart() {
  try {
    return JSON.parse(localStorage.getItem('dq_cart') || '[]');
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('dq_cart', JSON.stringify(cart));
  updateCartCount(); // update header badge
}

function addToCart(product, size, quantity = 1) {
  const cart = getCart();
  // Check if same product + size already in cart
  const existing = cart.find(
    item => item.productId === product._id && item.size === size
  );

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: size,
      quantity: quantity
    });
  }

  saveCart(cart);
  showToast(`${product.name} added to cart!`, 'success');
}

function removeFromCart(productId, size) {
  const cart = getCart().filter(
    item => !(item.productId === productId && item.size === size)
  );
  saveCart(cart);
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

// ── Customer session ──────────────────────────────────────────
// Stores the phone number after login

function getCustomerPhone() {
  return localStorage.getItem('dq_phone') || null;
}

function setCustomerPhone(phone) {
  localStorage.setItem('dq_phone', phone);
}

function logoutCustomer() {
  localStorage.removeItem('dq_phone');
}

// ── Status badge helper ───────────────────────────────────────
function statusBadgeHTML(status) {
  const cls = status.replace(/\s+/g, '-');
  const icons = {
    'pending':          '🕐',
    'confirmed':        '✅',
    'out for delivery': '🚴',
    'delivered':        '📦',
    'cancelled':        '❌'
  };
  const icon = icons[status] || '📋';
  return `<span class="status-badge status-${cls}">${icon} ${status}</span>`;
}

// ── Run on every page load ────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();

  // Highlight active nav link
  const currentPage = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-links a').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });

  // Show phone in nav if logged in
  const phone = getCustomerPhone();
  const loginBtn = document.getElementById('nav-login-btn');
  const logoutBtn = document.getElementById('nav-logout-btn');
  const navPhone = document.getElementById('nav-phone');

  if (phone) {
    if (loginBtn)  loginBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'inline-flex';
    if (navPhone)  navPhone.textContent = phone;
  } else {
    if (loginBtn)  loginBtn.style.display = 'inline-flex';
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
