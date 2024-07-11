export type TokenSecurity = {
  has_info: boolean;
  trust_list: boolean | null;
  risky_security_items: number;
  attention_security_items: number;
  is_airdrop_scam: boolean | null;
  fake_token: boolean | null;
} | null;

/**
 * Enum for token security status.
 */
export enum TokenSecurityStatus {
  /** Token is in Go+ Trust List OR a token is a Native Token in a Go+ supported network. */
  TRUST_LIST = 'trust-list',
  /** Token has 0 Go+ warnings, but not in the Go+ Trust List. */
  SECURED = 'safe',
  /** Token has some attention Go+ warnings and 0 risky warnings. */
  LOW_RISK = 'low-risk',
  /** Token has some risky Go+ warnings. */
  HIGH_RISK = 'high-risk',
  /** Network is supported by Go+, but there is no security info about token. */
  NO_INFO = 'no-info',
  /** Network is not supported by Go+. */
  UNSUPPORTED_BLOCKCHAIN = 'unsupported',
  /** Token is in the Rubic's Scam List */
  SCAM_LIST = 'scam-list',
  /** Token is Platform Token */
  PLATFORM_TOKEN = 'platform-token'
}

export const securityMessages: Record<TokenSecurityStatus, string> = {
  [TokenSecurityStatus.TRUST_LIST]: 'Token is in the Go+ Trust List',
  [TokenSecurityStatus.SCAM_LIST]: 'Token is in the Scam List',
  [TokenSecurityStatus.SECURED]: 'Token code has no elements of concern',
  [TokenSecurityStatus.LOW_RISK]: 'Token code contains some low risk elements of concern',
  [TokenSecurityStatus.HIGH_RISK]: 'Token code contains some high risk elements of concern',
  [TokenSecurityStatus.NO_INFO]: 'No information',
  [TokenSecurityStatus.PLATFORM_TOKEN]: 'Platform Native Token',
  [TokenSecurityStatus.UNSUPPORTED_BLOCKCHAIN]: 'Unsupported blockchain'
};
