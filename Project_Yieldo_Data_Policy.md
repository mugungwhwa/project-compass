# yieldo — Data Policy Document

## Classification · Legal Basis · Security · Lifecycle

**Version**: 1.0
**Date**: 2026-05-02
**Classification**: Internal Policy Document
**Audience**: 2-person dev team, future legal review, enterprise customer security audit
**Related Documents**:
- Foundation: `CLAUDE.md` §8.5~8.6
- Architecture: `Project_Yieldo_Data_Architecture.md`
- Legal: `Project_Yieldo_Legal.md`
- Sources: `Project_Yieldo_Data_Sources_Guide.md`

---

## 1. Data Classification Matrix

### 1.1 4-Tier 분류

| Tier | 명칭 | 정의 | 예시 | 보호 수준 |
|---|---|---|---|---|
| **T1** | Trade Secret | 고객사 영업비밀, 외부 유출 시 사업 손실 | Revenue, UA spend, cash balance, monthly burn | **AES-256 column 암호화 + RLS + Audit log + 4-eye access** |
| **T2** | Operational | 운영상 민감, 테넌트 내부 기밀 | Cohort retention, ATE 결과, prediction band, action_event | RLS + Audit log |
| **T3** | PII (소량) | 개인정보보호법 대상 | Org admin email, name, phone | RLS + Better Auth + 최소 수집 |
| **T4** | Public | 공개 데이터, 캐시 가능 | Genre P50 retention, public benchmark | 평문 저장, 캐시 가능 |

### 1.2 분류 결정 트리

```
데이터 입력 시:
  │
  ├─ 고객사 재무·금전 정보? ──► T1
  │
  ├─ 게임별 운영 metric? ─────► T2
  │
  ├─ 개인 식별 정보? ─────────► T3
  │
  └─ 공개 출처 + 익명? ───────► T4
```

### 1.3 Tier 별 처리 매트릭스

| 처리 | T1 | T2 | T3 | T4 |
|---|---|---|---|---|
| 평문 DB 저장 | ❌ | ✅ | ✅ | ✅ |
| Redis 캐시 | ❌ | ✅ (5min TTL) | ❌ | ✅ |
| GCS Cold archive | 암호화 후만 | ✅ | ❌ | ✅ |
| Log 출력 | ❌ (마스킹) | ❌ (요약만) | ❌ (마스킹) | ✅ |
| 외부 LLM 전송 | ❌ | aggregate만 | ❌ | ✅ |
| Demo 데이터 사용 | ❌ (synthetic만) | ❌ (synthetic만) | ❌ | ✅ |
| Audit log 기록 | 모든 read/write | write + bulk read | write + admin read | 불필요 |

### 1.4 Tier 마이그레이션 원칙

데이터의 Tier는 **격상**될 수 있으나 **격하**될 수 없다.

- 예: 공개 benchmark가 fork 되어 고객 환경에서 재계산되면 T4 → T2로 격상
- 한 번 T1로 분류된 데이터는 평생 T1 (계약 종료 시 영구 삭제 외엔 격하 불가)

---

## 2. Legal Basis

### 2.1 적용 법령 매핑

| 법령 | 적용 대상 | 핵심 의무 | yieldo 대응 |
|---|---|---|---|
| **부정경쟁방지법** §2(2) | T1 영업비밀 | 비공지성·경제적 가치·비밀관리성 유지 | AES-256 + RLS + audit + NDA |
| **개인정보보호법** (PIPA) | T3 PII | 최소 수집·동의·보관기간 명시·삭제권 | Better Auth + 약관 + 30일 삭제 SLA |
| **상법 §33 (회계법)** | Financial input + audit | 7년 장부 보관 의무 | GCS Archive 7년 lifecycle |
| **신용정보보호법** | (해당 없음, B2B SaaS) | — | — |
| **GDPR** (글로벌 진출 시) | EU 거주 user의 T3 | DPO 지정·DPA 체결·right to erasure | Phase 2 진입 시 SCC 도입 |
| **CCPA** (CA 진출 시) | CA 거주자 T3 | opt-out + 데이터 매핑 공개 | Phase 3 검토 |

### 2.2 부정경쟁방지법 vs 개인정보보호법

