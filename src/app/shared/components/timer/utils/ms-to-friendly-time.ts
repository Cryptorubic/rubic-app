export function msToFriendlyTime(timestamp: number): string {
  let timestampInSecs = Math.floor(timestamp / 1000);
  const hours = Math.floor(timestampInSecs / 3600);
  timestampInSecs = timestampInSecs - hours * 3600;
  const minutes = Math.floor(timestampInSecs / 60);
  timestampInSecs = timestampInSecs - minutes * 60;
  const seconds = timestampInSecs;

  const hh = hours < 10 ? `0${hours}` : `${hours}`;
  const mm = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const ss = seconds < 10 ? `0${seconds}` : `${seconds}`;

  return hh === '00' ? `${mm}:${ss}` : `${hh}:${mm}:${ss}`;
}
