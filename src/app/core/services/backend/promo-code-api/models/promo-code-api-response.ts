export type PromoCodeApiResponse =
  | AcceptedPromoCodeApiResponse
  | RejectedPromoCodeApiResponse
  | OutdatedPromoCodeApiResponse
  | WrongPromoCodeApiResponse;

interface AcceptedPromoCodeApiResponse {
  status: 'accepted';
  details: {
    usesLeft: number;
    usesLimit: number;
    timeLeft: number; // in seconds
  };
}

interface RejectedPromoCodeApiResponse {
  status: 'rejected';
  details: {
    code: number;
  };
}

interface OutdatedPromoCodeApiResponse {
  status: 'outdated';
}

interface WrongPromoCodeApiResponse {
  status: 'wrong';
}