T1과 T3의 법적 근거가 **다르다는 점**이 중요하다:

| 항목 | T1 (부정경쟁방지법) | T3 (PIPA) |
|---|---|---|
| 보호 객체 | 회사의 영업비밀 | 자연인의 개인정보 |
| 동의 주체 | 계약 (B2B 서비스 약관) | 개인 (체크박스 동의) |
| 위반 처벌 | 최대 10년 징역 + 손해배상 | 과징금 (매출 3% 이내) + 형사 |
| 보호 요건 | 비밀관리성 입증 필수 | 동의 + 목적 명시 필수 |
| 삭제 의무 | 계약 종료 시 (계약서 명시) | 보유기간 만료 또는 요청 시 |

**실무 함의**: T1은 "비밀관리 노력"을 입증할 증빙 (정책 문서·암호화 기록·접근 통제 기록) 자체가 법적 방어 수단이다. 따라서 본 문서 자체가 법적 자료로 활용된다.

### 2.3 데이터 처리 위탁 (DPA)

- 위탁 처리자: Supabase, Vercel, Upstash, Google Cloud, OpenAI/Anthropic (LLM 사용 시)
- 약관 검토: 각 vendor의 DPA + sub-processor list 정기 점검 (분기별)
- 사용자 고지: 약관에 sub-processor 명시 + 변경 시 30일 사전 통지

---

## 3. RLS Policy Template

### 3.1 기본 원칙

1. **모든 테넌트 데이터 테이블은 RLS 강제 활성화**
2. `org_id` 컬럼 필수 + `org_member` JOIN으로 권한 체크
3. Service role 키는 서버 사이드 ML inference 전용, 클라이언트 노출 절대 금지
4. `auth.uid()` 기반 row filter

### 3.2 Policy 템플릿 (Postgres SQL)

```sql
-- 1. 모든 운영 테이블에 RLS enable
ALTER TABLE financial_input ENABLE ROW LEVEL SECURITY;

-- 2. SELECT policy: 본인이 소속된 org만 조회 가능
CREATE POLICY "select_own_org" ON financial_input
  FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM org_member
      WHERE user_id = auth.uid()
    )
  );

-- 3. INSERT policy: org admin/operator role만 가능
CREATE POLICY "insert_by_role" ON financial_input
  FOR INSERT
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM org_member
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'operator')
    )
  );

-- 4. UPDATE/DELETE: admin only + audit trigger
CREATE POLICY "modify_admin_only" ON financial_input
  FOR UPDATE
  USING (
    org_id IN (
      SELECT org_id FROM org_member
      WHERE user_id = auth.uid()
        AND role = 'admin'
    )
  );

-- 5. DELETE 별도 policy (논리 삭제 권장)
CREATE POLICY "no_hard_delete" ON financial_input
  FOR DELETE
  USING (false);  -- 영구 삭제는 admin SQL only
```

### 3.3 Role 정의

| Role | 권한 | 대상 |
|---|---|---|
| `owner` | 모든 권한 + org 삭제 + billing | 계정 생성자 |
| `admin` | 멤버 관리 + 모든 데이터 R/W + financial 입력 | CFO, COO |
| `operator` | 운영 데이터 R/W (T2) + financial 읽기만 | UA lead, LiveOps |
| `viewer` | T2/T3 읽기만, T1 마스킹 표시 | 외부 컨설턴트, BD |

### 3.4 Service Role 사용 규약

- ML inference 호출 시에만 service role 사용
- Service role은 **반드시 server-side에서만** 사용 (Cloud Run + Server Action)
- Client-side에 service role 키 노출은 즉시 incident 처리

---

## 4. Encryption Spec

### 4.1 At-Rest

| 대상 | 방식 | Key 관리 |
|---|---|---|
| Supabase DB 전체 | AES-256 (Supabase native) | Supabase KMS |
| T1 컬럼 (financial_input.*) | AES-256-GCM (column-level) | Supabase Vault 또는 application-side env |
| GCS bucket | Google-managed encryption (default) | GCP KMS |
| GCS audit/T1 archive | CMEK (Customer-Managed) | Phase 2에서 도입 |
| Redis | TLS connection only (Upstash 자체 암호화 X) | — (캐시는 T1 저장 금지) |

