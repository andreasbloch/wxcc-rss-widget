class StatischesTestWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <div style="
        background: #005a8b; 
        color: white; 
        padding: 5px 15px; 
        border: 2px solid #ffcc00; 
        border-radius: 20px;
        font-family: sans-serif;
        font-weight: bold;
        display: flex;
        align-items: center;
        height: 30px;
        white-space: nowrap;
      ">
        🚀 Axians Test: Verbindung steht!
      </div>
    `;
  }
}
customElements.define('test-widget', StatischesTestWidget);
