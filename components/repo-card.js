export class RepoCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  set repo(data) {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          background: #1e1e1e;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 1rem;
          margin: 1rem 0;
          color: #eee;
        }
        h3 {
          margin: 0;
          font-size: 1.2rem;
        }
        p {
          font-size: 0.95rem;
          color: #aaa;
        }
        a {
          display: inline-block;
          margin-top: 0.5rem;
          color: #4fc3f7;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
      </style>
      <h3>${data.name}</h3>
      <p>${data.description || 'No description provided.'}</p>
      <a href="${data.html_url}" target="_blank">View on GitHub →</a>
    `;
    this.dataset.tags = data.topics.join(',');
  }
}

customElements.define('repo-card', RepoCard);