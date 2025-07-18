import '../components/repo-card.js';

document.addEventListener('DOMContentLoaded', () => {
  fetch('static/repos.json')
    .then(response => response.json())
    .then(repos => {
      const repoList = document.getElementById('repo-list');

      repos.forEach(repo => {
        const card = document.createElement('repo-card');
        card.repo = repo;
        card.setAttribute('data-tags', repo.topics?.join(',') || '');
        repoList.appendChild(card);
      });

      setupFilters();
    })
    .catch(error => {
      console.error('Error loading repos.json:', error);
    });
});

function setupFilters() {
  const buttons = document.querySelectorAll('nav button');
  const cards = document.querySelectorAll('repo-card');

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      buttons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      const filter = button.dataset.filter;

      cards.forEach(card => {
        const tags = card.getAttribute('data-tags');
        if (filter === 'All' || tags.includes(filter)) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}