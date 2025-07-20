// File: components/floating-card.js
class FloatingCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    const wrapper = document.createElement('div');
    wrapper.className = 'floating-card';

    const title = document.createElement('h3');
    title.textContent = this.getAttribute('title') || 'Title';

    const content = document.createElement('p');
    content.textContent = this.getAttribute('content') || 'Placeholder content for this section.';

    const close = document.createElement('button');
    close.textContent = '×';
    close.className = 'close-btn';
    close.addEventListener('click', () => {
      this.remove();
    });

    wrapper.append(close, title, content);
    const style = document.createElement('style');
    style.textContent = `
      .floating-card {
        position: fixed;
        top: 50%;
        left: 50%;
        width: 90%;
        max-width: 500px;
        transform: translate(-50%, -50%);
        background: rgba(0,0,10,0.9);
        color: #00ffff;
        border: 1px solid #00ffff55;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 0 20px #00ffff55;
        backdrop-filter: blur(12px);
        z-index: 9999;
        animation: fadeIn 0.3s ease-out;
      }

      .floating-card h3 {
        margin-top: 0;
        font-size: 1.6rem;
      }

      .floating-card p {
        font-size: 1rem;
        line-height: 1.5;
        color: #e0faff;
      }

      .close-btn {
        position: absolute;
        top: 0.4rem;
        right: 0.8rem;
        background: transparent;
        color: #00ffff;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.9) translate(-50%, -50%); }
        to { opacity: 1; transform: scale(1) translate(-50%, -50%); }
      }
    `;

    this.shadowRoot.append(style, wrapper);
  }
}
customElements.define('floating-card', FloatingCard);