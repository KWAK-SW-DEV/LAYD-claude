import { useState, useEffect } from "react";
import { productDB } from "../../mock/layouts";

// — 공통 스타일

const EMERALD = "#10b981";
const secLabel = {
  fontSize:"10px", letterSpacing:"3px", textTransform:"uppercase",
  color:"rgba(255,255,255,0.4)", margin:"0 0 10px", fontWeight:600,
};
const roInput = {                      // readonly — DB 조회 데이터
  background:"transparent", border:"none",
  borderBottom:"1px solid rgba(255,255,255,0.12)",
  outline:"none", color:"rgba(255,255,255,0.6)",
  fontFamily:"inherit", padding:"2px 4px 4px",
  fontSize:"13px", width:"100%", cursor:"default",
};

// — ProductTab

export default function ProductTab({ cfg, onChange, selProd, onProductSelect }) {
  const [query,    setQuery]    = useState(cfg.prod_code || "");
  const [results,  setResults]  = useState([]);
  const [searched, setSearched] = useState(false);
  const [pitch,    setPitch]    = useState("");
  const [coeffs,   setCoeffs]   = useState(Array(6).fill(""));
  const [shrink,   setShrink]   = useState({});

  // — product 선택/변경 시 필드 동기화

  useEffect(() => {
    if (selProd) {
      setPitch(selProd.pitch);
      // a6 → a1 순서 (coeffs[0] = a6)
      setCoeffs([...selProd.cra.coeffs].slice(1).reverse());
      setShrink(selProd.shrink_ratio);
    } else {
      setPitch(""); setCoeffs(Array(6).fill("")); setShrink({});
    }
  }, [selProd]);

  // — 검색

  const search = () => {
    const q = query.trim().toLowerCase();
    if (!q) return;
    setResults(productDB.filter(p =>
      p.prod_code.toLowerCase().includes(q) ||
      p.prod_nm.toLowerCase().includes(q)
    ));
    setSearched(true);
  };

  const select = p => {
    onProductSelect(p);
    onChange("prod_code", p.prod_code);
    setResults([]);
    setSearched(false);
  };

  // — render

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"24px" }}>

      {/* — Search — */}
      <div>
        <p style={secLabel}>Product Code</p>
        <div style={{ display:"flex", gap:"8px", position:"relative" }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") search(); }}
            placeholder="e.g. HP9-A1"
            style={{
              flex:1, background:"rgba(255,255,255,0.07)",
              border:"1px solid rgba(16,185,129,0.45)",
              borderRadius:"8px", padding:"9px 13px",
              color: EMERALD, fontSize:"13px", outline:"none",
              fontFamily:"inherit", caretColor: EMERALD,
            }}
          />
          <button onClick={search} style={{
            padding:"9px 20px",
            background:"linear-gradient(135deg,#4f46e5,#7c3aed)",
            border:"none", borderRadius:"8px", color:"#fff",
            fontSize:"12px", fontWeight:600, cursor:"pointer",
            whiteSpace:"nowrap", boxShadow:"0 3px 10px rgba(99,102,241,0.4)",
          }}>
            Search
          </button>
        </div>

        {/* Results dropdown */}
        {searched && (
          <div style={{
            marginTop:"4px", background:"rgba(18,16,32,0.98)",
            border:"1px solid rgba(255,255,255,0.1)",
            borderRadius:"10px",
            overflow:"hidden", boxShadow:"0 12px 36px rgba(0,0,0,0.6)",
          }}>
            {results.length === 0
              ? <div style={{ padding:"14px 16px", fontSize:"12px",
                  color:"rgba(255,255,255,0.32)" }}>No results found.</div>
              : results.map(p => (
                <div key={p.prod_code} onClick={() => select(p)}
                  style={{ padding:"10px 16px", cursor:"pointer",
                    display:"flex",
                    alignItems:"center", gap:"10px",
                    borderBottom:"1px solid rgba(255,255,255,0.05)",
                    transition:"background 0.15s" }}
                  onMouseEnter={e =>
                    e.currentTarget.style.background="rgba(99,102,241,0.2)"}
                  onMouseLeave={e =>
                    e.currentTarget.style.background="transparent"}>
                  <span style={{ fontSize:"13px", fontWeight:700,
                    color:"#a5b4fc" }}>{p.prod_code}</span>
                  <span style={{ fontSize:"11px",
                    color:"rgba(255,255,255,0.4)" }}>{p.prod_nm}</span>
                  <span style={{ fontSize:"11px", color:"#5eead4",
                    marginLeft:"auto" }}>pitch {p.pitch} μm</span>
                </div>
              ))
            }
          </div>
        )}
      </div>

      {/* — Detail (조회 결과 — readonly) — */}
      {selProd && (
        <div style={{ display:"flex", flexDirection:"column", gap:"20px",
          animation:"fadeSlideIn 0.35s ease" }}>
          <div style={{ height:"1px",
            background:"rgba(255,255,255,0.09)" }} />

          {/* Pitch */}
          <div>
            <p style={secLabel}>Pitch</p>
            <div style={{ maxWidth:"220px", position:"relative" }}>
              <input
                type="number" value={pitch} readOnly
                style={roInput}
              />
              <span style={{ position:"absolute", right:0, bottom:"5px",
                fontSize:"11px", color:"rgba(255,255,255,0.3)" }}>μm</span>
            </div>
          </div>

          {/* CRA Coefficients — a6 → a1 */}
          <div>
            <p style={secLabel}>CRA Coefficients</p>
            <div style={{ display:"flex", alignItems:"flex-end", gap:"16px",
              flexWrap:"wrap" }}>
              {coeffs.map((c, i) => {
                const order = 6 - i;
                return (
                  <div key={order} style={{ display:"flex",
                    flexDirection:"column", gap:"3px", minWidth:"88px", flex:1 }}>
                    <label style={{ fontSize:"9px",
                      color:"rgba(255,255,255,0.28)",
                      letterSpacing:"1px", textTransform:"uppercase" }}
                    >a{order}</label>
                    <input
                      id={`coef${order}`} type="number" value={c} readOnly
                      style={roInput}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shrink Ratio */}
          <div>
            <p style={secLabel}>Shrink Ratio</p>
            <div style={{ border:"1px solid rgba(255,255,255,0.1)",
              borderRadius:"8px", overflow:"hidden" }}>
              {/* Header */}
              <div style={{
                display:"grid", gridTemplateColumns:"110px 1fr",
                background:"rgba(255,255,255,0.05)",
                borderBottom:"1px solid rgba(255,255,255,0.1)",
                padding:"7px 14px",
              }}>
                <span style={{ fontSize:"10px", fontWeight:700,
                  letterSpacing:"2px",
                  textTransform:"uppercase",
                  color:"rgba(255,255,255,0.45)" }}>LAYER</span>
                <span style={{ fontSize:"10px", fontWeight:700,
                  letterSpacing:"2px",
                  textTransform:"uppercase",
                  color:"rgba(255,255,255,0.45)" }}>SHRINK RATIOS</span>
              </div>
              {/* Rows */}
              {Object.entries(shrink).map(([layer, vals], i) => (
                <div key={layer} style={{
                  display:"grid", gridTemplateColumns:"110px 1fr",
                  padding:"7px 14px", alignItems:"center",
                  borderBottom: i < Object.keys(shrink).length - 1
                    ? "1px solid rgba(255,255,255,0.05)" : "none",
                  background: i % 2 === 0 ? "transparent" :
                    "rgba(255,255,255,0.02)",
                }}>
                  <span style={{ fontSize:"12px",
                    color:"rgba(255,255,255,0.7)",
                    fontFamily:"monospace", fontWeight:500 }}>{layer}</span>
                  <div style={{ display:"flex", gap:"12px", flexWrap:"wrap",
                    alignItems:"center" }}>
                    {vals.map((v, j) => (
                      <input key={j} type="number" value={v} readOnly
                        style={{ ...roInput, width:"80px", flex:"none",
                          fontSize:"12px", fontFamily:"monospace" }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
