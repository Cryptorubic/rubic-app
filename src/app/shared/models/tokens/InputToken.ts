export default interface InputToken {
  address: string;
  name: string;
  symbol: string;
  image: string;
  decimals: number;
  min?: number;
  rank?: number;
}
