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