### 4.2 In-Transit

- 모든 endpoint TLS 1.3 강제
- HSTS header (max-age=31536000; includeSubDomains; preload)
- Internal: Supabase ↔ Cloud Run은 동일 region (asia-northeast3) + private IP (Phase 2)
- LLM API 호출: HTTPS only, prompt injection sanitization

### 4.3 Application-Level (T1 Column 암호화)

```typescript
// Server Action에서 financial_input 저장 시
import { aesGcmEncrypt, aesGcmDecrypt } from '@/shared/crypto'

// 저장
const encrypted = await aesGcmEncrypt(
  JSON.stringify({ revenue: 1_200_000, uaSpend: 350_000 }),
  process.env.YIELDO_T1_KEY  // 32-byte key, env 또는 Vault
)
await supabase.from('financial_input').insert({
  org_id: ctx.orgId,
  encrypted_payload: encrypted,
  encrypted_at: new Date().toISOString()
})

// 조회
const row = await supabase.from('financial_input').select('*').eq('id', id).single()
const decrypted = JSON.parse(
  await aesGcmDecrypt(row.encrypted_payload, process.env.YIELDO_T1_KEY)
)
```

**Key rotation**:
- 분기별 1회 (90일)
- Old key는 Vault에서 1년 유지 (이전 데이터 복호화용)
- 1년 경과 키는 Vault에서 영구 삭제 + 해당 데이터는 신규 키로 re-encrypt

---

## 5. Audit Trail

### 5.1 기록 대상

| 이벤트 | T1 | T2 | T3 | T4 |
|---|---|---|---|---|
| Read (single) | ✅ | ❌ | ❌ | ❌ |
| Read (bulk/export) | ✅ | ✅ | ✅ | ❌ |
| Write (insert) | ✅ | ✅ | ✅ | ❌ |
| Write (update) | ✅ | ✅ | ✅ | ❌ |
| Write (delete) | ✅ | ✅ | ✅ | ❌ |
| Permission change | ✅ | ✅ | ✅ | — |
| Login/logout | — | — | ✅ | — |
| Failed auth attempt | — | — | ✅ | — |

### 5.2 audit_log 스키마

```sql
CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  org_id UUID NOT NULL,
  actor_user_id UUID,
  actor_role TEXT,
  actor_ip INET,
  event_type TEXT NOT NULL,           -- 'read' | 'write' | 'delete' | 'auth' | 'permission'
  target_table TEXT NOT NULL,
  target_id TEXT,
  tier TEXT NOT NULL,                  -- 'T1' | 'T2' | 'T3'
  changes JSONB,                       -- write 시 before/after diff
  metadata JSONB,                      -- user-agent, request-id 등
  CONSTRAINT chk_tier CHECK (tier IN ('T1','T2','T3'))
);

CREATE INDEX idx_audit_org_date ON audit_log(org_id, occurred_at DESC);
CREATE INDEX idx_audit_target ON audit_log(target_table, target_id);
```

### 5.3 보존 정책

- L1 Postgres 보관: **30일** (hot)
- 30일 경과 → GCS Parquet archive 자동 이관 (monthly Cloud Run Job)
- GCS archive 보관: **7년** (회계법 + 부정경쟁방지법 자료 보전)
- 7년 경과 → 자동 영구 삭제 + 삭제 증명 GCS 별도 bucket에 기록

### 5.4 조회 권한

- Org admin: 본인 org의 audit log 전체 조회 가능
- yieldo internal: 고객 동의 (지원 요청) 또는 법원 명령 시에만
- 모든 audit log 조회 자체가 audit_log에 기록 (meta-audit)

---

## 6. Backup / DR

### 6.1 Backup 정책

| 자원 | 방식 | 빈도 | 보관 |
|---|---|---|---|
| Supabase DB | PITR (Point-in-Time Recovery) | continuous | 7일 (Pro plan) |
| Supabase DB | Daily snapshot → GCS | 1회/일 | 30일 |
| Supabase DB | Weekly full export → GCS | 1회/주 | 1년 |
| GCS data | Multi-region replication | continuous | 영구 (lifecycle 정책) |
| Redis | (백업 안 함, cold-start 가능) | — | — |
| Vercel deployments | Vercel native (immutable) | per-deploy | 영구 |

