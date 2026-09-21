/** Thin localStorage wrapper for the municipality's entered fleet data.
 *
 * This is an interim persistence layer: it keeps entered data across page
 * refreshes without needing a backend, but it is per-browser, per-device,
 * and offers no multi-user access, history, or backup - a real deployment
 * needs a database behind an API for that (see the pitch document's
 * roadmap). Every read/write is wrapped in try/catch because localStorage
 * can throw (private browsing, disabled storage, quota exceeded).
 */

const STORAGE_PREFIX = 'waste-mgmt:v1:';

export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage unavailable - the data just won't survive a refresh this time.
  }
}
