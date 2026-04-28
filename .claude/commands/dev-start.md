---
description: 새 작업 시작 — worktree + 브랜치 + npm install + (필요 시) brainstorming
argument-hint: <type: feature|fix|refactor|docs> <name>
---

# /dev-start

입력:
- `$1` = type (`feature` | `fix` | `refactor` | `docs` 중 하나)
- `$2` = name (kebab-case, 예: `mmm-v3`, `fadein-delay-prop`)

## 실행 순서

1. **입력 검증**
   - `$1`이 `feature` / `fix` / `refactor` / `docs` 중 하나인지 확인, 아니면 에러 메시지 출력 후 종료
   - `$2`가 `^[a-z][a-z0-9-]+$` 패턴인지 확인, 아니면 에러

2. **브랜치 / 경로 계산**
   - type별 prefix:
     - `feature` → `feat/<name>`
     - `fix` → `fix/<name>`
     - `refactor` → `refactor/<name>`
     - `docs` → `docs/<name>`
   - worktree 경로: `.worktrees/<type>-<name>/` (워크스페이스 내부)

3. **Worktree 생성**
   ```bash
   git worktree add ".worktrees/<type>-<name>" -b "<prefix>/<name>"
   ```
   이미 같은 이름의 worktree가 있으면 오류 출력 + 기존 경로 안내 후 종료.

4. **종속성 설치 (백그라운드)**
   - worktree 안의 `compass/` 서브디렉터리에서 `npm install --legacy-peer-deps`를 백그라운드로 실행
   - 사용자에게 "의존성 설치 중 — 몇 분 걸릴 수 있음" 안내

5. **타입별 후속 액션**
   - `feature` 또는 `refactor` → `superpowers:brainstorming` 스킬 자동 호출
   - `fix` → `superpowers:systematic-debugging` 스킬 자동 호출
   - `docs` → 바로 편집 모드 진입 (brainstorming 스킵)

6. **작업 디렉터리 전환 안내**
   - Claude에게 "이후 모든 파일 편집은 `.worktrees/<type>-<name>/` 디렉터리에서 수행" 알림

## 주의

- 메인 워크스페이스 루트(`/Users/mike/Downloads/Compass/`)에서 실행 가정
- 메타 파일(`docs/`, `CLAUDE.md`, `scripts/`, `README.md`, `.claude/`) 수정은 worktree 없이 main에서 해도 됨 (CLAUDE.md §16.2 참고)
- 동일한 이름의 worktree가 이미 있으면 오류 + 기존 경로 안내
- Next.js 앱은 워크스페이스의 `compass/` 서브디렉터리에 위치 — `npm install`은 거기서 실행
