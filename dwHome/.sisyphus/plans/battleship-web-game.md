# 배틀십 웹 게임 제작

## TL;DR

> **Quick Summary**: React + TypeScript로 싱글플레이어 배틀십 웹 게임 제작. AI 대전, 3단계 난이도, 통계, 사운드, 커스터마이징 기능 포함.
> 
> **Deliverables**: 
> - 반응형 웹 게임 (데스크톱 + 모바일)
> - AI 대전 모드 (Easy/Medium/Hard)
> - 게임 통계 & 기록 시스템
> - 사운드 이펙트
> - 함선 커스터마이징
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 4 waves
> **Critical Path**: Task 1 → Task 2 → Task 6 → Task 10 → Task 16 → Task 17

---

## Context

### Original Request
나무위키의 배틀십 보드게임을 기반으로 웹 게임 제작. 싱글플레이어 AI 대전 모드, 모던&미니멀 디자인, 반응형 지원.

### Interview Summary
**Key Discussions**:
- **게임 모드**: 싱글플레이어 (AI 대전)만 - 멀티플레이어는 제외
- **기술 스택**: React + TypeScript + Vitest (TDD)
- **디자인**: 모던 & 미니멀 스타일
- **규칙**: 클래식 규칙만 (Salvo 등 변형 제외)
- **프로젝트**: 새 프로젝트 생성 (battleship-web)

**Research Findings**:
- **공식 규칙**: 10×10 그리드, 5척 함선 (Carrier 5, Battleship 4, Cruiser 3, Submarine 3, Destroyer 2)
- **참고 구현**: Rare Pike, battleship-game.com - 드래그앤드롭 배치, 명확한 Hit/Miss 피드백
- **AI 전략**: Random(Easy), Hunt/Target(Medium), Probability-based(Hard)

---

## Work Objectives

### Core Objective
클래식 배틀십 규칙을 따르는 싱글플레이어 웹 게임을 React + TypeScript로 제작. AI 대전, 통계, 사운드, 커스터마이징 기능 포함.

### Concrete Deliverables
- `battleship-web/` - 새 React + TypeScript 프로젝트
- 10×10 그리드 게임 보드 UI
- 3단계 AI 난이도 (Easy/Medium/Hard)
- 로컬 스토리지 기반 통계 시스템
- Web Audio API 사운드 이펙트
- 함선 배치 저장/불러오기 기능
- 반응형 디자인 (모바일 대응)

### Definition of Done
- [ ] `npm run dev`로 게임 실행 가능
- [ ] AI와 대전 가능 (3단계 난이도)
- [ ] 승/패 통계가 로컬 스토리지에 저장됨
- [ ] 사운드 ON/OFF 가능
- [ ] 모바일에서 플레이 가능

### Must Have
- 클래식 배틀십 규칙 (10×10, 5척 함선)
- AI 대전 모드
- 3단계 AI 난이도
- 게임 통계 (승률, 플레이 횟수)
- 사운드 이펙트
- 반응형 디자인

### Must NOT Have (Guardrails)
- ❌ 멀티플레이어 모드 (온라인/로컬)
- ❌ 규칙 변형 (Salvo, 연속 공격 등)
- ❌ 백엔드 서버
- ❌ 소셜 기능 (로그인, 랭킹, 친구)
- ❌ 인앱 결제

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: NO (새 프로젝트)
- **Automated tests**: YES (TDD)
- **Framework**: Vitest + React Testing Library
- **TDD**: 각 Task는 RED → GREEN → REFACTOR 사이클 따름

### QA Policy
모든 Task는 Agent-Executed QA Scenarios 포함.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Playwright - 브라우저 열기, 클릭, 스크린샷
- **로직 테스트**: Vitest - 단위 테스트 실행

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — 프로젝트 설정 + 타입 + 기본):
├── Task 1: 프로젝트 초기 설정 (Vite + React + TS + Vitest) [quick]
├── Task 2: 타입 정의 (GameState, Ship, Cell 등) [quick]
├── Task 3: 게임 로직 유틸리티 (검증, 충돌 감지) [quick]
├── Task 4: 기본 UI 컴포넌트 (Cell, Grid) [visual-engineering]
└── Task 5: 사운드 시스템 설정 [quick]

Wave 2 (After Wave 1 — 핵심 로직 + AI):
├── Task 6: 게임 상태 관리 훅 (useGameState) [deep]
├── Task 7: AI Easy (무작위 공격) [quick]
├── Task 8: AI Medium (Hunt/Target 알고리즘) [unspecified-high]
├── Task 9: AI Hard (확률 기반 탐색) [deep]
└── Task 10: 함선 배치 UI (드래그앤드롭 + 회전) [visual-engineering]

