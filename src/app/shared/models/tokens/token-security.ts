export interface TokenSecurity {
  has_info: boolean;
  trust_list: boolean | null;
  risky_security_items: number;
  attention_security_items: number;
}

export enum TokenSecurityStatus {
  TRUST_LIST = 'trust-list',
  SECURED = 'safe',
  LOW_RISK = 'low-risk',
  HIGH_RISK = 'high-risk',
  NO_INFO = 'no-info',
  UNSUPPORTED_BLOCKCHAIN = 'unsupported'
}
