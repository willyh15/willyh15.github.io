class RepoCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  set repo(repoData) {
    const {
      name,
      description,
      html_url,
      stargazers_count,
      language,
      homepage
    } = repoData;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          background: rgba(10, 20, 30, 0.8);
          border: 1px solid rgba(0, 255, 255, 0.2);
          border-radius: 10px;
          padding: 1rem;
          margin-bottom: 1rem;
          box-shadow: 0 0 12px rgba(0,255,255,0.15);
          transition: transform 0.3s ease;
        }
        :host(:hover) {
          transform: scale(1.02);
        }
        h3 {
          color: #0ff;
          margin: 0 0 0.5rem;
        }
        p {
          font-size: 0.9rem;
          color: #ccc;
        }
        .meta {
          margin-top: 0.5rem;
          font-size: 0.8rem;
          color: #999;
        }
        a {
          color: #0ff;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
      </style>
      <div>
        <h3><a href="${html_url}" target="_blank">${name}</a></h3>
        <p>${description || 'No description'}</p>
        <div class="meta">
          ⭐ ${stargazers_count} • ${language || 'Unknown'}
          ${homepage ? ` • <a href="${homepage}" target="_blank">Live</a>` : ''}
        </div>
      </div>
    `;
  }
}

customElements.define('repo-card', RepoCard);