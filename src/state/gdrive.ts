/* ═══ Oda v3.0 — Google Drive Integration ═══ */
import { signal } from "@preact/signals-core";
import type { PlannerData } from "./types.js";

// ── Constants ──
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

if (import.meta.env.DEV && !CLIENT_ID) {
  console.warn("[GDrive] VITE_GOOGLE_CLIENT_ID no configurado. Creá un archivo .env.local con tu Client ID.");
}
const SCOPE = "https://www.googleapis.com/auth/drive.file";
const FILE_NAME = "oda-planner.json";
const LS_FILE_ID = "oda-drive-fileid";

// ── Signals ──
export type SyncStatus = "idle" | "saving" | "saved" | "error";

export const driveConnected = signal(false);
export const driveUser = signal<string | null>(null);
export const syncStatus = signal<SyncStatus>("idle");
export const syncError = signal<string | null>(null);
export const driveConflictData = signal<PlannerData | null>(null);

// ── Internal state ──
interface DriveSession {
  tokenClient: TokenClient | null;
  accessToken: string | null;
  tokenExpiry: number;
  fileId: string | null;
  saveTimer: ReturnType<typeof setTimeout> | null;
}

const session: DriveSession = {
  tokenClient: null,
  accessToken: null,
  tokenExpiry: 0,
  fileId: localStorage.getItem(LS_FILE_ID),
  saveTimer: null,
};
const SAVE_DEBOUNCE = 4_000;

// ── GIS Ready ──

/** Check if the Google Identity Services library is loaded. */
export function gisReady(): boolean {
  return typeof google !== "undefined" && !!google?.accounts?.oauth2;
}

/** Wait for GIS script to load (polls every 200ms, max 10s). */
function waitForGis(): Promise<boolean> {
  return new Promise((resolve) => {
    if (gisReady()) { resolve(true); return; }
    let tries = 0;
    const iv = setInterval(() => {
      tries++;
      if (gisReady()) { clearInterval(iv); resolve(true); }
      else if (tries > 50) { clearInterval(iv); resolve(false); }
    }, 200);
  });
}

// ── Token helpers ──

function tokenValid(): boolean {
  return !!session.accessToken && Date.now() < session.tokenExpiry;
}

function initTokenClient(callback: (ok: boolean) => void): void {
  session.tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPE,
    callback: (resp) => {
      if (resp.error) {
        console.error("[GDrive] Token error:", resp.error, resp.error_description);
        callback(false);
        return;
      }
      session.accessToken = resp.access_token;
      session.tokenExpiry = Date.now() + resp.expires_in * 1000 - 60_000; // 1 min margin
      callback(true);
    },
    error_callback: (err) => {
      console.error("[GDrive] Token client error:", err);
      callback(false);
    },
  });
}

function requestToken(opts?: { prompt?: string }): Promise<boolean> {
  return new Promise((resolve) => {
    // Always (re)init so the callback for *this* call is wired
    initTokenClient(resolve);
    session.tokenClient!.requestAccessToken(opts);
  });
}

// ── API helpers ──

async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  if (!tokenValid()) {
    const ok = await requestToken({ prompt: "" });
    if (!ok) throw new Error("Token refresh failed");
  }
  const resp = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      ...options.headers,
    },
  });
  if (resp.status === 401) {
    // Token expired mid-request, try once more
    const ok = await requestToken({ prompt: "" });
    if (!ok) throw new Error("Token refresh failed on retry");
    return fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        ...options.headers,
      },
    });
  }
  return resp;
}

// ── File operations ──

/** Find existing file by name, returns file ID or null. */
async function findFile(): Promise<string | null> {
  const q = `name='${FILE_NAME}' and trashed=false`;
  const resp = await apiFetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id)&spaces=drive`,
  );
  if (!resp.ok) return null;
  const data = await resp.json();
  const files = data.files as { id: string }[];
  return files.length > 0 ? files[0].id : null;
}

/** Save PlannerData to Drive. Creates file if needed, updates if exists. */
export async function driveSave(plannerData: PlannerData): Promise<boolean> {
  try {
    syncStatus.value = "saving";
    syncError.value = null;

    const jsonStr = JSON.stringify(plannerData);
    const metadata = { name: FILE_NAME, mimeType: "application/json" };

    const boundary = "oda_boundary_" + Date.now();
    const body =
      `--${boundary}\r\n` +
      `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
      `${JSON.stringify(metadata)}\r\n` +
      `--${boundary}\r\n` +
      `Content-Type: application/json\r\n\r\n` +
      `${jsonStr}\r\n` +
      `--${boundary}--`;

    let url: string;
    let method: string;

    if (session.fileId) {
      // Update existing
      url = `https://www.googleapis.com/upload/drive/v3/files/${session.fileId}?uploadType=multipart`;
      method = "PATCH";
    } else {
      // Create new
      url = `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`;
      method = "POST";
    }

    const resp = await apiFetch(url, {
      method,
      headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
      body,
    });

    if (!resp.ok) {
      // If file was deleted on Drive, clear fileId and retry as create
      if (resp.status === 404 && session.fileId) {
        session.fileId = null;
        localStorage.removeItem(LS_FILE_ID);
        return driveSave(plannerData);
      }
      throw new Error(`Save failed: ${resp.status}`);
    }

    const result = await resp.json();
    if (!session.fileId && result.id) {
      session.fileId = result.id;
      localStorage.setItem(LS_FILE_ID, result.id);
    }

    syncStatus.value = "saved";
    return true;
  } catch (err) {
    console.error("[GDrive] Save error:", err);
    syncStatus.value = "error";
    syncError.value = (err as Error).message;
    return false;
  }
}

