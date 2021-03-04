interface InputToken {
  address: string;
  name: string;
  symbol: string;
  image: string;
  decimals: number;
  min?: number;
}

interface InputTokenShort {
  image: string;
  name: string;
  symbol: string;
}

export { InputToken, InputTokenShort };
