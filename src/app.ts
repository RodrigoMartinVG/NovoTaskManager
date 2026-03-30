/* ═══ Oda v3.0 — Entry Point ═══ */

// Global styles (tokens, themes, reset)
import "./styles/tokens.css";
import "./styles/themes.css";
import "./styles/reset.css";

// State (must init before components read signals)
import "./state/store.js";
import "./state/pomo.js";

// Shell (auto-registers <app-shell> and its children)
import "./components/shell/app-shell.js";

// Features
import "./components/onboarding/onboarding-flow.js";
import "./components/pomodoro/pomo-focus-view.js";
import "./components/pomodoro/pomo-widget.js";
