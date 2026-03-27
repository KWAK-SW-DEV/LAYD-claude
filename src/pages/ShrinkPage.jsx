import { useState, useEffect, useRef } from "react";

// — fieldMap (inlined)
// ————————————————————————————————————————

const fieldMap = {
  shrink_id:    "Shrink ID",
  prod_nm:      "Product Name",
  prod_ver:     "Version",
  cra_center:   "CRA Center (°)",
  cra_corner:   "CRA Corner (°)",
  cra_margin:   "CRA Margin (°)",
  shrink_ratio: "Shrink Ratio (%)",
  target_nm:    "Target Node (nm)",
  measure_dt:   "Measured Date",
  engineer:     "Engineer",
  status:       "Status",
};
const toLabel = col => fieldMap[col] ?? col;

// — Mock Products (for dropdown)
// ————————————————————————————————————————

const PRODUCTS = [
  { prod_nm:"ISOCELL HP9", versions:["v1.0","v2.0"] },
  { prod_nm:"ISOCELL GNJ", versions:["v1.0"] },
  { prod_nm:"ISOCELL JN5", versions:["v1.0"] },
  { prod_nm:"ISOCELL HP2", versions:["v1.0"] },
  { prod_nm:"ISOCELL GN3", versions:["v1.0"] },
  { prod_nm:"ISOCELL HM6", versions:["v1.0"] },
];

// — Mock Shrink data
// ————————————————————————————————————————

const INIT_SHRINKS = [
  { shrink_id:"SHK-HP9-V1", prod_nm:"ISOCELL HP9", prod_ver:"v1.0", cra_center:"0.0", cra_corner:"28.5",
    cra_margin:"24.2", shrink_ratio:"12.5", target_nm:"28", measure_dt:"2024-07-10", engineer:"J.Kim",  status:"Active" },
  { shrink_id:"SHK-HP9-V2", prod_nm:"ISOCELL HP9", prod_ver:"v2.0", cra_center:"0.0", cra_corner:"27.8",
    cra_margin:"23.5", shrink_ratio:"14.0", target_nm:"24", measure_dt:"2024-09-03", engineer:"J.Kim",  status:"Active" },
  { shrink_id:"SHK-GNJ-V1", prod_nm:"ISOCELL GNJ", prod_ver:"v1.0", cra_center:"0.0", cra_corner:"30.1",
    cra_margin:"25.8", shrink_ratio:"10.0", target_nm:"32", measure_dt:"2024-07-22", engineer:"S.Park", status:"Active" },
  { shrink_id:"SHK-JN5-V1", prod_nm:"ISOCELL JN5", prod_ver:"v1.0", cra_center:"0.0", cra_corner:"32.4",
    cra_margin:"27.6", shrink_ratio:"8.5",  target_nm:"40", measure_dt:"2024-08-15", engineer:"H.Lee",  status:"Active" },
  { shrink_id:"SHK-HP2-V1", prod_nm:"ISOCELL HP2", prod_ver:"v1.0", cra_center:"0.0", cra_corner:"29.0",
    cra_margin:"24.8", shrink_ratio:"11.2", target_nm:"28", measure_dt:"2023-03-05", engineer:"J.Kim",  status:"Active" },
  { shrink_id:"SHK-GN3-V1", prod_nm:"ISOCELL GN3", prod_ver:"v1.0", cra_center:"0.0", cra_corner:"31.2",
    cra_margin:"26.3", shrink_ratio:"9.8",  target_nm:"32", measure_dt:"2022-06-20", engineer:"S.Park", status:"Legacy" },
];
const EMPTY_SHRINK = { shrink_id:"", prod_nm:"", prod_ver:"",
  cra_center:"", cra_corner:"", cra_margin:"", shrink_ratio:"",
  target_nm:"", measure_dt:"", engineer:"", status:"Active" };

// — BG images
// ————————————————————————————————————————

const BG_IMAGES = [
  "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1600&q=80",
  "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1600&q=80",
  "https://images.unsplash.com/photo-1635070041409-e63e783ce3c1?w=1600&q=80",
  "https://images.unsplash.com/photo-1567427018141-0584cfcbf1b8?w=1600&q=80",
];
const BG_FALLBACKS = [
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80",
  "https://images.unsplash.com/photo-1454789548928-9efd52dc4031?w=1600&q=80",
  "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1600&q=80",
  "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=1600&q=80",
];

