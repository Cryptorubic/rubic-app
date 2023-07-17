export interface OnramperSupportedResponse {
  message: {
    crypto: {
      address: string;
      chainId: number;
      code: string;
      icon: string;
      id: string;
      name: string;
      network: string;
      symbol: string;
    }[];
  };
}
