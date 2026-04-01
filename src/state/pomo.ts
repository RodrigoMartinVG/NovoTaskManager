/* ═══ Oda v3.0 — Pomodoro Timer Controller ═══ */
import { computed, signal } from "@preact/signals-core";
import { addSesion, pomoFocusMode, pomoSession } from "./store.js";
import type { Sesion } from "./types.js";

// ── Timer signals ──
export const pomoPaused = signal(false);
export const pomoStudySecs = signal(0);
export const pomoPauseSecs = signal(0);
export const pomoActive = computed(() => pomoSession.value !== null);

// ── Internal refs (timestamp-based, immune to tab throttling) ──
let studyStart = 0;
let studyAccum = 0;
let pauseStart = 0;
let tickInterval: ReturnType<typeof setInterval> | null = null;

function tick() {
  const now = Date.now();
  if (pomoPaused.value) {
    pomoPauseSecs.value = Math.floor((now - pauseStart) / 1000);
  } else {
    pomoStudySecs.value = studyAccum + Math.floor((now - studyStart) / 1000);
  }
}

function startTicking() {
  stopTicking();
  tickInterval = setInterval(tick, 500);
}

function stopTicking() {
  if (tickInterval !== null) {
    clearInterval(tickInterval);
    tickInterval = null;
  }
}

// ── Public actions ──
export function pomoStart(session: { materiaId: string; tareaId: string | null; titulo: string }) {
  pomoSession.value = session;
  pomoFocusMode.value = true;
  pomoPaused.value = false;
  pomoStudySecs.value = 0;
  pomoPauseSecs.value = 0;
  studyAccum = 0;
  studyStart = Date.now();
  pauseStart = 0;
  startTicking();
}

export function pomoPause() {
  if (!pomoActive.value || pomoPaused.value) return;
  studyAccum += (Date.now() - studyStart) / 1000;
  pomoStudySecs.value = Math.floor(studyAccum);
  pauseStart = Date.now();
  pomoPaused.value = true;
}

export function pomoResume() {
  if (!pomoActive.value || !pomoPaused.value) return;
  studyStart = Date.now();
  pomoPaused.value = false;
  pomoPauseSecs.value = 0;
}

export function pomoStop() {
  if (!pomoActive.value) return;
  stopTicking();

  // Final tick
  if (!pomoPaused.value) {
    studyAccum += (Date.now() - studyStart) / 1000;
  }

  const totalMinutes = Math.round(studyAccum / 60);
  const session = pomoSession.value;

  if (totalMinutes >= 1 && session) {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const localISO = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:00`;

    const ses: Sesion = {
      id: crypto.randomUUID(),
      materiaId: session.materiaId,
      tareaId: session.tareaId,
      inicio: localISO,
      minutos: totalMinutes,
      origen: "timer",
      titulo: session.titulo || undefined,
    };
    addSesion(ses);
  }

  _reset();
}

export function pomoCancel() {
  stopTicking();
  _reset();
}

export function pomoToggleFocus() {
  pomoFocusMode.value = !pomoFocusMode.value;
}

function _reset() {
  pomoSession.value = null;
  pomoFocusMode.value = false;
  pomoPaused.value = false;
  pomoStudySecs.value = 0;
  pomoPauseSecs.value = 0;
  studyAccum = 0;
  studyStart = 0;
  pauseStart = 0;
}

// ── Format helper ──
export function fmtSecs(s: number): string {
  const si = Math.floor(s);
  const h = Math.floor(si / 3600);
  const m = Math.floor((si % 3600) / 60);
  const sec = si % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}
