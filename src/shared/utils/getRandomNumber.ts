export function getRandomNumber(min: number, max: number) {
  return Number((((Math.random() * max) % max) + min).toFixed(0));
}
