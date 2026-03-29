import { normalizePlannerData } from '../import-export/normalizer'
import { LS } from '../planner/service'
import type { PlannerData } from '../planner/types'
import {
  driveState,
  isTokenValid,
  resetDriveState,
  setAccessToken,
  setDriveFileId,
} from './driveState'

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email'
const DRIVE_FILE_NAME = 'uai-planner.json'
const DRIVE_FILES_URL = 'https://www.googleapis.com/drive/v3/files'
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files'
const USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo'

type ConnectPrompt = 'consent' | ''

interface ConnectResult {
  accessToken: string
  expiresIn: number
}

function setLastSavedIso(iso: string): void {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(LS.LAST_SAVED, iso)
}

function getClientId(): string {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
  if (!clientId) {
    throw new Error('Falta VITE_GOOGLE_CLIENT_ID en el entorno.')
  }
  return clientId
}

function ensureGoogleOauth(): void {
  if (typeof window === 'undefined' || typeof google === 'undefined' || !google.accounts?.oauth2) {
    throw new Error('Google Identity Services no esta disponible.')
  }
}

function getAuthHeader(): string {
  if (!isTokenValid() || !driveState.accessToken) {
    throw new Error('Token de Drive invalido o vencido.')
  }
  return `Bearer ${driveState.accessToken}`
}

async function fetchJson<T>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, init)
  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`[Drive] ${response.status} ${response.statusText}: ${detail}`)
  }
  return (await response.json()) as T
}

async function requestToken(prompt: ConnectPrompt): Promise<ConnectResult> {
  ensureGoogleOauth()
  const clientId = getClientId()

  return new Promise<ConnectResult>((resolve, reject) => {
    driveState.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: DRIVE_SCOPE,
      prompt,
      ux_mode: 'popup',
      callback: (response) => {
        if (response.error || !response.access_token) {
          reject(new Error(response.error || 'No se pudo obtener token OAuth.'))
          return
        }

        resolve({
          accessToken: response.access_token,
          expiresIn: response.expires_in ?? 3600,
        })
      },
    })

    driveState.tokenClient.requestAccessToken({ scope: DRIVE_SCOPE, prompt })
  })
}

async function findPlannerFileId(): Promise<string | null> {
  const authHeader = getAuthHeader()
  const query = encodeURIComponent(`name='${DRIVE_FILE_NAME}' and trashed=false`)
  type ListResponse = { files?: Array<{ id: string }> }

  const payload = await fetchJson<ListResponse>(
    `${DRIVE_FILES_URL}?q=${query}&pageSize=1&fields=files(id)`,
    {
      method: 'GET',
      headers: { Authorization: authHeader },
    },
  )

  return payload.files?.[0]?.id ?? null
}

function makeMultipartBody(metadata: Record<string, unknown>, content: string, boundary: string): string {
  return [
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    JSON.stringify(metadata),
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    content,
    `--${boundary}--`,
    '',
  ].join('\r\n')
}

export async function driveConnect(prompt: ConnectPrompt = 'consent'): Promise<ConnectResult> {
  const result = await requestToken(prompt)
  setAccessToken(result.accessToken, result.expiresIn)
  return result
}

export async function driveConnectSilent(): Promise<ConnectResult> {
  const result = await requestToken('')
  setAccessToken(result.accessToken, result.expiresIn)
  return result
}

export async function driveLoad(): Promise<PlannerData | null> {
  const authHeader = getAuthHeader()
  let targetFileId = driveState.fileId

  if (!targetFileId) {
    targetFileId = await findPlannerFileId()
    if (targetFileId) {
      setDriveFileId(targetFileId)
    }
  }

  if (!targetFileId) {
    return null
  }

  try {
    const response = await fetch(`${DRIVE_FILES_URL}/${targetFileId}?alt=media`, {
      method: 'GET',
      headers: { Authorization: authHeader },
    })

    if (response.status === 404) {
      setDriveFileId(null)
      return null
    }

    if (!response.ok) {
      const detail = await response.text()
      throw new Error(`[Drive] ${response.status} ${response.statusText}: ${detail}`)
    }

    const raw = (await response.json()) as unknown
    return normalizePlannerData(raw)
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      setDriveFileId(null)
      return null
    }
    throw error
  }
}

export async function driveSave(data: PlannerData): Promise<string> {
  const authHeader = getAuthHeader()
  const content = JSON.stringify(data)

  if (driveState.fileId) {
    const updateRes = await fetch(`${DRIVE_UPLOAD_URL}/${driveState.fileId}?uploadType=media`, {
      method: 'PATCH',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: content,
    })

    if (!updateRes.ok) {
      const detail = await updateRes.text()
      throw new Error(`[Drive] ${updateRes.status} ${updateRes.statusText}: ${detail}`)
    }

    return driveState.fileId
  }

  const boundary = `drive-boundary-${Math.random().toString(36).slice(2, 10)}`
  const multipartBody = makeMultipartBody({ name: DRIVE_FILE_NAME, mimeType: 'application/json' }, content, boundary)

  type CreateResponse = { id: string }
  const created = await fetchJson<CreateResponse>(`${DRIVE_UPLOAD_URL}?uploadType=multipart&fields=id`, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartBody,
  })

  setDriveFileId(created.id)
  return created.id
}

export async function driveDisconnect(): Promise<void> {
  if (driveState.accessToken && typeof google !== 'undefined' && google.accounts?.oauth2) {
    await new Promise<void>((resolve) => {
      google.accounts.oauth2.revoke(driveState.accessToken as string, () => resolve())
    })
  }

  resetDriveState()
}

export function driveMarkSaved(date = new Date()): void {
  setLastSavedIso(date.toISOString())
}

export function getLastSavedLabel(now = new Date()): string {
  if (typeof window === 'undefined') {
    return 'Guardado recientemente'
  }

  const raw = window.localStorage.getItem(LS.LAST_SAVED)
  if (!raw) {
    return 'Sin guardados recientes'
  }

  const savedAt = new Date(raw)
  if (Number.isNaN(savedAt.getTime())) {
    return 'Sin guardados recientes'
  }

  const deltaSec = Math.max(0, Math.floor((now.getTime() - savedAt.getTime()) / 1000))
  if (deltaSec < 60) {
    return `Guardado hace ${deltaSec}s`
  }

  const deltaMin = Math.floor(deltaSec / 60)
  if (deltaMin < 60) {
    return `Guardado hace ${deltaMin}min`
  }

  const deltaHour = Math.floor(deltaMin / 60)
  return `Guardado hace ${deltaHour}h`
}

export async function getUserInfo(token: string): Promise<{ email: string }> {
  const payload = await fetchJson<{ email?: string }>(USERINFO_URL, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!payload.email) {
    throw new Error('No se pudo obtener el email del usuario.')
  }

  return { email: payload.email }
}
