export function formatTime(ms: number) {
  const seconds = Math.ceil((ms % (60 * 1000)) / 1000);
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));

  if (ms < 60 * 60 * 1000)
    return `${minutes}:${seconds > 9 ? "" : "0"}${seconds}`;

  const hours = Math.floor(ms / (60 * 60 * 1000));

  return `${hours}:${minutes > 9 ? "" : "0"}:${seconds > 9 ? "" : "0"}${seconds}`;
}
