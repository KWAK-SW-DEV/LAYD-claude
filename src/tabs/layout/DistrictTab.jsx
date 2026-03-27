import { useState, useEffect, useRef } from "react";

// ── 팔레트 ────────────────────────────────────────────────────────────────
const PALETTE = [
  { fill:"rgba(56,189,248,0.6)",  stroke:"#38bdf8", text:"#e0f9ff" },
  { fill:"rgba(251,146,60,0.6)",  stroke:"#fb923c", text:"#fff0e0" },
  { fill:"rgba(167,139,250,0.6)", stroke:"#a78bfa", text:"#ede9fe" },
  { fill:"rgba(52,211,153,0.6)",  stroke:"#34d399", text:"#d1fae5" },
  { fill:"rgba(248,113,113,0.6)", stroke:"#f87171", text:"#fee2e2" },
  { fill:"rgba(250,204,21,0.6)",  stroke:"#facc15", text:"#fef9c3" },
];
const CENTER_C = {
  fill:"rgba(255,255,255,0.08)",
  stroke:"rgba(255,255,255,0.4)",
  text:"rgba(255,255,255,0.55)",
};

const EMERALD = "#10b981";
const SEC_LBL = {
  fontSize:"10px", letterSpacing:"3px", textTransform:"uppercase",
  color:"rgba(255,255,255,0.38)", fontWeight:600, margin:"0 0 12px",
};
const DIVIDER = { height:"1px", background:"rgba(255,255,255,0.1)", margin:"20px 0" };
const VAR_LBL = {
  fontSize:"9px", color:"rgba(255,255,255,0.35)",
  letterSpacing:"1.5px", textTransform:"uppercase", fontWeight:600,
};

// 7열 그리드: 이름 | L | T | R | B | ruler | delete
const COLS = "52px 1fr 1fr 1fr 1fr 36px 28px";

// ── DirIcon ───────────────────────────────────────────────────────────────
function DirIcon({ dir, focused }) {
  const S=14, T=2.2, C="#38bdf8";
  return (
    <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{flexShrink:0}}>
      <rect x="1" y="1" width={S-2} height={S-2} fill="none"
        stroke={focused?"rgba(255,255,255,0.28)":"rgba(255,255,255,0.14)"}
        strokeWidth="1" rx="1"/>
      {dir==="left"  &&<line x1="1.5"   y1="1.5"   x2="1.5"   y2={S-1.5} stroke={C} strokeWidth={T} strokeLinecap="round"/>}
      {dir==="top"   &&<line x1="1.5"   y1="1.5"   x2={S-1.5} y2="1.5"   stroke={C} strokeWidth={T} strokeLinecap="round"/>}
      {dir==="right" &&<line x1={S-1.5} y1="1.5"   x2={S-1.5} y2={S-1.5} stroke={C} strokeWidth={T} strokeLinecap="round"/>}
      {dir==="bottom"&&<line x1="1.5"   y1={S-1.5} x2={S-1.5} y2={S-1.5} stroke={C} strokeWidth={T} strokeLinecap="round"/>}
    </svg>
  );
}

// ── RulerIcon ─────────────────────────────────────────────────────────────
function RulerIcon({ active }) {
  const c = active ? "#38bdf8" : "rgba(255,255,255,0.28)";
  return (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
      <rect x="1" y="6" width="18" height="8" rx="1.5"
        stroke={c} strokeWidth="1.2" fill={active?"rgba(56,189,248,0.15)":"none"}/>
      <line x1="4"  y1="6" x2="4"  y2="10" stroke={c} strokeWidth="1.2"/>
      <line x1="8"  y1="6" x2="8"  y2="9"  stroke={c} strokeWidth="1.2"/>
      <line x1="12" y1="6" x2="12" y2="10" stroke={c} strokeWidth="1.2"/>
      <line x1="16" y1="6" x2="16" y2="9"  stroke={c} strokeWidth="1.2"/>
    </svg>
  );
}

