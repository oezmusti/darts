// ============================================
// COMMON NAVIGATION FUNCTIONS
// ============================================

/**
 * Toggle Navigation Menu
 */
function toggleNav() {
    const nav = document.getElementById('headerNavigation');
    if (nav) {
        nav.classList.toggle('hidden');
    }
}

/**
 * Setup Navigation Auto-Close
 * Closes navigation when a nav item is clicked
 */
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item:not(.closebutton-nav)');
    navItems.forEach(item => {
        item.addEventListener('click', function () {
            setTimeout(() => {
                const nav = document.getElementById('headerNavigation');
                if (nav) {
                    nav.classList.add('hidden');
                }
            }, 100);
        });
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Wait for navigation to be injected
        setTimeout(setupNavigation, 100);
    });
} else {
    setTimeout(setupNavigation, 100);
}
