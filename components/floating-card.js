class FloatingCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    const wrapper = document.createElement('div');
    wrapper.setAttribute('part', 'wrapper');

    const title = document.createElement('div');
    title.setAttribute('part', 'title');
    title.textContent = this.getAttribute('title') || 'Untitled';

    const content = document.createElement('div');
    content.setAttribute('part', 'content');
    content.textContent = this.getAttribute('content') || 'No content provided.';

    wrapper.appendChild(title);
    wrapper.appendChild(content);

    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
      }

      div[part="wrapper"] {
        font-family: 'Segoe UI', sans-serif;
        background: rgba(20, 20, 30, 0.9);
        color: #fff;
        padding: 1.5rem 2rem;
        border-radius: 16px;
        backdrop-filter: blur(12px);
        box-shadow: 0 0 30px rgba(0, 255, 255, 0.2);
        max-width: 400px;
        text-align: center;
        animation: fadeIn 0.4s ease-out;
      }

      div[part="title"] {
        font-size: 1.5rem;
        font-weight: bold;
        margin-bottom: 1rem;
      }

      div[part="content"] {
        font-size: 1rem;
        line-height: 1.5;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;

    this.shadowRoot.append(style, wrapper);
  }

  connectedCallback() {
    this.addEventListener('click', () => {
      this.remove();
    });
  }
}

customElements.define('floating-card', FloatingCard);