Wave 3 (After Wave 2 — UI 완성 + 기능):
├── Task 11: 게임 보드 컴포넌트 (양쪽 보드) [visual-engineering]
├── Task 12: 게임 컨트롤 (시작, 재시작, 난이도) [quick]
├── Task 13: 통계 시스템 (로컬 스토리지) [quick]
└── Task 14: 함선 커스터마이징 (테마, 배치 저장) [visual-engineering]

Wave 4 (After Wave 3 — 통합 + 최적화):
├── Task 15: 반응형 디자인 적용 [visual-engineering]
├── Task 16: 게임 플로우 통합 [deep]
└── Task 17: 최종 QA 및 버그 수정 [unspecified-high]

Critical Path: T1 → T2 → T6 → T10 → T16 → T17
Max Concurrent: 5 (Wave 1)
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|------------|--------|
| 1 | - | 2, 3, 4, 5 |
| 2 | 1 | 6, 7, 8, 9 |
| 3 | 1, 2 | 6, 10 |
| 4 | 1, 2 | 11 |
| 5 | 1 | 11, 16 |
| 6 | 2, 3 | 10, 11, 16 |
| 7 | 2, 6 | 16 |
| 8 | 2, 6, 7 | 16 |
| 9 | 2, 6, 8 | 16 |
| 10 | 3, 6 | 11, 16 |
| 11 | 4, 6, 10 | 16 |
| 12 | 11 | 16 |
| 13 | 6 | 16 |
| 14 | 10 | 16 |
| 15 | 11, 12 | 17 |
| 16 | 6, 7, 8, 9, 10, 11, 12, 13, 14 | 17 |
| 17 | 15, 16 | - |

### Agent Dispatch Summary
- **Wave 1**: 5 tasks → T1-T3, T5 → `quick`, T4 → `visual-engineering`
- **Wave 2**: 5 tasks → T7 → `quick`, T6, T9 → `deep`, T8 → `unspecified-high`, T10 → `visual-engineering`
- **Wave 3**: 4 tasks → T12, T13 → `quick`, T11, T14 → `visual-engineering`
- **Wave 4**: 3 tasks → T15 → `visual-engineering`, T16 → `deep`, T17 → `unspecified-high`

---

## TODOs

- [ ] 1. 프로젝트 초기 설정

  **What to do**:
  - Vite + React + TypeScript 프로젝트 생성 (`npm create vite@latest battleship-web -- --template react-ts`)
  - Vitest + React Testing Library 설치 및 설정
  - 기본 디렉토리 구조 생성 (components, hooks, utils, types, assets)
  - ESLint + Prettier 설정
  - Tailwind CSS 설치 및 설정 (모던&미니멀 디자인용)

  **Must NOT do**:
  - 백엔드 관련 패키지 설치 (express, socket.io 등)
  - 불필요한 UI 라이브러리 과도한 설치

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 표준적인 프로젝트 설정 작업
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (모든 Task의 의존성)
  - **Parallel Group**: Wave 1 (시작)
  - **Blocks**: 2, 3, 4, 5
  - **Blocked By**: None

  **References**:
  - Vite 공식 템플릿: `https://vitejs.dev/guide/#scaffolding-your-first-vite-project`
  - Vitest 설정: `https://vitest.dev/guide/`

  **Acceptance Criteria**:
  - [ ] `npm run dev` 실행 시 개발 서버 시작
  - [ ] `npm test` 실행 시 Vitest 실행
  - [ ] TypeScript strict mode 활성화

  **QA Scenarios**:
  ```
  Scenario: 프로젝트 설정 검증
    Tool: Bash
    Steps:
      1. cd battleship-web && npm install
      2. npm run dev (백그라운드 실행)
      3. curl http://localhost:5173 | grep -q "Vite"
    Expected Result: 개발 서버 정상 실행, HTML 응답
    Evidence: .sisyphus/evidence/task-01-setup.txt
  ```

  **Commit**: NO (Wave 1 완료 후)

---

