(function () {
    'use strict';

    var CUSTOMER_LINKS = [
        { href: '/dashboard/market.html',          icon: 'fa-home',          label: 'Dashboard',        page: 'market' },
        { href: '/br-product/browse-products.html', icon: 'fa-store',         label: 'Browse Products',  page: 'browse' },
        { href: '/dashboard/my-products.html',      icon: 'fa-box',           label: 'My Products',      page: 'my-products' },
        { href: '/dashboard/messages.html',         icon: 'fa-envelope',      label: 'Messages',         page: 'messages' },
        { href: '/dashboard/my-orders.html',        icon: 'fa-shopping-cart', label: 'Orders',           page: 'orders' },
        { href: '/dashboard/settings.html',         icon: 'fa-cog',           label: 'Settings',         page: 'settings' }
    ];

    var ADMIN_LINKS = [
        { href: '/admin/admin.html#dashboard', icon: 'fa-home',          label: 'Dashboard', page: 'admin' },
        { href: '/admin/admin.html#users',     icon: 'fa-users',         label: 'Users',     page: 'admin' },
        { href: '/admin/admin.html#products',  icon: 'fa-box',           label: 'Products',  page: 'admin' },
        { href: '/admin/admin.html#orders',    icon: 'fa-shopping-cart', label: 'Orders',    page: 'admin' },
        { href: '#',                           icon: 'fa-chart-bar',     label: 'Reports',   page: 'admin' },
        { href: '#',                           icon: 'fa-cog',           label: 'Settings',  page: 'admin' }
    ];

    function getUser() {
        try { return JSON.parse(localStorage.getItem('utUser') || 'null'); } catch (e) { return null; }
    }

    function injectStyles() {
        if (document.getElementById('utComponentsStyle')) return;
        var s = document.createElement('style');
        s.id = 'utComponentsStyle';
        s.textContent = [
            /* ── User dropdown ── */
            '.nav-user-dropdown{position:relative;display:flex;align-items:center;}',
            '.nav-user-trigger{display:flex;align-items:center;gap:8px;cursor:pointer;padding:6px 10px;border-radius:10px;transition:background .15s;user-select:none;}',
            '.nav-user-trigger:hover{background:rgba(255,255,255,.1);}',
            '.nav-user-trigger .fa-chevron-down{font-size:11px;transition:transform .2s;color:rgba(255,255,255,.7);}',
            '.nav-user-dropdown.open .nav-user-trigger .fa-chevron-down{transform:rotate(180deg);}',
            '.nav-dropdown-menu{position:absolute;top:calc(100% + 10px);right:0;width:260px;background:#fff;border-radius:14px;box-shadow:0 8px 32px rgba(0,0,0,.16);z-index:9999;overflow:hidden;opacity:0;transform:translateY(-8px);pointer-events:none;transition:opacity .18s,transform .18s;}',
            '.nav-user-dropdown.open .nav-dropdown-menu{opacity:1;transform:translateY(0);pointer-events:auto;}',
            '.nav-dropdown-header{padding:16px;background:#fafafa;border-bottom:1px solid #f0f0f0;display:flex;align-items:center;gap:12px;}',
            '.nav-dropdown-avatar{width:42px;height:42px;border-radius:50%;background:#e07b39;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:16px;flex-shrink:0;}',
            '.nav-dropdown-avatar img{width:42px;height:42px;border-radius:50%;object-fit:cover;}',
            '.nav-dropdown-user-info{min-width:0;display:flex;flex-direction:column;align-items:flex-start;}',
            '.nav-dropdown-name{font-weight:600;font-size:14px;color:#1a1a1a;line-height:1.2;}',
            '.nav-dropdown-email{font-size:12px;color:#888;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:170px;}',
            '.nav-dropdown-role{display:inline-block;margin-top:5px;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;}',
            '.nav-dropdown-role.role-admin{background:#fef3eb;color:#e07b39;}',
            '.nav-dropdown-role.role-seller{background:#eaf4fb;color:#2980b9;}',
            '.nav-dropdown-role.role-buyer{background:#eafbea;color:#27ae60;}',
            '.nav-dropdown-role.role-buyer-seller{background:#eafbea;color:#247a3a;}',
            '.nav-dropdown-divider{height:1px;background:#f0f0f0;margin:4px 0;}',
            '.nav-dropdown-item{display:flex;align-items:center;gap:10px;padding:11px 16px;font-size:14px;color:#333;text-decoration:none;transition:background .12s;cursor:pointer;border:none;background:none;width:100%;text-align:left;font-family:inherit;}',
            '.nav-dropdown-item:hover{background:#f7f7f7;color:#e07b39;}',
            '.nav-dropdown-item i{width:16px;text-align:center;color:#aaa;font-size:13px;}',
            '.nav-dropdown-item:hover i{color:#e07b39;}',
            '.nav-dropdown-item.danger{color:#e74c3c;}',
            '.nav-dropdown-item.danger i{color:#e74c3c;}',
            '.nav-dropdown-item.danger:hover{background:#fdf0f0;}',
            '.nav-dropdown-item.highlight{color:#e07b39;font-weight:600;}',
            '.nav-dropdown-item.highlight i{color:#e07b39;}',
            /* ── Navbar search ── */
            '.search-bar input{background:none;border:none;outline:none;font-size:14px;width:180px;}',
            /* ── Notifications dropdown ── */
            '.nav-notifications-dropdown{position:relative;display:flex;align-items:center;}',
            '.navbar-bell-btn:hover{transform:scale(1.1);}',
            '.nav-notif-menu{position:absolute;top:calc(100% + 10px);right:0;width:320px;background:#fff;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.16);z-index:9999;overflow:hidden;opacity:0;transform:translateY(-8px);pointer-events:none;transition:opacity .18s,transform .18s;}',
            '.nav-notifications-dropdown.open .nav-notif-menu{opacity:1;transform:translateY(0);pointer-events:auto;}',
            '.nav-notif-header{padding:12px 16px;background:#fafafa;border-bottom:1px solid #f0f0f0;display:flex;justify-content:space-between;align-items:center;}',
            '.nav-notif-header h3{margin:0;font-size:14px;font-weight:700;color:#1a1a1a;}',
            '.nav-notif-header button{background:none;border:none;color:#999;cursor:pointer;font-size:12px;padding:4px 8px;}',
            '.nav-notif-header button:hover{color:#333;}',
            '.nav-notif-list{max-height:400px;overflow-y:auto;}',
            '.nav-notif-item{padding:12px 16px;border-bottom:1px solid #f5f5f5;cursor:pointer;transition:background .2s;display:flex;gap:12px;align-items:flex-start;}',
            '.nav-notif-item:hover{background:#fafafa;}',
            '.nav-notif-item.unread{background:#f0f7ff;border-left:3px solid #e04a2f;}',
            '.nav-notif-item.unread{padding-left:13px;}',
            '.nav-notif-icon{font-size:16px;margin-top:2px;}',
            '.nav-notif-content{flex:1;min-width:0;}',
            '.nav-notif-title{font-weight:600;font-size:12px;color:#1a1a1a;margin:0;}',
            '.nav-notif-message{font-size:11px;color:#666;margin:4px 0 0;line-height:1.4;}',
            '.nav-notif-time{font-size:10px;color:#999;margin-top:4px;}',
            '.nav-notif-empty{padding:24px 16px;text-align:center;color:#999;font-size:13px;}',
            '.nav-notif-footer{padding:12px 16px;text-align:center;border-top:1px solid #f0f0f0;}',
            '.nav-notif-footer a{color:#e04a2f;text-decoration:none;font-size:12px;font-weight:600;}',
            '.nav-notif-footer a:hover{text-decoration:underline;}',
        ].join('');
        document.head.appendChild(s);
    }

    function initNavbar(opts) {
        opts = opts || {};
        var type = opts.type || 'customer';
        var el = document.getElementById(opts.containerId || 'navbarContainer');
        if (!el) return;

        injectStyles();

        var user = getUser();
        var name    = user ? (user.username || user.email || 'User') : 'User';
        var email   = user ? (user.email || '') : '';
        var role    = user ? (user.role || 'Buyer') : 'Buyer';
        var displayRole = type === 'customer' && role !== 'Admin' ? 'Buyer/Seller' : role;
        var roleClass = displayRole.toLowerCase().replace('/', '-').replace(/\s+/g, '-');
        var initial = name[0].toUpperCase();

        var cartHTML = type === 'customer'
            ? '<a href="/cart/cart.html" class="navbar-cart-link" id="navCartBtn" aria-label="Cart">' +
              '<i class="fas fa-shopping-cart"></i>' +
              '<span class="navbar-cart-count" id="navCartCount">0</span></a>'
            : '';

        // Build dropdown menu items
        var menuItems = '';
        if (type === 'customer') {
            menuItems +=
                '<a href="/dashboard/market.html" class="nav-dropdown-item"><i class="fas fa-home"></i> Dashboard</a>' +
                '<a href="/br-product/browse-products.html" class="nav-dropdown-item"><i class="fas fa-store"></i> Browse Products</a>' +
                '<a href="/dashboard/my-products.html" class="nav-dropdown-item"><i class="fas fa-box"></i> My Products</a>' +
                '<a href="/dashboard/messages.html" class="nav-dropdown-item"><i class="fas fa-envelope"></i> Messages</a>' +
                '<div class="nav-dropdown-divider"></div>';
            if (role === 'Admin') {
                menuItems += '<a href="/admin/admin.html" class="nav-dropdown-item highlight"><i class="fas fa-shield-halved"></i> Admin Panel</a>' +
                    '<div class="nav-dropdown-divider"></div>';
            }
        } else {
            menuItems +=
                '<a href="/admin/admin.html#dashboard" class="nav-dropdown-item"><i class="fas fa-home"></i> Admin Dashboard</a>' +
                '<a href="/admin/admin.html#users" class="nav-dropdown-item"><i class="fas fa-users"></i> Manage Users</a>' +
                '<a href="/admin/admin.html#products" class="nav-dropdown-item"><i class="fas fa-box"></i> Manage Products</a>' +
                '<a href="/admin/admin.html#orders" class="nav-dropdown-item"><i class="fas fa-shopping-cart"></i> Manage Orders</a>' +
                '<a href="/admin/admin.html#admin-roles" class="nav-dropdown-item"><i class="fas fa-user-shield"></i> Admin Roles</a>' +
                '<div class="nav-dropdown-divider"></div>' +
                '<a href="/dashboard/market.html" class="nav-dropdown-item"><i class="fas fa-eye"></i> Customer View</a>' +
                                '<a href="/dashboard/market.html" class="nav-dropdown-item"><i class="fas fa-users"></i> User Panel</a>' +
                                '<div class="nav-dropdown-divider"></div>';
        }
        menuItems += '<button class="nav-dropdown-item danger" id="navDropdownLogout"><i class="fas fa-sign-out-alt"></i> Logout</button>';

        var avatarHTML = user && user.avatarUrl
            ? '<img src="' + user.avatarUrl + '" alt="' + name + '" onerror="this.outerHTML=\'<span>' + initial + '</span>\'">'
            : initial;

        var logoHref = type === 'admin' ? '/admin/admin.html' : '/dashboard/market.html';
        var bellHTML = user ? '<button class="navbar-bell-btn" id="navBellBtn" aria-label="Notifications" title="Notifications" style="background:none;border:none;color:#fff;cursor:pointer;font-size:18px;position:relative;">' +
              '<i class="fas fa-bell"></i>' +
              '<span class="navbar-notif-count" id="navNotifCount" style="position:absolute;top:-5px;right:-5px;background:#e04a2f;color:#fff;width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;display:none;"></span>' +
              '</button>' : '';

        el.innerHTML =
            '<nav class="navbar">' +
            '<a href="' + logoHref + '" class="logo" style="text-decoration:none;color:inherit;">Ubuntu <span class="color-logo">Trade</span></a>' +
            '<div class="nav-buttons">' +
            '<div class="search-bar"><i class="fas fa-search"></i><input type="text" id="navSearchInput" placeholder="Search products..."></div>' +
            '<div class="admin-profile">' +
            bellHTML +
            cartHTML +
            '<div class="nav-user-dropdown" id="navUserDropdown">' +
            '<div class="nav-user-trigger" id="navUserTrigger">' +
            '<div class="profile-avatar nav-dropdown-avatar">' + avatarHTML + '</div>' +
            '<span id="navUsername">' + name + '</span>' +
            '<i class="fas fa-chevron-down"></i>' +
            '</div>' +
            '<div class="nav-dropdown-menu" id="navDropdownMenu">' +
            '<div class="nav-dropdown-header">' +
            '<div class="nav-dropdown-avatar">' + avatarHTML + '</div>' +
            '<div class="nav-dropdown-user-info">' +
            '<div class="nav-dropdown-name">' + name + '</div>' +
            '<div class="nav-dropdown-email">' + email + '</div>' +
            '<span class="nav-dropdown-role role-' + roleClass + '">' + displayRole + '</span>' +
            '</div></div>' +
            '<div class="nav-dropdown-divider"></div>' +
            menuItems +
            '</div></div>' +
            '</div></div></nav>';

        // Toggle dropdown
        var trigger  = document.getElementById('navUserTrigger');
        var dropdown = document.getElementById('navUserDropdown');
        if (trigger && dropdown) {
            trigger.addEventListener('click', function (e) {
                e.stopPropagation();
                dropdown.classList.toggle('open');
            });
            document.addEventListener('click', function () {
                dropdown.classList.remove('open');
            });
            document.getElementById('navDropdownMenu').addEventListener('click', function (e) {
                e.stopPropagation();
            });
        }

        // Logout
        var logoutBtn = document.getElementById('navDropdownLogout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function () {
                localStorage.removeItem('utUser');
                window.location.href = '/index/login.html';
            });
        }

        // Navbar search → browse-products
        var navSearch = document.getElementById('navSearchInput');
        if (navSearch) {
            navSearch.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    var q = navSearch.value.trim();
                    if (q) window.location.href = '/br-product/browse-products.html?search=' + encodeURIComponent(q);
                }
            });
        }

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

                // Load notifications
                function loadNotifications() {
                    fetch('/api/notifications/unread/' + user.id)
                        .then(function (r) { return r.json(); })
                        .then(function (data) {
                            var count = data.count || 0;
                            var badge = document.getElementById('navNotifCount');
                            if (badge) {
                                if (count > 0) {
                                    badge.textContent = count;
                                    badge.style.display = 'flex';
                                } else {
                                    badge.style.display = 'none';
                                }
                            }
                        })
                        .catch(function () {});
                }

                loadNotifications();
                setInterval(loadNotifications, 30000); // Reload every 30 seconds

                // Bell click handler
                var bellBtn = document.getElementById('navBellBtn');
                if (bellBtn) {
                    var notifDropdown = null;
                    
                    bellBtn.addEventListener('click', function (e) {
                        e.stopPropagation();
                        
                        // Create dropdown if it doesn't exist
                        if (!notifDropdown) {
                            notifDropdown = document.createElement('div');
                            notifDropdown.className = 'nav-notif-menu';
                            notifDropdown.innerHTML = '<div style="padding:20px;text-align:center;"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
                            bellBtn.insertAdjacentElement('afterend', notifDropdown);

                            var notifContainer = document.createElement('div');
                            notifContainer.className = 'nav-notifications-dropdown';
                            notifContainer.appendChild(bellBtn);
                            notifContainer.appendChild(notifDropdown);
                            bellBtn.parentNode.replaceChild(notifContainer, bellBtn);
                            bellBtn = notifContainer.querySelector('#navBellBtn');
                        }

                        // Toggle dropdown
                        var parent = bellBtn.parentNode;
                        parent.classList.toggle('open');

                        if (parent.classList.contains('open')) {
                            // Load notifications
                            fetch('/api/notifications/unread/' + user.id)
                                .then(function (r) { return r.json(); })
                                .then(function (data) {
                                    var notifications = data.notifications || [];
                                    var html = '<div class="nav-notif-header">' +
                                        '<h3>Notifications (' + notifications.length + ')</h3>' +
                                        (notifications.length > 0 ? '<button onclick="fetch(\'/api/notifications/markAll/' + user.id + '/read\', {method:\'PUT\'}).then(() => location.reload())">Mark all as read</button>' : '') +
                                        '</div>' +
                                        '<div class="nav-notif-list">';

                                    if (notifications.length === 0) {
                                        html += '<div class="nav-notif-empty">No new notifications</div>';
                                    } else {
                                        notifications.forEach(function (notif) {
                                            var icon = notif.type === 'seller_approved' ? '🎉' : 
                                                      notif.type === 'new_order' ? '📦' :
                                                      notif.type === 'seller_flagged' ? '⚠️' : '📢';
                                            var time = new Date(notif.createdAt).toLocaleDateString();
                                            html += '<div class="nav-notif-item ' + (notif.isRead ? '' : 'unread') + '" onclick="' +
                                                (notif.actionUrl ? 'window.location.href=\'' + notif.actionUrl + '\'' : '') +
                                                '"; fetch(\'/api/notifications/' + notif.id + '/read\', {method:\'PUT\'});">' +
                                                '<div class="nav-notif-icon">' + icon + '</div>' +
                                                '<div class="nav-notif-content">' +
                                                '<p class="nav-notif-title">' + notif.title + '</p>' +
                                                '<p class="nav-notif-message">' + notif.message + '</p>' +
                                                '<div class="nav-notif-time">' + time + '</div>' +
                                                '</div></div>';
                                        });
                                    }

                                    html += '</div>' +
                                        '<div class="nav-notif-footer">' +
                                        '<a href="javascript:void(0)">View All Notifications</a>' +
                                        '</div>';

                                    notifDropdown.innerHTML = html;
                                })
                                .catch(function () {
                                    notifDropdown.innerHTML = '<div class="nav-notif-empty">Failed to load notifications</div>';
                                });
                        }
                    });

                    // Close on outside click
                    document.addEventListener('click', function () {
                        if (notifDropdown && bellBtn && bellBtn.parentNode) {
                            bellBtn.parentNode.classList.remove('open');
                        }
                    });
                }
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
