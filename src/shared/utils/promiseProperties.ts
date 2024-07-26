type AwaitedObject<T extends Record<string, Promise<unknown>>> = {
  [K in keyof T]: Awaited<T[K]>;
};
export const promiseProperties = async <
  T extends Record<string, Promise<unknown>>,
>(
  object: T,
): Promise<AwaitedObject<T>> => {
  return Object.fromEntries(
    await Promise.all(
      Object.entries(object).map(([key, promise]) =>
        promise.then((value) => [key, value]),
      ),
    ),
  );
};
