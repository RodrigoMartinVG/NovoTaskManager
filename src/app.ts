/* ═══ Oda v3.0 — Entry Point ═══ */

// Global styles (tokens, themes, reset)
import "./styles/tokens.css";
import "./styles/themes.css";
import "./styles/reset.css";

// State (must init before components read signals)
import "./state/store.js";
import "./state/pomo.js";
import { driveBoot } from "./state/gdrive.js";
import { appMode, plannerData, setAppMode, setPlannerData } from "./state/store.js";

// Shell (auto-registers <app-shell> and its children)
import "./components/shell/app-shell.js";

// Features
import "./components/onboarding/onboarding-flow.js";
import "./components/pomodoro/pomo-focus-view.js";
import "./components/pomodoro/pomo-widget.js";

// Boot: silent reconnect to Google Drive if mode=drive
driveBoot(appMode.value, plannerData.value, setPlannerData, () => setAppMode("local"));
