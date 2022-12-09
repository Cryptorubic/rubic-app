export interface OnramperGatewaysResponse {
  gateways: {
    fiatCurrencies: {
      code: string;
    }[];
  }[];
  localization: {
    currency: string;
  };
}
