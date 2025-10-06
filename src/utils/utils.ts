export const delay = <T>(result: T, ms = 2000): Promise<T> => {
  return new Promise((resolve) => setTimeout(() => resolve(result), ms));
};