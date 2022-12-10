export interface OnramperGatewaysResponse {
  gateways: {
    fiatCurrencies: {
      code: string;
    }[];
  }[];
  localization: {
    currency: string;
  };
  icons: {
    [key: string]: {
      name: string;
      icon: string;
    };
  };
}
