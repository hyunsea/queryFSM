// Convert UTC timestamp to KST (UTC+9) for display
export const convertToKST = (utcTimestamp: string): string => {
  const utcDate = new Date(utcTimestamp);
  const kstDate = new Date(utcDate.getTime() + (9 * 60 * 60 * 1000)); // Add 9 hours
  return kstDate.toISOString();
};

export const formatDateTimeKST = (utcTimestamp: string): string => {
  const kstTimestamp = convertToKST(utcTimestamp);
  return new Date(kstTimestamp).toLocaleString('en-US', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};