export interface XamanSignModalData {
  qrCodeUrl: string;
  deepLink: string;
  /**
   * When true, the user is on the same device as Xaman (mobile deeplink flow).
   */
  isMobile: boolean;
  /**
   * Highlighted instruction shown above the QR (e.g. which account must sign a trustline).
   */
  warningText?: string;
}

export interface XamanSignRequestRef {
  /**
   * Closes the sign-request modal programmatically (e.g. once the payload is resolved).
   */
  close: () => void;

  /**
   * Resolves when the user dismisses the modal manually (cancels the sign request).
   */
  dismissed: Promise<void>;
}
