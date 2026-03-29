import { LS } from '../planner/service'

export interface DriveInternalState {
  tokenClient: google.accounts.oauth2.TokenClient | null
  accessToken: string | null
  tokenExpiry: number | null
  fileId: string | null
}

function readFileId(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  return window.localStorage.getItem(LS.DRIVE_FILE_ID)
}

export const driveState: DriveInternalState = {
  tokenClient: null,
  accessToken: null,
  tokenExpiry: null,
  fileId: readFileId(),
}

export function isTokenValid(nowMs = Date.now()): boolean {
  if (!driveState.accessToken || !driveState.tokenExpiry) {
    return false
  }
  return nowMs < driveState.tokenExpiry - 30_000
}

export function setAccessToken(token: string, expiresInSeconds: number): void {
  driveState.accessToken = token
  driveState.tokenExpiry = Date.now() + expiresInSeconds * 1000
}

export function clearAccessToken(): void {
  driveState.accessToken = null
  driveState.tokenExpiry = null
}

export function setDriveFileId(fileId: string | null): void {
  driveState.fileId = fileId
  if (typeof window === 'undefined') {
    return
  }

  if (!fileId) {
    window.localStorage.removeItem(LS.DRIVE_FILE_ID)
    return
  }

  window.localStorage.setItem(LS.DRIVE_FILE_ID, fileId)
}

export function resetDriveState(): void {
  clearAccessToken()
  setDriveFileId(null)
  driveState.tokenClient = null
}
