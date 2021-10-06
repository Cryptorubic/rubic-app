export type PromoCode = AcceptedPromoCode | RejectedPromoCode | WrongPromoCode | OutdatedPromoCode;

interface BasePromoCode {
  status: 'accepted' | 'outdated' | 'wrong' | 'rejected';
  text: string;
}

export interface AcceptedPromoCode extends BasePromoCode {
  status: 'accepted';
  usesLeft: number;
  usesLimit: number;
  validUntil: Date;
}

export interface RejectedPromoCode extends BasePromoCode {
  status: 'rejected';
  code: number;
}

export interface WrongPromoCode extends BasePromoCode {
  status: 'wrong';
}

export interface OutdatedPromoCode extends BasePromoCode {
  status: 'outdated';
}
