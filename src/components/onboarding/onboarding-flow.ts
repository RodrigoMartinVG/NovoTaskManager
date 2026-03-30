import { SignalWatcher } from "@lit-labs/signals";
import { gsap } from "gsap";
/* ═══ Oda v3.0 — Onboarding Flow ═══ */
import { LitElement, css, html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { appMode, enterDemo, enterLocal } from "../../state/store.js";

type Step = "welcome" | "tema" | "dataset";

const THEMES = [
  { id: "hueso", label: "Hueso", bg: "#f0ece3", fg: "#28231c", bar: "#4e47b8" },
  { id: "claro", label: "Claro", bg: "#f5f5f5", fg: "#111111", bar: "#4040cc" },
  { id: "noche", label: "Noche", bg: "#0e0e10", fg: "#ececec", bar: "#8880f0" },
  { id: "pizarron", label: "Pizarrón", bg: "#181c2e", fg: "#e8eaf8", bar: "#a09cf8" },
  { id: "cafe", label: "Café", bg: "#1a1410", fg: "#f0e8d8", bar: "#c0a8f0" },
] as const;

const STEPS: Step[] = ["welcome", "tema", "dataset"];

@customElement("onboarding-flow")
export class OnboardingFlow extends SignalWatcher(LitElement) {
  @state() private step: Step = "welcome";
  @state() private selectedTheme = "noche";
  @state() private animating = false;

  static styles = css`
    :host {
      display: block;
    }

    /* ── Screen ── */
    .ob-screen {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem 1.25rem;
      background: var(--bg0);
      position: relative;
      overflow: hidden;
    }

    /* Grid pattern */
    .ob-screen::before {
      content: "";
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(var(--border) 1px, transparent 1px),
        linear-gradient(90deg, var(--border) 1px, transparent 1px);
      background-size: 2.5rem 2.5rem;
      opacity: 0.18;
      pointer-events: none;
    }

    /* Radial vignette */
    .ob-screen::after {
      content: "";
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse 70% 60% at 50% 30%, transparent 0%, var(--bg0) 100%);
      pointer-events: none;
    }

    .ob-inner {
      position: relative;
      z-index: 1;
      max-width: 32.5rem;
      width: 100%;
    }

    /* ── Progress ── */
    .ob-progress {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }
    .ob-step {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.6875rem;
      color: var(--text3);
      font-weight: 500;
    }
    .ob-step-num {
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.6875rem;
      font-weight: 700;
      border: 1px solid var(--border2);
      color: var(--text3);
      background: transparent;
    }
    .ob-step[data-active] .ob-step-num {
      background: var(--accent);
      color: #fff;
      border-color: var(--accent);
    }
    .ob-step[data-done] .ob-step-num {
      background: var(--accent);
      color: #fff;
      border-color: var(--accent);
    }
    .ob-step-line {
      width: 2rem;
      height: 1px;
      background: var(--border2);
    }

    /* ── Card ── */
    .ob-card {
      background: var(--bg1);
      border: 1px solid var(--border2);
      border-radius: 1rem;
      padding: 2rem 2rem 1.75rem;
      box-shadow: 0 1.5rem 3.75rem rgba(0,0,0,.18);
    }

    /* ── Hero ── */
    .ob-hero {
      text-align: center;
      margin-bottom: 1.5rem;
    }
    .ob-logo-mark {
      font-size: 2.5rem;
      color: var(--accent);
      line-height: 1;
      display: block;
      margin-bottom: 0.5rem;
    }
    .ob-logo-text {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text0);
      letter-spacing: .04em;
    }

    /* ── Titles & text ── */
    .ob-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text0);
      margin-bottom: 0.75rem;
      line-height: 1.3;
    }
    .ob-desc {
      font-size: var(--text-sm);
      color: var(--text2);
      line-height: 1.65;
      margin-bottom: 1.25rem;
    }
    .ob-desc strong {
      color: var(--text0);
    }

    /* ── Feature values ── */
    .ob-values {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }
    .ob-value {
      display: flex;
      gap: 0.75rem;
      align-items: flex-start;
      padding: 0.75rem;
      border-radius: 0.5rem;
      background: var(--bg2);
    }
    .ob-value-ico {
      font-size: 1.25rem;
      line-height: 1;
      flex-shrink: 0;
    }
    .ob-value-text h4 {
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--text0);
      margin-bottom: 0.25rem;
    }
    .ob-value-text p {
      font-size: 0.6875rem;
      color: var(--text2);
      line-height: 1.5;
    }

    /* ── Mini preview ── */
    .ob-preview {
      border: 1px solid var(--border);
      border-radius: 0.625rem;
      padding: 0.875rem;
      margin-bottom: 1.25rem;
      background: var(--bg0);
    }
    .ob-preview-title {
      font-size: 0.6875rem;
      font-weight: 600;
      color: var(--text3);
      text-transform: uppercase;
      letter-spacing: .08em;
      margin-bottom: 0.75rem;
    }
    .ob-preview-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.375rem 0;
      font-size: 0.6875rem;
    }
    .ob-preview-item + .ob-preview-item {
      border-top: 1px solid var(--border);
    }
    .ob-preview-left {
      color: var(--text1);
    }
    .ob-preview-right {
      color: var(--text3);
      font-size: 0.625rem;
    }
    .ob-preview-bar {
      height: 0.25rem;
      border-radius: 0.125rem;
      background: var(--bg3);
      margin-top: 0.75rem;
      overflow: hidden;
    }
    .ob-preview-fill {
      height: 100%;
      width: 62%;
      background: var(--accent);
      border-radius: 0.125rem;
    }
    .ob-preview-footer {
      display: flex;
      justify-content: space-between;
      font-size: 0.625rem;
      color: var(--text3);
      margin-top: 0.375rem;
    }

    /* ── Theme chips ── */
    .ob-themes {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 0.5rem;
      margin-bottom: 1.25rem;
    }
    .ob-theme-chip {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.375rem;
      padding: 0.625rem 0.375rem;
      border: 2px solid var(--border);
      border-radius: 0.5rem;
      background: transparent;
      cursor: pointer;
      font-family: inherit;
      font-size: 0.625rem;
      color: var(--text2);
      transition: all .16s;
    }
    .ob-theme-chip:hover {
      border-color: var(--text3);
    }
    .ob-theme-chip[data-active] {
      border-color: var(--accent);
      color: var(--text0);
    }
    .ob-theme-preview {
      width: 100%;
      height: 1.625rem;
      border-radius: 0.25rem;
      position: relative;
      overflow: hidden;
    }
    .ob-theme-bar {
      position: absolute;
      bottom: 0.25rem;
      left: 0.25rem;
      width: 40%;
      height: 0.25rem;
      border-radius: 0.125rem;
    }
    .ob-theme-note {
      font-size: 0.6875rem;
      color: var(--text3);
      text-align: center;
      margin-bottom: 1.25rem;
      font-style: italic;
    }

    /* ── Dataset options ── */
    .ob-opts-label {
      font-size: 0.6875rem;
      color: var(--text3);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: .08em;
      margin-bottom: 0.75rem;
    }
    .ob-opt {
      display: block;
      width: 100%;
      text-align: left;
      border: 1px solid var(--border2);
      border-radius: 0.625rem;
      padding: 1rem;
      background: transparent;
      cursor: pointer;
      font-family: inherit;
      transition: all .16s;
      margin-bottom: 0.625rem;
    }
    .ob-opt:hover {
      background: var(--bg2);
      border-color: var(--text3);
    }
    .ob-opt.pri-opt {
      border-color: var(--accent);
      background: color-mix(in srgb, var(--accent) 6%, transparent);
    }
    .ob-opt-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.375rem;
    }
    .ob-opt-ico {
      font-size: 1.125rem;
    }
    .ob-opt-title {
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--text0);
    }
    .ob-opt-tag {
      font-size: 0.5625rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .06em;
      padding: 0.125rem 0.375rem;
      border-radius: 0.25rem;
      background: var(--accent);
      color: #fff;
    }
    .ob-opt-desc {
      font-size: 0.6875rem;
      color: var(--text2);
      line-height: 1.5;
      margin-bottom: 0.375rem;
    }
    .ob-opt-small {
      font-size: 0.625rem;
      color: var(--text3);
      line-height: 1.5;
    }

    /* ── Buttons ── */
    .ob-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.625rem 1.25rem;
      border-radius: 0.5rem;
      font-family: inherit;
      font-size: var(--text-sm);
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all .16s;
    }
    .ob-btn-pri {
      background: var(--accent);
      color: #fff;
      width: 100%;
    }
    .ob-btn-pri:hover {
      filter: brightness(1.12);
    }
    .ob-btn-sec {
      background: transparent;
      color: var(--text2);
      border: 1px solid var(--border);
    }
    .ob-btn-sec:hover {
      color: var(--text0);
      border-color: var(--text3);
    }
    .ob-actions {
      display: flex;
      gap: 0.75rem;
      margin-top: 1.25rem;
    }
    .ob-actions .ob-btn { flex: 1; }

    /* ── Hints ── */
    .ob-hint {
      font-size: 0.6875rem;
      color: var(--text3);
      line-height: 1.55;
      margin-top: 1rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--border);
    }
    .ob-hint strong {
      color: var(--text2);
    }

    /* ── Footnote ── */
    .ob-footnote {
      font-size: 0.625rem;
      color: var(--text3);
      text-align: center;
      margin-top: 1.5rem;
      max-width: 28rem;
      line-height: 1.5;
    }

    /* ── Responsive ── */
    @media (max-width: 40em) {
      .ob-card { padding: 1.375rem 1.125rem 1.25rem; border-radius: 1.125rem; }
      .ob-title { font-size: 1.25rem; }
      .ob-themes { grid-template-columns: repeat(3, 1fr); }
    }
  `;

  // ── Navigation ──
  private async _goTo(next: Step) {
    if (this.animating) return;
    this.animating = true;

    const inner = this.renderRoot.querySelector(".ob-inner") as HTMLElement;
    if (inner) {
      await gsap.to(inner, { opacity: 0, y: 10, duration: 0.2, ease: "power2.in" });
    }

    this.step = next;
    await this.updateComplete;

    if (inner) {
      gsap.fromTo(
        inner,
        { opacity: 0, y: -10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.35,
          ease: "power2.out",
          onComplete: () => {
            this.animating = false;
          },
        },
      );
    } else {
      this.animating = false;
    }
  }

  private _applyTheme(id: string) {
    this.selectedTheme = id;
    document.documentElement.setAttribute("data-theme", id);
    localStorage.setItem("oda-theme", id);
  }

  private async _onEnterLocal() {
    if (this.animating) return;
    this.animating = true;

    const screen = this.renderRoot.querySelector(".ob-screen") as HTMLElement;
    if (screen) {
      await gsap.to(screen, { opacity: 0, scale: 0.97, duration: 0.4, ease: "power2.in" });
    }
    enterLocal();
    this.dispatchEvent(new CustomEvent("onboarding-done", { bubbles: true, composed: true }));
  }

  private async _onEnterDemo() {
    if (this.animating) return;
    this.animating = true;

    const screen = this.renderRoot.querySelector(".ob-screen") as HTMLElement;
    if (screen) {
      await gsap.to(screen, { opacity: 0, scale: 0.97, duration: 0.4, ease: "power2.in" });
    }
    enterDemo();
    this.dispatchEvent(new CustomEvent("onboarding-done", { bubbles: true, composed: true }));
  }

  // ── Entrance animation ──
  protected firstUpdated() {
    const hero = this.renderRoot.querySelector(".ob-hero");
    const card = this.renderRoot.querySelector(".ob-card");
    const footnote = this.renderRoot.querySelector(".ob-footnote");

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    if (hero) tl.from(hero, { opacity: 0, y: 18, duration: 0.5 });
    if (card) tl.from(card, { opacity: 0, y: 18, duration: 0.45 }, "-=0.3");
    if (footnote) tl.from(footnote, { opacity: 0, duration: 0.4 }, "-=0.2");
  }

  // ── Progress rendering ──
  private _renderProgress() {
    const labels = ["Inicio", "Estilo", "Arranque"];
    const currentIdx = STEPS.indexOf(this.step);

    return html`
      <div class="ob-progress">
        ${labels.map(
          (label, i) => html`
          ${i > 0 ? html`<span class="ob-step-line"></span>` : nothing}
          <span class="ob-step" ?data-active=${i === currentIdx} ?data-done=${i < currentIdx}>
            <span class="ob-step-num">${i < currentIdx ? "✓" : i + 1}</span>
            ${label}
          </span>
        `,
        )}
      </div>
    `;
  }

  // ── Step 1: Welcome ──
  private _renderWelcome() {
    return html`
      <div class="ob-hero">
        <span class="ob-logo-mark">◈</span>
        <span class="ob-logo-text">Oda Planner</span>
      </div>
      ${this._renderProgress()}
      <div class="ob-card">
        <h1 class="ob-title">Organizá tu semana sin caos</h1>
        <p class="ob-desc">
          Convertí materias, fechas límite, sesiones y horarios en un plan claro
          que podés seguir todos los días. Oda te ayuda a dejar de improvisar,
          ver qué toca hoy y adelantarte a lo importante antes de llegar con el
          agua al cuello.
        </p>

        <div class="ob-preview">
          <div class="ob-preview-title">Vista rápida de una semana viva</div>
          <div class="ob-preview-item">
            <span class="ob-preview-left">🔴 TP de Matemática · arrancar hoy</span>
            <span class="ob-preview-right">vence mañana</span>
          </div>
          <div class="ob-preview-item">
            <span class="ob-preview-left">📘 Bloque de estudio · Bases de Datos</span>
            <span class="ob-preview-right">19:00 — Noche</span>
          </div>
          <div class="ob-preview-item">
            <span class="ob-preview-left">✅ Resumen de Historia · completado</span>
            <span class="ob-preview-right">2 sesiones</span>
          </div>
          <div class="ob-preview-bar"><div class="ob-preview-fill"></div></div>
          <div class="ob-preview-footer">
            <span>Horas de la semana</span>
            <span>8.5h / 13h — 62%</span>
          </div>
        </div>

        <div class="ob-values">
          <div class="ob-value">
            <span class="ob-value-ico">📚</span>
            <div class="ob-value-text">
              <h4>Convierte materias en un plan real</h4>
              <p>Pasás de una lista suelta de entregas a una semana ordenada por franjas, prioridades y horas disponibles.</p>
            </div>
          </div>
          <div class="ob-value">
            <span class="ob-value-ico">⏱</span>
            <div class="ob-value-text">
              <h4>Registra estudio sin fricción</h4>
              <p>Cada sesión suma tiempo real a tus materias y tareas, para ver si vas llegando o si ya te estás quedando atrás.</p>
            </div>
          </div>
          <div class="ob-value">
            <span class="ob-value-ico">🚨</span>
            <div class="ob-value-text">
              <h4>Te avisa antes del desastre</h4>
              <p>Fechas de inicio, vencimientos y alertas configurables para no enterarte tarde de lo importante.</p>
            </div>
          </div>
        </div>

        <button class="ob-btn ob-btn-pri" @click=${() => this._goTo("tema")}>
          Empezar →
        </button>

        <div class="ob-hint">
          <strong>Inicio recomendado:</strong> arrancá en local y, cuando ya tengas
          tu planner armado, conectá Google Drive desde 💾 Datos para sincronizarlo
          entre dispositivos.
        </div>
      </div>

      <p class="ob-footnote">
        Tus datos pueden vivir en este navegador, en un JSON exportado o sincronizados
        con Google Drive · La configuración visual se puede cambiar en cualquier momento
      </p>
    `;
  }

  // ── Step 2: Theme ──
  private _renderTema() {
    return html`
      ${this._renderProgress()}
      <div class="ob-card">
        <h1 class="ob-title">Antes de empezar, elegí tu tema</h1>
        <p class="ob-desc">
          Elegí el tema que más te guste para arrancar. Es solo una personalización
          visual, así que después podés cambiarlo cuando quieras desde el header o
          desde Configuración.
        </p>

        <div class="ob-themes">
          ${THEMES.map(
            (t) => html`
            <button
              class="ob-theme-chip"
              ?data-active=${this.selectedTheme === t.id}
              @click=${() => this._applyTheme(t.id)}
            >
              <div class="ob-theme-preview" style="background:${t.bg}">
                <div class="ob-theme-bar" style="background:${t.bar}"></div>
              </div>
              ${t.label}
            </button>
          `,
          )}
        </div>

        <p class="ob-theme-note">No te bloquees acá: es solo estética. Lo importante viene en el siguiente paso.</p>

        <div class="ob-actions">
          <button class="ob-btn ob-btn-sec" @click=${() => this._goTo("welcome")}>← Atrás</button>
          <button class="ob-btn ob-btn-pri" @click=${() => this._goTo("dataset")}>Continuar →</button>
        </div>
      </div>
    `;
  }

  // ── Step 3: Dataset ──
  private _renderDataset() {
    return html`
      ${this._renderProgress()}
      <div class="ob-card">
        <h1 class="ob-title">Elegí tu forma de arranque</h1>
        <p class="ob-desc">
          Elegís cómo entrar por primera vez y listo. En cuanto entres, la app te
          abre la guía completa para que no tengas que adivinar nada ni perder
          tiempo buscando dónde está cada cosa.
        </p>

        <div class="ob-opts-label">Elegí una opción</div>

        <button class="ob-opt pri-opt" @click=${this._onEnterLocal}>
          <div class="ob-opt-header">
            <span class="ob-opt-ico">⚡</span>
            <span class="ob-opt-title">Empezar rápido en modo local</span>
            <span class="ob-opt-tag">recomendado</span>
          </div>
          <p class="ob-opt-desc">
            Entrás ya mismo a la app con tu planner vacío para empezar a cargar
            materias, horarios y tareas.
          </p>
          <p class="ob-opt-small">
            Tus datos quedan guardados en este navegador. Después podés exportar,
            importar o sincronizar con Google Drive desde 💾 Datos.
          </p>
        </button>

        <button class="ob-opt" @click=${this._onEnterDemo}>
          <div class="ob-opt-header">
            <span class="ob-opt-ico">🎲</span>
            <span class="ob-opt-title">Explorar con datos de ejemplo</span>
            <span class="ob-opt-tag" style="background: var(--text3)">demo</span>
          </div>
          <p class="ob-opt-desc">
            Ideal para entender rápido cómo se conectan materias, backlog,
            calendario, sesiones y alertas.
          </p>
          <p class="ob-opt-small">
            Se cargan materias, tareas y sesiones ficticias para que puedas
            recorrer la app y enseguida ver cómo te devuelve valor.
          </p>
        </button>

        <div class="ob-hint">
          <strong>Al entrar se abre la guía completa:</strong> vas a tener a mano el
          recorrido inicial, cómo cargar materias, cómo usar la Vista Semana y cómo
          manejar tus datos sin romper nada.
        </div>
        <div class="ob-hint" style="border-top:none;margin-top:0.375rem;padding-top:0">
          <strong>Siguiente paso recomendado al entrar:</strong> crear tus materias,
          definir objetivos semanales y marcar tus slots en la Vista Semana. Con eso
          la app ya empieza a transformarte fechas sueltas en un plan concreto.
        </div>

        <div class="ob-actions">
          <button class="ob-btn ob-btn-sec" @click=${() => this._goTo("tema")}>← Atrás</button>
        </div>
      </div>
    `;
  }

  render() {
    if (appMode.value !== "welcome") return nothing;

    return html`
      <div class="ob-screen">
        <div class="ob-inner">
          ${this.step === "welcome" ? this._renderWelcome() : nothing}
          ${this.step === "tema" ? this._renderTema() : nothing}
          ${this.step === "dataset" ? this._renderDataset() : nothing}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "onboarding-flow": OnboardingFlow;
  }
}
