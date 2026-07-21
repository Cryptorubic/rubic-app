const MOBILE_USER_AGENT_PATTERN = /Android|iPhone|iPad|iPod/i;

/**
 * True when Xaman is expected to run on the same device as the browser (deeplink flow).
 * On these devices we omit payload return_url so Xaman updates the origin tab over WebSocket
 * instead of opening a new browser window after signing.
 */
export function isXamanMobileDevice(userAgent: string): boolean {
  return MOBILE_USER_AGENT_PATTERN.test(userAgent);
}
