// Menu hamburger mobile
document.addEventListener('DOMContentLoaded', function () {
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeBtn = document.querySelector('.close-mobile-menu');
    const links = document.querySelectorAll('.mobile-menu-links a');

    function openMenu() {
        mobileMenu.classList.add('open');
        document.body.classList.add('menu-open');
        hamburger.setAttribute('aria-expanded', 'true');
    }
    function closeMenu() {
        mobileMenu.classList.remove('open');
        document.body.classList.remove('menu-open');
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
    const layout = document.querySelector('.cv-layout');
    const sections = document.querySelectorAll('.cv-left, .cv-right');

    loader.classList.add('hidden'); // Cache le loader

    // Débloque les animations du contenu
    layout.style.opacity = '1';
    layout.style.animationPlayState = 'running';

    sections.forEach(section => {
      section.style.animationPlayState = 'running';
      section.style.opacity = '1';
    });
});