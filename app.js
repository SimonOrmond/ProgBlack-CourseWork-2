// SEAM — app.js
// Placeholder for interactivity (routing, modals, etc.)

// Cards are navigable
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', () => {
    const title = card.querySelector('.card__title')?.textContent;
    console.log(`Navigating to project: ${title}`);
    // TODO: navigate to project detail page
  });
});

// New Project button
document.querySelector('.btn--primary')?.addEventListener('click', (e) => {
  e.stopPropagation();
  console.log('Open new project modal');
  // TODO: open new project modal
});

// User menu
document.querySelector('.nav__user')?.addEventListener('click', () => {
  console.log('Toggle user menu');
  // TODO: open user dropdown
});