- [ ] 2. 타입 정의

  **What to do**:
  - `src/types/game.ts` 생성
  - 핵심 타입 정의:
    - `CellStatus`: 'empty' | 'ship' | 'hit' | 'miss'
    - `ShipType`: 'carrier' | 'battleship' | 'cruiser' | 'submarine' | 'destroyer'
    - `Ship`: { type, positions, hits, sunk, size }
    - `Cell`: { status, shipId? }
    - `Board`: Cell[][]
    - `GamePhase`: 'setup' | 'playing' | 'gameover'
    - `Difficulty`: 'easy' | 'medium' | 'hard'
    - `GameState`: { phase, playerBoard, enemyBoard, playerShips, enemyShips, currentTurn, winner }
    - `GameStats`: { gamesPlayed, wins, losses, winRate }
  - 함선 크기 상수 정의: `SHIP_SIZES`

  **Must NOT do**:
  - 멀티플레이어 관련 타입 추가 (Room, Player 등)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 타입 정의는 단순하고 명확한 작업
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Task 3, 4, 5와 병렬)
  - **Parallel Group**: Wave 1
  - **Blocks**: 6, 7, 8, 9
  - **Blocked By**: 1

  **References**:
  - 클래식 배틀십 규칙 기반 타입 설계

  **Acceptance Criteria**:
  - [ ] TypeScript 컴파일 에러 없음 (`tsc --noEmit`)
  - [ ] 모든 타입 export 됨

  **QA Scenarios**:
  ```
  Scenario: 타입 정의 검증
    Tool: Bash
    Steps:
      1. cd battleship-web && npx tsc --noEmit
    Expected Result: No TypeScript errors
    Evidence: .sisyphus/evidence/task-02-types.txt
  ```

  **Commit**: NO (Wave 1 완료 후)

---

- [ ] 3. 게임 로직 유틸리티

  **What to do**:
  - `src/utils/gameLogic.ts` 생성
  - 함수 구현:
    - `createEmptyBoard(): Board` - 10×10 빈 보드 생성
    - `canPlaceShip(board, ship, positions): boolean` - 배치 가능 여부 확인
    - `placeShip(board, ship): Board` - 함선 배치
    - `isValidPosition(positions): boolean` - 좌표 유효성 검사 (10×10 범위 내)
    - `checkCollision(board, positions): boolean` - 다른 함선과 충돌 확인
    - `fireShot(board, position): { board, result: CellStatus }` - 발사 처리
    - `checkShipSunk(ship): boolean` - 함선 침몰 확인
    - `checkAllShipsSunk(ships): boolean` - 승리 조건 확인
    - `getRandomPosition(): [number, number]` - 무작위 좌표 생성
  - TDD: 각 함수별 테스트 먼저 작성

  **Must NOT do**:
  - UI 관련 로직 포함

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 순수 함수 로직, TDD로 검증 가능
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Task 2, 4, 5와 병렬)
  - **Parallel Group**: Wave 1
  - **Blocks**: 6, 10
  - **Blocked By**: 1, 2

  **References**:
  - 배틀십 규칙: 10×10 그리드, 함선 배치 규칙 (수직/수평, 겹침 불가)

  **Acceptance Criteria**:
  - [ ] `npm test src/utils/gameLogic.test.ts` 통과
  - [ ] 최소 10개 이상의 테스트 케이스

  **QA Scenarios**:
  ```
  Scenario: 게임 로직 테스트
    Tool: Bash
    Steps:
      1. cd battleship-web && npm test src/utils/gameLogic.test.ts
    Expected Result: All tests pass
    Evidence: .sisyphus/evidence/task-03-logic.txt
  ```

  **Commit**: NO (Wave 1 완료 후)

---

- [ ] 4. 기본 UI 컴포넌트

  **What to do**:
  - `src/components/Cell/Cell.tsx` 생성:
    - props: status (empty/ship/hit/miss), onClick, isHoverable
    - Tailwind로 모던&미니멀 스타일링
    - 상태별 색상: empty(회색), ship(남색), hit(빨강), miss(흰색)
  - `src/components/Grid/Grid.tsx` 생성:
    - props: board, onCellClick, isInteractive, label
    - 10×10 그리드 렌더링
    - 좌표 라벨 (A-J, 1-10)
  - TDD: React Testing Library로 컴포넌트 테스트

  **Must NOT do**:
  - 과도한 애니메이션/이펙트
  - 멀티플레이어 관련 UI

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI 컴포넌트 스타일링 및 시각적 피드백
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Task 2, 3, 5와 병렬)
  - **Parallel Group**: Wave 1
  - **Blocks**: 11
  - **Blocked By**: 1, 2

  **References**:
  - 모던&미니멀 디자인 가이드
  - 참고: battleship-game.com UI 패턴

  **Acceptance Criteria**:
  - [ ] Cell 컴포넌트 4가지 상태 렌더링
  - [ ] Grid 컴포넌트 10×10 렌더링 + 라벨
  - [ ] `npm test` 통과

  **QA Scenarios**:
  ```
  Scenario: 컴포넌트 렌더링 검증
    Tool: Playwright
    Steps:
      1. Storybook 또는 테스트 페이지에서 Cell/Grid 렌더링
      2. 각 상태별 스크린샷 캡처
    Expected Result: 모든 상태가 올바른 색상으로 렌더링
    Evidence: .sisyphus/evidence/task-04-components.png
  ```

  **Commit**: NO (Wave 1 완료 후)

