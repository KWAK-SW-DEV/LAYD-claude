# LAY:D — Product Requirements Document (PRD)

**Version:** 0.3  
**Last Updated:** 2026-03-26  
**Status:** In Development

---

## 1. Product Overview

### 1.1 Product Name
**LAY:D** — Layout Design Tool for Semiconductor OPC (Optical Proximity Correction) Pattern Engineering

### 1.2 Purpose
LAY:D는 반도체 공정에서 광학 근접 효과 보정(OPC)에 사용되는 레이아웃 패턴을 설계하는 웹 기반 도구다. 설계자가 PCell(Parameterized Cell) 기반의 Polygon 형상을 정의하고, 좌표 기반 Field 알고리즘을 통해 위치에 따른 보정값(delta)을 시뮬레이션할 수 있다.

### 1.3 Target Users
- 반도체 OPC 엔지니어
- 레이아웃 설계자
- 공정 개발 연구원

---

## 2. Product Goals

| Goal | Description |
|------|-------------|
| 정밀한 패턴 설계 | nm 단위 정밀도로 PCell/Polygon/Serif/Hole 형상 정의 |
| 실시간 시뮬레이션 | 좌표 입력 즉시 알고리즘 결과를 canvas에 반영 |
| Field 기반 보정 | 좌표에 따른 field 값 계산으로 shrink delta 자동 산출 |
| 직관적 편집 UX | 다이얼로그 기반 편집, canvas 드로잉, 단축키 지원 |

---

## 3. Pages & Navigation

| Route | Page | Description |
|-------|------|-------------|
| `/` | HomePage | 메인 대시보드 |
| `/product` | ProductPage | 제품(Product) 관리 |
| `/shrink` | ShrinkPage | Shrink 파라미터 관리 |
| `/layout` | LayoutPage | 레이아웃 설계 (핵심 페이지) |

---

## 4. LayoutPage — Tab Structure

LayoutPage는 탭 기반으로 구성된다.

| Tab | Status | Description |
|-----|--------|-------------|
| **Parameter** | ✅ 구현 중 | PCell/Polygon/Serif/Hole 파라미터 설계 |
| **Unit** | 🔴 미구현 | 단위 셀 정의 |
| **Verification** | 🔴 미구현 | 설계 검증 |
| **Confirm (Export)** | 🔴 미구현 | JSON 내보내기 |

---

## 5. ParameterTab — Core Features

### 5.1 개념 계층 구조
```
Product
  └─ LayoutPage (cfg: actv_dum_col, actv_dum_row, pitch)
       └─ PCell (Grid N×M, Layer, ShrinkRatio, Algorithms)
            └─ Polygon (shape, align, Algorithms)
                 ├─ Serif × N (outward rectangle, align 8방향)
                 └─ Hole (N×M grid, align 9방향)
```

### 5.2 PCell
- Grid: N×M (열×행)
- 크기 = Grid × Pitch (단위: nm)
- Layer: OD / POLY / CO / M1 / VIA1 / M2
- Shrink Ratio: Layer별 다중 값 선택
- Algorithm: 최대 N개, 순서 있음

### 5.3 Polygon
- 모드: Rectangle (W×H 직접 입력) / Free Polygon (클릭으로 점 추가)
- Align: PCell 내 9방향 배치
  - center → Polygon BBox 중심 = PCell 중심
  - top-left → Polygon BBox top-left = PCell top-left
  - (나머지 7방향 동일 원칙)
- Algorithm: 최대 N개

### 5.4 Serif
- Polygon에 종속, 외부 방향(outward) 직사각형
- Align: 8방향 (center 제외)
- 속성: width, height, overlapW, overlapH
- Algorithm: 최대 N개

### 5.5 Hole
- Polygon 내부 N×M 배열 관통 구멍
- Align: 9방향 (BBox 기준)
- 속성: holeW, holeH, gapX/Y (auto 또는 manual)
- 개별 hole disable 가능
- Algorithm: 최대 N개

### 5.6 Algorithm
- Function: `field` (현재 유일)
  - `field = sqrt(x²+y²) / sqrt((actv_dum_col×pitch/2)² + (actv_dum_row×pitch/2)²)`
  - `delta = field × factor`
- Command: `resize` / `move`
- Direction: 8방향 + ALL (resize 전용)
- Factor: ±999,999 (소수점 6자리)
- 순서(↑ 이동) 변경 가능

### 5.7 Preview Canvas
- 고정 크기: 420 × 630 px (가로:세로 = 1:1.5)
- 흰색 배경 (반도체 레이아웃 뷰어 스타일)
- PCell 중심이 canvas 중앙에 표시 (anchor point는 좌하단)
- 좌표계: Y-up, anchor point = PCell 좌하단 = (coordX, coordY)
- 실시간 알고리즘 시뮬레이션 반영

---

## 6. Coordinate System

```
Y
↑   PCell: [coordX, coordX+pcW] × [coordY, coordY+pcH]
|   PCell 좌하단 = anchor point = (coordX, coordY)
|   PCell 중심 = viewport center = (coordX+pcW/2, coordY+pcH/2)
└──────────────────────────→ X
(0,0)
```

- Field 계산 기준 좌표: (coordX, coordY) = PCell anchor (사분면 입력 지원)
- PCell local 좌표: [0, pcW] × [0, pcH]

---

## 7. Preview Interaction

| 액션 | 방법 |
|------|------|
| Serif 추가 | `S` 키 → canvas 클릭 → Serif Dialog |
| Hole 추가 | `H` 키 → canvas 클릭 → Hole Dialog |
| Serif/Hole 편집 | `E` 키 → 객체 클릭 → Dialog |
| Serif/Hole 삭제 | `⇧D` 키 → 객체 클릭 |
| Ruler (가로) | RULER ↔ 버튼 → 2회 클릭 (객체 변에 snap) |
| Ruler (세로) | RULER ↕ 버튼 → 2회 클릭 |
| Zoom | +/1:1/− 버튼 |

---

## 8. Data Flow

```
Mock Data (현재)
  ↓
ParameterTab state (pcells[])
  ↓
computeRendered() — 알고리즘 적용 후 world 좌표 계산
  ↓
PreviewCanvas — Canvas 2D API로 렌더링
  ↓
(미래) FastAPI → 실제 DB 데이터로 교체
```

---

## 9. Out of Scope (현재 버전)

- DB 연동 (FastAPI 교체 예정)
- UnitTab, VerificationTab, ConfirmTab 구현
- DRC (Design Rule Check) 기능
- MUI 마이그레이션
- 반응형 레이아웃
- 다중 사용자 / 협업 기능

