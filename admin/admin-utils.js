// ============================================================
//  admin-utils.js — Shared utilities for all admin pages
// ============================================================

const API_BASE = 'http://localhost:5000';

// ── Get stored admin token ────────────────────────────────
function getToken() {
  return localStorage.getItem('dq_admin_token');
}

// ── Save token after login ────────────────────────────────
function setToken(token) {
  localStorage.setItem('dq_admin_token', token);
}

// ── Remove token (logout) ─────────────────────────────────
function clearToken() {
  localStorage.removeItem('dq_admin_token');
}

// ── Auth headers for protected API calls ─────────────────
function authHeaders() {
  return {
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json'
  };
}

// ── Auth headers WITHOUT Content-Type (for FormData/file upload) ──
function authHeadersMultipart() {
  return { 'Authorization': `Bearer ${getToken()}` };
}

// ── Redirect to login if not authenticated ────────────────
function requireAuth() {
  if (!getToken()) {
    window.location.href = 'admin-login.html';
  }
}

// ── Logout ────────────────────────────────────────────────
function adminLogout() {
  clearToken();
  window.location.href = 'admin-login.html';
}

// ── Image URL helper ──────────────────────────────────────
function getImageUrl(filename) {
  if (!filename) return null;
  if (filename.startsWith('http')) return filename;
  return `${API_BASE}/uploads/${filename}`;
}

// ── Format price ──────────────────────────────────────────
function formatPrice(amount) {
  return '₹' + Number(amount || 0).toLocaleString('en-IN');
}

// ── Format date ───────────────────────────────────────────
function formatDate(dateString) {
  const d = new Date(dateString);
  return d.toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

// ── Toast notification ────────────────────────────────────
function showToast(message, type = '') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ── Status badge HTML ─────────────────────────────────────
function statusBadge(status) {
  const icons = {
    'pending':          '🕐',
    'confirmed':        '✅',
    'out for delivery': '🚴',
    'delivered':        '📦',
    'cancelled':        '❌'
  };
  const cls = status.replace(/\s+/g, '-');
  return `<span class="badge badge-${cls}">${icons[status] || '📋'} ${status}</span>`;
}

// ── Confirm dialog ────────────────────────────────────────
function confirmAction(message) {
  return window.confirm(message);
}

// ── Live clock in topbar ──────────────────────────────────
function startClock() {
  const el = document.getElementById('topbar-time');
  if (!el) return;
  const update = () => {
    el.textContent = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };
  update();
  setInterval(update, 1000);
}

// ── Mark active nav item ──────────────────────────────────
function markActiveNav() {
  const page = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    if (item.dataset.page === page) item.classList.add('active');
  });
}

// ── Run on every admin page ───────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  startClock();
  markActiveNav();
});
