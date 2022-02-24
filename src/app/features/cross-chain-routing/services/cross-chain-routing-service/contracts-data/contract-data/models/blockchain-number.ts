type Increase<A, ACC extends Array<unknown> = []> = ACC['length'] extends A
  ? [...ACC, ACC['length']]['length']
  : Increase<A, [...ACC, ACC['length']]>;

type NumbersRange<
  FROM extends number,
  TO extends number,
  I = FROM,
  Result extends unknown[] = []
> = I extends TO ? [...Result, I][number] : NumbersRange<FROM, TO, Increase<I>, [...Result, I]>;

export type BlockchainNumber = NumbersRange<1, 11>;
