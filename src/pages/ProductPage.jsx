import { useState, useEffect, useRef } from "react";

// — fieldMap (inlined)
// ————————————————————————————————————————

const fieldMap = {
  prod_id:    "Product ID",
  prod_nm:    "Product Name",
  prod_desc:  "Description",
  pixel_size: "Pixel Size (μm)",
  resolution: "Resolution (MP)",
  sensor_size:"Sensor Size",
  release_dt: "Release Date",
  status:     "Status",
};
const toLabel  = col  => fieldMap[col]  ?? col;
const toColumn = label =>
  Object.entries(fieldMap).find(([,v])=>v===label)?.[0] ?? label;

// — Mock data
// ————————————————————————————————————————

const INIT_PRODUCTS = [
  { prod_id:"ISOCELL-HP9", prod_nm:"ISOCELL HP9",
    prod_desc:"Industry's first 200MP telephoto sensor with 0.56μm pixels and high-refractive microlens.", pixel_size:"0.56",
    resolution:"200", sensor_size:"1/1.4", release_dt:"2024-06-27", status:"Active" },
  { prod_id:"ISOCELL-GNJ", prod_nm:"ISOCELL GNJ",
    prod_desc:"50MP dual-pixel sensor with 1.0μm pixels. Lower power consumption and improved video quality.", pixel_size:"1.0",
    resolution:"50", sensor_size:"1/1.57", release_dt:"2024-06-27", status:"Active" },
  { prod_id:"ISOCELL-JN5", prod_nm:"ISOCELL JN5",
    prod_desc:"50MP sensor with Dual VTG technology for ultra-low-light and Super QPD autofocus.", pixel_size:"0.64", resolution:"50",
    sensor_size:"1/2.76", release_dt:"2024-06-27", status:"Active" },
  { prod_id:"ISOCELL-HP2", prod_nm:"ISOCELL HP2",
    prod_desc:"200MP sensor in Galaxy S23 Ultra. Adaptive Pixel and Super QPD for any condition.", pixel_size:"0.6", resolution:"200",
    sensor_size:"1/1.3", release_dt:"2023-01-17", status:"Active" },
  { prod_id:"ISOCELL-GN3", prod_nm:"ISOCELL GN3",
    prod_desc:"50MP stacked DRAM sensor with the fastest readout speed. Supports 8K video at 30fps.", pixel_size:"1.0",
    resolution:"50", sensor_size:"1/1.56", release_dt:"2022-05-11", status:"Active" },
  { prod_id:"ISOCELL-HM6", prod_nm:"ISOCELL HM6",
    prod_desc:"108MP mid-range sensor with Nona-cell technology for bright low-light shots.", pixel_size:"0.7", resolution:"108",
    sensor_size:"1/1.67", release_dt:"2022-03-09", status:"Legacy" },
];
const EMPTY = { prod_id:"", prod_nm:"", prod_desc:"", pixel_size:"",
  resolution:"", sensor_size:"", release_dt:"", status:"Active" };

// — BG slide images (milky way)
// ————————————————————————————————————————

const BG_IMAGES = [
  "https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=1600&q=80",
  "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1600&q=80",
  "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1600&q=80",
  "https://images.unsplash.com/photo-1464802686167-b939a6910659?w=1600&q=80",
];

// — MiniGrid (sparkle)
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
        const id=setInterval(()=>{ if(cells[i]) {cells[i].style.backgroundColor=rndC();cells[i].style.opacity=rndA();} }, 300+Math.random()*600);
        timers.current.push(id);
      }, Math.random()*800);
      timers.current.push(t);
    }
    return ()=>{ timers.current.forEach(id=>{clearInterval(id);clearTimeout(id);}); };
  },[size]);
  return <div ref={ref} style={{display:"grid",width:"36px",height:"36px",gap:"1px",backgroundColor:"#1a1a2e",borderRadius:"4px",overflow:"hidden",flexShrink:0}}/>;
}

// — Status badge
// ————————————————————————————————————————

function StatusBadge({ status }) {
  const color = status === "Active"
    ? { bg:"rgba(52,211,153,0.15)", text:"#34d399", border:"rgba(52,211,153,0.3)" }
    : { bg:"rgba(251,146,60,0.15)", text:"#fb923c", border:"rgba(251,146,60,0.3)" };
  return (
    <span style={{fontSize:"10px",fontWeight:600,letterSpacing:"1px",textTransform:"uppercase",
      background:color.bg, color:color.text, border:`1px solid ${color.border}`,
      borderRadius:"20px", padding:"2px 8px"}}>
      {status}
    </span>
  );
}

