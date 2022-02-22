export type ComparisonResult = 1 | 0 | -1;

export type Comparator<T> = (a: T, b: T) => ComparisonResult;
