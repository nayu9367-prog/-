"use client";

import { useState } from "react";

export default function CopyTemplateButton({
  text,
  colorClass,
}: {
  text: string;
  colorClass: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 접근 불가 시 무시
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={`w-full text-xs py-2 rounded-xl font-bold transition-all ${colorClass}`}
    >
      {copied ? "복사되었습니다 ✅" : "양식 텍스트 복사"}
    </button>
  );
}
