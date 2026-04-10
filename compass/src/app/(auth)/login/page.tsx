"use client"

import { useRouter } from "next/navigation"
import { CompassLogo } from "@/shared/ui/compass-logo"
import { useLocale } from "@/shared/i18n"

export default function LoginPage() {
  const router = useRouter()
  const { t } = useLocale()

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <CompassLogo size="lg" />
          <p className="text-caption uppercase tracking-[0.18em] text-[var(--fg-2)]">
            {t("login.subtitle")}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-white p-6">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">Email</label>
              <input type="email" defaultValue="demo@compass.io" className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)]" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">Password</label>
              <input type="password" defaultValue="password123" className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)]" />
            </div>
            <button onClick={() => router.push("/dashboard")} className="w-full rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors cursor-pointer">
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
