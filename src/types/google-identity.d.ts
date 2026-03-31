/* ═══ Google Identity Services (GIS) type declarations ═══ */

interface TokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  error?: string;
  error_description?: string;
}

interface TokenClientConfig {
  client_id: string;
  scope: string;
  callback: (resp: TokenResponse) => void;
  error_callback?: (err: { type: string; message: string }) => void;
  prompt?: string;
}

interface TokenClient {
  requestAccessToken(overrides?: { prompt?: string }): void;
}

interface Google {
  accounts: {
    oauth2: {
      initTokenClient(config: TokenClientConfig): TokenClient;
      revoke(token: string, done?: () => void): void;
    };
  };
}

declare const google: Google;