### 6.2 DR 목표

- **RTO** (Recovery Time Objective): **4시간**
- **RPO** (Recovery Point Objective): **1시간**

### 6.3 DR Runbook 요약

```
1. 장애 감지 (Vercel/Supabase status page + 자체 health check)
2. Severity 분류 (S1: 전면 down / S2: 일부 기능 / S3: 성능 저하)
3. S1 발동 시:
   ├─ 5min:  status page 공지
   ├─ 15min: 원인 1차 추정
   ├─ 1h:    Supabase PITR 또는 snapshot에서 복구 시작
   ├─ 3h:    Read-only 모드로 부분 서비스 재개
   └─ 4h:    완전 복구 + post-mortem 시작
4. Post-mortem 48시간 내 작성 + 영향 받은 고객 개별 통지
```

### 6.4 정기 DR 훈련

- 분기별 1회: snapshot 복구 dry-run (별도 schema에 복원)
- 연 1회: 전체 region failover 시뮬레이션 (Phase 3)

---

## 7. Customer Data Lifecycle

### 7.1 단계별 처리

```
[1] 가입 (Signup)
    │ 약관 동의 + email 검증
    │ org 생성 + owner role 부여
    ▼
[2] 데이터 수집 (Onboarding)
    │ Connection 등록 (MMP API key → Vault)
    │ Financial input 첫 입력 (T1, AES-256 암호화)
    │ Game catalog 등록
    ▼
[3] 데이터 처리 (Active)
    │ Nightly batch (MMP pull, posterior update)
    │ 사용자 dashboard 조회 (RLS scoped)
    │ 모든 활동 audit log 기록
    ▼
[4] 데이터 export (사용자 요청 시)
    │ 본인 org 데이터 전체 JSON/CSV 다운로드
    │ T1 복호화 후 export (마스킹 옵션)
    │ Export 자체가 audit log 기록
    ▼
[5] 계약 종료 (Termination)
    │ 30일 grace period (read-only mode)
    │ 사용자 export 기회 제공
    │ 30일 후 영구 삭제 시작
    ▼
[6] 영구 삭제 (Hard Delete)
    │ L1 Postgres: org_id 기반 cascade delete
    │ L2 Redis: 모든 키 invalidate
    │ L3 GCS: org_id prefix 객체 삭제
    │ 단, audit_log archive는 7년 의무 보관 (anonymized)
    │ 삭제 증명서 발급 (PDF, 사용자 email + Vault에 30일 보관)
```

### 7.2 사용자 권리 (Data Subject Rights)

| 권리 | 대상 Tier | 응답 SLA | 채널 |
|---|---|---|---|
| 열람권 | T1·T2·T3 | 7일 | Dashboard + 이메일 |
| 정정권 | T1·T3 | 7일 | Dashboard self-serve |
| 삭제권 | T1·T2·T3 | 30일 | 이메일 요청 → 본인 확인 |
| 처리정지권 | T2·T3 | 즉시 | Dashboard toggle |
| 이동권 (portability) | T1·T2 | 30일 | JSON export |

### 7.3 미성년자·민감정보

- yieldo는 B2B 서비스로 14세 미만 가입 차단 (약관 명시)
- 민감정보 (인종·종교·건강 등) 수집 안 함

---

## 8. Customer-Authorized Agent Pattern (MMP API Key 관리)

### 8.1 Pattern 정의

yieldo는 고객을 대신해 MMP/Statsig API를 호출하는 **Customer-Authorized Agent**다. 이는:
- 고객의 명시적 위임 (계약서 + UI 동의 화면)
- 최소 권한 원칙 (read-only scope만 요청)
- 키 회전 및 감사 의무

### 8.2 키 저장 방식

```
사용자가 AppsFlyer API key 입력
   │
   ▼
[Server Action 즉시 처리]
   ├─ TLS 검증
   ├─ Key 형식 검증 (regex)
   ├─ Test API call (validation)
   ├─ Vault에 저장 (Supabase Vault 또는 HashiCorp Vault)
   └─ DB connection table에는 vault_ref만 저장 (key 자체 X)
```

