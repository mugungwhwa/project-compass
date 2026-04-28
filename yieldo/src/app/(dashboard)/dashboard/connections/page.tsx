import { ConnectionsClient } from "@/widgets/connections"

export default function ConnectionsPage() {
  return (
    <div className="px-8 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">데이터 연결</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          MMP · 실험 · 재무 · 시장 인텔리전스 4개 사일로의 통합 진입점
        </p>
      </header>
      <ConnectionsClient />
    </div>
  )
}
