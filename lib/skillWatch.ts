// How much of each skill video this browser has played. Kept in the
// browser: the video players report progress to the page, not to the server.
export const WATCH_STORAGE_KEY = "nursihub_skill_watch";

// A video counts as watched once this share of it has actually played.
export const WATCH_COMPLETE_RATIO = 0.9;

export type WatchEntry = { seconds: number; duration: number; done: boolean };
export type WatchState = Record<string, WatchEntry>;

// Progress belongs to the video, so replacing a skill's video starts it over.
export function watchKey(skill: { id: string; videoId: string }): string {
  return `${skill.id}:${skill.videoId}`;
}

export function watchPercent(entry: WatchEntry | undefined): number {
  if (!entry) return 0;
  if (entry.done) return 100;
  if (!(entry.duration > 0)) return 0;
  return Math.min(99, Math.floor((entry.seconds / (entry.duration * WATCH_COMPLETE_RATIO)) * 100));
}

export function loadWatchState(): WatchState {
  try {
    const raw = window.localStorage.getItem(WATCH_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as WatchState) : {};
  } catch {
    return {};
  }
}

export function saveWatchState(state: WatchState): void {
  try {
    window.localStorage.setItem(WATCH_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 저장 실패는 무시 (이 기기에서만 쓰는 시청 기록)
  }
}
