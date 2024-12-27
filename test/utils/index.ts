export const mockType = <T, A = Partial<T>>(value: A): T =>
  value as unknown as T;
