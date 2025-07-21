export function Threadify<T>(
  outputThread: T[],
  array: T[],
  find: (value: T, leaf: T | undefined) => boolean,
  hasLeaf: (value: T | undefined) => boolean,
) {
  const leaf = outputThread.at(-1);

  const newLeaf = array.find((value) => find(value, leaf));

  if (newLeaf) outputThread.push(newLeaf);

  if (hasLeaf(newLeaf)) {
    Threadify<T>(outputThread, array, find, hasLeaf);
  }
}
