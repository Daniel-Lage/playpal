export function getRandomIndexes(count: number, limit: number) {
  const orderedList: number[] = [];
  const output: number[] = [];

  if (count > limit) {
    count = limit;
  }

  for (let i = 0; i < count; i++) {
    // gets a random number between 0 and limit - i (number of already selected indexes)
    const randomNumber = Math.floor(Math.random() * (limit - i));
    // checks if it was already selected and skips it if it is
    output.push(checkAndSkip(randomNumber, orderedList));
  }

  return [orderedList, output] as [number[], number[]];
}

function checkAndSkip(number: number, orderedList: number[]) {
  let index = 0;
  while (index < orderedList.length) {
    const currentNumber = orderedList[index]!;
    if (number >= currentNumber) {
      number++;
      index++;
    } else {
      break;
    }
  }
  orderedList.splice(index, 0, number);
  return number;
}
