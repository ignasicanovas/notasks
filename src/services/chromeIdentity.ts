/**
 * chromeIdentity.ts — Google OAuth2 via chrome.identity
 *
 * Security notes:
 * - Tokens are never logged or stored in chrome.storage.
 * - Only used to call googleapis.com (validated via host_permissions).
 * - sender.id is not applicable here (newtab context, not message passing).
 */

const isChromeExtension =
  typeof chrome !== "undefined" && typeof chrome.identity !== "undefined"

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "AuthError"
  }
}

/**
 * Get a Google OAuth token.
 * @param interactive - Show the sign-in popup if not already authenticated.
 */
export function getGoogleToken(interactive: boolean): Promise<string> {
  if (!isChromeExtension) {
    return Promise.reject(new AuthError("chrome.identity not available"))
  }

  return new Promise((resolve, reject) => {
    try {
      chrome.identity.getAuthToken({ interactive }, (token) => {
        if (chrome.runtime.lastError) {
          reject(new AuthError(chrome.runtime.lastError.message ?? "Auth failed"))
          return
        }
        if (!token) {
          reject(new AuthError("No token returned"))
          return
        }
        resolve(token)
      })
    } catch (err) {
      reject(err)
    }
  })
}

/**
 * Revoke and remove the cached Google token.
 */
export async function revokeGoogleToken(token: string): Promise<void> {
  if (!isChromeExtension) return

  return new Promise((resolve) => {
    try {
      chrome.identity.removeCachedAuthToken({ token }, () => {
        // Also revoke on Google's side
        fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`).catch(
          () => {} // ignore revoke errors
        )
        resolve()
      })
    } catch {
      resolve()
    }
  })
}

/**
 * Silently check if the user is already authenticated.
 * Returns the token or null without showing any UI.
 */
export async function getSilentToken(): Promise<string | null> {
  try {
    return await getGoogleToken(false)
  } catch {
    return null
  }
}
