# LAY:D — Technical Requirements Document (TRD)

**Version:** 0.3  
**Last Updated:** 2026-03-26

---

## 1. Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React 18 + Vite |
| Routing | react-router-dom v6 |
| Styling | Inline CSS-in-JS (no CSS files) |
| Canvas | HTML5 Canvas 2D API |
| Backend (예정) | FastAPI (Python) |
| State | React useState / useRef / useMemo / useCallback |

---

## 2. Project Structure

```
src/
├── main.jsx                  # React 18 entry
├── App.jsx                   # Router (4 routes)
├── config/
│   └── fieldMap.js           # column ↔ label 변환 (product/shrink/layout)
├── data/
│   └── pageDescriptions.js   # 각 route 설명
├── mock/
│   ├── products.js           # 제품 mock (pitch, cra coeffs, shrink_ratio)
│   ├── shrinks.js            # shrink mock
│   └── layouts.js            # layout mock (productDB)
├── components/
│   ├── MiniGrid.jsx
│   ├── HeroBanner.jsx
│   ├── SectionCard.jsx
│   ├── UserSidebar.jsx
│   ├── HelpFAB.jsx
│   └── ClickCursor.jsx
├── tabs/layout/
│   ├── PlaceholderTab.jsx
│   ├── ProductTab.jsx
│   ├── DistrictTab.jsx       # cfg: actv_dum_col, actv_dum_row
│   └── ParameterTab.jsx      # 핵심 구현 파일
└── pages/
    ├── HomePage.jsx
    ├── ProductPage.jsx
    ├── ShrinkPage.jsx
    └── LayoutPage.jsx
```

---

## 3. ParameterTab.jsx — Architecture

### 3.1 Component Tree
```
ParameterTab (export default)
├── PCellDialog
│   └── AlgEditor
├── PolygonDialog
│   └── AlgEditor
├── SerifDialog
│   └── AlgEditor
├── HoleDialog
│   └── AlgEditor
├── AlignBtn (SVG 방향 버튼)
└── PreviewCanvas
    ├── Serif/HoleDialog (inline)
    └── Canvas 2D rendering
```

### 3.2 Data Models

#### PCell
```js
{
  id: string,          // uid()
  name: string,
  gridN: number,       // columns
  gridM: number,       // rows
  layer: string,       // "OD"|"POLY"|"CO"|"M1"|"VIA1"|"M2"
  shrinkRatio: number, // e.g. 0.985
  algorithms: Algorithm[],
  polygons: Polygon[]
}
```

#### Polygon
```js
{
  id: string,
  name: string,        // "P1", "P2", ...
  mode: "rect"|"poly",
  points: [{x,y}],     // PCell-local coords [0,pcW]×[0,pcH], Y-up
  rectW: number,       // rect mode only
  rectH: number,       // rect mode only
  align: AlignPos,     // 9방향
  algorithms: Algorithm[],
  serifs: Serif[],
  hole: Hole|null
}
```

#### Serif
```js
{
  id: string,
  align: AlignPos8,    // 8방향 (center 제외)
  w: number,           // nm
  h: number,           // nm
  overlapW: number,    // nm
  overlapH: number,    // nm
  algorithms: Algorithm[]
}
```

#### Hole
```js
{
  id: string,
  align: AlignPos9,    // 9방향
  gridN: number,       // columns
  gridM: number,       // rows
  holeW: number,       // nm
  holeH: number,       // nm
  spacingOn: boolean,
  gapX: number,        // manual mode
  gapY: number,        // manual mode
  disabled: [{r,c}],   // disabled hole indices
  algorithms: Algorithm[]
}
```

#### Algorithm
```js
{
  id: string,
  fn: "field",
  command: "resize"|"move",
  direction: AlignPos8 | "ALL",  // ALL은 resize 전용
  factor: string                 // 소수점 6자리 문자열
}
```

---

## 4. Coordinate System Specification

### 4.1 World Coordinate System
- Y-up (수학적 좌표계, canvas와 반대)
- PCell anchor = 좌하단 = `(coordX, coordY)`
- PCell 범위: `[coordX, coordX+pcW] × [coordY, coordY+pcH]`
- PCell local 범위: `[0, pcW] × [0, pcH]`

### 4.2 gao() — Align Offset Function
```js
// container [0,pw]×[0,ph] 내에서 (ow×oh) bbox의 bottom-left 좌표 반환
function gao(align, pw, ph, ow, oh) {
  const bx = align.includes("left") ? 0
            : align.includes("right") ? pw-ow
            : (pw-ow)/2;
  const by = align.includes("bottom") ? 0
            : align.includes("top") ? ph-oh
            : (ph-oh)/2;
  return [bx, by];
}
```

### 4.3 computeRendered() — 렌더링 좌표 계산
```
1. polygon points (PCell-local, origin 임의)
2. gao()로 align target bottom-left [bx,by] 계산
3. tx = bx - bbox.minX, ty = by - bbox.minY (이동량)
4. basePts = points.map(p => p + (tx,ty))  → PCell-local [0,pcW]×[0,pcH]
5. applyAlgs() → algorithm 적용 (ox,oy,w,h 변화)
6. oPts = basePts + alg delta + (coordX,coordY)  → World coords
7. paWorld = {ox:bx+coordX, oy:by+coordY, w, h}  → World bbox
```