// — MiniGrid
// ————————————————————————————————————————

const PALETTE = ["#00f0ff","#38bdf8","#818cf8","#a855f7","#ec4899","#f97316","#facc15","#4ade80","#2dd4bf","#60a5fa","#e879f9","#fb7185","#34d399","#fbbf24","#c084fc"];
const rndC = () => PALETTE[Math.floor(Math.random()*PALETTE.length)];
const rndA = () => +(0.7+Math.random()*0.3).toFixed(2);

function MiniGrid({ size=7 }) {
  const ref = useRef(null); const timers = useRef([]);
  useEffect(()=>{
    const el=ref.current; if(!el) return;
    timers.current.forEach(id=>{clearInterval(id);clearTimeout(id);}); timers.current=[];
    el.innerHTML=""; el.style.gridTemplateColumns=`repeat(${size},1fr)`; el.style.gridTemplateRows=`repeat(${size},1fr)`;
    const cells=[];
    for(let i=0;i<size*size;i++){
      const d=document.createElement("div");
      d.style.cssText=`background-color:${rndC()};opacity:${rndA()};transition:background-color 0.4s ease,opacity 0.4s ease;border-radius:1px;`;
      el.appendChild(d); cells.push(d);
    }
    for(let i=0;i<size*size;i++){
      const t=setTimeout(()=>{
        const id=setInterval(()=>{ if(cells[i]) {cells[i].style.backgroundColor=rndC();cells[i].style.opacity=rndA();} },300+Math.random()*600);
        timers.current.push(id);
      },Math.random()*800);
      timers.current.push(t);
    }
    return ()=>{ timers.current.forEach(id=>{clearInterval(id);clearTimeout(id);}); };
  },[size]);
  return <div ref={ref} style={{display:"grid",width:"36px",height:"36px",gap:"1px",backgroundColor:"#1a1a2e",borderRadius:"4px",overflow:"hidden",flexShrink:0}}/>;
}

// — BgSlideshow
// ————————————————————————————————————————

function BgSlideshow() {
  const [cur, setCur]   = useState(0);
  const [prev, setPrev] = useState(null);
  const [fading, setFading] = useState(false);

  useEffect(()=>{
    const id = setInterval(()=>{
      setPrev(c=>c); setFading(true);
      setCur(c=>(c+1)%BG_IMAGES.length);
      setTimeout(()=>{ setPrev(null); setFading(false); }, 3000);
    }, 8000);
    return ()=>clearInterval(id);
  },[]);

  return (
    <div style={{position:"absolute",inset:0,zIndex:0,background:"#04030f"}}>
      {prev!==null && (
        <img src={BG_IMAGES[prev]} onError={e=>{ e.target.src=BG_FALLBACKS[prev]; }} alt=""
          style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",
            opacity:fading?0:0.65, transition:"opacity 3s ease",
            filter:"brightness(0.45) saturate(1.2) hue-rotate(200deg)"}}/>
      )}
      <img key={cur} src={BG_IMAGES[cur]} onError={e=>{ e.target.src=BG_FALLBACKS[cur]; }} alt=""
        style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",
          opacity:0.65, transition:"opacity 3s ease",
          filter:"brightness(0.45) saturate(1.2) hue-rotate(200deg)"}}/>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 35%, rgba(30,20,80,0.15) 0%, rgba(4,3,15,0.55) 75%)"}}/>
      <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom, transparent 35%, rgba(4,3,15,0.4) 100%)"}}/>
    </div>
  );
}

// — Status Badge
// ————————————————————————————————————————

function StatusBadge({ status }) {
  const c = status==="Active"
    ? {bg:"rgba(52,211,153,0.15)",text:"#34d399",border:"rgba(52,211,153,0.3)"}
    : {bg:"rgba(251,146,60,0.15)",text:"#fb923c",border:"rgba(251,146,60,0.3)"};
  return (
    <span style={{fontSize:"10px",fontWeight:600,letterSpacing:"1px",textTransform:"uppercase",
      background:c.bg,color:c.text,border:`1px solid ${c.border}`,
      borderRadius:"20px",padding:"2px 8px"}}>
      {status}
    </span>
  );
}