**금지 사항**:
- ❌ 평문 DB 저장
- ❌ 로그에 출력
- ❌ Redis 캐시
- ❌ Frontend 노출
- ❌ Error stack trace 포함

### 8.3 Scope 제한

| 외부 서비스 | 요구 권한 | 거절할 권한 |
|---|---|---|
| AppsFlyer | Cohort API read | Push notification, app config write |
| Adjust | Report Service read | Callback URL 수정 |
| Statsig | Console API read (experiment results) | Experiment publish/rollback |

고객사가 더 넓은 권한의 키를 제공해도 **read-only scope로 제한해서 사용** (코드 레벨 enforcement).

### 8.4 키 회전 정책

- 90일마다 자동 알림 (이메일 + dashboard banner)
- 새 키 입력 시 30일 grace period (이전 키 fallback)
- 회전 실패 시: yieldo는 inference 중단, 사용자에게 escalation

### 8.5 키 침해 대응 (Incident Response)

```
의심 징후 (외부 통보 또는 anomaly detection)
   │
   ▼
1. 즉시 키 비활성화 (Vault 토큰 revoke)
2. 사용자에게 1시간 내 통보
3. 영향 범위 추정 (audit log 기반)
4. 새 키 발급 안내
5. 침해 가능성 확인 → 법적 통보 의무 (PIPA §34, GDPR Art.33)
   - 한국: 개인정보위 72시간 내 신고
   - EU: 감독기관 72시간 내 신고
```

---

## 9. Compliance Checklist (운영 점검표)

### 9.1 분기별

- [ ] Sub-processor 변경 점검 (Supabase, Vercel, Upstash, GCP, Anthropic)
- [ ] Vault key rotation
- [ ] DR snapshot dry-run
- [ ] RLS policy 회귀 테스트
- [ ] Audit log 보관 기간 점검 (30일 → GCS 이관)

### 9.2 연 1회

- [ ] 전체 region failover 시뮬레이션 (Phase 3)
- [ ] Penetration test (외부 업체 의뢰)
- [ ] DPA 재검토 + sub-processor list 갱신
- [ ] 약관 갱신 검토
- [ ] 직원 보안 교육

### 9.3 이벤트별

- [ ] 신규 vendor 도입 → DPA 검토 + sub-processor list 추가
- [ ] 신규 region 진출 → 해당 지역 법령 조사 (GDPR/CCPA 등)
- [ ] Major version up → security regression test
- [ ] Personnel change → 모든 access key/credential rotation

---

## 10. 결정 요약 (Decision Log)

| 결정 | 선택 | 근거 |
|---|---|---|
| 데이터 분류 | 4-tier (T1~T4) | 보호 수준 차등 + audit 비용 최적화 |
| T1 암호화 | AES-256-GCM column-level | 부정경쟁방지법 비밀관리성 입증 |
| RLS | 모든 테넌트 테이블 강제 | 단일 multi-tenant DB의 격리 보장 |
| Audit 보관 | L1 30일 + L3 7년 | 회계법 + 영업비밀 자료 보전 |
| Backup | PITR 7d + Snapshot 30d + Weekly 1y | 다층 안전망 |
| Customer-Authorized Agent | Vault + read-only scope | 고객 키 노출 risk 최소화 |
| DR 목표 | RTO 4h / RPO 1h | 2인 팀 운영 가능 + 고객 SLA 충족 |
| GDPR/CCPA | Phase 2/3에 도입 | 현재 한국 시장 집중, 진출 시점에 적용 |

---

## 11. 미해결 / 다음 결정 필요

1. **Customer-managed encryption key (CMK)** — Phase 2 enterprise 고객 첫 요구 시 도입
2. **Penetration test 업체 선정** — Phase 2 진입 시 입찰
3. **Cyber insurance** — 첫 enterprise 계약 (ACV $50K+) 동시 가입
4. **SOC 2 Type II** — Phase 3 (24개월+), 미국 enterprise 진출 시
5. **ISO 27001** — Phase 3, 한국 대기업·공공 고객 요구 시

---

## 12. 변경 이력

| 날짜 | 버전 | 변경 | 작성자 |
|---|---|---|---|
| 2026-05-02 | 1.0 | 최초 작성, 4-tier 분류 + 부정경쟁방지법/PIPA 분리 | Mike |
