// Wir laden Lit direkt von einem CDN, damit kein Build-Step nötig ist
import { html, css, LitElement } from 'https://esm.sh';

export class RSSWidget extends LitElement {
  static get styles() {
    return css`
      :host {
        display: flex;
        align-items: center;
        height: 40px; /* Passt besser in den WxCC Header */
        background: transparent;
        font-family: sans-serif;
      }
      .rss-container {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 0 15px;
        color: var(--text-color, white);
        font-size: 13px;
      }
      .title-link {
        color: #ffcc00; /* Axians Gelb oder Gold als Akzent */
        text-decoration: none;
        white-space: nowrap;
        max-width: 300px;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      button {
        cursor: pointer;
        background: rgba(255,255,255,0.1);
        border: none;
        color: white;
        border-radius: 4px;
        padding: 2px 8px;
      }
      button:hover { background: rgba(255,255,255,0.2); }
    `;
  }

  static get properties() {
    return {
      rss: { type: String },
      items: { type: Array },
      currentIndex: { type: Number }
    };
  }

  constructor() {
    super();
    this.rss = 'https://www.tagesschau.de';
    this.items = [];
    this.currentIndex = 0;
  }

  // Da wir keinen NPM Server haben, nutzen wir einen freien RSS-zu-JSON Wandler, 
  // um CORS Probleme im Browser zu umgehen
  async connectedCallback() {
    super.connectedCallback();
    try {
      const response = await fetch(`https://api.rss2json.com{encodeURIComponent(this.rss)}`);
      const data = await response.json();
      this.items = data.items || [];
    } catch (e) {
      console.error("RSS Feed Fehler:", e);
    }
  }

  render() {
    if (this.items.length === 0) return html`<div class="rss-container">Lade Feed...</div>`;
    const item = this.items[this.currentIndex];

    return html`
      <div class="rss-container">
        <span>📢</span>
        <button @click="${() => this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length}">&lt;</button>
        <a class="title-link" href="${item.link}" target="_blank">${item.title}</a>
        <button @click="${() => this.currentIndex = (this.currentIndex + 1) % this.items.length}">&gt;</button>
      </div>
    `;
  }
}

customElements.define('rss-widget', RSSWidget);
