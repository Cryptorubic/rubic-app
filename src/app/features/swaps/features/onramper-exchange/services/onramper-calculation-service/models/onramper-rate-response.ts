export type OnramperRateResponse = {
  available: boolean;
  receivedCrypto?: number;
  error?: {
    type: string;
    limit: number;
    message: string;
  };
}[];
