type Indices<L extends number, T extends number[] = []> = T['length'] extends L
  ? T[number]
  : Indices<L, [T['length'], ...T]>;

type LengthAtLeast<T extends readonly unknown[], L extends number> = Pick<Required<T>, Indices<L>>;

export function hasLengthAtLeast<T extends readonly unknown[], L extends number>(
  arr: T,
  len: L
): arr is T & LengthAtLeast<T, L> {
  return arr.length >= len;
}
