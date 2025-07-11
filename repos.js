const TAG_MAP = {
  DevOps: ['docker', 'kubernetes', 'ci', 'cd', 'devops', 'infra', 'terraform', 'ansible'],
  FullStack: ['svelte', 'nextjs', 'frontend', 'backend', 'sqlite', 'supabase', 'fullstack'],
  Cybersecurity: ['pentest', 'security', 'aircrack', 'ctf', 'spoof', 'jailbreak']
};

const main = document.querySelector('#repo-list');

async function loadRepos() {
  const res = await fetch('static/repos.json');
  const repos = await res.json();
  render(repos);
  setupFilters(repos);
}

function render(repos) {
  main.innerHTML = '';
  repos.forEach(repo => {
    const card = document.createElement('article');
    card.innerHTML = `
      <h2><a href="${repo.html_url}" target="_blank">${repo.name}</a></h2>
      <p>${repo.description || 'No description'}</p>
      <span class="lang">${repo.language || ''}</span>
      <span class="topics">${(repo.topics || []).join(', ')}</span>
    `;
    card.dataset.topics = (repo.topics || []).join(' ').toLowerCase();
    main.appendChild(card);
  });
}

function setupFilters(repos) {
  document.querySelectorAll('nav button').forEach(button => {
    button.addEventListener('click', () => {
      const tag = button.dataset.filter;
      if (tag === 'All') return render(repos);
      const keywords = TAG_MAP[tag] || [];
      const filtered = repos.filter(r =>
        (r.topics || []).some(t => keywords.includes(t.toLowerCase()))
      );
      render(filtered);
    });
  });
}

loadRepos();