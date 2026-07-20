import Link from "next/link";
import type { Metadata } from "next";
import { Rocket, Wordmark } from "@/components/Logo";
import { StartFlow } from "@/components/StartFlow";

export const metadata: Metadata = {
  title: "Start your Messy Launch",
  description: "Tell us about your business — we'll come back with first thoughts on your game plan within a day.",
};

export default function StartPage() {
  return (
    <main className="flex min-h-screen flex-col px-6 py-8">
      <div className="mx-auto flex w-full max-w-2xl items-center">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:rotate-6">
            <Rocket size={20} />
          </span>
          <Wordmark />
        </Link>
        <Link href="/" className="ml-auto text-sm text-faint transition hover:text-sub">
          ✕ Not yet
        </Link>
      </div>
      <div className="flex flex-1 items-center py-14">
        <StartFlow />
      </div>
    </main>
  );
}
