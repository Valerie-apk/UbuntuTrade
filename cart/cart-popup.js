(function () {
    const API = 'http://localhost:3000';
    let rootEl = null;

    // ── Badge ──────────────────────────────────────────────────────────────
    function setBadge(count) {
        document.querySelectorAll('.navbar-cart-count').forEach(el => {
            el.textContent = count > 0 ? count : '0';
        });
    }

    async function refreshBadge() {
        const userId = localStorage.getItem('userId');
        if (!userId) { setBadge(0); return; }
        try {
            const res = await fetch(`${API}/api/cart/${userId}`);
            const data = await res.json();
            setBadge((data.summary && data.summary.itemCount) || 0);
        } catch { setBadge(0); }
    }

    // ── Render ─────────────────────────────────────────────────────────────
    async function loadCart() {
        const userId = localStorage.getItem('userId');
        const itemsEl  = document.getElementById('popupCartItems');
        const titleEl  = document.getElementById('popupCartTitle');
        const summaryEl = document.getElementById('popupCartSummary');
        const bannerEl = document.getElementById('popupDeliveryBanner');
        if (!itemsEl) return;

        if (!userId) {
            itemsEl.innerHTML =
                '<p style="padding:20px;color:#888;text-align:center;">Please <a href="/index/login.html">log in</a> to see your cart.</p>';
            return;
        }

        itemsEl.innerHTML = '<p style="padding:20px;color:#888;text-align:center;">Loading...</p>';

        try {
            const res  = await fetch(`${API}/api/cart/${userId}`);
            const data = await res.json();
            const items = data.items || [];
            const s     = data.summary || {};

            if (titleEl) titleEl.textContent = `Your Cart (${s.itemCount || 0})`;
            setBadge(s.itemCount || 0);

            if (bannerEl) {
                const remaining = Math.max(0, 1000 - (s.subtotal || 0));
                bannerEl.innerHTML = remaining > 0
                    ? `<span><i class="fas fa-info-circle"></i> Add R${remaining.toLocaleString()} more for free delivery!</span><i class="fas fa-truck"></i>`
                    : `<span><i class="fas fa-check-circle"></i> You qualify for free delivery!</span><i class="fas fa-truck"></i>`;
            }

            if (!items.length) {
                itemsEl.innerHTML =
                    '<p style="padding:20px;color:#888;text-align:center;">Your cart is empty. <a href="/br-product/browse-products.html">Browse products</a></p>';
                if (summaryEl) summaryEl.innerHTML = '';
                return;
            }

            itemsEl.innerHTML = items.map(item => {
                const p    = item.product || {};
                const price = Number(p.price || 0);
                const qty  = item.quantity || 1;
                const img  = p.imageUrl && p.imageUrl !== 'default-product.png' ? p.imageUrl : '';
                return `
                <article class="cart-popup-item" data-item-id="${item.id}">
                    ${img
                        ? `<img src="${img}" alt="${p.name || ''}" onerror="this.style.display='none'" style="width:60px;height:60px;object-fit:cover;border-radius:8px;flex-shrink:0;">`
                        : `<div style="width:60px;height:60px;border-radius:8px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="fas fa-box" style="color:#ccc;font-size:20px;"></i></div>`}
                    <div class="cart-popup-product">
                        <h3>${p.name || 'Product'}</h3>
                        <p>${p.condition || ''}</p>
                        <strong>R${price.toLocaleString()}</strong>
                    </div>
                    <div class="cart-popup-actions">
                        <div class="cart-popup-quantity">
                            <button type="button" data-action="decrease" data-item="${item.id}" data-qty="${qty}" aria-label="Decrease"><i class="fas fa-minus"></i></button>
                            <span>${qty}</span>
                            <button type="button" data-action="increase" data-item="${item.id}" data-qty="${qty}" aria-label="Increase"><i class="fas fa-plus"></i></button>
                        </div>
                        <button class="cart-popup-remove" type="button" data-action="remove" data-item="${item.id}" aria-label="Remove">
                            <i class="far fa-trash-alt"></i>
                        </button>
                    </div>
                </article>`;
            }).join('');

            if (summaryEl) {
                summaryEl.innerHTML = `
                <div>
                    <span>Subtotal (${s.itemCount} item${s.itemCount !== 1 ? 's' : ''})</span>
                    <strong>R${Number(s.subtotal || 0).toLocaleString()}</strong>
                </div>
                <div>
                    <span>Delivery</span>
                    <strong>${s.deliveryFee > 0 ? 'R' + Number(s.deliveryFee).toLocaleString() : 'Free'}</strong>
                </div>
                <div class="cart-popup-total">
                    <span>Total</span>
                    <strong>R${Number(s.total || 0).toLocaleString()}</strong>
                </div>`;
            }
        } catch {
            if (itemsEl) itemsEl.innerHTML =
                '<p style="padding:20px;color:red;text-align:center;">Failed to load cart.</p>';
        }
    }

    // ── Init (call once after popup HTML is injected) ──────────────────────
    function init(root) {
        rootEl = root;
        loadCart();

        root.addEventListener('click', async function (e) {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;
            const action = btn.dataset.action;
            const itemId = btn.dataset.item;
            const qty    = Number(btn.dataset.qty || 1);

            if (action === 'decrease') {
                if (qty <= 1) {
                    await fetch(`${API}/api/cart/${itemId}`, { method: 'DELETE' });
                } else {
                    await fetch(`${API}/api/cart/${itemId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ quantity: qty - 1 })
                    });
                }
                loadCart();
            } else if (action === 'increase') {
                await fetch(`${API}/api/cart/${itemId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ quantity: qty + 1 })
                });
                loadCart();
            } else if (action === 'remove') {
                await fetch(`${API}/api/cart/${itemId}`, { method: 'DELETE' });
                loadCart();
            }
        });
    }

    // Refresh badge whenever page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', refreshBadge);
    } else {
        refreshBadge();
    }

    window.CartPopup = { init, load: loadCart, refreshBadge, setBadge };
})();
