/**
 * Canonical time formatting helpers.
 * Every view should import from here — no local copies.
 */

/** Minutes-from-midnight → "HH:MM"  (e.g. 510 → "08:30") */
export function fmtClock(minutesFromMidnight: number): string {
  const h = Math.floor(minutesFromMidnight / 60);
  const m = minutesFromMidnight % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Duration in minutes → human string  (e.g. 90 → "1h 30m", 45 → "45m") */
export function fmtDur(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/** ISO date-time string → "HH:MM"  (e.g. "2026-04-01T14:30:00" → "14:30") */
export function fmtTimeIso(iso: string): string {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

/** Pre-built "HH:MM" options every 15 minutes (00:00 – 23:45) for <select> pickers */
export const TIME_OPTIONS: string[] = (() => {
  const opts: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      opts.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return opts;
})();
