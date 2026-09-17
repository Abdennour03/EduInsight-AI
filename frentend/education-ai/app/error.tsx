"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application route failed to render", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC] p-6">
      <section className="w-full max-w-xl rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-xl font-bold text-[#0F172A]">Something went wrong</h1>
        <p className="mt-2 text-sm text-[#64748B]">
          We could not display this page. Try again or return to the login page.
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-lg bg-[#0052CC] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
          >
            Try again
          </button>
          <a
            href="/login"
            className="rounded-lg border border-[#CBD5E1] px-4 py-2 text-sm font-semibold text-[#334155] hover:bg-[#F8FAFC]"
          >
            Go to login
          </a>
        </div>
      </section>
    </main>
  );
}