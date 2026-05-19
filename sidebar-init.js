function loadSidebar(sidebarPath) {
    fetch(sidebarPath)
        .then(r => r.text())
        .then(html => {
            document.getElementById('sidebarContainer').innerHTML = html;
            initSidebar();
        })
        .catch(err => console.error('Sidebar load error:', err));
}

function initSidebar() {
    // Toggle collapse
    const toggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('appSidebar');
    if (toggle && sidebar) {
        if (localStorage.getItem('sidebarCollapsed') === 'true') {
            sidebar.classList.add('collapsed');
            toggle.querySelector('i').style.transform = 'rotate(180deg)';
        }
        toggle.addEventListener('click', function () {
            sidebar.classList.toggle('collapsed');
            const collapsed = sidebar.classList.contains('collapsed');
            this.querySelector('i').style.transform = collapsed ? 'rotate(180deg)' : 'rotate(0deg)';
            localStorage.setItem('sidebarCollapsed', collapsed);
        });
    }

    // Logout
    const logoutBtn = document.getElementById('sidebarLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            localStorage.clear();
            window.location.href = '/index/login.html';
        });
    }

    // Active link — match current page filename
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    document.querySelectorAll('.sidebar-menu a[data-page]').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === currentPage) {
            link.classList.add('active');
        }
    });

    // Show username in navbar elements if present
    const usernameEl = document.getElementById('username');
    const initialEl = document.getElementById('userInitial');
    const stored = localStorage.getItem('username') || 'User';
    if (usernameEl) usernameEl.textContent = stored;
    if (initialEl) initialEl.textContent = stored.charAt(0).toUpperCase();
}
