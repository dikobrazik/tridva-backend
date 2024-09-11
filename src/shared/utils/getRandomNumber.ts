export function getRandomNumber(min: number, max: number) {
  return Number((((Math.random() * 100) % max) + min).toFixed(0));
}
