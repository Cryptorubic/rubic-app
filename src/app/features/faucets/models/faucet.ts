export interface Faucet {
  readonly token: {
    readonly address: string;
    readonly symbol: string;
    readonly icon_url: string;
  };
  readonly url: string;
  readonly name: string;
}