---

- [ ] 5. 사운드 시스템 설정

  **What to do**:
  - `src/utils/sound.ts` 생성
  - Web Audio API로 사운드 관리:
    - `SoundManager` 클래스 구현
    - `play(soundType: 'hit' | 'miss' | 'sunk' | 'win' | 'lose' | 'click')`
    - `setMuted(muted: boolean)`
    - `setVolume(volume: number)`
  - 무료 사운드 이펙트 다운로드 및 `public/sounds/` 배치
  - `useSound` 커스텀 훅 생성

  **Must NOT do**:
  - 외부 사운드 라이브러리 과도한 사용 (howler.js 등은 필요시만)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 간단한 오디오 유틸리티 구현
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Task 2, 3, 4와 병렬)
  - **Parallel Group**: Wave 1
  - **Blocks**: 11, 16
  - **Blocked By**: 1

  **References**:
  - Web Audio API: `https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API`
  - 무료 사운드: freesound.org

  **Acceptance Criteria**:
  - [ ] 사운드 파일 6개 이상 준비
  - [ ] SoundManager 정상 동작
  - [ ] 음소거/볼륨 조절 가능

  **QA Scenarios**:
  ```
  Scenario: 사운드 시스템 검증
    Tool: Bash + Playwright
    Steps:
      1. 유닛 테스트로 SoundManager 함수 검증
      2. 브라우저에서 사운드 재생 확인 (자동 재생 정책 고려)
    Expected Result: 모든 사운드 타입 재생 가능
    Evidence: .sisyphus/evidence/task-05-sound.txt
  ```

  **Commit**: NO (Wave 1 완료 후)

---

- [ ] 6. 게임 상태 관리 훅

  **What to do**:
  - `src/hooks/useGameState.ts` 생성
  - 상태 관리:
    - `gameState`: 전체 게임 상태 (phase, boards, ships, turn, winner)
    - `difficulty`: AI 난이도
    - `isPlayerTurn`: 플레이어 턴 여부
  - 액션 함수:
    - `startGame(difficulty)` - 게임 시작
    - `placePlayerShip(ship, positions)` - 플레이어 함선 배치
    - `randomizePlayerShips()` - 무작위 배치
    - `playerFire(position)` - 플레이어 발사
    - `aiFire()` - AI 발사 (난이도별 로직 호출)
    - `resetGame()` - 게임 초기화
  - TDD: 각 액션별 테스트 작성

  **Must NOT do**:
  - 멀티플레이어 상태 관리 로직

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 게임의 핵심 상태 관리 로직, 복잡한 상태 전이
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (핵심 의존성)
  - **Parallel Group**: Wave 2 (Task 1-5 완료 후)
  - **Blocks**: 10, 11, 16
  - **Blocked By**: 2, 3

  **References**:
  - React useReducer 패턴
  - 배틀십 게임 플로우: Setup → Playing → GameOver

  **Acceptance Criteria**:
  - [ ] 모든 액션 함수 구현
  - [ ] `npm test src/hooks/useGameState.test.ts` 통과
  - [ ] 상태 전이가 올바르게 동작

  **QA Scenarios**:
  ```
  Scenario: 게임 상태 관리 테스트
    Tool: Bash
    Steps:
      1. npm test src/hooks/useGameState.test.ts
    Expected Result: All tests pass (최소 8개 테스트)
    Evidence: .sisyphus/evidence/task-06-state.txt
  ```

  **Commit**: NO (Wave 2 완료 후)

---

- [ ] 7. AI Easy (무작위 공격)

  **What to do**:
  - `src/utils/ai/easy.ts` 생성
  - 알고리즘:
    - 이미 발사한 위치 제외
    - 무작위 좌표 선택
    - 발사 결과 반환
  - `getEasyAIMove(board, previousShots): [number, number]`
  - TDD: 무작위성 테스트 (같은 위치 중복 안 됨)

  **Must NOT do**:
  - 복잡한 전략 로직

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 단순한 무작위 알고리즘
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Task 8, 9, 10과 병렬)
  - **Parallel Group**: Wave 2
  - **Blocks**: 16
  - **Blocked By**: 2, 6

  **References**:
  - Easy AI: 순수 무작위 선택

  **Acceptance Criteria**:
  - [ ] 이미 발사한 위치 선택하지 않음
  - [ ] 유효한 좌표만 반환
  - [ ] 테스트 통과

  **QA Scenarios**:
  ```
  Scenario: Easy AI 검증
    Tool: Bash
    Steps:
      1. npm test src/utils/ai/easy.test.ts
      2. 100회 연속 호출 시 중복 없는지 확인
    Expected Result: All tests pass, no duplicates in 100 calls
    Evidence: .sisyphus/evidence/task-07-ai-easy.txt
  ```

  **Commit**: NO (Wave 2 완료 후)

