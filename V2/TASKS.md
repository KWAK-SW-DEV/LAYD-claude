# LAY:D — Task Backlog

**Last Updated:** 2026-03-26

---

## Legend
- ✅ Done
- 🔧 In Progress
- 🔴 Todo
- ⚠️ Bug / Known Issue

---

## SPRINT 1 — Foundation

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1.1 | React 18 + Vite 프로젝트 세팅 | ✅ | react-router-dom v6 |
| 1.2 | App.jsx 4개 Route 설정 | ✅ | /, /product, /shrink, /layout |
| 1.3 | fieldMap.js 컬럼↔레이블 매핑 | ✅ | product/shrink/layout 도메인 |
| 1.4 | Mock 데이터 (products, shrinks, layouts) | ✅ | |
| 1.5 | 공통 컴포넌트 (MiniGrid, HeroBanner, SectionCard 등) | ✅ | |
| 1.6 | HomePage 구현 | ✅ | |
| 1.7 | ProductPage 구현 | ✅ | |
| 1.8 | ShrinkPage 기본 구현 | 🔧 | 기능 부족, 향후 보완 필요 |
| 1.9 | LayoutPage 기본 구현 | ✅ | 탭 구조 |

---

## SPRINT 2 — ParameterTab Core

| # | Task | Status | Notes |
|---|------|--------|-------|
| 2.1 | PCell Dialog (Grid, Layer, ShrinkRatio) | ✅ | |
| 2.2 | PCell 목록 패널 (선택/추가/편집/삭제) | ✅ | 편집버튼(✎) + 휴지통+confirm |
| 2.3 | Polygon Dialog (Rect / Free Poly 모드) | ✅ | |
| 2.4 | Polygon canvas 드로잉 (click to add point) | ✅ | |
| 2.5 | Polygon snap 설정 (pitch 단위 default, 수정 가능) | ✅ | |
| 2.6 | Polygon margin 설정 (pitch 단위) | ✅ | |
| 2.7 | Polygon point 편집 (Edit Pts 버튼 + drag) | ✅ | |
| 2.8 | Polygon Align 버튼 (9방향, SVG 변 표시) | ✅ | |
| 2.9 | Polygon 목록 패널 (선택/추가/편집/삭제) | ✅ | 편집버튼(✎) + 휴지통+confirm |
| 2.10 | AlgorithmEditor (fn/command/direction/factor) | ✅ | 순서 변경(↑), 추가/삭제 |

---

## SPRINT 3 — Serif & Hole

| # | Task | Status | Notes |
|---|------|--------|-------|
| 3.1 | SerifDialog (align 8방향, w/h/overlapW/overlapH) | ✅ | |
| 3.2 | HoleDialog (align 9방향, N×M grid, spacing) | ✅ | |
| 3.3 | Hole 개별 disable 토글 | ✅ | |
| 3.4 | Serif/Hole 추가를 Preview 액션으로 분리 | ✅ | S/H 키 → canvas 클릭 |
| 3.5 | Serif/Hole 편집 (E 키 → 객체 클릭) | ✅ | |
| 3.6 | Serif/Hole 삭제 (⇧D 키 → 객체 클릭) | ✅ | |
| 3.7 | 액션 완료 후 모드 자동 해제 | ✅ | |

---

## SPRINT 4 — Preview Canvas

| # | Task | Status | Notes |
|---|------|--------|-------|
| 4.1 | PreviewCanvas 기본 렌더링 (PCell 박스) | ✅ | |
| 4.2 | 흰색 Canvas 배경 | ✅ | |
| 4.3 | Grid lines (pitch 단위) | ✅ | |
| 4.4 | 축(X/Y) + 좌표 눈금 | ✅ | |
| 4.5 | Polygon 렌더링 (Y-up → Y-down 변환) | ✅ | |
| 4.6 | Serif 렌더링 | ✅ | |
| 4.7 | Hole 렌더링 (row=0 at top 방향) | ✅ | |
| 4.8 | 실시간 알고리즘 시뮬레이션 | ✅ | coordX/Y 변경 즉시 반영 |
| 4.9 | Canvas 고정 크기 (420×630) | ✅ | |
| 4.10 | Viewport center = PCell 중심 | ✅ | anchor = 좌하단 |
| 4.11 | Zoom 기능 (+/1:1/−) | ✅ | |
| 4.12 | 커서 좌표 레이블 (우하단 오프셋) | ✅ | canvas px 기준 |

