const STUDENT_ID_KEY = "nursihub_student_id";

export function loadSavedStudentId(): string {
  try {
    return window.localStorage.getItem(STUDENT_ID_KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveStudentId(studentId: string): void {
  try {
    window.localStorage.setItem(STUDENT_ID_KEY, studentId);
  } catch {}
}