---

- [ ] 8. AI Medium (Hunt/Target 알고리즘)

  **What to do**:
  - `src/utils/ai/medium.ts` 생성
  - 알고리즘:
    - **Hunt 모드**: 무작위 탐색
    - **Target 모드**: Hit 시 인접 4방향 우선 탐색
    - Hit 위치 큐 관리
    - 침몰 시 해당 함선 Hit 위치들 제거
  - `getMediumAIMove(board, previousShots, hitQueue): [number, number]`
  - TDD: Hunt/Target 전환 테스트

  **Must NOT do**:
  - 확률 기반 복잡한 계산

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 중간 복잡도의 알고리즘, 상태 관리 필요
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Task 7, 9, 10과 병렬)
  - **Parallel Group**: Wave 2
  - **Blocks**: 16
  - **Blocked By**: 2, 6, 7

  **References**:
  - Hunt/Target 알고리즘: Hit 시 인접 칸 탐색

  **Acceptance Criteria**:
  - [ ] Hit 시 인접 4방향 우선 탐색
  - [ ] 침몰 시 Target 모드 종료
  - [ ] 테스트 통과

  **QA Scenarios**:
  ```
  Scenario: Medium AI 검증
    Tool: Bash
    Steps:
      1. npm test src/utils/ai/medium.test.ts
      2. Hit 발생 후 인접 칸 탐색 확인
    Expected Result: All tests pass, adjacent targeting works
    Evidence: .sisyphus/evidence/task-08-ai-medium.txt
  ```

  **Commit**: NO (Wave 2 완료 후)

---

- [ ] 9. AI Hard (확률 기반 탐색)

  **What to do**:
  - `src/utils/ai/hard.ts` 생성
  - 알고리즘:
    - **Probability Density Map**: 각 셀에 함선이 있을 확률 계산
    - 남은 함선 크기 기반 확률 업데이트
    - 가장 높은 확률 좌표 선택
    - Hit/Miss 시 확률 맵 재계산
  - `getHardAIMove(board, previousShots, remainingShips): [number, number]`
  - TDD: 확률 계산 정확성 테스트

  **Must NOT do**:
  - 치트 (상대 함선 위치 미리 알기)

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 복잡한 확률 계산 알고리즘
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Task 7, 8, 10과 병렬)
  - **Parallel Group**: Wave 2
  - **Blocks**: 16
  - **Blocked By**: 2, 6, 8

  **References**:
  - Probability Density Map 알고리즘
  - 참고: Battleship AI 최적 전략 연구

  **Acceptance Criteria**:
  - [ ] 확률 맵 정확하게 계산
  - [ ] 가장 높은 확률 좌표 선택
  - [ ] Easy/Medium보다 승률 높음 (테스트 시뮬레이션)

  **QA Scenarios**:
  ```
  Scenario: Hard AI 검증
    Tool: Bash
    Steps:
      1. npm test src/utils/ai/hard.test.ts
      2. 100게임 시뮬레이션으로 Easy/Medium보다 평균 턴 수 적은지 확인
    Expected Result: All tests pass, better performance than Medium
    Evidence: .sisyphus/evidence/task-09-ai-hard.txt
  ```

  **Commit**: NO (Wave 2 완료 후)

---

- [ ] 10. 함선 배치 UI (드래그앤드롭 + 회전)

  **What to do**:
  - `src/components/ShipPlacement/ShipPlacement.tsx` 생성
  - 기능:
    - 드래그앤드롭으로 함선 배치
    - R 키 또는 버튼으로 함선 회전 (수직/수평)
    - 배치 불가 시 시각적 피드백 (빨간 표시)
    - 무작위 배치 버튼
    - 전체 초기화 버튼
    - 함선 목록 표시 (배치 완료/미완료 상태)
  - TDD: 드래그앤드롭 인터랙션 테스트

  **Must NOT do**:
  - 규칙 위반 배치 허용

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 복잡한 드래그앤드롭 UI 인터랙션
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Task 7, 8, 9와 병렬)
  - **Parallel Group**: Wave 2
  - **Blocks**: 11, 16
  - **Blocked By**: 3, 6

  **References**:
  - HTML5 Drag and Drop API
  - 참고: Slap Games 배치 UI 패턴

  **Acceptance Criteria**:
  - [ ] 드래그앤드롭 동작
  - [ ] 회전 기능 동작
  - [ ] 배치 검증 피드백
  - [ ] 모든 함선 배치 시 게임 시작 가능

  **QA Scenarios**:
  ```
  Scenario: 함선 배치 UI 검증
    Tool: Playwright
    Steps:
      1. 함선 드래그하여 보드에 배치
      2. R 키로 회전
      3. 겹치는 위치에 배치 시도
    Expected Result: 정상 배치 동작, 충돌 시 배치 차단
    Evidence: .sisyphus/evidence/task-10-placement.png
  ```

  **Commit**: NO (Wave 2 완료 후)

