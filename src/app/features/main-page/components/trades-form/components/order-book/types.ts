interface TokenInfoBody {
  // TODO: Андрей, поменяй нейминг. Теперь этот тип актуален только для ордер буков. Возможно, его вообще можно убрать
  decimals: number;
  name: string;
  symbol: string;

  platform?: string;
}

export { TokenInfoBody };
