// Datei: rss-ticker.js
// Direkter RSS-Abruf via rss2json (mit optionalem API-Key), Debug-Logs, fester Breiten-Fix für Header

class RssTicker extends HTMLElement {
  static get observedAttributes() {
    return ["rss","speed","maxitems","separator","dark","debug",
            "rss2jsonapikey","rss2jsonparams"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.state = {
      rss: "",
      speed: 60,           // Sekunden pro kompletter Marquee-Durchlauf (min 20)
      maxItems: 15,
      separator: " • ",
      dark: false,
      debug: false,
      rss2jsonApiKey: "",  // optionaler API-Key für bessere Limits/Optionen
      rss2jsonParams: ""   // optionale Query-Parameter, z.B. "order_by=pubDate&count=15"
    };
  }

  attributeChangedCallback(name, _oldVal, val) {
    const map = {
      maxitems: "maxItems",
      rss2jsonapikey: "rss2jsonApiKey",
      rss2jsonparams: "rss2jsonParams"
    };
    const key = map[name] || name;
    if (key === "speed" || key === "maxItems") this.state[key] = Number(val);
    else if (key === "dark" || key === "debug") this.state[key] = (String(val) === "true");
    else this.state[key] = val;
    if (this.isConnected) this.render();
  }

  connectedCallback() {
    for (const attr of RssTicker.observedAttributes) {
      if (this.hasAttribute(attr)) {
        this.attributeChangedCallback(attr, null, this.getAttribute(attr));
      }
    }
    this.render();
  }

  log(...args){ if (this.state.debug) console.log("[rss-ticker]", ...args); }

  async render() {
    const { rss, speed, maxItems, separator, dark } = this.state;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          height: 32px;
          width: 360px;          /* Arbeitsbreite im Header */
          max-width: 640px;
          flex: 0 1 360px;       /* erlaubt Schrumpfen, wenn eng */
          font: 12px/32px system-ui, Segoe UI, Roboto, sans-serif;
        }
        .wrap {
          position: relative;
          overflow: hidden;
          height: 32px;
          border-radius: 16px;
          padding: 0 12px;
          box-sizing: border-box;
          background: ${dark ? "#1b1d21" : "#f6f7f9"};
          color: ${dark ? "#e9eaec" : "#1a1c1e"};
          border: 1px solid ${dark ? "#2a2d33" : "#dfe3e8"};
        }
        .track {
          position: absolute;
          white-space: nowrap;
          will-change: transform;
          animation: scroll linear infinite;
        }
        .item { margin-right: 16px; opacity: 0.95 }
        .item a { color: inherit; text-decoration: none; }
        .item a:hover { text-decoration: underline; }

        /* Start leicht im Sichtbereich, damit sofort Text da ist */
        @keyframes scroll {
          from { transform: translateX(10%); }
          to   { transform: translateX(-110%); }
        }
      </style>
      <div class="wrap" part="container">
        <div class="track" part="track">Lade Meldungen …</div>
      </div>
    `;

    const track = this.shadowRoot.querySelector(".track");

    try {
      const items = await this.fetchRssItems();
      this.log("Items geladen:", items.length, { rss });

      if (!items.length) {
        track.textContent = "Keine Einträge im Feed.";
        return;
      }

      const html = items.map(i => {
        const title = this.escape(i.title);
        const href  = this.escapeAttr(i.link || i.url || "#");
        return `<span class="item">• ${href}${title}</a></span>`;
      }).join(separator);

      track.innerHTML = html;

      const charCount = track.textContent ? track.textContent.length : 100;
      const seconds = Math.max(20, Number.isFinite(this.state.speed) ? this.state.speed : 60, Math.round(charCount / 6));
      track.style.animationDuration = `${seconds}s`;

    } catch (e) {
      this.log("Fehler beim Rendern:", e);
      track.textContent = `RSS-Fehler: ${e?.message || e}`;
    }
  }

  async fetchRssItems() {
    const { rss, maxItems, rss2jsonApiKey, rss2jsonParams } = this.state;
    if (!rss) return [];

    // Basis-URL lt. Doku: https://api.rss2json.com/v1/api.json?rss_url=<encoded>
    // Optional: api_key + weitere Parameter (order_by, order_dir, count ...)
    // Doku: https://rss2json.com/docs
    let api = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rss)}`;

    if (rss2jsonApiKey) api += `&api_key=${encodeURIComponent(rss2jsonApiKey)}`;
    if (rss2jsonParams) api += `&${rss2jsonParams}`;

    this.log("Hole RSS via rss2json:", api);

    const res = await fetch(api, { cache: "no-store" });
    if (!res.ok) throw new Error(`rss2json: HTTP ${res.status}`);

    const data = await res.json();
    // Erfolgsformat laut Doku: { status: "ok", items: [...] }
    if (data.status !== "ok") throw new Error(data.message || "rss2json Fehler");

    const items = Array.isArray(data.items) ? data.items : [];
    return items.slice(0, maxItems).map(x => ({ title: x.title, link: x.link }));
  }

  // Utility: Escapes
  escape(s) {
    return String(s || "").replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
    }[c]));
  }
  escapeAttr(s) { return String(s || "").replace(/"/g, "&quot;"); }
}

customElements.define("rss-ticker", RssTicker);
