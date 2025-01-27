export function getRandomSample<T>(
  array: Array<T>,
  limit = Infinity,
): Array<T> {
  const size = Math.min(array.length, limit); // either the whole array or limit if specified and valid

  const newArray: Array<T> = [];
  const prevArray = [...array];

  for (let index = 0; index < size; index++) {
    const index = Math.floor(Math.random() * prevArray.length);
    const item = prevArray.splice(index, 1)[0];
    if (item) newArray.push(item);
  }

  return newArray;
}
