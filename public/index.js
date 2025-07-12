// Menu hamburger mobile
document.addEventListener('DOMContentLoaded', function () {
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeBtn = document.querySelector('.close-mobile-menu');
    const links = document.querySelectorAll('.mobile-menu-links a');

    function openMenu() {
        mobileMenu.classList.add('open');
        document.body.classList.add('menu-open');
        hamburger.classList.add('active');
        hamburger.setAttribute('aria-expanded', 'true');
    }
    function closeMenu() {
        mobileMenu.classList.remove('open');
        document.body.classList.remove('menu-open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
    }

    if (hamburger && mobileMenu && closeBtn) {
        hamburger.addEventListener('click', openMenu);
        closeBtn.addEventListener('click', closeMenu);
        // Fermer le menu quand on clique sur un lien
        links.forEach(link => {
            link.addEventListener('click', closeMenu);
        });
    }
});
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    const sections = document.querySelectorAll('.cv-left, .cv-right');

    // Cache le loader
    if (loader) {
        loader.classList.add('hidden');
    }

    // Animation d'entrée progressive pour chaque section
    sections.forEach((section, index) => {
        setTimeout(() => {
            section.classList.add('animate-in');
        }, 200 + (index * 150)); // Délai progressif entre les sections
    });
});