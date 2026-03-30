import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("view-placeholder")
export class ViewPlaceholder extends LitElement {
  @property() icon = "🔨";
  @property() title = "Vista";
  @property() message = "En construcción...";

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      gap: var(--space-4);
      text-align: center;
      padding: var(--space-6);
    }
    .icon {
      font-size: 3rem;
      line-height: 1;
      opacity: 0.7;
    }
    .title {
      font-size: var(--text-2xl);
      font-weight: 700;
      color: var(--text0);
      letter-spacing: -0.01em;
    }
    .msg {
      font-size: var(--text-sm);
      color: var(--text2);
      max-width: 20rem;
      line-height: 1.6;
    }
  `;

  render() {
    return html`
      <span class="icon">${this.icon}</span>
      <h2 class="title">${this.title}</h2>
      <p class="msg">${this.message}</p>
    `;
  }
}
