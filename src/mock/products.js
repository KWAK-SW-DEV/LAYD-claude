/**
 * products.js — Product Mock 데이터
 * FastAPI가 반환할 JSON 형태 그대로 정의 (컬럼명: snake_case)
 */

export const mockProducts = [
  {
    prod_id:     "ISOCELL-HP9",
    prod_nm:     "ISOCELL HP9",
    prod_desc:   "Industry's first 200MP telephoto image sensor with 0.56μm pixels and high-refractive microlens for superior light gathering.",
    pixel_size:  "0.56",
    resolution:  "200",
    sensor_size: "1/1.4\"",
    release_dt:  "2024-06-27",
    status:      "Active",
  },
  {
    prod_id:     "ISOCELL-GNJ",
    prod_nm:     "ISOCELL GNJ",
    prod_desc:   "50MP dual-pixel sensor with 1.0μm pixel size. Improved video quality, reduced artifacting, and significantly lower power consumption.",
    pixel_size:  "1.0",
    resolution:  "50",
    sensor_size: "1/1.57\"",
    release_dt:  "2024-06-27",
    status:      "Active",
  },
  {
    prod_id:     "ISOCELL-JN5",
    prod_nm:     "ISOCELL JN5",
    prod_desc:   "50MP sensor with 0.64μm pixels featuring Dual VTG technology for ultra-low-light performance and Super QPD autofocus.",
    pixel_size:  "0.64",
    resolution:  "50",
    sensor_size: "1/2.76\"",
    release_dt:  "2024-06-27",
    status:      "Active",
  },
  {
    prod_id:     "ISOCELL-HP2",
    prod_nm:     "ISOCELL HP2",
    prod_desc:   "200MP sensor used in Galaxy S23 Ultra. Features Adaptive Pixel and Super QPD for exceptional detail in any condition.",
    pixel_size:  "0.6",
    resolution:  "200",
    sensor_size: "1/1.3\"",
    release_dt:  "2023-01-17",
    status:      "Active",
  },
  {
    prod_id:     "ISOCELL-GN3",
    prod_nm:     "ISOCELL GN3",
    prod_desc:   "50MP sensor with stacked DRAM for the fastest readout speed in its class, supporting 8K video at 30fps.",
    pixel_size:  "1.0",
    resolution:  "50",
    sensor_size: "1/1.56\"",
    release_dt:  "2022-05-11",
    status:      "Active",
  },
  {
    prod_id:     "ISOCELL-HM6",
    prod_nm:     "ISOCELL HM6",
    prod_desc:   "108MP sensor for mid-range smartphones. Nona-cell technology for bright 12MP shots in low light.",
    pixel_size:  "0.7",
    resolution:  "108",
    sensor_size: "1/1.67\"",
    release_dt:  "2022-03-09",
    status:      "Legacy",
  },
];

/** 새 제품 기본 템플릿 */
export const emptyProduct = {
  prod_id:     "",
  prod_nm:     "",
  prod_desc:   "",
  pixel_size:  "",
  resolution:  "",
  sensor_size: "",
  release_dt:  "",
  status:      "Active",
};
