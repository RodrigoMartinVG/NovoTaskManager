/* ═══ Oda v3.0 — Onboarding Flow ═══ */
import { PreactSignalWatcher } from "../shared/preact-signal-watcher.js";
import { gsap } from "gsap";
import { LitElement, css, html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { appMode, enterDemo, enterLocal } from "../../state/store.js";

type Step = "splash" | "estilo" | "welcome" | "dataset";

const THEMES = [
  { id: "hueso", label: "Hueso", bg: "#f0ece3", fg: "#28231c", bar: "#4e47b8" },
  { id: "claro", label: "Claro", bg: "#f5f5f5", fg: "#111111", bar: "#4040cc" },
  { id: "noche", label: "Noche", bg: "#0e0e10", fg: "#ececec", bar: "#8880f0" },
  { id: "pizarron", label: "Pizarrón", bg: "#181c2e", fg: "#e8eaf8", bar: "#a09cf8" },
  { id: "cafe", label: "Café", bg: "#1a1410", fg: "#f0e8d8", bar: "#c0a8f0" },
] as const;

const DENSITIES = [
  { id: "compacto", label: "Compacto", desc: "Más info en pantalla", sample: "Aa" },
  { id: "", label: "Normal", desc: "Equilibrio", sample: "Aa" },
  { id: "comodo", label: "Cómodo", desc: "Más legible", sample: "Aa" },
  { id: "grande", label: "Extra grande", desc: "Máxima legibilidad", sample: "Aa" },
] as const;

const STEPS: Step[] = ["estilo", "welcome", "dataset"];
const STEP_LABELS = ["Estilo", "Bienvenida", "Arranque"];

@customElement("onboarding-flow")
export class OnboardingFlow extends PreactSignalWatcher(LitElement) {
  @state() private step: Step = "splash";
  @state() private selectedTheme = "";
  @state() private selectedDensity = "";
  @state() private animating = false;

  static styles = css`
    :host { display: block; }

    /* ── Splash (step 0) ── */
    .splash {
      box-sizing: border-box;
      height: 100vh;
      height: 100dvh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #f4f1eb;
      position: relative;
      overflow: hidden;
      padding: 2rem;
    }

    /* Radial glow behind the logo */
    .splash::before {
      content: "";
      position: absolute;
      width: 36rem;
      height: 36rem;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(78,71,184,0.10) 0%, rgba(78,71,184,0.03) 50%, transparent 75%);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -58%);
      pointer-events: none;
    }

    .splash-inner {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 0.5rem;
    }

    .splash-diamond {
      font-size: 5rem;
      line-height: 1;
      color: #4e47b8;
      filter: drop-shadow(0 0 2rem rgba(78,71,184,0.35));
      margin-bottom: 0.5rem;
    }

    .splash-logo {
      font-size: 3.5rem;
      font-weight: 800;
      color: #1c1a2e;
      letter-spacing: 0.08em;
      line-height: 1.1;
    }

    .splash-sub {
      font-size: 0.9375rem;
      font-weight: 600;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #4e47b8;
      margin-bottom: 0.25rem;
    }

    .splash-tagline {
      font-size: 1.3125rem;
      font-weight: 600;
      color: #4a4860;
      line-height: 1.4;
      max-width: 24rem;
      margin-top: 1rem;
    }

    .splash-ctas {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      margin-top: 2rem;
    }

    .splash-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.875rem 3rem;
      border-radius: 0.625rem;
      font-family: inherit;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      border: none;
      background: #4e47b8;
      color: #fff;
      letter-spacing: 0.04em;
      transition: all 0.2s;
      box-shadow: 0 0.375rem 1.5rem rgba(78,71,184,0.30);
    }
    .splash-btn:hover {
      filter: brightness(1.12);
      transform: translateY(-2px);
      box-shadow: 0 0.5rem 2rem rgba(78,71,184,0.40);
    }

    .splash-skip {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      background: none;
      border: 1px solid #c4bcaf;
      border-radius: 0.5rem;
      padding: 0.5rem 1.25rem;
      font-family: inherit;
      font-size: 0.6875rem;
      color: #6d6358;
      cursor: pointer;
      transition: all 0.2s;
    }
    .splash-skip:hover {
      color: #28231c;
      border-color: #8a8278;
    }

    .splash-footer {
      margin-top: auto;
      padding-top: 1rem;
      text-align: center;
      font-size: 0.6875rem;
      color: #8a8278;
      z-index: 1;
      flex-shrink: 0;
    }

    @media (min-width: 40em) {
      .splash-diamond { font-size: 6rem; }
      .splash-logo { font-size: 4rem; }
      .splash-tagline { font-size: 1.5rem; }
    }
    @media (max-width: 30em) {
      .splash-diamond { font-size: 3.5rem; }
      .splash-logo { font-size: 2.5rem; }
      .splash-tagline { font-size: 1.0625rem; max-width: 18rem; }
      .splash-btn { padding: 0.625rem 2rem; font-size: 0.875rem; }
    }

    /* ── Screen: full viewport, no scroll ── */
    .ob-screen {
      box-sizing: border-box;
      height: 100vh;
      height: 100dvh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1rem;
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
      opacity: 0.15;
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
      width: 100%;
      max-width: 40rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      max-height: calc(100vh - 2rem);
      max-height: calc(100dvh - 2rem);
    }

    /* ── Progress ── */
    .ob-progress {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      margin-bottom: 0.5rem;
      flex-shrink: 0;
    }
    .ob-step {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.75rem;
      color: var(--text3);
      font-weight: 500;
    }
    .ob-step-num {
      width: 1.25rem;
      height: 1.25rem;
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
    .ob-step[data-active] .ob-step-num,
    .ob-step[data-done] .ob-step-num {
      background: var(--accent);
      color: #fff;
      border-color: var(--accent);
    }
    .ob-step-line {
      width: 1.5rem;
      height: 1px;
      background: var(--border2);
    }

    /* ── Card ── */
    .ob-card {
      background: var(--bg1);
      border: 1px solid var(--border2);
      border-radius: 0.875rem;
      padding: 1rem;
      box-shadow: 0 1rem 3rem rgba(0,0,0,.15);
      width: 100%;
      overflow-y: auto;
    }

    /* ── Hero (step 2 only) ── */
    .ob-hero {
      text-align: center;
      margin-bottom: 0.75rem;
      flex-shrink: 0;
    }
    .ob-logo-mark {
      font-size: 2rem;
      color: var(--accent);
      line-height: 1;
      display: block;
      margin-bottom: 0.25rem;
    }
    .ob-logo-text {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text0);
      letter-spacing: .04em;
    }

    /* ── Titles & text ── */
    .ob-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text0);
      margin-bottom: 0.375rem;
      line-height: 1.25;
    }
    .ob-desc {
      font-size: 0.9375rem;
      color: var(--text2);
      line-height: 1.5;
      margin-bottom: 0.5rem;
    }

    /* ── Sections (step 1) ── */
    .ob-sections {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .ob-section-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text3);
      text-transform: uppercase;
      letter-spacing: .08em;
      margin-bottom: 0.375rem;
    }

    /* ── Theme chips (step 1) — always horizontal row ── */
    .ob-themes {
      display: flex;
      gap: 0.375rem;
    }
    .ob-theme-chip {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.1875rem;
      padding: 0.375rem 0.25rem 0.25rem;
      border: 2px solid var(--border);
      border-radius: 0.375rem;
      background: transparent;
      cursor: pointer;
      font-family: inherit;
      font-size: 0.625rem;
      color: var(--text2);
      transition: border-color .16s;
      flex: 1;
      min-width: 0;
    }
    .ob-theme-chip:hover { border-color: var(--text3); }
    .ob-theme-chip[data-active] {
      border-color: var(--accent);
      color: var(--text0);
    }
    .ob-theme-preview {
      width: 100%;
      height: 1.25rem;
      border-radius: 0.1875rem;
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

    /* ── Density selector (step 1) ── */
    .ob-densities {
      display: flex;
      gap: 0.375rem;
    }
    .ob-density-chip {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.1875rem;
      padding: 0.375rem 0.25rem 0.25rem;
      border: 2px solid var(--border);
      border-radius: 0.375rem;
      background: transparent;
      cursor: pointer;
      font-family: inherit;
      transition: border-color .16s;
      min-width: 0;
    }
    .ob-density-chip:hover { border-color: var(--text3); }
    .ob-density-chip[data-active] {
      border-color: var(--accent);
    }
    .ob-density-sample {
      font-weight: 700;
      color: var(--text0);
      line-height: 1;
    }
    .ob-density-sample-sm { font-size: 0.75rem; }
    .ob-density-sample-md { font-size: 0.9375rem; }
    .ob-density-sample-lg { font-size: 1.125rem; }
    .ob-density-sample-xl { font-size: 1.375rem; }
    .ob-density-label {
      font-size: 0.625rem;
      font-weight: 600;
      color: var(--text2);
      white-space: nowrap;
    }
    .ob-density-desc {
      display: none;
    }

    /* ── Feature values (step 2) ── */
    .ob-values {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }
    .ob-value {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      padding: 0.5rem;
      border-radius: 0.5rem;
      background: var(--bg2);
      text-align: center;
    }
    .ob-value-ico {
      font-size: 1.125rem;
      line-height: 1;
    }
    .ob-value-text h4 {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text0);
      margin-bottom: 0.125rem;
    }
    .ob-value-text p {
      font-size: 0.6875rem;
      color: var(--text2);
      line-height: 1.45;
    }

    /* ── Mini preview (step 2) ── */
    .ob-preview {
      border: 1px solid var(--border);
      border-radius: 0.5rem;
      padding: 0.625rem;
      margin-bottom: 0.75rem;
      background: var(--bg0);
    }
    .ob-preview-title {
      font-size: 0.6875rem;
      font-weight: 600;
      color: var(--text3);
      text-transform: uppercase;
      letter-spacing: .08em;
      margin-bottom: 0.5rem;
    }
    .ob-preview-item {
      display: flex;
      justify-content: space-between;
      padding: 0.25rem 0;
      font-size: 0.75rem;
    }
    .ob-preview-item + .ob-preview-item {
      border-top: 1px solid var(--border);
    }
    .ob-preview-left { color: var(--text1); }
    .ob-preview-right { color: var(--text3); font-size: 0.6875rem; }
    .ob-preview-bar {
      height: 0.1875rem;
      border-radius: 0.0625rem;
      background: var(--bg3);
      margin-top: 0.5rem;
      overflow: hidden;
    }
    .ob-preview-fill {
      height: 100%;
      width: 62%;
      background: var(--accent);
      border-radius: 0.0625rem;
    }
    .ob-preview-footer {
      display: flex;
      justify-content: space-between;
      font-size: 0.6875rem;
      color: var(--text3);
      margin-top: 0.25rem;
    }

    /* ── Dataset options (step 3) ── */
    .ob-opts-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text3);
      text-transform: uppercase;
      letter-spacing: .08em;
      margin-bottom: 0.5rem;
    }
    .ob-opt {
      display: block;
      width: 100%;
      text-align: left;
      border: 1px solid var(--border2);
      border-radius: 0.5rem;
      padding: 0.75rem;
      background: transparent;
      cursor: pointer;
      font-family: inherit;
      transition: all .16s;
      margin-bottom: 0.5rem;
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
      gap: 0.375rem;
      margin-bottom: 0.25rem;
    }
    .ob-opt-ico { font-size: 1rem; }
    .ob-opt-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text0);
    }
    .ob-opt-tag {
      font-size: 0.625rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .06em;
      padding: 0.0625rem 0.3125rem;
      border-radius: 0.1875rem;
      background: var(--accent);
      color: #fff;
    }
    .ob-opt-desc {
      font-size: 0.8125rem;
      color: var(--text2);
      line-height: 1.5;
    }

    /* ── Buttons ── */
    .ob-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font-family: inherit;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all .16s;
    }
    .ob-btn-pri {
      background: var(--accent);
      color: #fff;
      flex: 1;
    }
    .ob-btn-pri:hover { filter: brightness(1.12); }
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
      gap: 0.5rem;
      margin-top: 0.75rem;
    }

    /* ── Hints ── */
    .ob-hint {
      font-size: 0.5625rem;
      color: var(--text3);
      line-height: 1.5;
      margin-top: 0.75rem;
      padding-top: 0.5rem;
      border-top: 1px solid var(--border);
    }
    .ob-hint strong { color: var(--text2); }

    /* ── Footnote ── */
    .ob-footnote {
      font-size: 0.5625rem;
      color: var(--text3);
      text-align: center;
      margin-top: 0.75rem;
      max-width: 28rem;
      line-height: 1.5;
      flex-shrink: 0;
    }

    /* ══════ Responsive ══════ */

    /* Desktop — two columns in step 1 */
    @media (min-width: 40em) {
      .ob-sections {
        flex-direction: row;
      }
      .ob-sections > * { flex: 1; }
      .ob-themes { flex-direction: column; }
      .ob-densities { flex-direction: column; }
      .ob-density-desc { display: block; font-size: 0.5rem; color: var(--text3); }
      .ob-card { padding: 1.5rem; }
      .ob-title { font-size: 1.375rem; }

      /* Step 2: horizontal values */
      .ob-values { gap: 0.625rem; }
    }

    /* Mobile small — stack everything */
    @media (max-width: 30em) {
      .ob-screen { padding: 0.75rem; }
      .ob-card { padding: 0.875rem 0.75rem; border-radius: 0.75rem; }
      .ob-title { font-size: 1.0625rem; }
      .ob-desc { font-size: 0.6875rem; margin-bottom: 0.5rem; }
      .ob-section-label { font-size: 0.5625rem; margin-bottom: 0.25rem; }
      .ob-values { flex-direction: column; gap: 0.375rem; }
      .ob-value { flex-direction: row; text-align: left; }
    }
  `;

  // ── Navigation ──
  private async _goTo(next: Step) {
    if (this.animating) return;
    this.animating = true;

    // Exit current step
    if (this.step === "splash") {
      const splash = this.renderRoot.querySelector(".splash") as HTMLElement;
      if (splash) {
        await gsap.to(splash, { opacity: 0, duration: 0.35, ease: "power2.in" });
      }
      // Apply hueso theme for seamless splash→onboarding transition
      if (!localStorage.getItem("oda-theme")) {
        this._applyTheme("hueso");
      }
    } else {
      const inner = this.renderRoot.querySelector(".ob-inner") as HTMLElement;
      if (inner) {
        await gsap.to(inner, { opacity: 0, y: 10, duration: 0.2, ease: "power2.in" });
      }
    }

    this.step = next;
    await this.updateComplete;

    // Enter next step
    const inner = this.renderRoot.querySelector(".ob-inner") as HTMLElement;
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

  private _applyDensity(id: string) {
    this.selectedDensity = id;
    if (id) {
      document.documentElement.setAttribute("data-density", id);
      localStorage.setItem("oda-density", id);
    } else {
      document.documentElement.removeAttribute("data-density");
      localStorage.removeItem("oda-density");
    }
  }

  private async _onEnterLocal() {
    if (this.animating) return;
    this.animating = true;
    const target = (this.renderRoot.querySelector(".ob-screen") ||
      this.renderRoot.querySelector(".splash")) as HTMLElement;
    if (target) {
      await gsap.to(target, { opacity: 0, scale: 0.97, duration: 0.4, ease: "power2.in" });
    }
    enterLocal();
    this.dispatchEvent(new CustomEvent("onboarding-done", { bubbles: true, composed: true }));
  }

  private async _onEnterDemo() {
    if (this.animating) return;
    this.animating = true;
    const target = (this.renderRoot.querySelector(".ob-screen") ||
      this.renderRoot.querySelector(".splash")) as HTMLElement;
    if (target) {
      await gsap.to(target, { opacity: 0, scale: 0.97, duration: 0.4, ease: "power2.in" });
    }
    enterDemo();
    this.dispatchEvent(new CustomEvent("onboarding-done", { bubbles: true, composed: true }));
  }

  // ── Read current theme/density without triggering re-render ──
  override connectedCallback() {
    super.connectedCallback();
    this.selectedTheme = document.documentElement.getAttribute("data-theme") || "noche";
    this.selectedDensity = document.documentElement.getAttribute("data-density") || "";
  }

  // ── Entrance animation ──
  protected firstUpdated() {
    requestAnimationFrame(() => this._animateCurrentStep());
  }

  private _animateCurrentStep() {
    if (this.step === "splash") {
      const diamond = this.renderRoot.querySelector(".splash-diamond");
      const logo = this.renderRoot.querySelector(".splash-logo");
      const sub = this.renderRoot.querySelector(".splash-sub");
      const tagline = this.renderRoot.querySelector(".splash-tagline");
      const ctas = this.renderRoot.querySelector(".splash-ctas");
      const footer = this.renderRoot.querySelector(".splash-footer");

      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
      if (diamond) tl.from(diamond, { opacity: 0, scale: 0.6, duration: 0.6 });
      if (logo) tl.from(logo, { opacity: 0, y: 12, duration: 0.4 }, "-=0.2");
      if (sub) tl.from(sub, { opacity: 0, duration: 0.3 }, "-=0.15");
      if (tagline) tl.from(tagline, { opacity: 0, y: 10, duration: 0.4 }, "-=0.1");
      if (ctas) tl.from(ctas, { opacity: 0, y: 14, duration: 0.45 }, "-=0.1");
      if (footer) tl.from(footer, { opacity: 0, duration: 0.3 }, "-=0.2");
    } else {
      const card = this.renderRoot.querySelector(".ob-card");
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
      if (card) tl.from(card, { opacity: 0, y: 18, duration: 0.5 });
    }
  }

  // ── Progress rendering ──
  private _renderProgress() {
    const currentIdx = STEPS.indexOf(this.step);

    return html`
      <div class="ob-progress">
        ${STEP_LABELS.map(
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

  // ── Step 0: Splash ──
  private _renderSplash() {
    return html`
      <div class="splash">
        <div class="splash-inner">
          <span class="splash-diamond">◈</span>
          <span class="splash-logo">Oda</span>
          <span class="splash-sub">Planner</span>
          <p class="splash-tagline">
            Cada hora de estudio cuenta.<br>Organizalas sin esfuerzo.
          </p>
          <div class="splash-ctas">
            <button class="splash-btn" @click=${() => this._goTo("estilo")}>
              Empezar
            </button>
            <button class="splash-skip" @click=${this._onEnterLocal}>
              Ya tengo experiencia · Ir al planner →
            </button>
          </div>
        </div>
        <div class="splash-footer">
          100 % offline · Tus datos se guardan en este dispositivo
        </div>
      </div>
    `;
  }

  // ── Step 1: Style (theme + density) ──
  private _renderEstilo() {
    return html`
      ${this._renderProgress()}
      <div class="ob-card">
        <h1 class="ob-title">Elegí cómo se ve Oda</h1>
        <p class="ob-desc">
          Tema y tamaño de letra. Lo podés cambiar cuando quieras desde ⚙.
        </p>

        <div class="ob-sections">
          <div>
            <div class="ob-section-label">Tema</div>
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
          </div>

          <div>
            <div class="ob-section-label">Tamaño de letra</div>
            <div class="ob-densities">
              ${DENSITIES.map(
                (d) => html`
                <button
                  class="ob-density-chip"
                  ?data-active=${this.selectedDensity === d.id}
                  @click=${() => this._applyDensity(d.id)}
                >
                  <span class="ob-density-sample ${d.id === "compacto" ? "ob-density-sample-sm" : d.id === "grande" ? "ob-density-sample-xl" : d.id === "comodo" ? "ob-density-sample-lg" : "ob-density-sample-md"}">${d.sample}</span>
                  <span class="ob-density-label">${d.label}</span>
                  <span class="ob-density-desc">${d.desc}</span>
                </button>
              `,
              )}
            </div>
          </div>
        </div>

        <div class="ob-actions">
          <button class="ob-btn ob-btn-pri" @click=${() => this._goTo("welcome")}>
            Continuar →
          </button>
        </div>
      </div>
    `;
  }

  // ── Step 2: Welcome ──
  private _renderWelcome() {
    return html`
      <div class="ob-hero">
        <span class="ob-logo-mark">◈</span>
        <span class="ob-logo-text">Oda Planner</span>
      </div>
      ${this._renderProgress()}
      <div class="ob-card">
        <h1 class="ob-title">Organizá tu semana sin caos</h1>

        <div class="ob-preview">
          <div class="ob-preview-title">Tu semana en un vistazo</div>
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
              <h4>Plan real</h4>
              <p>Materias, franjas y prioridades en una semana concreta.</p>
            </div>
          </div>
          <div class="ob-value">
            <span class="ob-value-ico">⏱</span>
            <div class="ob-value-text">
              <h4>Tracking</h4>
              <p>Cada sesión suma tiempo real a tus materias y tareas.</p>
            </div>
          </div>
          <div class="ob-value">
            <span class="ob-value-ico">🚨</span>
            <div class="ob-value-text">
              <h4>Alertas</h4>
              <p>Te avisa antes de que sea tarde para lo importante.</p>
            </div>
          </div>
        </div>

        <div class="ob-actions">
          <button class="ob-btn ob-btn-sec" @click=${() => this._goTo("estilo")}>← Atrás</button>
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
        <h1 class="ob-title">¿Cómo querés arrancar?</h1>

        <button class="ob-opt pri-opt" @click=${this._onEnterLocal}>
          <div class="ob-opt-header">
            <span class="ob-opt-ico">⚡</span>
            <span class="ob-opt-title">Empezar en modo local</span>
            <span class="ob-opt-tag">recomendado</span>
          </div>
          <p class="ob-opt-desc">
            Planner vacío para cargar tus materias, horarios y tareas.
            Tus datos quedan en este navegador.
          </p>
        </button>

        <button class="ob-opt" @click=${this._onEnterDemo}>
          <div class="ob-opt-header">
            <span class="ob-opt-ico">🎲</span>
            <span class="ob-opt-title">Explorar con datos de ejemplo</span>
            <span class="ob-opt-tag" style="background: var(--text3)">demo</span>
          </div>
          <p class="ob-opt-desc">
            Materias, tareas y sesiones ficticias para recorrer la app.
          </p>
        </button>

        <div class="ob-hint">
          <strong>Al entrar:</strong> creá tus materias, definí objetivos semanales y
          marcá tus slots en la Vista Semana. Con eso Oda ya empieza a devolverte valor.
        </div>

        <div class="ob-actions">
          <button class="ob-btn ob-btn-sec" @click=${() => this._goTo("welcome")}>← Atrás</button>
        </div>
      </div>
    `;
  }

  render() {
    if (appMode.value !== "welcome") return nothing;

    if (this.step === "splash") {
      return this._renderSplash();
    }

    return html`
      <div class="ob-screen">
        <div class="ob-inner">
          ${this.step === "estilo" ? this._renderEstilo() : nothing}
          ${this.step === "welcome" ? this._renderWelcome() : nothing}
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
