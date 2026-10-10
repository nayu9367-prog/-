import { NextRequest, NextResponse } from "next/server";
import { clearQuizSubmissions, deleteQuizSubmission } from "@/lib/quiz";

// Admin-only (see proxy.ts). Removes one submission, or every submission
// when none is named.
export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (id) {
    await deleteQuizSubmission(id);
  } else {
    await clearQuizSubmissions();
  }
  return NextResponse.json({ ok: true });
}
