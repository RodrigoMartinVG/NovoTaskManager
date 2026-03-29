declare namespace google {
  namespace accounts {
    namespace oauth2 {
      interface CodeClientConfig {
        client_id: string
        scope?: string
        prompt?: string
        ux_mode?: 'popup' | 'redirect'
        callback: (response: {
          code?: string
          clientId?: string
          error?: string
          [key: string]: unknown
        }) => void
      }

      interface TokenClientConfig {
        client_id: string
        scope?: string
        prompt?: string
        hint?: string
        ux_mode?: 'popup' | 'redirect'
        callback: (response: {
          access_token?: string
          expires_in?: number
          scope?: string
          token_type?: string
          error?: string
          [key: string]: unknown
        }) => void
      }

      interface TokenClient {
        request(params: { scope?: string; prompt?: string; hint?: string }): void
      }

      interface CodeClient {
        request(params: { scope?: string; prompt?: string }): void
      }

      interface OneTapPromptMomentNotification {
        isDisplayed(): boolean
        isNotDisplayed(): boolean
        getNotDisplayedReason(): string
        isSkippedMoment(): boolean
        getSkippedReason(): string
      }

      function initTokenClient(config: TokenClientConfig): TokenClient
      function initCodeClient(config: CodeClientConfig): CodeClient
      function prompt(callback?: (notification: OneTapPromptMomentNotification) => void): void
      function revoke(token: string, callback?: (done: boolean) => void): void
    }

    namespace id {
      interface CredentialResponse {
        credential: string
        select_by?: string
        clientId?: string
      }

      interface PromptMomentNotification {
        isDisplayed(): boolean
        isNotDisplayed(): boolean
        wasDismissed(): boolean
        isSkippedMoment(): boolean
      }

      interface IdConfiguration {
        client_id: string
        callback: (response: CredentialResponse) => void
        auto_select?: boolean
        cancel_on_tap_outside?: boolean
        itp_support?: boolean
      }

      function initialize(config: IdConfiguration): void
      function prompt(): void
      function cancel(): void
    }
  }
}
