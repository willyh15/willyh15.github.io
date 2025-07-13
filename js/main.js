import '../components/repo-card.js';

const TAG_MAP = {
  DevOps: ['docker', 'kubernetes', 'ci', 'cd', 'devops', 'infra', 'terraform', 'ansible'],
  FullStack: ['svelte', 'nextjs', 'frontend', 'backend', 'sqlite', 'supabase', 'fullstack'],
  Cybersecurity: ['pentest', 'security', 'aircrack', 'ctf', 'spoof', 'jailbreak']
};

const list = document.querySelector('#repo-list');

window.addEventListener("scroll", () => {
  const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrolled = (winScroll / height) * 100;
  document.getElementById("scroll-bar").style.width = scrolled + "%";
});

async function loadRepos() {
  const res = await fetch('static/repos.json');
  const repos = await res.json();
  render(repos);
  setupFilters(repos);
}

function render(repos) {
  list.innerHTML = '';
  repos.forEach(repo => {
    const card = document.createElement('repo-card');
    card.repo = repo;
    list.appendChild(card);
  });
}

function setupFilters(repos) {
  document.querySelectorAll('nav button').forEach(btn => {
    btn.addEventListener('click', () => {
      const tag = btn.dataset.filter;
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