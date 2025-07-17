class RepoCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  set data(repo) {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        .card {
          background: rgba(22, 27, 34, 0.6);
          backdrop-filter: blur(8px);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.25);
          padding: 1.25rem;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .card:hover {
          transform: rotateX(6deg) rotateY(-6deg) scale(1.03);
          box-shadow: 0 10px 40px rgba(88, 166, 255, 0.35);
        }

        h3 {
          margin: 0 0 0.5rem;
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
          font-size: 0.9rem;
        }

        .meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          color: #6e7681;
          margin-top: 0.5rem;
        }
      </style>
      <div class="card">
        <h3><a href="${repo.html_url}" target="_blank">${repo.name}</a></h3>
        <p>${repo.description || "No description provided."}</p>
        <div class="meta">
          <span>⭐ ${repo.stargazers_count}</span>
          <span>🍴 ${repo.forks_count}</span>
          <span>💬 ${repo.language || "Unknown"}</span>
        </div>
      </div>
    `;
  }
}

customElements.define("repo-card", RepoCard);