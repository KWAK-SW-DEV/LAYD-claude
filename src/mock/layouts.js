/**
 * layouts.js — Layout Mock 데이터
 *
 * productDB    : Product code 검색 시 반환될 제품 DB (pitch, CRA, shrink_ratio)
 * mockLayouts  : 기존 저장된 layout 설정 목록
 */

// —— Product DB (product code 검색 대상) ————————————————————————————

export const productDB = [
  {
    prod_code:   "HP9-A1",
    prod_nm:     "ISOCELL HP9",
    pitch:       0.560,
    cra: {
      order: 6,
      coeffs: [0.000000, 0.312450, 0.001234, -0.000056, 0.000002, -0.000000],
    },
    shrink_ratio: {
      "OD":   [0.985],
      "POLY": [0.982],
      "CO":   [0.978],
      "M1":   [0.975],
      "VIA1": [0.972],
      "M2":   [0.970],
    },
  },
  {
    prod_code:   "HP9-B1",
    prod_nm:     "ISOCELL HP9",
    pitch:       0.560,
    cra: {
      order: 6,
      coeffs: [0.000000, 0.314120, 0.001180, -0.000048, 0.000001, -0.000000],
    },
    shrink_ratio: {
      "OD":   [0.984],
      "POLY": [0.981],
      "CO":   [0.977],
      "M1":   [0.974],
      "VIA1": [0.971],
      "M2":   [0.969],
    },
  },
  {
    prod_code:   "GNJ-A1",
    prod_nm:     "ISOCELL GNJ",
    pitch:       1.000,
    cra: {
      order: 6,
      coeffs: [0.000000, 0.298760, 0.001056, -0.000042, 0.000001, -0.000000],
    },
    shrink_ratio: {
      "OD":   [0.990],
      "POLY": [0.987],
      "CO":   [0.984],
      "M1":   [0.981],
      "VIA1": [0.979],
      "M2":   [0.977],
    },
  },
  {
    prod_code:   "JN5-A1",
    prod_nm:     "ISOCELL JN5",
    pitch:       0.640,
    cra: {
      order: 6,
      coeffs: [0.000000, 0.325600, 0.001312, -0.000061, 0.000002, -0.000000],
    },
    shrink_ratio: {
      "OD":   [0.983],
      "POLY": [0.980],
      "CO":   [0.976],
      "M1":   [0.973],
      "VIA1": [0.970],
      "M2":   [0.968],
    },
  },
  {
    prod_code:   "HP2-A1",
    prod_nm:     "ISOCELL HP2",
    pitch:       0.600,
    cra: {
      order: 6,
      coeffs: [0.000000, 0.308900, 0.001145, -0.000051, 0.000002, -0.000000],
    },
    shrink_ratio: {
      "OD":   [0.986],
      "POLY": [0.983],
      "CO":   [0.979],
      "M1":   [0.976],
      "VIA1": [0.973],
      "M2":   [0.971],
    },
  },
];

// —— Saved Layout 설정 목록 ————————————————————————————————————————

export const mockLayouts = [
  {
    layout_id:    "LYT-001",
    prod_code:    "HP9-A1",
    top_cell:     "HP9_TOP_V1",
    total_col:    5120,
    total_row:    4096,
    actv_dum_col: 4800,
    actv_dum_row: 3840,
    dist_left:    64,
    dist_top:     64,
    dist_right:   64,
    dist_bottom:  64,
    created_dt:   "2024-08-01",
    status:       "Active",
  },
  {
    layout_id:    "LYT-002",
    prod_code:    "GNJ-A1",
    top_cell:     "GNJ_FULL_V2",
    total_col:    4096,
    total_row:    4096,
    actv_dum_col: 3840,
    actv_dum_row: 3840,
    dist_left:    48,
    dist_top:     48,
    dist_right:   48,
    dist_bottom:  48,
    created_dt:   "2024-09-14",
    status:       "Active",
  },
  {
    layout_id:    "LYT-003",
    prod_code:    "JN5-A1",
    top_cell:     "JN5_TOP_A",
    total_col:    3200,
    total_row:    2400,
    actv_dum_col: 3008,
    actv_dum_row: 2240,
    dist_left:    32,
    dist_top:     32,
    dist_right:   32,
    dist_bottom:  32,
    created_dt:   "2024-10-05",
    status:       "Draft",
  },
];

export const emptyLayout = {
  layout_id:    "",
  prod_code:    "",
  top_cell:     "",
  total_col:    "",
  total_row:    "",
  actv_dum_col: "",
  actv_dum_row: "",
  dist_left:    "",
  dist_top:     "",
  dist_right:   "",
  dist_bottom:  "",
  created_dt:   "",
  status:       "Draft",
};
