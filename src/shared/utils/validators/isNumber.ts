export const isNumber = (maybeNumber: unknown): maybeNumber is number => {
  if (typeof maybeNumber === 'number') {
    return true;
  }

  if (typeof maybeNumber === 'string') {
    return maybeNumber !== '' && !Number.isNaN(+maybeNumber);
  }

  return false;
};