// — Shrink List Panel
// ————————————————————————————————————————

function ShrinkListPanel({ shrinks, selectedId, onSelect, onAdd, shifted }) {
  return (
    <div style={{
      width:shifted?"360px":"660px",
      minWidth:shifted?"360px":"660px",
      background:"rgba(180,180,195,0.13)",
      backdropFilter:"blur(24px) saturate(1.4)",
      WebkitBackdropFilter:"blur(24px) saturate(1.4)",
      borderRadius:"16px",
      border:"1px solid rgba(255,255,255,0.13)",
      display:"flex",flexDirection:"column",overflow:"hidden",
      transition:"width 0.4s cubic-bezier(0.4,0,0.2,1),min-width 0.4s cubic-bezier(0.4,0,0.2,1)",
      boxShadow:"0 24px 64px rgba(0,0,0,0.5)",
      maxHeight:"76vh",
    }}>
      <div style={{padding:"20px 24px 16px",borderBottom:"1px solid rgba(255,255,255,0.07)",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <p style={{fontSize:"10px",letterSpacing:"4px",textTransform:"uppercase",color:"#a78bfa",margin:"0 0 4px",fontWeight:500}}>Database</p>
          <h2 style={{fontSize:"18px",fontWeight:800,color:"#fff",margin:0}}>CRA Shrink</h2>
        </div>
        <button onClick={onAdd}
          style={{width:"32px",height:"32px",borderRadius:"50%",border:"none",cursor:"pointer",
            background:"linear-gradient(135deg,#7c3aed,#a855f7)",color:"#fff",fontSize:"20px",
            fontWeight:300,lineHeight:1,display:"flex",alignItems:"center",justifyContent:"center",
            boxShadow:"0 4px 12px rgba(124,58,237,0.45)",transition:"transform 0.15s,box-shadow 0.15s"}}
          onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.1)";e.currentTarget.style.boxShadow="0 6px 18px rgba(124,58,237,0.6)";}}
          onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="0 4px 12px rgba(124,58,237,0.45)";}}
          title="Add new shrink">+</button>
      </div>

      {!shifted && (
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr",gap:"0",padding:"8px 24px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
          {["Product / Ver","CRA Ctr","CRA Crn","CRA Mrg","Shrink","Status"].map(h=>(
            <span key={h} style={{fontSize:"9px",letterSpacing:"1.5px",textTransform:"uppercase",color:"rgba(255,255,255,0.28)",fontWeight:600}}>{h}</span>
          ))}
        </div>
      )}

      <div style={{overflowY:"auto",flex:1}}>
        {shrinks.map(s=>{
          const sel = s.shrink_id===selectedId;
          return (
            <div key={s.shrink_id} onClick={()=>onSelect(s)}
              style={{
                padding:shifted?"12px 16px":"12px 24px",
                borderBottom:"1px solid rgba(255,255,255,0.05)",
                cursor:"pointer",
                background:sel?"rgba(167,139,250,0.1)":"transparent",
                borderLeft:sel?"3px solid #a78bfa":"3px solid transparent",
                transition:"background 0.2s,border-color 0.2s",
              }}
              onMouseEnter={e=>{ if(!sel) e.currentTarget.style.background="rgba(255,255,255,0.04)"; }}
              onMouseLeave={e=>{ if(!sel) e.currentTarget.style.background="transparent"; }}
            >
              {shifted ? (
                <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:"13px",fontWeight:700,color:"#fff",margin:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.prod_nm}</p>
                    <p style={{fontSize:"10px",color:"rgba(255,255,255,0.4)",margin:"2px 0 0"}}>{s.prod_ver} · {s.shrink_ratio}% shrink</p>
                  </div>
                  <StatusBadge status={s.status}/>
                </div>
              ) : (
                <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr",gap:"0",alignItems:"center"}}>
                  <div>
                    <p style={{fontSize:"13px",fontWeight:700,color:"#fff",margin:0}}>{s.prod_nm}</p>
                    <p style={{fontSize:"10px",color:"rgba(255,255,255,0.4)",margin:"2px 0 0"}}>{s.prod_ver}</p>
                  </div>
                  <span style={{fontSize:"13px",color:"#67e8f9",fontWeight:600}}>{s.cra_center}°</span>
                  <span style={{fontSize:"13px",color:"#a78bfa",fontWeight:600}}>{s.cra_corner}°</span>
                  <span style={{fontSize:"13px",color:"#f472b6",fontWeight:600}}>{s.cra_margin}°</span>
                  <span style={{fontSize:"13px",color:"#fbbf24",fontWeight:600}}>{s.shrink_ratio}%</span>
                  <StatusBadge status={s.status}/>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// — Detail / Edit Panel
// ————————————————————————————————————————

function DetailPanel({ shrink, isNew, onSave, onClose }) {
  const [form, setForm]   = useState({...shrink});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  const availableVersions = PRODUCTS.find(p=>p.prod_nm===form.prod_nm)?.versions ?? [];
  const editableFields = Object.keys(fieldMap).filter(k=>k!=="shrink_id");

  const handleSave = () => {
    setSaving(true);
    setTimeout(()=>{ setSaving(false); setSaved(true); onSave(form); setTimeout(()=>setSaved(false),2000); },800);
  };

  const inputStyle = {
    width:"100%",background:"rgba(255,255,255,0.07)",
    border:"1px solid rgba(255,255,255,0.12)",borderRadius:"8px",
    padding:"9px 12px",color:"#fff",fontSize:"13px",outline:"none",
    boxSizing:"border-box",fontFamily:"inherit",
  };

  return (
    <div style={{
      width:"420px",minWidth:"420px",
      background:"rgba(180,180,195,0.13)",
      backdropFilter:"blur(24px) saturate(1.4)",
      WebkitBackdropFilter:"blur(24px) saturate(1.4)",
      borderRadius:"16px",
      border:"1px solid rgba(255,255,255,0.13)",
      display:"flex",flexDirection:"column",overflow:"hidden",
      animation:"slideIn 0.4s cubic-bezier(0.34,1.56,0.64,1)",
      boxShadow:"0 24px 64px rgba(0,0,0,0.5)",
      maxHeight:"76vh",
    }}>
      <div style={{padding:"20px 24px 16px",borderBottom:"1px solid rgba(255,255,255,0.07)",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <p style={{fontSize:"10px",letterSpacing:"4px",textTransform:"uppercase",color:isNew?"#c084fc":"#a78bfa",margin:"0 0 4px",fontWeight:500}}>
            {isNew?"New Entry":"Edit Entry"}
          </p>
          <h2 style={{fontSize:"17px",fontWeight:800,color:"#fff",margin:0}}>
            {isNew ? "Add CRA Shrink" : `${form.prod_nm} ${form.prod_ver}`}
          </h2>
        </div>
        <button onClick={onClose} style={{background:"none",border:"none",color:"rgba(255,255,255,0.4)",fontSize:"20px",cursor:"pointer",lineHeight:1,padding:"4px"}}>×</button>
      </div>

      <div style={{overflowY:"auto",flex:1,padding:"20px 24px"}}>
        {!isNew && (
          <div style={{marginBottom:"20px",padding:"14px",background:"rgba(255,255,255,0.05)",borderRadius:"10px",border:"1px solid rgba(255,255,255,0.08)"}}>
            <p style={{fontSize:"10px",letterSpacing:"2px",textTransform:"uppercase",color:"rgba(255,255,255,0.35)",margin:"0 0 8px"}}>CRA Summary</p>
            <div style={{display:"flex",gap:"20px"}}>
              {[["Center",form.cra_center,"#67e8f9"],["Corner",form.cra_corner,"#a78bfa"],["Margin",form.cra_margin,"#f472b6"]].map(([l,v,col])=>(
                <div key={l} style={{textAlign:"center"}}>
                  <div style={{fontSize:"20px",fontWeight:800,color:col,lineHeight:1}}>{v||"—"}°</div>
                  <div style={{fontSize:"9px",color:"rgba(255,255,255,0.35)",letterSpacing:"1px",marginTop:"3px"}}>{l.toUpperCase()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isNew && (
          <div style={{marginBottom:"14px"}}>
            <label style={{fontSize:"10px",letterSpacing:"2px",textTransform:"uppercase",color:"rgba(255,255,255,0.3)",fontWeight:600,display:"block",marginBottom:"5px"}}>Shrink ID</label>
            <div style={{...inputStyle,color:"rgba(255,255,255,0.3)",cursor:"not-allowed"}}>{form.shrink_id}</div>
          </div>
        )}

        {editableFields.map(col=>{
          const label = toLabel(col);
          if(col==="prod_nm") return (
            <div key={col} style={{marginBottom:"14px"}}>
              <label style={{fontSize:"10px",letterSpacing:"2px",textTransform:"uppercase",color:"rgba(255,255,255,0.45)",fontWeight:600,display:"block",marginBottom:"5px"}}>{label}</label>
              <select value={form.prod_nm} onChange={e=>setForm(f=>({...f,prod_nm:e.target.value,prod_ver:""}))} style={{...inputStyle,cursor:"pointer"}}>
                <option value="" style={{background:"#1a1a2e"}}>— Select Product —</option>
                {PRODUCTS.map(p=><option key={p.prod_nm} value={p.prod_nm} style={{background:"#1a1a2e"}}>{p.prod_nm}</option>)}
              </select>
            </div>
          );
          if(col==="prod_ver") return (
            <div key={col} style={{marginBottom:"14px"}}>
              <label style={{fontSize:"10px",letterSpacing:"2px",textTransform:"uppercase",color:"rgba(255,255,255,0.45)",fontWeight:600,display:"block",marginBottom:"5px"}}>{label}</label>
              <select value={form.prod_ver} onChange={e=>setForm(f=>({...f,prod_ver:e.target.value}))} style={{...inputStyle,cursor:"pointer"}} disabled={!form.prod_nm}>
                <option value="" style={{background:"#1a1a2e"}}>— Select Version —</option>
                {availableVersions.map(v=><option key={v} value={v} style={{background:"#1a1a2e"}}>{v}</option>)}
              </select>
            </div>
          );
          if(col==="status") return (
            <div key={col} style={{marginBottom:"14px"}}>
              <label style={{fontSize:"10px",letterSpacing:"2px",textTransform:"uppercase",color:"rgba(255,255,255,0.45)",fontWeight:600,display:"block",marginBottom:"5px"}}>{label}</label>
              <select value={form[col]??""} onChange={e=>setForm(f=>({...f,[col]:e.target.value}))} style={{...inputStyle,cursor:"pointer"}}>
                <option value="Active" style={{background:"#1a1a2e"}}>Active</option>
                <option value="Legacy" style={{background:"#1a1a2e"}}>Legacy</option>
                <option value="EOL"    style={{background:"#1a1a2e"}}>EOL</option>
              </select>
            </div>
          );
          const isCra = col.startsWith("cra_");
          return (
            <div key={col} style={{marginBottom:"14px"}}>
              <label style={{fontSize:"10px",letterSpacing:"2px",textTransform:"uppercase",color:"rgba(255,255,255,0.45)",fontWeight:600,display:"block",marginBottom:"5px"}}>{label}</label>
              <div style={{position:"relative"}}>
                <input type={isCra||col==="shrink_ratio"||col==="target_nm"?"number":"text"}
                  value={form[col]??""} onChange={e=>setForm(f=>({...f,[col]:e.target.value}))}
                  style={{...inputStyle, paddingRight: isCra?"36px":"12px"}}/>
                {isCra && <span style={{position:"absolute",right:"12px",top:"50%",transform:"translateY(-50%)",color:"rgba(255,255,255,0.3)",fontSize:"13px",pointerEvents:"none"}}>°</span>}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{padding:"16px 24px",borderTop:"1px solid rgba(255,255,255,0.07)",flexShrink:0,display:"flex",gap:"10px"}}>
        <button onClick={onClose}
          style={{flex:1,padding:"10px",borderRadius:"8px",border:"1px solid rgba(255,255,255,0.12)",background:"transparent",color:"rgba(255,255,255,0.6)",fontSize:"13px",fontWeight:600,cursor:"pointer",transition:"background 0.2s"}}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.06)"}
          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          Cancel
        </button>
        <button onClick={handleSave}
          style={{flex:2,padding:"10px",borderRadius:"8px",border:"none",
            background:saved?"linear-gradient(135deg,#34d399,#059669)":"linear-gradient(135deg,#7c3aed,#a855f7)",
            color:"#fff",fontSize:"13px",fontWeight:700,cursor:"pointer",
            boxShadow:"0 4px 14px rgba(124,58,237,0.4)",transition:"background 0.3s"}}>
          {saving?"Saving…":saved?"✓ Saved":isNew?"Add Entry":"Save Changes"}
        </button>
      </div>
    </div>
  );
}

// — Main Page
// ————————————————————————————————————————

export default function ShrinkPage() {
  const [shrinks, setShrinks]       = useState(INIT_SHRINKS);
  const [selected, setSelected]     = useState(null);
  const [isNew, setIsNew]           = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const handleSelect = (s) => { setSelected(s); setIsNew(false); setShowDetail(true); };
  const handleAdd    = ()  => { setSelected({...EMPTY_SHRINK}); setIsNew(true); setShowDetail(true); };
  const handleClose  = ()  => { setShowDetail(false); setTimeout(()=>setSelected(null),400); };
  const handleSave   = (form) => {
    if(isNew) setShrinks(ss=>[...ss,{...form, shrink_id:`SHK-${Date.now()}`}]);
    else setShrinks(ss=>ss.map(s=>s.shrink_id===form.shrink_id?form:s));
    setSelected(form);
  };

  return (
    <div style={{position:"fixed",inset:0,background:"#04030f",fontFamily:"Inter,system-ui,sans-serif",color:"#fff",display:"flex",flexDirection:"column",overflow:"hidden"}}>

      <header style={{flexShrink:0,height:"60px",zIndex:100,background:"rgba(8,8,24,0.9)",backdropFilter:"blur(16px)",borderBottom:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",padding:"0 24px",gap:"16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"10px",userSelect:"none"}}>
          <MiniGrid size={7}/>
          <div style={{display:"flex",alignItems:"baseline"}}>
            <span style={{fontSize:"21px",fontWeight:900,letterSpacing:"4px",color:"#fff",WebkitTextFillColor:"#fff"}}>LAY</span>
            <span style={{fontSize:"21px",fontWeight:900,color:"#fff",WebkitTextFillColor:"#fff",letterSpacing:"1px"}}>:D</span>
          </div>
        </div>
        <div style={{width:"1px",height:"20px",background:"rgba(255,255,255,0.12)"}}/>
        <span style={{fontSize:"13px",color:"rgba(255,255,255,0.45)",letterSpacing:"1px"}}>SHRINK</span>
        <div style={{flex:1}}/>
        <button onClick={()=>window.history.back()}
          style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"rgba(255,255,255,0.6)",padding:"6px 14px",fontSize:"12px",cursor:"pointer",letterSpacing:"0.5px"}}>
          ← Home
        </button>
      </header>

      <div style={{flex:1,position:"relative",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",minHeight:0}}>
        <BgSlideshow/>
        <div style={{position:"relative",zIndex:2,display:"flex",gap:"16px",alignItems:"flex-start",padding:"24px",maxWidth:"100%",overflow:"hidden"}}>
          <ShrinkListPanel shrinks={shrinks} selectedId={selected?.shrink_id} onSelect={handleSelect} onAdd={handleAdd} shifted={showDetail}/>
          {showDetail && selected && (
            <DetailPanel key={selected.shrink_id+String(isNew)} shrink={selected} isNew={isNew} onSave={handleSave} onClose={handleClose}/>
          )}
        </div>
      </div>

      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes slideIn{from{opacity:0;transform:translateX(24px) scale(0.97);}to{opacity:1;transform:translateX(0) scale(1);}}
        input,textarea,select{color-scheme:dark;}
        input[type=number]::-webkit-inner-spin-button{opacity:0.3;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.12);border-radius:2px;}
      `}</style>
    </div>
  );
}