// ── DirField ──────────────────────────────────────────────────────────────
function DirField({ dir, value, onChange, readOnly=false }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{display:"flex", flexDirection:"column", gap:"3px"}}>
      <div style={{display:"flex", alignItems:"center", gap:"3px"}}>
        <DirIcon dir={dir} focused={focused && !readOnly}/>
        <span style={VAR_LBL}>{dir.toUpperCase()}</span>
      </div>
      <input
        type="number"
        value={readOnly ? "" : (value ?? "")}
        placeholder={readOnly ? "auto" : "0"}
        readOnly={readOnly}
        onChange={e => onChange && onChange(
          e.target.value === "" ? "" : parseInt(e.target.value, 10) || 0
        )}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          background:"transparent", border:"none",
          borderBottom:`1px solid ${
            readOnly ? "rgba(255,255,255,0.1)"
            : focused ? EMERALD
            : "rgba(255,255,255,0.22)"
          }`,
          outline:"none",
          color: readOnly ? "rgba(255,255,255,0.22)" : EMERALD,
          fontFamily:"inherit", padding:"3px 2px 5px",
          fontSize:"13px", width:"100%",
          cursor: readOnly ? "default" : "text",
          transition:"border-color 0.18s",
        }}
      />
    </div>
  );
}

// ── AreaInput ─────────────────────────────────────────────────────────────
function AreaInput({ label, colKey, rowKey, cfg, onChange }) {
  const [fcol, setFcol] = useState(false);
  const [frow, setFrow] = useState(false);
  const inp = f => ({
    background:"transparent", border:"none",
    borderBottom:`1px solid ${f ? EMERALD : "rgba(255,255,255,0.22)"}`,
    outline:"none", color:EMERALD, fontFamily:"inherit",
    padding:"3px 2px 5px", fontSize:"13px", width:"100%",
    transition:"border-color 0.18s",
  });
  return (
    <div style={{display:"flex", alignItems:"flex-end", gap:"16px"}}>
      <span style={{fontSize:"12px", fontWeight:600, color:"rgba(255,255,255,0.55)",
        flexShrink:0, minWidth:"110px", paddingBottom:"5px"}}>{label}</span>
      <div style={{flex:1, display:"flex", flexDirection:"column", gap:"3px"}}>
        <span style={VAR_LBL}>Column</span>
        <input type="number" value={cfg[colKey]||""} placeholder="0"
          onChange={e => onChange(colKey, e.target.value===""?"":parseInt(e.target.value,10)||0)}
          onFocus={()=>setFcol(true)} onBlur={()=>setFcol(false)} style={inp(fcol)}/>
      </div>
      <div style={{flex:1, display:"flex", flexDirection:"column", gap:"3px"}}>
        <span style={VAR_LBL}>Row</span>
        <input type="number" value={cfg[rowKey]||""} placeholder="0"
          onChange={e => onChange(rowKey, e.target.value===""?"":parseInt(e.target.value,10)||0)}
          onFocus={()=>setFrow(true)} onBlur={()=>setFrow(false)} style={inp(frow)}/>
      </div>
    </div>
  );
}

