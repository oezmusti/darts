// ============================================
// NAVIGATION LOADER & INJECTOR
// ============================================

const NavigationTemplate = `
<nav class="header-nav hidden" id="headerNavigation">
    <div class="header-nav-inner">
        <div class="closebutton-nav" onclick="toggleNav()">✕</div>
        <div class="nav-items">
            <button class="nav-item" onclick="navigateTo('home')">Home</button>
            <a href="imprint.html" class="nav-item nav-text">Impressum</a>
            <a href="privacy.html" class="nav-item nav-text">Datenschutz</a>
        </div>
    </div>
</nav>
`;

function injectNavigation() {
    // Find all header-menu elements
    document.querySelectorAll('.header-menu').forEach(headerMenu => {
        // Check if navigation already exists
        if (!headerMenu.querySelector('.header-nav')) {
            const navContainer = document.createElement('div');
            navContainer.innerHTML = NavigationTemplate;
            headerMenu.appendChild(navContainer.firstElementChild);
        }
    });
}

// Inject navigation when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectNavigation);
} else {
    injectNavigation();
}