// — Product List Panel
// ————————————————————————————————————————

function ProductListPanel({ products, selectedId, onSelect, onAdd, shifted }) {
  return (
    <div style={{
      width: shifted ? "340px" : "640px",
      minWidth: shifted ? "340px" : "640px",
      background:"rgba(180,180,195,0.13)",
      backdropFilter:"blur(24px) saturate(1.4)",
      WebkitBackdropFilter:"blur(24px) saturate(1.4)",
      borderRadius:"16px",
      border:"1px solid rgba(255,255,255,0.13)",
      display:"flex", flexDirection:"column",
      overflow:"hidden",
      transition:"width 0.4s cubic-bezier(0.4,0,0.2,1), min-width 0.4s cubic-bezier(0.4,0,0.2,1)",
      boxShadow:"0 24px 64px rgba(0,0,0,0.5)",
      maxHeight:"72vh",
    }}>
      <div style={{padding:"20px 24px 16px", borderBottom:"1px solid rgba(255,255,255,0.07)", flexShrink:0, display:"flex",
        alignItems:"center", justifyContent:"space-between"}}>
        <div>
          <p style={{fontSize:"10px",letterSpacing:"4px",textTransform:"uppercase",color:"#67e8f9",margin:"0 0 4px",fontWeight:500}}>Database</p>
          <h2 style={{fontSize:"18px",fontWeight:800,color:"#fff",margin:0}}>Products</h2>
        </div>
        <button onClick={onAdd} style={{
          width:"32px",height:"32px",borderRadius:"50%",border:"none",cursor:"pointer",
          background:"linear-gradient(135deg,#3b82f6,#7c3aed)",
          color:"#fff",fontSize:"20px",fontWeight:300,lineHeight:1,
          display:"flex",alignItems:"center",justifyContent:"center",
          boxShadow:"0 4px 12px rgba(59,130,246,0.4)",
          transition:"transform 0.15s, box-shadow 0.15s",
        }}
        onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.1)";e.currentTarget.style.boxShadow="0 6px 18px rgba(59,130,246,0.55)";}}
        onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="0 4px 12px rgba(59,130,246,0.4)";}}
        title="Add new product">+</button>
      </div>

      <div style={{overflowY:"auto",flex:1}}>
        {products.map(p => {
          const selected = p.prod_id === selectedId;
          return (
            <div key={p.prod_id} onClick={()=>onSelect(p)}
              style={{
                padding: shifted ? "12px 16px" : "14px 24px",
                borderBottom:"1px solid rgba(255,255,255,0.05)",
                cursor:"pointer",
                background: selected ? "rgba(103,232,249,0.08)" : "transparent",
                borderLeft: selected ? "3px solid #67e8f9" : "3px solid transparent",
                transition:"background 0.2s, border-color 0.2s",
              }}
              onMouseEnter={e=>{ if(!selected) e.currentTarget.style.background="rgba(255,255,255,0.04)"; }}
              onMouseLeave={e=>{ if(!selected) e.currentTarget.style.background="transparent"; }}
            >
              {shifted ? (
                <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:"13px",fontWeight:700,color:"#fff",margin:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.prod_nm}</p>
                    <p style={{fontSize:"10px",color:"rgba(255,255,255,0.4)",margin:"2px 0 0"}}>{p.resolution}MP · {p.pixel_size}μm</p>
                  </div>
                  <StatusBadge status={p.status}/>
                </div>
              ) : (
                <div style={{display:"flex",alignItems:"center",gap:"16px"}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"4px"}}>
                      <p style={{fontSize:"15px",fontWeight:700,color:"#fff",margin:0}}>{p.prod_nm}</p>
                      <StatusBadge status={p.status}/>
                    </div>
                    <p style={{fontSize:"12px",color:"rgba(255,255,255,0.5)",margin:"0 0 6px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.prod_desc}</p>
                    <div style={{display:"flex",gap:"16px"}}>
                      {[["Resolution", `${p.resolution}MP`],["Pixel",`${p.pixel_size}μm`],["Sensor",p.sensor_size]].map(([l,v])=>(
                        <div key={l}>
                          <span style={{fontSize:"9px",color:"rgba(255,255,255,0.3)",letterSpacing:"1px",textTransform:"uppercase"}}>{l}</span>
                          <p style={{fontSize:"12px",color:"#67e8f9",fontWeight:600,margin:0}}>{v}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <svg width="16" height="16" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" viewBox="0 0 24 24" style={{flexShrink:0}}>
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
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

function DetailPanel({ product, isNew, onSave, onClose }) {
  const [form, setForm] = useState({...product});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  const fields = Object.keys(fieldMap).filter(k => k !== "prod_id");

  const handleSave = () => {
    setSaving(true);
    setTimeout(()=>{ setSaving(false); setSaved(true); onSave(form); setTimeout(()=>setSaved(false),2000); }, 800);
  };

  return (
    <div style={{
      width:"440px", minWidth:"440px",
      background:"rgba(180,180,195,0.13)",
      backdropFilter:"blur(24px) saturate(1.4)",
      WebkitBackdropFilter:"blur(24px) saturate(1.4)",
      borderRadius:"16px",
      border:"1px solid rgba(255,255,255,0.13)",
      display:"flex", flexDirection:"column",
      overflow:"hidden",
      animation:"slideIn 0.4s cubic-bezier(0.34,1.56,0.64,1)",
      boxShadow:"0 24px 64px rgba(0,0,0,0.5)",
      maxHeight:"72vh",
    }}>
      <div style={{padding:"20px 24px 16px",borderBottom:"1px solid rgba(255,255,255,0.07)",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <p style={{fontSize:"10px",letterSpacing:"4px",textTransform:"uppercase",color:isNew?"#a78bfa":"#67e8f9",margin:"0 0 4px",fontWeight:500}}>
            {isNew ? "New Product" : "Edit Product"}
          </p>
          <h2 style={{fontSize:"18px",fontWeight:800,color:"#fff",margin:0}}>
            {isNew ? "Add Product" : form.prod_nm || "—"}
          </h2>
        </div>
        <button onClick={onClose} style={{background:"none",border:"none",color:"rgba(255,255,255,0.4)",fontSize:"20px",cursor:"pointer",lineHeight:1,padding:"4px"}}>×</button>
      </div>

      <div style={{overflowY:"auto",flex:1,padding:"20px 24px"}}>
        {!isNew && (
          <div style={{marginBottom:"16px"}}>
            <label style={{fontSize:"10px",letterSpacing:"2px",textTransform:"uppercase",color:"rgba(255,255,255,0.35)",fontWeight:600,display:"block",marginBottom:"6px"}}>
              {toLabel("prod_id")}
            </label>
            <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"8px",padding:"9px 12px",color:"rgba(255,255,255,0.35)",fontSize:"13px"}}>
              {form.prod_id}
            </div>
          </div>
        )}
        {fields.map(col => (
          <div key={col} style={{marginBottom:"16px"}}>
            <label style={{fontSize:"10px",letterSpacing:"2px",textTransform:"uppercase",color:"rgba(255,255,255,0.45)",fontWeight:600,display:"block",marginBottom:"6px"}}>
              {toLabel(col)}
            </label>
            {col === "prod_desc" ? (
              <textarea value={form[col] ?? ""} onChange={e=>setForm(f=>({...f,[col]:e.target.value}))} rows={3}
                style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",padding:"9px 12px",color:"#fff",fontSize:"13px",resize:"vertical",outline:"none",fontFamily:"inherit",lineHeight:1.6,boxSizing:"border-box"}}/>
            ) : col === "status" ? (
              <select value={form[col]??""} onChange={e=>setForm(f=>({...f,[col]:e.target.value}))}
                style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",padding:"9px 12px",color:"#fff",fontSize:"13px",outline:"none",cursor:"pointer"}}>
                <option value="Active" style={{background:"#1a1a2e"}}>Active</option>
                <option value="Legacy" style={{background:"#1a1a2e"}}>Legacy</option>
                <option value="EOL"    style={{background:"#1a1a2e"}}>EOL</option>
              </select>
            ) : (
              <input value={form[col] ?? ""} onChange={e=>setForm(f=>({...f,[col]:e.target.value}))}
                style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",padding:"9px 12px",color:"#fff",fontSize:"13px",outline:"none",boxSizing:"border-box"}}/>
            )}
          </div>
        ))}
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
            background: saved ? "linear-gradient(135deg,#34d399,#059669)" : "linear-gradient(135deg,#3b82f6,#7c3aed)",
            color:"#fff",fontSize:"13px",fontWeight:700,cursor:"pointer",
            boxShadow:"0 4px 14px rgba(59,130,246,0.35)",transition:"background 0.3s"}}>
          {saving ? "Saving…" : saved ? "✓ Saved" : isNew ? "Add Product" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

// — Background slideshow
// ————————————————————————————————————————

function BgSlideshow() {
  const [cur, setCur]   = useState(0);
  const [prev, setPrev] = useState(null);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setPrev(c => c); setFading(true);
      setCur(c => (c + 1) % BG_IMAGES.length);
      setTimeout(() => { setPrev(null); setFading(false); }, 1200);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ position:"absolute", inset:0, zIndex:0, background:"#04030f" }}>
      {prev !== null && (
        <img src={BG_IMAGES[prev]} alt="" style={{
          position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover",
          opacity: fading ? 0 : 0.28, transition:"opacity 1.2s ease",
          filter:"brightness(0.55) saturate(1.3) hue-rotate(10deg)",
        }}/>
      )}
      <img key={cur} src={BG_IMAGES[cur]} alt="" style={{
        position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover",
        opacity: 0.72, transition:"opacity 1.2s ease",
        filter:"brightness(0.6) saturate(1.4) hue-rotate(10deg)",
      }}/>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 40%, rgba(60,30,120,0.12) 0%, rgba(4,3,15,0.45) 70%)"}}/>
      <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom, transparent 40%, rgba(4,3,15,0.3) 100%)"}}/>
    </div>
  );
}

// — Main Page
// ————————————————————————————————————————

export default function ProductPage() {
  const [products, setProducts]     = useState(INIT_PRODUCTS);
  const [selected, setSelected]     = useState(null);
  const [isNew, setIsNew]           = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const handleSelect = (p) => { setSelected(p); setIsNew(false); setShowDetail(true); };
  const handleAdd    = ()  => { setSelected({...EMPTY}); setIsNew(true); setShowDetail(true); };
  const handleClose  = ()  => { setShowDetail(false); setTimeout(()=>setSelected(null),400); };
  const handleSave   = (form) => {
    if (isNew) { setProducts(ps=>[...ps, form]); }
    else { setProducts(ps=>ps.map(p=>p.prod_id===form.prod_id ? form : p)); setSelected(form); }
  };

  return (
    <div style={{position:"fixed",inset:0,background:"#080818",fontFamily:"Inter,system-ui,sans-serif",color:"#fff",display:"flex",flexDirection:"column",overflow:"hidden"}}>

      <header style={{flexShrink:0,height:"60px",zIndex:100,background:"rgba(8,8,24,0.9)",backdropFilter:"blur(16px)",borderBottom:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",padding:"0 24px",gap:"16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"10px",userSelect:"none"}}>
          <MiniGrid size={7}/>
          <div style={{display:"flex",alignItems:"baseline"}}>
            <span style={{fontSize:"21px",fontWeight:900,letterSpacing:"4px",color:"#fff",WebkitTextFillColor:"#fff"}}>LAY</span>
            <span style={{fontSize:"21px",fontWeight:900,color:"#fff",WebkitTextFillColor:"#fff",letterSpacing:"1px"}}>:D</span>
          </div>
        </div>
        <div style={{width:"1px",height:"20px",background:"rgba(255,255,255,0.12)",marginLeft:"4px"}}/>
        <span style={{fontSize:"13px",color:"rgba(255,255,255,0.45)",letterSpacing:"1px"}}>PRODUCT</span>
        <div style={{flex:1}}/>
        <button onClick={()=>window.history.back()}
          style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"rgba(255,255,255,0.6)",padding:"6px 14px",fontSize:"12px",cursor:"pointer",letterSpacing:"0.5px"}}>
          ← Home
        </button>
      </header>

      <div style={{flex:1,position:"relative",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",minHeight:0}}>
        <BgSlideshow/>
        <div style={{position:"relative",zIndex:2,display:"flex",gap:"16px",alignItems:"flex-start",padding:"24px",maxWidth:"100%",overflow:"hidden"}}>
          <ProductListPanel products={products} selectedId={selected?.prod_id} onSelect={handleSelect} onAdd={handleAdd} shifted={showDetail}/>
          {showDetail && selected && (
            <DetailPanel key={selected.prod_id + String(isNew)} product={selected} isNew={isNew} onSave={handleSave} onClose={handleClose}/>
          )}
        </div>
      </div>

      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes slideIn{from{opacity:0;transform:translateX(24px) scale(0.97);}to{opacity:1;transform:translateX(0) scale(1);}}
        input,textarea,select{color-scheme:dark;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.12);border-radius:2px;}
      `}</style>
    </div>
  );
}
