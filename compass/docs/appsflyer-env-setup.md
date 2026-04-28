# AppsFlyer Connector — Vercel Env Vars Setup

PR 3/PR 4 머지 후 production 배포 전, 다음 환경변수를 Vercel에 등록해야 합니다.

## 필수 변수 (3개)

### 1. `APPSFLYER_MASTER_KEY` — AES-256 암호화 키
- 발급: `openssl rand -hex 32` (32바이트 hex 문자열)
- 환경: Production + Preview 모두
- 용도: 사용자가 등록하는 AppsFlyer dev_token 암호화

### 2. `BLOB_READ_WRITE_TOKEN` — Vercel Blob 토큰
- 발급: Vercel 대시보드 → Storage → Blob → Create → "Connect Project"
- 환경: 자동 주입 (Vercel-managed)
- 용도: 계정 정보 + 코호트 데이터 저장

### 3. `CRON_SECRET` — Cron 라우트 인증 시크릿
- 발급: `openssl rand -hex 32`
- 환경: Production + Preview 모두
- 용도: 외부에서 `/api/appsflyer/cron` 호출 차단 (Vercel Cron이 자동 주입)

## 셋업 절차

1. Vercel 대시보드 → 프로젝트 (`mugungwhwa/project-compass`) → Settings → Environment Variables
2. 위 3개 변수 모두 추가 (Production + Preview)
3. Storage 탭 → Blob 활성화 → 자동 주입되는 `BLOB_READ_WRITE_TOKEN` 확인
4. PR 4 머지 후 별도 commit으로 `vercel.json`의 `crons` 활성화
5. 다음 deploy에서 첫 cron 작동 확인 — Vercel Logs에서 03:00 KST 호출 확인

## Cron 활성화 commit (PR 4 이후)

`compass/vercel.json` 수정:

```json
{
  "crons": [
    { "path": "/api/appsflyer/cron", "schedule": "0 18 * * *" }
  ]
}
```

UTC 18:00 = KST 03:00 일일 sync. Vercel Cron이 자동으로 `Authorization: Bearer ${CRON_SECRET}` 헤더를 주입.

## 로컬 개발

`compass/.env.local` (gitignore됨)에 동일 변수 등록:

```
APPSFLYER_MASTER_KEY=<openssl rand -hex 32>
BLOB_READ_WRITE_TOKEN=<from Vercel Blob>
CRON_SECRET=<openssl rand -hex 32>
```

테스트 실행 시 인라인 export:

```bash
APPSFLYER_MASTER_KEY=$(openssl rand -hex 32) npm test
```
