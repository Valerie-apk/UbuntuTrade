// Shared frontend API utility — included on every page via <script src="/api.js">

function getUser() {
    return {
        id: localStorage.getItem('userId'),
        name: localStorage.getItem('username'),
        email: localStorage.getItem('userEmail'),
        role: localStorage.getItem('userRole')
    };
}

function requireAuth() {
    const user = getUser();
    if (!user.id) {
        window.location.href = '/index/login.html';
        return null;
    }
    return user;
}

function requireAdmin() {
    const user = requireAuth();
    if (!user) return null;
    if (user.role !== 'admin') {
        window.location.href = '/dashboard/market.html';
        return null;
    }
    return user;
}

function logout() {
    ['userId', 'username', 'userEmail', 'userRole'].forEach(k => localStorage.removeItem(k));
    window.location.href = '/index/login.html';
}

async function apiFetch(path, options = {}) {
    const res = await fetch('/api' + path, {
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        ...options
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(data.message || data.error || 'Request failed'), { status: res.status, data });
    return data;
}

function setNavbarUser() {
    const user = getUser();
    const nameEl = document.getElementById('username');
    const initEl = document.getElementById('userInitial');
    if (nameEl && user.name) nameEl.textContent = user.name;
    if (initEl && user.name) initEl.textContent = user.name.charAt(0).toUpperCase();
}

async function updateCartCount() {
    const user = getUser();
    if (!user.id) return;
    try {
        const data = await apiFetch('/cart/' + user.id);
        let items;
        if (data.items) {
            items = data.items;
        } else if (Array.isArray(data)) {
            items = data;
        } else {
            items = [];
        }
        const count = items.reduce((s, i) => s + i.quantity, 0);
        document.querySelectorAll('.navbar-cart-count').forEach(el => { el.textContent = count; });
    } catch (_) {}
}

async function addToCart(productId, quantity = 1) {
    const user = requireAuth();
    if (!user) return false;
    await apiFetch('/cart/add', {
        method: 'POST',
        body: JSON.stringify({ userId: parseInt(user.id), productId: parseInt(productId), quantity })
    });
    await updateCartCount();
    return true;
}
