(function () {
    'use strict';

    var CUSTOMER_LINKS = [
        { href: '/dashboard/market.html',          icon: 'fa-home',          label: 'Dashboard',        page: 'market' },
        { href: '/br-product/browse-products.html', icon: 'fa-store',         label: 'Browse Products',  page: 'browse' },
        { href: '/dashboard/my-products.html',      icon: 'fa-box',           label: 'My Products',      page: 'my-products' },
        { href: '/dashboard/messages.html',         icon: 'fa-envelope',      label: 'Messages',         page: 'messages' },
        { href: '#',                                icon: 'fa-shopping-cart', label: 'Orders',           page: 'orders' },
        { href: '#',                                icon: 'fa-cog',           label: 'Settings',         page: 'settings' }
    ];

    var ADMIN_LINKS = [
        { href: '/admin/admin.html',          icon: 'fa-home',          label: 'Dashboard', page: 'admin' },
        { href: '/admin/admin-users.html',    icon: 'fa-users',         label: 'Users',     page: 'admin-users' },
        { href: '/admin/admin-products.html', icon: 'fa-box',           label: 'Products',  page: 'admin-products' },
        { href: '/admin/admin-orders.html',   icon: 'fa-shopping-cart', label: 'Orders',    page: 'admin-orders' },
        { href: '#',                          icon: 'fa-chart-bar',     label: 'Reports',   page: 'admin-reports' },
        { href: '#',                          icon: 'fa-cog',           label: 'Settings',  page: 'admin-settings' }
    ];

    function getUser() {
        try { return JSON.parse(localStorage.getItem('utUser') || 'null'); } catch (e) { return null; }
    }

    function initNavbar(opts) {
        opts = opts || {};
        var type = opts.type || 'customer';
        var el = document.getElementById(opts.containerId || 'navbarContainer');
        if (!el) return;

        var user = getUser();
        var name = user ? (user.username || user.email || 'User') : 'User';
        var initial = name[0].toUpperCase();

        var cartHTML = type === 'customer'
            ? '<a href="/cart/cart.html" class="navbar-cart-link" id="navCartBtn" aria-label="Cart">' +
              '<i class="fas fa-shopping-cart"></i>' +
              '<span class="navbar-cart-count" id="navCartCount">0</span></a>'
            : '';

        var logoHref = type === 'admin' ? '/admin/admin.html' : '/dashboard/market.html';
        el.innerHTML =
            '<nav class="navbar">' +
            '<a href="' + logoHref + '" class="logo" style="text-decoration:none;color:inherit;">Ubuntu <span class="color-logo">Trade</span></a>' +
            '<div class="nav-buttons">' +
            '<div class="search-bar"><i class="fas fa-search"></i><input type="text" placeholder="Search here..."></div>' +
            '<div class="admin-profile">' +
            '<i class="fas fa-bell"></i>' +
            cartHTML +
            '<div class="profile-avatar" id="navUserInitial">' + initial + '</div>' +
            '<span id="navUsername">' + name + '</span>' +
            '<i class="fas fa-chevron-down"></i>' +
            '</div></div></nav>';

        if (type === 'customer') {
            var popupRoot = document.getElementById('cartPopupRoot');
            if (!popupRoot) {
                popupRoot = document.createElement('div');
                popupRoot.id = 'cartPopupRoot';
                popupRoot.className = 'cart-popup-root';
                popupRoot.setAttribute('aria-hidden', 'true');
                el.insertAdjacentElement('afterend', popupRoot);
            }

            var cartBtn = document.getElementById('navCartBtn');
            if (cartBtn) {
                cartBtn.addEventListener('click', function (e) {
                    e.preventDefault();
                    if (!popupRoot.dataset.loaded) {
                        fetch('/cart/popup-cart.html')
                            .then(function (r) { return r.text(); })
                            .then(function (html) {
                                popupRoot.innerHTML = html;
                                popupRoot.dataset.loaded = 'true';
                                popupRoot.classList.add('active');
                                popupRoot.setAttribute('aria-hidden', 'false');
                                document.body.classList.add('cart-popup-open');
                            })
                            .catch(function () { window.location.href = '/cart/cart.html'; });
                    } else {
                        popupRoot.classList.add('active');
                        popupRoot.setAttribute('aria-hidden', 'false');
                        document.body.classList.add('cart-popup-open');
                    }
                });
            }

            popupRoot.addEventListener('click', function (e) {
                if (e.target.closest('[data-cart-popup-close]') || e.target === popupRoot ||
                    e.target.matches('[data-cart-popup-backdrop]')) {
                    popupRoot.classList.remove('active');
                    popupRoot.setAttribute('aria-hidden', 'true');
                    document.body.classList.remove('cart-popup-open');
                }
            });

            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && popupRoot.classList.contains('active')) {
                    popupRoot.classList.remove('active');
                    popupRoot.setAttribute('aria-hidden', 'true');
                    document.body.classList.remove('cart-popup-open');
                }
            });

            if (user) {
                fetch('/api/cart/' + user.id)
                    .then(function (r) { return r.json(); })
                    .then(function (data) {
                        var badge = document.getElementById('navCartCount');
                        if (badge) badge.textContent = (data.summary && data.summary.itemCount) || 0;
                    })
                    .catch(function () {});
            }
        }
    }

    function initSidebar(opts) {
        opts = opts || {};
        var type = opts.type || 'customer';
        var activePage = opts.activePage || '';
        var el = document.getElementById(opts.containerId || 'sidebarContainer');
        if (!el) return;

        var links = type === 'admin' ? ADMIN_LINKS : CUSTOMER_LINKS;
        var linksHTML = links.map(function (link) {
            var cls = link.page === activePage ? ' class="active"' : '';
            return '<a href="' + link.href + '"' + cls + '>' +
                   '<i class="fas ' + link.icon + '"></i> <span>' + link.label + '</span></a>';
        }).join('');

        if (type === 'admin') {
            el.innerHTML =
                '<div class="admin-sidebar" id="appSidebar">' +
                '<div class="sidebar-title-container">' +
                '<div class="sidebar-title">ADMIN PANEL</div>' +
                '<button class="sidebar-toggle" id="sidebarToggle" title="Toggle"><i class="fas fa-angle-left"></i></button>' +
                '</div>' +
                '<div class="sidebar-menu">' + linksHTML + '</div>' +
                '<a href="#" class="logout-link" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> <span>Logout</span></a>' +
                '</div>';
        } else {
            el.innerHTML =
                '<div class="sidebar" id="appSidebar">' +
                '<div class="sidebar-toggle-container">' +
                '<button class="sidebar-toggle" id="sidebarToggle" title="Toggle"><i class="fas fa-angle-left"></i></button>' +
                '</div>' +
                '<button class="add-product-btn" type="button" onclick="window.location.href=\'/br-product/add-products.html\'">' +
                '<i class="fas fa-plus"></i> <span>Add Product</span></button>' +
                '<div class="sidebar-menu">' + linksHTML + '</div>' +
                '<div class="sidebar-footer">' +
                '<a href="#"><i class="fab fa-facebook"></i></a>' +
                '<a href="#"><i class="fab fa-twitter"></i></a>' +
                '<a href="#"><i class="fab fa-instagram"></i></a>' +
                '</div>' +
                '<a href="#" class="logout-link" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> <span>Logout</span></a>' +
                '</div>';
        }

        var toggle = document.getElementById('sidebarToggle');
        var sidebar = document.getElementById('appSidebar');
        if (toggle && sidebar) {
            if (localStorage.getItem('sidebarCollapsed') === 'true') {
                sidebar.classList.add('collapsed');
                toggle.querySelector('i').style.transform = 'rotate(180deg)';
            }
            toggle.addEventListener('click', function () {
                sidebar.classList.toggle('collapsed');
                var collapsed = sidebar.classList.contains('collapsed');
                toggle.querySelector('i').style.transform = collapsed ? 'rotate(180deg)' : '';
                localStorage.setItem('sidebarCollapsed', String(collapsed));
            });
        }

        var logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function (e) {
                e.preventDefault();
                localStorage.removeItem('utUser');
                window.location.href = '/index/login.html';
            });
        }
    }

    function init(opts) {
        initNavbar(opts);
        initSidebar(opts);
    }

    window.UTComponents = { init: init, initNavbar: initNavbar, initSidebar: initSidebar, getUser: getUser };
})();