/** Load PlannerData from Drive. Returns null if no file found. */
export async function driveLoad(): Promise<PlannerData | null> {
  try {
    // First try cached fileId
    if (session.fileId) {
      const resp = await apiFetch(
        `https://www.googleapis.com/drive/v3/files/${session.fileId}?alt=media`,
      );
      if (resp.ok) {
        return await resp.json();
      }
      // File might have been deleted
      if (resp.status === 404) {
        session.fileId = null;
        localStorage.removeItem(LS_FILE_ID);
      }
    }

    // Search by name
    const foundId = await findFile();
    if (!foundId) return null;

    session.fileId = foundId;
    localStorage.setItem(LS_FILE_ID, foundId);

    const resp = await apiFetch(
      `https://www.googleapis.com/drive/v3/files/${session.fileId}?alt=media`,
    );
    if (!resp.ok) return null;

    return await resp.json();
  } catch (err) {
    console.error("[GDrive] Load error:", err);
    return null;
  }
}

/** Fetch user info (email) for display. */
async function fetchUserInfo(): Promise<string | null> {
  try {
    const resp = await apiFetch("https://www.googleapis.com/oauth2/v3/userinfo");
    if (!resp.ok) return null;
    const info = await resp.json();
    return info.email ?? null;
  } catch {
    return null;
  }
}

// ── Connect / Disconnect ──

/**
 * Connect to Google Drive (interactive — shows consent popup).
 * Returns the remote PlannerData if found, or null for fresh start.
 * The caller is responsible for conflict resolution.
 */
export async function driveConnect(): Promise<{
  ok: boolean;
  email?: string;
  remoteData?: PlannerData | null;
}> {
  const gisOk = await waitForGis();
  if (!gisOk) return { ok: false };

  const tokenOk = await requestToken({ prompt: "consent" });
  if (!tokenOk) return { ok: false };

  const email = await fetchUserInfo();
  driveUser.value = email;
  driveConnected.value = true;

  const remoteData = await driveLoad();
  return { ok: true, email: email ?? undefined, remoteData };
}

/**
 * Silent reconnect (no consent popup) — for app boot when mode=drive.
 * Returns false if silent auth fails (user must re-consent).
 */
export async function driveConnectSilent(): Promise<{
  ok: boolean;
  remoteData?: PlannerData | null;
}> {
  const gisOk = await waitForGis();
  if (!gisOk) return { ok: false };

  // Initialize token client with empty prompt (no popup)
  const tokenOk = await requestToken({ prompt: "" });
  if (!tokenOk) return { ok: false };

  const email = await fetchUserInfo();
  driveUser.value = email;
  driveConnected.value = true;

  const remoteData = await driveLoad();
  return { ok: true, remoteData };
}

/** Disconnect from Google Drive. Revoke token, keep local data. */
export function driveDisconnect(): void {
  if (session.accessToken) {
    google.accounts.oauth2.revoke(session.accessToken, () => {});
  }
  session.accessToken = null;
  session.tokenExpiry = 0;
  session.fileId = null;
  localStorage.removeItem(LS_FILE_ID);
  driveConnected.value = false;
  driveUser.value = null;
  syncStatus.value = "idle";
  syncError.value = null;
  driveConflictData.value = null;
  cancelAutoSave();
}

// ── Auto-save ──

/** Schedule a debounced save. Call this whenever plannerData changes while connected. */
export function scheduleAutoSave(getData: () => PlannerData): void {
  if (!driveConnected.value) return;
  cancelAutoSave();
  session.saveTimer = setTimeout(async () => {
    session.saveTimer = null;
    await driveSave(getData());
  }, SAVE_DEBOUNCE);
}

/** Cancel any pending auto-save. */
export function cancelAutoSave(): void {
  if (session.saveTimer) {
    clearTimeout(session.saveTimer);
    session.saveTimer = null;
  }
}

/** Force an immediate save (e.g. before navigating away). */
export async function driveFlush(getData: () => PlannerData): Promise<void> {
  cancelAutoSave();
  if (driveConnected.value) {
    await driveSave(getData());
  }
}

// ── Boot ──

/**
 * Called once at app init. If appMode === "drive", attempt silent reconnect.
 * The caller provides setPlannerData so we avoid circular imports.
 */
export async function driveBoot(
  currentMode: string,
  currentData: PlannerData,
  applyData: (data: PlannerData, preserveTimestamp?: boolean) => void,
  setMode: (mode: "local") => void,
): Promise<void> {
  if (currentMode !== "drive") return;

  const result = await driveConnectSilent();
  if (!result.ok) {
    // Silent auth failed — fall back to local, user must re-connect manually
    console.warn("[GDrive] Silent reconnect failed, falling back to local");
    setMode("local");
    return;
  }

  // Compare timestamps to decide which data is newer
  if (result.remoteData) {
    const remoteTs = result.remoteData.updatedAt ?? "1970-01-01T00:00:00.000Z";
    const localTs  = currentData.updatedAt       ?? "1970-01-01T00:00:00.000Z";

    if (remoteTs > localTs) {
      // Remote is newer — apply and preserve its timestamp
      applyData(result.remoteData, true);
    }
    // If local >= remote: local data is already loaded, nothing to do
  }
}
