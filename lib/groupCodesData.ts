// Kept apart from lib/groupCodes.ts so the admin screen can use these
// without pulling the server's code into the browser.

// Each practicum group enters the site with its own code. A code says which
// group someone is in, not who they are: the features that record under a
// person still ask for a student ID and PIN.
export type GroupCode = {
  id: string;
  name: string;
  code: string;
  // An inactive group's code no longer lets anyone in.
  active: boolean;
};

export type GroupCodesSettings = {
  groups: GroupCode[];
};

export type GroupLogin = { count: number; lastAt: string };

export const MIN_GROUP_CODE_LENGTH = 4;
export const MAX_GROUPS = 30;

// Codes are typed by hand on phones, so case and stray spaces don't count.
export function normalizeGroupCode(code: string): string {
  return code.trim().toLowerCase();
}
