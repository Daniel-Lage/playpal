export function setFirstItem<T>(
  array: T[],
  first: T,
  find: (value: T, index: number, obj: T[]) => unknown,
): T[] {
  const newArray = [...array];

  const itemIndex = newArray.findIndex(find);

  void newArray.splice(itemIndex, 1)[0];

  newArray.unshift(first);

  return newArray;
}
