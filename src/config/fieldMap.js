/**
 * fieldMap.js
 * FastAPI 컬럼명 ↔ UI 표시명 양방향 매핑 설정 파일
 *
 * - 모든 페이지의 필드 정의는 이 파일 하나에서 관리
 * - key   : FastAPI 응답의 컬럼명 (snake_case)
 * - value : UI에 표시할 사용자 친화적 레이블
 *
 * 새 도메인 추가 시 하단에 섹션 추가
 */

export const fieldMap = {

  // —— Product ————————————————————————————————————————————————————

  product: {
    prod_id:     "Product ID",
    prod_nm:     "Product Name",
    prod_ver:    "Version",
    prod_desc:   "Description",
    pixel_size:  "Pixel Size (μm)",
    resolution:  "Resolution (MP)",
    sensor_size: "Sensor Size",
    release_dt:  "Release Date",
    status:      "Status",
  },

  // —— Shrink ————————————————————————————————————————————————————

  shrink: {
    shrink_id:   "Shrink ID",
    prod_nm:     "Product Name",
    prod_ver:    "Version",
    cra_center:  "CRA Center (°)",
    cra_corner:  "CRA Corner (°)",
    cra_margin:  "CRA Margin (°)",
    shrink_ratio: "Shrink Ratio (%)",
    target_nm:   "Target Node (nm)",
    measure_dt:  "Measured Date",
    engineer:    "Engineer",
    status:      "Status",
  },

  // —— Layout ————————————————————————————————————————————————————

  layout: {
    layout_id:    "Layout ID",
    prod_code:    "Product Code",
    top_cell:     "Top Cell",
    total_col:    "Total Area Col [ea]",
    total_row:    "Total Area Row [ea]",
    actv_dum_col: "Actv. Dum. Col [ea]",
    actv_dum_row: "Actv. Dum. Row [ea]",
    dist_left:    "District Left [ea]",
    dist_top:     "District Top [ea]",
    dist_right:   "District Right [ea]",
    dist_bottom:  "District Bottom [ea]",
    pitch:        "Pitch [um]",
    cra_coeffs:   "CRA Coefficients",
    shrink_ratio: "Shrink Ratio",
    created_dt:   "Created Date",
    status:       "Status",
  },

};

/**
 * 컬럼명 → UI 표시명
 * @param {string} domain  - 'product' | 'shrink' | 'layout'
 * @param {string} col     - FastAPI 컬럼명
 */
export const toLabel = (domain, col) =>
  fieldMap[domain]?.[col] ?? col;

/**
 * UI 표시명 → 컬럼명 (역방향, 데이터 전송 시 사용)
 * @param {string} domain  - 'product' | 'shrink' | 'layout'
 * @param {string} label   - UI 표시명
 */
export const toColumn = (domain, label) =>
  Object.entries(fieldMap[domain] ?? {}).find(([, v]) => v === label)?.[0] ?? label;

/**
 * API 응답 객체를 표시명 키로 변환 (수신)
 * @example apiToUi('product', { prod_nm: 'GN3' }) → { 'Product Name': 'GN3' }
 */
export const apiToUi = (domain, apiObj) =>
  Object.fromEntries(
    Object.entries(apiObj).map(([col, val]) => [toLabel(domain, col), val])
  );

/**
 * UI 객체를 컬럼명 키로 변환 (송신)
 * @example uiToApi('product', { 'Product Name': 'GN3' }) → { prod_nm: 'GN3' }
 */
export const uiToApi = (domain, uiObj) =>
  Object.fromEntries(
    Object.entries(uiObj).map(([label, val]) => [toColumn(domain, label), val])
  );