---

## SPRINT 5 — Coordinate & Field

| # | Task | Status | Notes |
|---|------|--------|-------|
| 5.1 | 좌표 직접 입력 (x, y) | ✅ | |
| 5.2 | Field 모드 (사분면 + field값 → x,y 자동 계산) | ✅ | |
| 5.3 | Field 계산 공식 구현 | ✅ | actv_dum_col/row × pitch/2 기준 |
| 5.4 | 좌표 정보 표시 (coord + field값) | ✅ | 상단 툴바 |
| 5.5 | gao() 좌표 함수 (Y-up, [0,pw]×[0,ph] 기준) | ✅ | |
| 5.6 | computeRendered() world 좌표 계산 | ✅ | |

---

## SPRINT 6 — Ruler

| # | Task | Status | Notes |
|---|------|--------|-------|
| 6.1 | Ruler 버튼 UI (↔/↕/⟺/⇕ 4종) | ✅ | |
| 6.2 | 2-click ruler (1st click → snap to edge, 2nd click → 완성) | ✅ | |
| 6.3 | 객체 변(edge) snap | ✅ | polygon xs/ys, rect ox/oy+w/h |
| 6.4 | Ruler 거리 레이블 (nm) | ✅ | |
| 6.5 | Ruler clear 버튼 | ✅ | |
| 6.6 | 1st click 후 점선 미리보기 | ✅ | |

---

## SPRINT 7 — 미구현 탭

| # | Task | Status | Priority |
|---|------|--------|----------|
| 7.1 | UnitTab 구현 | 🔴 | High |
| 7.2 | VerificationTab 구현 | 🔴 | High |
| 7.3 | ConfirmTab (Export JSON) 구현 | 🔴 | High |

---

## SPRINT 8 — 기타 기능

| # | Task | Status | Priority |
|---|------|--------|----------|
| 8.1 | ShrinkPage 완성 (productDB shrink_ratio 연동) | 🔴 | Mid |
| 8.2 | 유저 정보 수정 | 🔴 | Mid |
| 8.3 | Topbar 검색 | 🔴 | Mid |
| 8.4 | HelpFAB 연결 | 🔴 | Mid |
| 8.5 | Product 삭제 | 🔴 | Mid |

---

## SPRINT 9 — FastAPI 연동

| # | Task | Status | Priority |
|---|------|--------|----------|
| 9.1 | FastAPI 프로젝트 세팅 | 🔴 | High (when ready) |
| 9.2 | Mock → API 교체 (products, shrinks, layouts) | 🔴 | High |
| 9.3 | ParameterTab 데이터 저장/불러오기 API | 🔴 | High |
| 9.4 | Layer/ShrinkRatio API 연동 | 🔴 | High |

---

## SPRINT 10 — 품질 개선

| # | Task | Status | Priority |
|---|------|--------|----------|
| 10.1 | MUI 마이그레이션 | 🔴 | Low |
| 10.2 | 반응형 레이아웃 | 🔴 | Low |
| 10.3 | DRC (Design Rule Check) 기능 | 🔴 | Low |
| 10.4 | Expand 기능 | 🔴 | Low |

---

## Known Bugs / Issues

| # | Bug | Status | Description |
|---|-----|--------|-------------|
| B1 | Ruler 정밀도 | ⚠️ | 복잡한 polygon에서 edge snap이 가장 가까운 edge만 선택, 특정 방향 snap 개선 여지 |
| B2 | HitTest (polygon) | ⚠️ | ray casting 방식, 복잡 비볼록 polygon에서 부정확 가능 |
| B3 | Polygon points 초기값 | ⚠️ | edit 시 polygon.points가 PCell-local이므로 기존 데이터 로드 시 확인 필요 |