---

- [ ] 11. 게임 보드 컴포넌트 (양쪽 보드)

  **What to do**:
  - `src/components/GameBoard/GameBoard.tsx` 생성
  - 기능:
    - 플레이어 보드 (왼쪽/아래) + 적 보드 (오른쪽/위)
    - 적 보드만 클릭 가능 (발사)
    - 턴 표시 (Player's Turn / AI's Turn)
    - Hit/Miss 애니메이션
    - 침몰한 함선 표시
    - 게임 종료 시 모든 함선 공개
  - `src/components/GameBoard/PlayerBoard.tsx` 생성
  - `src/components/GameBoard/EnemyBoard.tsx` 생성

  **Must NOT do**:
  - 적 함선 미리 표시 (치팅 방지)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 복잡한 게임 보드 UI, 양쪽 보드 동기화
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Task 12, 13, 14와 병렬)
  - **Parallel Group**: Wave 3
  - **Blocks**: 16
  - **Blocked By**: 4, 6, 10

  **References**:
  - 참고: battleship-game.com 보드 레이아웃

  **Acceptance Criteria**:
  - [ ] 양쪽 보드 정상 렌더링
  - [ ] 적 보드 클릭으로 발사
  - [ ] Hit/Miss 시각적 피드백
  - [ ] 턴 표시 정상 동작

  **QA Scenarios**:
  ```
  Scenario: 게임 보드 UI 검증
    Tool: Playwright
    Steps:
      1. 게임 시작 후 양쪽 보드 확인
      2. 적 보드 클릭으로 발사
      3. Hit/Miss 결과 확인
    Expected Result: 양쪽 보드 렌더링, 발사 동작, 결과 표시
    Evidence: .sisyphus/evidence/task-11-gameboard.png
  ```

  **Commit**: NO (Wave 3 완료 후)

---

- [ ] 12. 게임 컨트롤 (시작, 재시작, 난이도)

  **What to do**:
  - `src/components/GameControls/GameControls.tsx` 생성
  - 기능:
    - 난이도 선택 드롭다운 (Easy/Medium/Hard)
    - 게임 시작 버튼
    - 재시작 버튼
    - 음소거 토글 버튼
    - 현재 게임 상태 표시 (배치 중 / 진행 중 / 종료)
  - 난이도별 아이콘 또는 색상 구분

  **Must NOT do**:
  - 게임 중 난이도 변경 허용

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 단순한 컨트롤 UI 컴포넌트
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Task 11, 13, 14와 병렬)
  - **Parallel Group**: Wave 3
  - **Blocks**: 16
  - **Blocked By**: 11

  **References**:
  - 모던 UI 버튼/드롭다운 패턴

  **Acceptance Criteria**:
  - [ ] 난이도 선택 동작
  - [ ] 게임 시작/재시작 동작
  - [ ] 음소거 토글 동작
  - [ ] 게임 상태 표시

  **QA Scenarios**:
  ```
  Scenario: 게임 컨트롤 검증
    Tool: Playwright
    Steps:
      1. 난이도 선택
      2. 게임 시작 버튼 클릭
      3. 재시작 버튼 클릭
    Expected Result: 모든 컨트롤 정상 동작
    Evidence: .sisyphus/evidence/task-12-controls.png
  ```

  **Commit**: NO (Wave 3 완료 후)

---

- [ ] 13. 통계 시스템 (로컬 스토리지)

  **What to do**:
  - `src/utils/stats.ts` 생성
  - 기능:
    - `saveGameResult(result: 'win' | 'lose', difficulty)` - 게임 결과 저장
    - `getStats(): GameStats` - 통계 조회
    - `resetStats()` - 통계 초기화
  - 통계 항목:
    - 총 게임 수
    - 승리 횟수
    - 패배 횟수
    - 승률 (%)
    - 난이도별 통계
    - 연속 승리/패배
  - `src/components/Stats/Stats.tsx` - 통계 표시 컴포넌트

  **Must NOT do**:
  - 외부 서버로 데이터 전송

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 로컬 스토리지 기반 단순 CRUD
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Task 11, 12, 14와 병렬)
  - **Parallel Group**: Wave 3
  - **Blocks**: 16
  - **Blocked By**: 6

  **References**:
  - localStorage API

  **Acceptance Criteria**:
  - [ ] 게임 결과 저장 동작
  - [ ] 통계 조회/표시 동작
  - [ ] 통계 초기화 동작
  - [ ] 승률 정확히 계산

  **QA Scenarios**:
  ```
  Scenario: 통계 시스템 검증
    Tool: Playwright
    Steps:
      1. 게임 완료 (승리 또는 패배)
      2. 통계 화면 확인
      3. 통계 초기화
    Expected Result: 통계 정확히 저장 및 표시
    Evidence: .sisyphus/evidence/task-13-stats.png
  ```

  **Commit**: NO (Wave 3 완료 후)

