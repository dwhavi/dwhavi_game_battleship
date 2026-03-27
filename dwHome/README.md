# 🚢 Battleship Web Game

클래식 보드게임 배틀십(Battleship)의 웹 버전입니다. React + TypeScript로 제작된 싱글플레이어 게임입니다.

## 🎮 게임 소개

배틀십은 두 명의 플레이어가 각자의 함선을 보드에 배치한 후, 상대방의 함선 위치를 추측하여 공격하는 전략 보드게임입니다. 이 웹 버전에서는 AI와 대전할 수 있습니다.

### 게임 규칙
- **보드**: 10×10 그리드
- **함선**: 5척 (총 17칸)
  | 함선 | 크기 |
  |------|------|
  | 항공모함 (Carrier) | 5칸 |
  | 전함 (Battleship) | 4칸 |
  | 순양함 (Cruiser) | 3칸 |
  | 잠수함 (Submarine) | 3칸 |
  | 구축함 (Destroyer) | 2칸 |
- **진행**: 턴제, 좌표 호출로 공격
- **승리**: 상대 함선 5척 모두 격침

## ✨ 주요 기능

- 🤖 **AI 대전 모드** - 3단계 난이도 (Easy/Medium/Hard)
- 📊 **게임 통계** - 승률, 플레이 횟수 추적
- 🔊 **사운드 이펙트** - 발사, 침몰, 승리/패배 효과음
- 🎨 **커스터마이징** - 함선 배치 프리셋, 테마 변경
- 📱 **반응형 디자인** - 데스크톱 & 모바일 지원

## 🛠️ 기술 스택

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Testing**: Vitest + React Testing Library
- **Audio**: Web Audio API

## 📦 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 테스트 실행
npm test

# 프로덕션 빌드
npm run build
```

## 🎯 AI 난이도

| 난이도 | 알고리즘 | 설명 |
|--------|----------|------|
| Easy | Random | 무작위 좌표 공격 |
| Medium | Hunt/Target | Hit 시 인접 칸 우선 탐색 |
| Hard | Probability | 확률 밀도 맵 기반 최적 탐색 |

## 📁 프로젝트 구조

```
battleship-web/
├── src/
│   ├── components/     # React 컴포넌트
│   │   ├── Board/      # 게임 보드
│   │   ├── Ship/       # 함선 컴포넌트
│   │   ├── GameControls/ # 게임 컨트롤
│   │   └── Stats/      # 통계 표시
│   ├── hooks/          # 커스텀 훅
│   ├── utils/          # 유틸리티 함수
│   │   ├── gameLogic   # 게임 로직
│   │   ├── ai/         # AI 알고리즘
│   │   └── sound       # 사운드 관리
│   ├── types/          # TypeScript 타입
│   └── assets/         # 정적 리소스
├── public/
│   └── sounds/         # 사운드 파일
└── .sisyphus/
    └── plans/          # 작업 계획서
```

## 📝 개발 계획

상세 개발 계획은 [.sisyphus/plans/battleship-web-game.md](./.sisyphus/plans/battleship-web-game.md)를 참조하세요.

## 📄 라이선스

MIT License

## 🔗 참고 자료

- [배틀십 (나무위키)](https://namu.wiki/w/배틀십(보드게임))
- [Vite 공식 문서](https://vitejs.dev/)
- [Vitest 공식 문서](https://vitest.dev/)
