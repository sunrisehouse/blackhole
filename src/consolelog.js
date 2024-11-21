import { Queue } from "./queue";

const consoleLogs = new Queue(500);

function getKoreanTimeISO() {
  const date = new Date();
  const offsetInMs = 9 * 60 * 60 * 1000; // UTC+9에 해당하는 밀리초
  const koreanTime = new Date(date.getTime() + offsetInMs);

  return koreanTime.toISOString().replace('Z', '+09:00'); // Z를 UTC+9로 대체
}

export function getConsoleLog() {
  return consoleLogs.getQueue();
}

export function addConsoleLog(log) {
  consoleLogs.enqueue(`[${getKoreanTimeISO()}] ${log}`);
}
