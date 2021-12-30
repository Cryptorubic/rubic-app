type MarkFunctionProperties<Component> = {
  [Key in keyof Component]: Component[Key] extends Function ? never : Key;
};

type ExcludeFunctionPropertyNames<T> = MarkFunctionProperties<T>[keyof T];

export type ExcludeFunctions<T> = Pick<T, ExcludeFunctionPropertyNames<T>>;