### 4.4 Canvas Transform
```js
// PCell 중심이 canvas 중앙에 오도록
const vpCX = coordX + pcW/2;  // viewport center X (world)
const vpCY = coordY + pcH/2;  // viewport center Y (world)

// world → canvas
toC(wx, wy) = {
  cx: CW/2 + (wx - vpCX) * sc,
  cy: CH/2 - (wy - vpCY) * sc   // Y-up → Y-down 변환
}

// canvas → world
toW(cx, cy) = {
  wx: (cx - CW/2) / sc + vpCX,
  wy: -(cy - CH/2) / sc + vpCY
}
```

### 4.5 Scale Factor
```js
const sc = Math.min(CW / (pcW * 1.6), CH / (pcH * 1.6)) * zoom;
// PCell이 canvas 너비/높이의 약 62%를 차지
```

---

## 5. Field Algorithm

### 5.1 Field 계산 공식
```
field = sqrt(x² + y²) / sqrt((actv_dum_col × pitch / 2)² + (actv_dum_row × pitch / 2)²)
```
- `(x, y)`: 현재 좌표 (coordX, coordY)
- `actv_dum_col`, `actv_dum_row`: DistrictTab cfg 값
- `pitch`: 선택된 Product의 pitch

### 5.2 Delta 계산
```
delta = field × factor
```
- `factor`: Algorithm에서 사용자 입력 (±999,999, 소수점 6자리)

### 5.3 Algorithm 적용 순서
1. Polygon algorithm 적용 → polygon 위치/크기 결정
2. Polygon 결과 기준으로 Serif 위치 계산
3. Serif algorithm 적용
4. Polygon 결과 기준으로 Hole 위치 계산
5. Hole algorithm 적용

---

## 6. Serif Position Calculation (Y-up)

| Align | sox (x) | soy (y, bottom-left) |
|-------|---------|----------------------|
| left | `paWorld.ox - sf.w + sf.overlapW` | `paWorld.oy + paWorld.h/2 - sf.h/2` |
| right | `paWorld.ox + paWorld.w - sf.overlapW` | `paWorld.oy + paWorld.h/2 - sf.h/2` |
| top | `paWorld.ox + paWorld.w/2 - sf.w/2` | `paWorld.oy + paWorld.h - sf.overlapH` |
| bottom | `paWorld.ox + paWorld.w/2 - sf.w/2` | `paWorld.oy - sf.h + sf.overlapH` |
| top-left | left의 x, top의 y | |
| ... | 조합 | |

---

## 7. Hole Position Calculation (Y-up)

```js
// gao로 hole group bottom-left 계산
const [hax, hay] = gao(h.align, paWorld.w, paWorld.h, tW, tH);
const sX = paWorld.ox + hax;  // group bottom-left X
const sY = paWorld.oy + hay;  // group bottom-left Y

// row=0이 시각적으로 최상단 → Y-up에서 가장 큰 y값
const holeOy = sY + (M-1-row) * (hh+gY) + gY;
const holeOx = sX + gX + (hw+gX) * col;
```

---

## 8. Canvas Rendering

### 8.1 Draw Order
1. 흰색 배경 (`#ffffff`)
2. Grid lines (pitch 단위, 연한 회색)
3. PCell 경계 (dashed, 검정 22%)
4. 축 (X/Y, 점선)
5. 축 눈금 및 좌표 레이블
6. Polygon (파랑 채우기 + CYAN 테두리)
7. Serif (보라 채우기 + PURPLE 테두리)
8. Hole (주황 채우기 + ORANGE 테두리, disabled는 회색)
9. Anchor dot (노란 작은 원)
10. Ruler lines (주황 점선 + 거리 레이블)
11. Cursor 좌표 레이블

### 8.2 Rect 렌더링
```js
// Y-up bbox → canvas rect
const {cx, cy} = toC(o.ox, o.oy + o.h);  // top-left in canvas
ctx.fillRect(cx, cy, o.w * sc, -o.h * sc); // 위에서 아래로
```

---

## 9. Mock Data

### 9.1 MOCK_LAYERS
```js
[
  { name: "OD",   shrink_ratios: [0.985, 0.982] },
  { name: "POLY", shrink_ratios: [0.982] },
  { name: "CO",   shrink_ratios: [0.978, 0.975] },
  { name: "M1",   shrink_ratios: [0.975] },
  { name: "VIA1", shrink_ratios: [0.972] },
  { name: "M2",   shrink_ratios: [0.970, 0.969] },
]
```

### 9.2 MOCK_FUNCTIONS
```js
[{ name: "field" }]
```
- field: 좌표 → field 계산 → factor 곱산 → delta

---

## 10. Constraints & Rules

| Rule | Detail |
|------|--------|
| FastAPI 코드 금지 | 현재 모든 데이터는 Mock |
| 단위 | nm (나노미터) |
| 좌표 정밀도 | r3 = 소수점 3자리 반올림 |
| Factor 정밀도 | r6 = 소수점 6자리 반올림 |
| Canvas 크기 | 고정 420×630 (가로:세로 = 1:1.5) |
| Y축 방향 | Y-up (수학 좌표계) |
| PCell anchor | 좌하단 = (coordX, coordY) |
| Viewport center | PCell 중심 |

