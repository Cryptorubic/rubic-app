export type PromoCode = AcceptedPromoCode | RejectedPromoCode | WrongPromoCode | OutdatedPromoCode;

export interface BasicPromoCode {
  status: 'accepted' | 'outdated' | 'wrong' | 'rejected';
  text: string;
}

export interface AcceptedPromoCode extends BasicPromoCode {
  status: 'accepted';
  usesLeft: number;
  usesLimit: number;
  validUntil: Date;
}

export interface RejectedPromoCode extends BasicPromoCode {
  status: 'rejected';
  code: number;
}

export interface WrongPromoCode extends BasicPromoCode {
  status: 'wrong';
}

export interface OutdatedPromoCode extends BasicPromoCode {
  status: 'outdated';
}