---

- [ ] 14. 함선 커스터마이징 (테마, 배치 저장)

  **What to do**:
  - `src/utils/presets.ts` 생성
  - 기능:
    - `savePreset(name, ships)` - 함선 배치 프리셋 저장
    - `loadPreset(name)` - 프리셋 불러오기
    - `deletePreset(name)` - 프리셋 삭제
    - `getPresetList()` - 프리셋 목록 조회
  - `src/components/Customization/Customization.tsx` 생성
  - 기능:
    - 프리셋 저장/불러오기 UI
    - 보드 테마 선택 (클래식/다크/오션)
    - 함선 색상 커스터마이징

  **Must NOT do**:
  - 규칙 위반 프리셋 저장 허용

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 커스터마이징 UI, 테마 변경
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Task 11, 12, 13과 병렬)
  - **Parallel Group**: Wave 3
  - **Blocks**: 16
  - **Blocked By**: 10

  **References**:
  - localStorage API

  **Acceptance Criteria**:
  - [ ] 프리셋 저장/불러오기 동작
  - [ ] 테마 변경 동작
  - [ ] 최대 5개 프리셋 저장 가능

  **QA Scenarios**:
  ```
  Scenario: 커스터마이징 검증
    Tool: Playwright
    Steps:
      1. 함선 배치 후 프리셋 저장
      2. 새 게임 시작 후 프리셋 불러오기
      3. 테마 변경
    Expected Result: 프리셋 정상 저장/로드, 테마 적용
    Evidence: .sisyphus/evidence/task-14-customization.png
  ```

  **Commit**: NO (Wave 3 완료 후)

---

- [ ] 15. 반응형 디자인 적용

  **What to do**:
  - 모든 컴포넌트에 반응형 스타일 적용
  - 브레이크포인트:
    - Mobile: < 640px (세로 레이아웃)
    - Tablet: 640px - 1024px
    - Desktop: > 1024px (가로 레이아웃)
  - 모바일 최적화:
    - 보드 크기 자동 조절
    - 터치 드래그앤드롭 지원
    - 함선 배치 UI 세로 배치
    - 버튼 크기 확대 (터치 친화적)
  - Tailwind responsive classes 활용

  **Must NOT do**:
  - 모바일에서 기능 제거

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 반응형 UI/UX 최적화
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Task 16과 병렬)
  - **Parallel Group**: Wave 4
  - **Blocks**: 17
  - **Blocked By**: 11, 12

  **References**:
  - Tailwind CSS responsive design
  - 모바일 터치 이벤트 처리

  **Acceptance Criteria**:
  - [ ] 375px (iPhone SE)에서 플레이 가능
  - [ ] 768px (iPad)에서 플레이 가능
  - [ ] 1440px (Desktop)에서 플레이 가능
  - [ ] 터치 드래그앤드롭 동작

  **QA Scenarios**:
  ```
  Scenario: 반응형 디자인 검증
    Tool: Playwright
    Steps:
      1. 375px 뷰포트에서 게임 플레이
      2. 768px 뷰포트에서 게임 플레이
      3. 1440px 뷰포트에서 게임 플레이
      4. 각 크기별 스크린샷 캡처
    Expected Result: 모든 크기에서 UI 깨짐 없이 플레이 가능
    Evidence: .sisyphus/evidence/task-15-responsive.png
  ```

  **Commit**: NO (Wave 4 완료 후)

---