// ── HierarchyHeader ───────────────────────────────────────────────────────
function HierarchyHeader() {
  return (
    <div style={{display:"grid", gridTemplateColumns:COLS, gap:"10px",
      marginBottom:"6px", paddingBottom:"6px",
      borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
      {["NAME","LEFT","TOP","RIGHT","BOTTOM","RULER",""].map((h,i) => (
        <span key={i} style={{...VAR_LBL, fontSize:"8px",
          textAlign: i >= 5 ? "center" : "left"}}>{h}</span>
      ))}
    </div>
  );
}

// ── HierarchyRow ──────────────────────────────────────────────────────────
function HierarchyRow({ name, nameColor, value, onChange, onRulerToggle, onDelete, isCenter=false }) {
  return (
    <div style={{display:"grid", gridTemplateColumns:COLS, gap:"10px", alignItems:"flex-end"}}>
      {/* 1. 이름 */}
      <div style={{display:"flex", alignItems:"center", gap:"5px", paddingBottom:"5px"}}>
        {!isCenter && (
          <div style={{width:"8px", height:"8px", borderRadius:"2px", flexShrink:0,
            background:nameColor?.fill, border:`1px solid ${nameColor?.stroke}`}}/>
        )}
        <span style={{fontSize:"11px", fontWeight:700,
          color: isCenter ? CENTER_C.text : nameColor?.text,
          letterSpacing:"0.5px"}}>{name}</span>
      </div>
      {/* 2~5. 방향 입력 */}
      {["left","top","right","bottom"].map(dir => (
        <DirField key={dir} dir={dir}
          value={isCenter ? "" : value[dir]}
          onChange={isCenter ? null : v => onChange({...value, [dir]:v})}
          readOnly={isCenter}
        />
      ))}
      {/* 6. Ruler */}
      <div style={{display:"flex", justifyContent:"center", alignItems:"center", paddingBottom:"4px"}}>
        {!isCenter && (
          <button onClick={onRulerToggle}
            title={value.ruler ? "Ruler ON" : "Ruler OFF"}
            style={{
              background: value.ruler ? "rgba(56,189,248,0.18)" : "rgba(255,255,255,0.05)",
              border:`1px solid ${value.ruler ? "rgba(56,189,248,0.5)" : "rgba(255,255,255,0.13)"}`,
              borderRadius:"6px", cursor:"pointer", padding:"3px 5px",
              display:"flex", alignItems:"center", transition:"all 0.18s",
            }}>
            <RulerIcon active={value.ruler}/>
          </button>
        )}
      </div>
      {/* 7. 삭제 */}
      <div style={{display:"flex", justifyContent:"center", alignItems:"center", paddingBottom:"4px"}}>
        {!isCenter && (
          <button onClick={onDelete}
            style={{background:"none", border:"none", cursor:"pointer",
              color:"rgba(255,80,80,0.45)", fontSize:"14px", lineHeight:1,
              padding:"4px", transition:"color 0.15s"}}
            onMouseEnter={e => e.currentTarget.style.color="rgba(255,80,80,0.9)"}
            onMouseLeave={e => e.currentTarget.style.color="rgba(255,80,80,0.45)"}>✕</button>
        )}
      </div>
    </div>
  );
}

// ── AddRow ────────────────────────────────────────────────────────────────
function AddRow({ value, onChange, onAdd }) {
  return (
    <div style={{display:"grid", gridTemplateColumns:COLS, gap:"10px", alignItems:"flex-end"}}>
      <div/>
      {["left","top","right","bottom"].map(dir => (
        <DirField key={dir} dir={dir}
          value={value[dir]}
          onChange={v => onChange({...value, [dir]:v})}
        />
      ))}
      <div style={{gridColumn:"span 2", display:"flex", alignItems:"flex-end", paddingBottom:"2px"}}>
        <button onClick={onAdd}
          style={{width:"100%", padding:"6px 0",
            background:"linear-gradient(135deg,#4f46e5,#7c3aed)",
            border:"none", borderRadius:"7px", color:"#fff",
            fontSize:"12px", fontWeight:600, cursor:"pointer",
            boxShadow:"0 3px 10px rgba(99,102,241,0.4)", transition:"opacity 0.15s"}}
          onMouseEnter={e => e.currentTarget.style.opacity="0.82"}
          onMouseLeave={e => e.currentTarget.style.opacity="1"}>
          + Add
        </button>
      </div>
    </div>
  );
}

// ── buildAreas ────────────────────────────────────────────────────────────
function buildAreas(col, row, margins, K) {
  const areas = []; let ox=0, oy=0, cw=col, ch=row;
  for (let d=0; d<margins.length; d++) {
    const { left:dL=0, top:dT=0, right:dR=0, bottom:dB=0 } = margins[d];
    const vL=dL>0?Math.max(dL,K):0, vT=dT>0?Math.max(dT,K):0;
    const vR=dR>0?Math.max(dR,K):0, vB=dB>0?Math.max(dB,K):0;
    const cc = PALETTE[d % PALETTE.length];
    const icw=cw-vL-vR, ich=ch-vT-vB;
    const p = (name,x,y,w,h,rW,rH) =>
      areas.push({name, ox:ox+x, oy:oy+y, w, h, rW, rH, c:cc});
    if(dT>0&&dL>0) p("TL",0,      0,      vL,  vT,  dL,       dT);
    if(dT>0)        p("T", vL,     0,      icw, vT,  cw-dL-dR, dT);
    if(dT>0&&dR>0)  p("TR",cw-vR,  0,      vR,  vT,  dR,       dT);
    if(dL>0)        p("L", 0,      vT,     vL,  ich, dL,       ch-dT-dB);
    if(dR>0)        p("R", cw-vR,  vT,     vR,  ich, dR,       ch-dT-dB);
    if(dB>0&&dL>0)  p("BL",0,      ch-vB,  vL,  vB,  dL,       dB);
    if(dB>0)        p("B", vL,     ch-vB,  icw, vB,  cw-dL-dR, dB);
    if(dB>0&&dR>0)  p("BR",cw-vR,  ch-vB,  vR,  vB,  dR,       dB);
    ox+=vL; oy+=vT; cw-=vL+vR; ch-=vT+vB;
  }
  areas.push({name:"CTR", ox, oy, w:cw, h:ch, rW:cw, rH:ch, c:CENTER_C});
  return areas;
}

// ── DistrictPreview ───────────────────────────────────────────────────────
function DistrictPreview({ totalCol, totalRow, margins, scale, previewWidth }) {
  const col = parseInt(totalCol)||0, row = parseInt(totalRow)||0;
  if (!col||!row) return (
    <div style={{display:"flex", alignItems:"center", justifyContent:"center",
      height:"100px", color:"rgba(255,255,255,0.2)", fontSize:"11px", letterSpacing:"1px"}}>
      Enter Total Area to preview
    </div>
  );
  const K = Math.max(1, parseInt(scale)||1);
  const areas = buildAreas(col, row, margins, K);

  // 너비: 전달된 값 그대로 (최소 280, 최대 600은 부모에서 보장)
  const PW = previewWidth;
  const PH = Math.min(480, Math.max(180, Math.round(PW * row / col)));
  const scX = PW / col, scY = PH / row;

  return (
    <svg width={PW} height={PH} viewBox={`0 0 ${PW} ${PH}`}
      style={{display:"block", borderRadius:"4px",
        border:"1px solid rgba(255,255,255,0.1)", flexShrink:0}}>
      <rect width={PW} height={PH} fill="rgba(6,4,20,0.97)"/>
      {areas.map((a,i) => {
        const px=a.ox*scX, py=a.oy*scY, pw=a.w*scX, ph=a.h*scY;
        const fs = Math.min(11, Math.max(5, Math.min(pw,ph)/5));
        return (
          <g key={i}>
            <rect x={px+0.5} y={py+0.5}
              width={Math.max(pw-1,0)} height={Math.max(ph-1,0)}
              fill={a.c.fill} stroke={a.c.stroke} strokeWidth="0.8" rx="1"/>
            {pw>20&&ph>14&&(
              <>
                <text x={px+pw/2} y={py+ph/2-fs*0.55} textAnchor="middle"
                  fill={a.c.text} fontSize={fs} fontWeight="700" fontFamily="monospace">
                  {a.name}
                </text>
                <text x={px+pw/2} y={py+ph/2+fs*1.0} textAnchor="middle"
                  fill={a.c.text} fontSize={Math.max(4,fs-2)}
                  fontFamily="monospace" opacity="0.7">
                  {a.rW}×{a.rH}
                </text>
              </>
            )}
          </g>
        );
      })}
      <rect width={PW} height={PH} fill="none"
        stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" rx="3"/>
    </svg>
  );
}

// ── DistrictTab ───────────────────────────────────────────────────────────
export default function DistrictTab({ cfg, onChange }) {
  const [inputMargin, setInputMargin] = useState({left:"",top:"",right:"",bottom:""});
  const [scale, setScale]             = useState(400);
  const containerRef                  = useRef(null);
  const [previewWidth, setPreviewWidth] = useState(400);

  // 오른쪽 컬럼 너비 감지 → previewWidth 반응형 (최소 280, 최대 600)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width;
      setPreviewWidth(Math.min(600, Math.max(280, Math.floor(w))));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const margins = cfg.districts || [];

  const addMargin = () => {
    const { left, top, right, bottom } = inputMargin;
    if (!left && !top && !right && !bottom) return;
    onChange("districts", [...margins, {
      left:parseInt(left)||0, top:parseInt(top)||0,
      right:parseInt(right)||0, bottom:parseInt(bottom)||0, ruler:false,
    }]);
    setInputMargin({left:"", top:"", right:"", bottom:""});
  };

  const updateMargin = (i, val) => {
    const n = [...margins]; n[i] = {...n[i], ...val}; onChange("districts", n);
  };
  const toggleRuler  = i => updateMargin(i, {ruler:!margins[i].ruler});
  const deleteMargin = i => onChange("districts", margins.filter((_,j) => j!==i));

  const legendItems = [
    ...margins.map((_,i) => ({label:`D${i+1}`, c:PALETTE[i%PALETTE.length]})),
    {label:"CENTER", c:CENTER_C},
  ];

  return (
    <div style={{display:"flex", gap:"36px", alignItems:"flex-start"}}>

      {/* ── LEFT: 입력 (420px 고정) ── */}
      <div style={{flex:"0 0 420px", display:"flex", flexDirection:"column"}}>

        <p style={SEC_LBL}>Area</p>
        <div style={{display:"flex", flexDirection:"column", gap:"16px"}}>
          <AreaInput label="Total Area [ea]"  colKey="total_col"    rowKey="total_row"    cfg={cfg} onChange={onChange}/>
          <AreaInput label="Actv. Dum. [ea]"  colKey="actv_dum_col" rowKey="actv_dum_row" cfg={cfg} onChange={onChange}/>
        </div>

        <div style={DIVIDER}/>

        <p style={SEC_LBL}>Hierarchy</p>
        <AddRow value={inputMargin} onChange={setInputMargin} onAdd={addMargin}/>

        <p style={{...SEC_LBL, marginTop:"20px"}}>Hierarchy List</p>
        <HierarchyHeader/>
        <div style={{display:"flex", flexDirection:"column", gap:"14px"}}>
          {margins.length === 0 && (
            <p style={{fontSize:"12px", color:"rgba(255,255,255,0.2)", margin:0}}>
              No hierarchy added yet.
            </p>
          )}
          {margins.map((m, i) => (
            <HierarchyRow key={i}
              name={`D${i+1}`}
              nameColor={PALETTE[i % PALETTE.length]}
              value={m}
              onChange={val => updateMargin(i, val)}
              onRulerToggle={() => toggleRuler(i)}
              onDelete={() => deleteMargin(i)}
            />
          ))}
          <HierarchyRow name="CTR" isCenter value={{}} onChange={null}/>
        </div>
      </div>

      {/* ── RIGHT: Preview (반응형 너비) ── */}
      <div ref={containerRef}
        style={{flex:1, minWidth:"280px", maxWidth:"600px",
          display:"flex", flexDirection:"column", gap:"10px"}}>

        {/* 헤더 */}
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
          <span style={{...SEC_LBL, margin:0}}>Preview</span>
          <div style={{display:"flex", alignItems:"center", gap:"8px",
            background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)",
            borderRadius:"7px", padding:"4px 10px"}}>
            <span style={{fontSize:"9px", color:"rgba(255,255,255,0.35)",
              letterSpacing:"1px", textTransform:"uppercase", flexShrink:0}}>Display Scale</span>
            <input type="number" min="1" value={scale}
              onChange={e => setScale(Math.max(1, parseInt(e.target.value)||1))}
              style={{background:"none", border:"none", outline:"none",
                color:"#fcd34d", fontSize:"12px", fontWeight:700,
                width:"50px", fontFamily:"inherit", textAlign:"right"}}/>
          </div>
        </div>

        <DistrictPreview
          totalCol={cfg.total_col} totalRow={cfg.total_row}
          margins={margins} scale={scale}
          previewWidth={previewWidth}
        />

        {legendItems.length > 0 && (
          <div style={{display:"flex", gap:"10px", flexWrap:"wrap", marginTop:"2px"}}>
            {legendItems.map((item, i) => (
              <div key={i} style={{display:"flex", alignItems:"center", gap:"5px"}}>
                <div style={{width:"8px", height:"8px", borderRadius:"2px",
                  background:item.c.fill, border:`1px solid ${item.c.stroke}`}}/>
                <span style={{fontSize:"10px", color:item.c.text, fontWeight:600}}>{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}