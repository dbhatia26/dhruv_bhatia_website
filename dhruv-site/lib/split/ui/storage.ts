/** Client-only localStorage helpers. Every read/write is wrapped, since localStorage can throw
 * (private browsing, quota, disabled) and none of that should ever break the app. */

const GROUPS_KEY = "runningTab.groups";
const identityKey = (secret: string) => `runningTab.identity.${secret}`;

export interface DeviceGroup {
  secret: string;
  name: string;
  joinedAt: string;
}

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Nothing to do: the app still works, just without persistence.
  }
}

export function getDeviceGroups(): DeviceGroup[] {
  return readJSON<DeviceGroup[]>(GROUPS_KEY, []);
}

export function addDeviceGroup(group: DeviceGroup) {
  const groups = getDeviceGroups().filter((g) => g.secret !== group.secret);
  writeJSON(GROUPS_KEY, [group, ...groups]);
}

export function getIdentity(secret: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(identityKey(secret));
  } catch {
    return null;
  }
}

export function setIdentity(secret: string, memberId: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(identityKey(secret), memberId);
  } catch {
    // Nothing to do: the app still works, just re-prompts next visit.
  }
}