- [ ] 16. 게임 플로우 통합

  **What to do**:
  - `src/App.tsx` 메인 게임 플로우 구성
  - 게임 단계별 화면:
    1. **메인 화면**: 게임 타이틀, 시작 버튼, 통계 보기
    2. **배치 화면**: 함선 배치, 프리셋 선택, 게임 시작
    3. **전투 화면**: 양쪽 보드, 컨트롤, 상태 표시
    4. **결과 화면**: 승리/패배, 통계 업데이트, 재시작
  - 상태 전이 로직 연결
  - 사운드 효과 연결 (발사, 침몰, 승리, 패배)
  - AI 턴 자동 진행 (딜레이 500ms)

  **Must NOT do**:
  - 멀티플레이어 플로우 포함

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 전체 게임 플로우 통합, 복잡한 상태 전이
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Task 15와 병렬)
  - **Parallel Group**: Wave 4
  - **Blocks**: 17
  - **Blocked By**: 6, 7, 8, 9, 10, 11, 12, 13, 14

  **References**:
  - React 상태 관리 패턴
  - 배틀십 게임 플로우: Setup → Playing → GameOver

  **Acceptance Criteria**:
  - [ ] 메인 → 배치 → 전투 → 결과 플로우 동작
  - [ ] AI 턴 자동 진행
  - [ ] 사운드 정상 재생
  - [ ] 승리/패배 조건 정확

  **QA Scenarios**:
  ```
  Scenario: 전체 게임 플로우 검증
    Tool: Playwright
    Steps:
      1. 메인 화면에서 게임 시작
      2. 함선 배치 완료
      3. 전투 진행 (승리 또는 패배까지)
      4. 결과 화면 확인
      5. 재시작
    Expected Result: 전체 플로우 정상 동작
    Evidence: .sisyphus/evidence/task-16-flow.mp4
  ```

  **Commit**: NO (Wave 4 완료 후)

---

- [ ] 17. 최종 QA 및 버그 수정

  **What to do**:
  - 전체 테스트 스위트 실행 (`npm test`)
  - TypeScript 타입 검사 (`tsc --noEmit`)
  - 프로덕션 빌드 테스트 (`npm run build`)
  - 수동 QA:
    - Easy/Medium/Hard 난이도별 1게임씩 플레이
    - 모바일에서 전체 플레이
    - 통계 저장/조회 확인
    - 프리셋 저장/불러오기 확인
    - 사운드 ON/OFF 확인
  - 발견된 버그 수정
  - 성능 최적화 (불필요한 리렌더링 제거)

  **Must NOT do**:
  - 새 기능 추가

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 포괄적인 QA 및 버그 수정
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (최종 단계)
  - **Parallel Group**: Wave 4 (Task 15, 16 완료 후)
  - **Blocks**: None
  - **Blocked By**: 15, 16

  **References**:
  - React DevTools 프로파일링
  - Lighthouse 성능 측정

  **Acceptance Criteria**:
  - [ ] 모든 테스트 통과
  - [ ] TypeScript 에러 없음
  - [ ] 프로덕션 빌드 성공
  - [ ] 3가지 난이도 모두 플레이 가능
  - [ ] 치명적 버그 0개

  **QA Scenarios**:
  ```
  Scenario: 최종 QA 검증
    Tool: Bash + Playwright
    Steps:
      1. npm test
      2. npm run build
      3. Playwright로 전체 게임 플레이 (각 난이도)
      4. Lighthouse 성능 측정
    Expected Result: All tests pass, build success, no critical bugs
    Evidence: .sisyphus/evidence/task-17-final-qa.txt
  ```

  **Commit**: YES
  - Message: `feat: 배틀십 웹 게임 완성`
  - Files: 전체 프로젝트
  - Pre-commit: `npm test && npm run build`

---

## Final Verification Wave (MANDATORY)

- [ ] F1. **Plan Compliance Audit** — `oracle`
  모든 "Must Have" 구현 확인, "Must NOT Have" 미포함 확인, Evidence 파일 존재 확인.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  `tsc --noEmit` + `npm test` + lint 통과 확인. AI slop 패턴 점검.
  Output: `Build [PASS/FAIL] | Tests [N pass/N fail] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` + `playwright`
  모든 QA Scenario 실행, Evidence 캡처.
  Output: `Scenarios [N/N pass] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  각 Task별 "What to do"와 실제 구현 일치 확인. 범위 벗어난 변경사항 없는지 확인.
  Output: `Tasks [N/N compliant] | VERDICT`

---

## Commit Strategy

- **Wave 1 완료**: `feat: 프로젝트 초기 설정 및 기본 컴포넌트`
- **Wave 2 완료**: `feat: AI 로직 및 함선 배치 UI 구현`
- **Wave 3 완료**: `feat: 게임 UI 완성 및 통계 시스템`
- **Wave 4 완료**: `feat: 반응형 디자인 및 최종 통합`

---

## Success Criteria

### Verification Commands
```bash
cd battleship-web
npm install          # 의존성 설치
npm run dev          # 개발 서버 실행
npm test             # 테스트 실행
npm run build        # 프로덕션 빌드
```

### Final Checklist
- [ ] 게임 실행 가능 (`npm run dev`)
- [ ] AI 대전 가능 (3단계 난이도)
- [ ] 통계 저장/조회 가능
- [ ] 사운드 ON/OFF 가능
- [ ] 모바일에서 플레이 가능
- [ ] 모든 테스트 통과
