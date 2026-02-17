class HeaderTextWidget extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<span style="color: white; font-weight: bold; padding: 0 10px;">
                        Dein Text hier
                      </span>`;
  }
}
customElements.define('header-text-widget', HeaderTextWidget);
