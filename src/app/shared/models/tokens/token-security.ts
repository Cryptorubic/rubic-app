export type TokenSecurity = {
  has_info: boolean;
  trust_list: boolean | null;
  risky_security_items: number;
  attention_security_items: number;
  is_airdrop_scam: boolean | null;
  fake_token: boolean | null;
} | null;

/**
 * UNSUPPORTED_BLOCKCHAIN - network is not supported by Go+.
 * NO_INFO - network is supported by Go+, but there is no security info about token.
 * TRUST_LIST - token is in Go+ trust list OR a token is a Native Token in a supported netwrok.
 * SCAM_LIST - token is in the Rubic's Scam List
 * SECURED - token has 0 Go+ warnings, but not in the Trust List.
 * HIGH_RISK - token has some risky Go+ warnings.
 * LOW_RISK - token has some attention Go+ warnings and 0 risky warnings.
 */
export enum TokenSecurityStatus {
  TRUST_LIST = 'trust-list',
  SECURED = 'safe',
  LOW_RISK = 'low-risk',
  HIGH_RISK = 'high-risk',
  NO_INFO = 'no-info',
  UNSUPPORTED_BLOCKCHAIN = 'unsupported',
  SCAM_LIST = 'scam-list'
}
