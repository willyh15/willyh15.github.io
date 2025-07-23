class FloatingCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.dragging = false;
    this.dragOffset = { x: 0, y: 0 };

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
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 999;
        user-select: none;
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
        cursor: grab;
        animation: fadeInSlideDown 0.4s ease forwards;
      }

      div[part="wrapper"]:active {
        cursor: grabbing;
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

      @keyframes fadeInSlideDown {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes fadeOutSlideUp {
        from {
          opacity: 1;
          transform: translateY(0);
        }
        to {
          opacity: 0;
          transform: translateY(-20px);
        }
      }
    `;

    this.shadowRoot.append(style, wrapper);
    this.wrapper = wrapper;

    // Bind event handlers
    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    this._onClickOutside = this._onClickOutside.bind(this);
  }

  connectedCallback() {
    this.wrapper.addEventListener('pointerdown', this._onPointerDown);
    window.addEventListener('pointermove', this._onPointerMove);
    window.addEventListener('pointerup', this._onPointerUp);
    window.addEventListener('click', this._onClickOutside);

    // Prevent clicks inside the card from propagating and closing it immediately
    this.wrapper.addEventListener('click', e => e.stopPropagation());
  }

  disconnectedCallback() {
    this.wrapper.removeEventListener('pointerdown', this._onPointerDown);
    window.removeEventListener('pointermove', this._onPointerMove);
    window.removeEventListener('pointerup', this._onPointerUp);
    window.removeEventListener('click', this._onClickOutside);
  }

  _onPointerDown(e) {
    this.dragging = true;
    this.wrapper.style.transition = 'none';

    // Calculate offset of cursor from top-left corner of card
    const rect = this.wrapper.getBoundingClientRect();
    this.dragOffset.x = e.clientX - rect.left;
    this.dragOffset.y = e.clientY - rect.top;

    e.preventDefault();
  }

  _onPointerMove(e) {
    if (!this.dragging) return;

    const x = e.clientX - this.dragOffset.x;
    const y = e.clientY - this.dragOffset.y;

    // Clamp within viewport (optional)
    const maxX = window.innerWidth - this.wrapper.offsetWidth;
    const maxY = window.innerHeight - this.wrapper.offsetHeight;
    const clampedX = Math.min(Math.max(0, x), maxX);
    const clampedY = Math.min(Math.max(0, y), maxY);

    this.wrapper.style.position = 'fixed';
    this.wrapper.style.left = clampedX + 'px';
    this.wrapper.style.top = clampedY + 'px';
    this.wrapper.style.transform = 'none';
  }

  _onPointerUp(e) {
    if (!this.dragging) return;
    this.dragging = false;
    this.wrapper.style.transition = '';
  }

  _onClickOutside() {
    this.close();
  }

  close() {
    this.wrapper.style.animation = 'fadeOutSlideUp 0.3s ease forwards';
    this.wrapper.style.pointerEvents = 'none';
    setTimeout(() => this.remove(), 300);
  }
}

customElements.define('floating-card', FloatingCard);