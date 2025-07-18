class RepoCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  set repo(data) {
    const {
      name,
      html_url,
      description = "No description provided.",
      language = "Unknown",
      stargazers_count = 0,
      forks_count = 0,
    } = data;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          background: rgba(22, 27, 34, 0.6);
          backdrop-filter: blur(8px);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
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
          color: #58a6ff;
          font-size: 1.2rem;
        }

        p {
          font-size: 0.95rem;
          color: #8b949e;
          margin-bottom: 0.8rem;
        }

        .meta {
          font-size: 0.8rem;
          color: #c9d1d9;
        }

        a {
          color: #58a6ff;
          text-decoration: none;
        }
      </style>
      <div>
        <h3><a href="${html_url}" target="_blank">${name}</a></h3>
        <p>${description}</p>
        <div class="meta">⭐ ${stargazers_count} | 🍴 ${forks_count} | 💻 ${language}</div>
      </div>
    `;
  }
}

customElements.define('repo-card', RepoCard);