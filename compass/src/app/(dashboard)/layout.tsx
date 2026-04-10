import { AppSidebar } from "@/widgets/sidebar"
import { CopilotProvider, RunwayStatusBar, CopilotCommandBar } from "@/widgets/app-shell"

/*
  Dashboard shell layout — 2026-04-08 refactor (Variant A).
  See: docs/Project_Compass_Design_Migration_Log.md §5
       .omc/specs/2026-04-08-dashboard-shell-refactor.md

  Structure:
    [RunwayStatusBar — sticky top, 48px]
    [main content (pb-24 for bottom bar clearance) | AppSidebar (right)]
    [CopilotCommandBar — fixed bottom, 64px, with floating answer card]
*/

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CopilotProvider>
      <div className="flex h-screen flex-col overflow-hidden">
        <RunwayStatusBar />
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto bg-[var(--background)] px-10 pb-24 pt-6">
            {children}
          </main>
          <AppSidebar />
        </div>
        <CopilotCommandBar />
      </div>
    </CopilotProvider>
  )
}
