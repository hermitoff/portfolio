function renderSection(section) {
  if (!section) return '';

  switch (section.type) {
    case 'photo':
        return `
            <img class="profile-picture" src="${section.image}" alt="Photo de profil" />
            <h1>${section.name}</h1>
            <p class="justify-center">${section.description}</p>
        `;

    case 'list':
        return `
            <h2>${section.title}</h2>
            <ul>
              ${section.items.map(item => `
                <li>
                  ${item.primary ? `<strong>${item.primary}</strong>` : ''}
                  ${item.secondary ? ` – ${item.secondary}` : ''}
                  ${item.years ? ` (${item.years})` : ''}
                </li>
              `).join('')}
            </ul>
        `;

    case 'skills':
        return `
        <h2>${section.title}</h2>
        <ul>
            ${section.items.map(item => `
            <li><strong>${item.category} :</strong> ${item.details}</li>
            `).join('')}
        </ul>
      `;

    case 'languages':
      return `
        <h2>${section.title}</h2>
        <ul>
            ${section.items.map(item => `
                <li><strong>${item.name} :</strong> ${item.level}</li>
            `).join('')}
        </ul>
        `;

    case 'contacts':
        return `
            <h2>${section.title}</h2>
            <ul class="contact-list">
            ${section.items.map(item => `
                <li>
                <i class="${item.icon}"></i>
                <a href="${item.url}" ${item.newTab ? 'target="_blank"' : ''}>${item.label}</a>
            </li>
          `).join('')}
        </ul>
      `;

    case 'text':
      return `
        <h2>${section.title}</h2>
        <p class="justify-center">${section.content}</p>
      `;

    default:
      return '';
  }
}

module.exports = renderSection;