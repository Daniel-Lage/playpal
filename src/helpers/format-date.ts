export function formatDate(date: Date) {
  const now = new Date();

  const years = now.getFullYear() - date.getFullYear();
  if (years > 0) return `${years} year${years > 1 ? "s" : ""}`;

  const months = now.getMonth() - date.getMonth();
  if (months > 0) return `${months} month${months > 1 ? "s" : ""}`;

  const days = now.getDate() - date.getDate();
  if (days > 0) return `${days} day${days > 1 ? "s" : ""}`;
}
