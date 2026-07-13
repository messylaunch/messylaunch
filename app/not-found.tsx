import Link from "next/link";
import { Rocket } from "@/components/Logo";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <div className="mx-auto inline-block rotate-[135deg] opacity-80">
          <Rocket size={80} />
        </div>
        <p className="eyebrow mt-8">Error 404 — trajectory anomaly</p>
        <h1 className="mt-3 font-display text-4xl font-extrabold text-ink">This page missed the launch window.</h1>
        <p className="mx-auto mt-3 max-w-md text-sub">
          Whatever was here either moved, never existed, or is still on the pad. Let&apos;s get you back to mission control.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className="btn btn-primary">Back home</Link>
          <Link href="/admin" className="btn btn-ghost">Mission Control</Link>
        </div>
      </div>
    </main>
  );
}
