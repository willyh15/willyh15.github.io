export class RepoCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  async setRepo(data) {
    const res = await fetch(`https://api.github.com/repos/${data.full_name}`);
    const repoDetails = await res.json();

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          background: rgba(22, 27, 34, 0.6);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.25);
          padding: 1.25rem;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          transform-style: preserve-3d;
          perspective: 1000px;
        }
        :host(:hover) {
          transform: rotateX(6deg) rotateY(-6deg) scale(1.03);
          box-shadow: 0 10px 40px rgba(88, 166, 255, 0.35);
        }
        h3 {
          margin: 0 0 0.5rem;
          font-size: 1.2rem;
          color: #58a6ff;
        }
        p {
          font-size: 0.95rem;
          color: #8b949e;
          margin-bottom: 0.8rem;
        }
        a {
          color: #58a6ff;
          text-decoration: none;
          font-size: 0.95rem;
        }
        .stats {
          display: flex;
          gap: 1rem;
          margin-top: 0.75rem;
          font-size: 0.85rem;
          color: #8b949e;
        }
        .stats span {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
      </style>
      <h3>${data.name}</h3>
      <p>${data.description || 'No description provided.'}</p>
      <a href="${data.html_url}" target="_blank">View on GitHub →</a>
      <div class="stats">
        <span>⭐ ${repoDetails.stargazers_count}</span>
        <span>🍴 ${repoDetails.forks_count}</span>
        <span>🧬 ${repoDetails.language || 'N/A'}</span>
      </div>
    `;

    this.dataset.tags = data.topics.join(',');
  }

  set repo(data) {
    this.setRepo(data);
  }
}

customElements.define('repo-card', RepoCard);