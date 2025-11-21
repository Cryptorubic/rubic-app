export type Prettify<Type> = Type extends Function
  ? Type
  : Extract<
      {
        [Key in keyof Type]: Type[Key];
      },
      Type
    >;

export type MarkRequired<Type, Keys extends keyof Type> = Type extends Type
  ? Prettify<Type & Required<Omit<Type, Exclude<keyof Type, Keys>>>>
  : never;
