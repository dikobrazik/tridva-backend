const SURNAME = [
  'Пушистый',
  'Милый',
  'Колючий',
  'Одинокий',
  'Гордый',
  'Сутулый',
  'Сексуальный',
];

const NAME = [
  'Ёж',
  'Бобёр',
  'Кролик',
  'Заяц',
  'Медведь',
  'Волк',
  'Лев',
  'Тигр',
  'Тигр',
];

export function getRandomName() {
  return `${SURNAME[Math.floor(Math.random() * SURNAME.length)]} ${
    NAME[Math.floor(Math.random() * NAME.length)]
  }`;
}
