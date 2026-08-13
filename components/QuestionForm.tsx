"use client";

import { useState, type FormEvent } from "react";

type Status = "idle" | "submitting" | "success" | "error";

export default function QuestionForm() {
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [question, setQuestion] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, studentId, question }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "질문 전송에 실패했습니다.");
      }

      setStatus("success");
      setName("");
      setStudentId("");
      setQuestion("");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "질문 전송에 실패했습니다."
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm sm:p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
          이름
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500"
            placeholder="홍길동"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
          학번
          <input
            required
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500"
            placeholder="2022010942"
          />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
        질문 내용
        <textarea
          required
          rows={4}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="resize-none rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500"
          placeholder="궁금한 내용을 입력해주세요."
        />
      </label>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "submitting" ? "전송 중..." : "질문 제출"}
      </button>

      {status === "success" && (
        <p className="text-sm text-green-600">질문이 성공적으로 전송되었습니다.</p>
      )}
      {status === "error" && <p className="text-sm text-red-600">{errorMessage}</p>}
    </form>
  );
}
