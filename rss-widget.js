(function() {
  class RssWidget extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.logs = [];
    }

    addLog(msg) {
      this.logs.push(`${new Date().toLocaleTimeString()}: ${msg}`);
      this.render();
    }

    connectedCallback() {
      this.addLog("Widget im DOM verbunden.");
      this.fetchData();
    }

    async fetchData() {
      const rssUrl = "https://www.tagesschau.de/index~rss2.xml";
      const apiUrl = "https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(rssUrl);
      
      this.addLog(`Starte Fetch auf: ${apiUrl}`);

      try {
        const response = await fetch(apiUrl);
        this.addLog(`HTTP Status: ${response.status}`);
        
        const data = await response.json();
        if (data.status === 'ok') {
          this.addLog(`Daten erfolgreich geladen. Items: ${data.items.length}`);
          this.render(data.items[0]);
        } else {
          this.addLog(`API Fehler: ${data.message}`);
        }
      } catch (error) {
        this.addLog(`KRITISCHER FEHLER: ${error.message}`);
      }
    }

    render(items = []) {
  const item = items[0]; // Wir zeigen die aktuellste Meldung
  this.shadowRoot.innerHTML = `
    <style>
      :host { display: block; padding: 20px; font-family: 'Segoe UI', sans-serif; height: 100%; background: #f4f4f7; }
      .axians-card { background: white; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-top: 4px solid #005a8b; padding: 20px; max-width: 500px; }
      .category { color: #005a8b; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; }
      h2 { margin: 0 0 12px 0; font-size: 18px; color: #333; line-height: 1.3; }
      p { color: #666; font-size: 14px; line-height: 1.5; margin-bottom: 20px; }
      .btn { display: inline-block; background: #005a8b; color: white; text-decoration: none; padding: 10px 20px; border-radius: 2px; font-size: 14px; font-weight: 500; transition: background 0.2s; }
      .btn:hover { background: #00466d; }
    </style>
    <div class="axians-card">
      <div class="category">Axians News Feed</div>
      <h2>${item.title}</h2>
      <p>${item.description.replace(/<[^>]*>?/gm, '').substring(0, 150)}...</p>
      <a href="${item.link}" target="_blank" class="btn">Vollständigen Artikel lesen</a>
    </div>
  `;
}

// Doppel-Registrierung für maximale Kompatibilität
const widgetName = 'rss-widget';
const widgetItemName = 'rss-widget-item';

if (!customElements.get(widgetName)) {
    customElements.define(widgetName, RssWidget);
    console.log(`Widget registriert als: ${widgetName}`);
}

if (!customElements.get(widgetItemName)) {
    customElements.define(widgetItemName, RssWidget);
    console.log(`Widget registriert als: ${widgetItemName}`);
}
})();
