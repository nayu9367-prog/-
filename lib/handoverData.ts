// A handover is a PDF the outgoing rotation uploads for the next one, filed
// under the institution it is about.
export type HandoverFile = {
  id: string;
  institution: string;
  // Which rotation wrote it, as free text (e.g. "2026-2학기 1조").
  period: string;
  fileUrl: string;
  fileName: string;
  createdAt: string;
};

export const MAX_HANDOVER_FILE_MB = 20;
