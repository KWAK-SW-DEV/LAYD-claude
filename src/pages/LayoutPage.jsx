import { useState, useEffect, useRef } from "react";
import ProductTab     from "../tabs/layout/ProductTab";
import DistrictTab    from "../tabs/layout/DistrictTab";
import PlaceholderTab from "../tabs/layout/PlaceholderTab";

// ── Mock data ─────────────────────────────────────────────────────────────
export const productDB = [
  { prod_code:"HP9-A1", prod_nm:"ISOCELL HP9", pitch:0.560,
    cra:{ order:6, coeffs:[0.000000,0.312450,0.001234,-0.000056,0.000002,-0.000000] },
    shrink_ratio:{ OD:[0.985,0.982],POLY:[0.982],CO:[0.978,0.975],M1:[0.975],VIA1:[0.972],M2:[0.970] } },
  { prod_code:"HP9-B1", prod_nm:"ISOCELL HP9", pitch:0.560,
    cra:{ order:6, coeffs:[0.000000,0.314120,0.001180,-0.000048,0.000001,-0.000000] },
    shrink_ratio:{ OD:[0.984],POLY:[0.981],CO:[0.977],M1:[0.974],VIA1:[0.971],M2:[0.969] } },
  { prod_code:"GNJ-A1", prod_nm:"ISOCELL GNJ", pitch:1.000,
    cra:{ order:6, coeffs:[0.000000,0.298760,0.001056,-0.000042,0.000001,-0.000000] },
    shrink_ratio:{ OD:[0.990],POLY:[0.987],CO:[0.984],M1:[0.981],VIA1:[0.979],M2:[0.977] } },
  { prod_code:"JN5-A1", prod_nm:"ISOCELL JN5", pitch:0.640,
    cra:{ order:6, coeffs:[0.000000,0.325600,0.001312,-0.000061,0.000002,-0.000000] },
    shrink_ratio:{ OD:[0.983],POLY:[0.980],CO:[0.976],M1:[0.973],VIA1:[0.970],M2:[0.968] } },
  { prod_code:"HP2-A1", prod_nm:"ISOCELL HP2", pitch:0.600,
    cra:{ order:6, coeffs:[0.000000,0.308900,0.001145,-0.000051,0.000002,-0.000000] },
    shrink_ratio:{ OD:[0.986],POLY:[0.983],CO:[0.979],M1:[0.976],VIA1:[0.973],M2:[0.971] } },
];

const mockLayouts = [
  { layout_id:"LYT-001", prod_code:"HP9-A1", total_col:5120, total_row:4096,
    actv_dum_col:4800, actv_dum_row:3840,
    districts:[{left:64,top:64,right:64,bottom:64,ruler:true}], status:"Active" },
  { layout_id:"LYT-002", prod_code:"GNJ-A1", total_col:4096, total_row:4096,
    actv_dum_col:3840, actv_dum_row:3840,
    districts:[{left:48,top:48,right:48,bottom:48,ruler:false},{left:24,top:24,right:24,bottom:24,ruler:true}], status:"Active" },
  { layout_id:"LYT-003", prod_code:"JN5-A1", total_col:3200, total_row:2400,
    actv_dum_col:3008, actv_dum_row:2240,
    districts:[{left:32,top:32,right:32,bottom:32,ruler:true}], status:"Draft" },
];

const EMPTY_CFG = {
  layout_id:"", prod_code:"",
  total_col:"", total_row:"", actv_dum_col:"", actv_dum_row:"",
  districts:[], status:"Draft",
};

// ── Tab definitions ───────────────────────────────────────────────────────
const TABS = [
  { key:"product",      label:"Product",
    icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>,
    getSummary:(cfg,prod)=>prod?[{label:"Code",value:cfg.prod_code},{label:"Pitch",value:`${prod.pitch} μm`}]:null },
  { key:"district",     label:"District",
    icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><rect x="7" y="7" width="10" height="10" rx="1"/></svg>,
    getSummary:(cfg)=>cfg.total_col&&cfg.total_row?[{label:"Total",value:`${cfg.total_col}×${cfg.total_row}`},{label:"Margins",value:`${cfg.districts?.length||0}`}]:null },
  { key:"parameter",    label:"Parameter",
    icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/><line x1="4" y1="18" x2="18" y2="18"/></svg>,
    getSummary:()=>null },
  { key:"unit",         label:"Unit",
    icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
    getSummary:()=>null },
  { key:"verification", label:"Verification",
    icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    getSummary:()=>null },
  { key:"confirm",      label:"Confirm",
    icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
    getSummary:()=>null },
];

const ACTIVE_BG = "rgba(200,200,215,0.13)";
const ACTIVE_BD = "rgba(255,255,255,0.14)";

const BG_IMAGES = [
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80",
  "https://images.unsplash.com/photo-1601132359864-c974e79890ac?w=1600&q=80",
  "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=1600&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80",
  "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1600&q=80",
];

// ── MiniGrid ──────────────────────────────────────────────────────────────
const GRID_PAL = ["#00f0ff","#38bdf8","#818cf8","#a855f7","#ec4899","#f97316","#facc15","#4ade80","#2dd4bf","#60a5fa","#e879f9","#fb7185","#34d399","#fbbf24","#c084fc"];
function MiniGrid({ size=7 }) {
  const cRef=useRef(null), sRef=useRef({cells:[],timers:[],running:false});
  useEffect(()=>{
    const el=cRef.current; if(!el) return;
    const s=sRef.current;
    s.running=false; s.timers.forEach(id=>cancelAnimationFrame(id)); s.timers=[]; s.cells=[];
    el.innerHTML=""; el.style.gridTemplateColumns=`repeat(${size},1fr)`; el.style.gridTemplateRows=`repeat(${size},1fr)`;
    const total=size*size;
    for(let i=0;i<total;i++){
      const d=document.createElement("div");
      d.style.cssText=`background-color:${GRID_PAL[Math.floor(Math.random()*GRID_PAL.length)]};opacity:${+(0.7+Math.random()*0.3).toFixed(2)};transition:background-color 0.35s,opacity 0.35s;border-radius:1px;`;
      el.appendChild(d); s.cells.push(d);
    }
    s.running=true;
    const iv=Array.from({length:total},()=>280+Math.random()*520);
    const cd=Array.from({length:total},(_,i)=>Math.random()*iv[i]);
    let last=performance.now();
    const tick=now=>{
      if(!s.running) return;
      const dt=now-last; last=now;
      for(let i=0;i<total;i++){
        cd[i]-=dt;
        if(cd[i]<=0){
          const c=s.cells[i];
          if(c){c.style.backgroundColor=GRID_PAL[Math.floor(Math.random()*GRID_PAL.length)];c.style.opacity=+(0.7+Math.random()*0.3).toFixed(2);}
          cd[i]=iv[i]+(Math.random()-0.5)*120;
        }
      }
      s.timers[0]=requestAnimationFrame(tick);
    };
    s.timers[0]=requestAnimationFrame(tick);
    return()=>{s.running=false;s.timers.forEach(id=>cancelAnimationFrame(id));s.timers=[];};
  },[size]);
  return <div ref={cRef} style={{display:"grid",width:"36px",height:"36px",gap:"1px",backgroundColor:"#1a1a2e",borderRadius:"4px",overflow:"hidden",flexShrink:0}}/>;
}

// ── BgSlideshow ───────────────────────────────────────────────────────────
function BgSlideshow() {
  const [cur,setCur]=useState(0),[prev,setPrev]=useState(null),[fading,setFading]=useState(false);
  useEffect(()=>{
    const id=setInterval(()=>{
      setPrev(c=>c); setFading(true); setCur(c=>(c+1)%BG_IMAGES.length);
      setTimeout(()=>{setPrev(null);setFading(false);},3000);
    },8000);
    return()=>clearInterval(id);
  },[]);
  return(
    <div style={{position:"absolute",inset:0,zIndex:0,background:"#020510"}}>
      {prev!==null&&<img src={BG_IMAGES[prev]} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:fading?0:0.65,transition:"opacity 3s ease",filter:"brightness(0.4) saturate(0.8) hue-rotate(180deg)"}}/>}
      <img key={cur} src={BG_IMAGES[cur]} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:fading?0:0.65,transition:"opacity 3s ease",filter:"brightness(0.4) saturate(0.8) hue-rotate(180deg)"}}/>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 40%,rgba(20,10,60,0.2) 0%,rgba(2,5,16,0.5) 75%)"}}/>
    </div>
  );
}

// ── LoadModal ─────────────────────────────────────────────────────────────
function LoadModal({onLoad,onNew,onClose}) {
  const [hov,setHov]=useState(null),[vis,setVis]=useState(false);
  useEffect(()=>{const t=setTimeout(()=>setVis(true),30);return()=>clearTimeout(t);},[]);
  return(
    <div style={{position:"fixed",inset:0,zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",background:`rgba(0,0,0,${vis?0.62:0})`,backdropFilter:"blur(10px)",transition:"background 0.3s"}}>
      <div style={{background:"rgba(20,20,28,0.97)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"20px",padding:"32px",width:"480px",maxWidth:"92vw",boxShadow:"0 40px 100px rgba(0,0,0,0.7)",position:"relative",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(16px)",transition:"opacity 0.35s,transform 0.35s"}}>
        <button onClick={onClose} style={{position:"absolute",top:"14px",right:"16px",background:"none",border:"none",color:"rgba(255,255,255,0.3)",fontSize:"18px",cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.color="#fff"} onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.3)"}>✕</button>
        <p style={{fontSize:"10px",letterSpacing:"5px",textTransform:"uppercase",color:"#818cf8",margin:"0 0 5px",fontWeight:600}}>Layout Designer</p>
        <h2 style={{fontSize:"20px",fontWeight:900,color:"#fff",margin:"0 0 4px"}}>Select Session</h2>
        <p style={{fontSize:"12px",color:"rgba(255,255,255,0.32)",margin:"0 0 22px"}}>Load an existing layout or start fresh.</p>
        <div style={{maxHeight:"210px",overflowY:"auto",marginBottom:"14px"}}>
          {mockLayouts.map((l,i)=>(
            <div key={l.layout_id} onClick={()=>onLoad(l)}
              style={{padding:"10px 14px",borderRadius:"10px",cursor:"pointer",marginBottom:"6px",display:"flex",alignItems:"center",gap:"12px",background:hov===i?"rgba(99,102,241,0.14)":"rgba(255,255,255,0.04)",border:`1px solid ${hov===i?"rgba(99,102,241,0.45)":"rgba(255,255,255,0.07)"}`,transition:"all 0.18s",transform:hov===i?"translateX(3px)":"translateX(0)"}}
              onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"2px"}}>
                  <span style={{fontSize:"13px",fontWeight:700,color:"#a5b4fc"}}>{l.layout_id}</span>
                  <span style={{fontSize:"10px",padding:"1px 7px",borderRadius:"10px",fontWeight:600,background:l.status==="Active"?"rgba(52,211,153,0.15)":"rgba(251,191,36,0.15)",color:l.status==="Active"?"#34d399":"#fbbf24",border:`1px solid ${l.status==="Active"?"rgba(52,211,153,0.3)":"rgba(251,191,36,0.3)"}`}}>{l.status}</span>
                </div>
                <span style={{fontSize:"11px",color:"rgba(255,255,255,0.32)"}}>{l.prod_code} · {l.total_col}×{l.total_row}</span>
              </div>
              <svg width="13" height="13" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          ))}
        </div>
        <button onClick={onNew} style={{width:"100%",padding:"12px",borderRadius:"10px",border:"1px dashed rgba(99,102,241,0.4)",background:"rgba(99,102,241,0.07)",color:"#a5b4fc",fontSize:"13px",fontWeight:600,cursor:"pointer",transition:"all 0.2s"}}
          onMouseEnter={e=>{e.currentTarget.style.background="rgba(99,102,241,0.16)";e.currentTarget.style.borderColor="rgba(99,102,241,0.65)";}}
          onMouseLeave={e=>{e.currentTarget.style.background="rgba(99,102,241,0.07)";e.currentTarget.style.borderColor="rgba(99,102,241,0.4)";}}>
          + New Layout
        </button>
      </div>
    </div>
  );
}

// ── TabItem ───────────────────────────────────────────────────────────────
function TabItem({tab,isActive,isDone,summary,onClick}) {
  const [hov,setHov]=useState(false);
  return(
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{padding:"10px 16px",borderRadius:"10px 10px 0 0",cursor:"pointer",minWidth:"100px",userSelect:"none",flexShrink:0,
        background:isActive?ACTIVE_BG:(hov?"rgba(255,255,255,0.07)":(isDone?"rgba(255,255,255,0.07)":"rgba(255,255,255,0.04)")),
        border:`1px solid ${isActive?ACTIVE_BD:"rgba(255,255,255,0.08)"}`,
        borderBottom:isActive?`1px solid ${ACTIVE_BG}`:"1px solid rgba(255,255,255,0.08)",
        marginBottom:isActive?"-1px":"0",
        zIndex:isActive?2:1, position:"relative",
        transition:"background 0.2s,border-color 0.2s"}}>
      <div style={{display:"flex",alignItems:"center",gap:"7px"}}>
        <span style={{color:isActive?"#e0e7ff":(isDone?"rgba(255,255,255,0.7)":"rgba(255,255,255,0.35)"),transition:"color 0.2s"}}>{tab.icon}</span>
        <span style={{fontSize:"12px",fontWeight:isActive?700:500,color:isActive?"#fff":(isDone?"rgba(255,255,255,0.7)":"rgba(255,255,255,0.35)"),transition:"color 0.2s"}}>{tab.label}</span>
        {isDone&&!isActive&&(
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="5" fill="rgba(52,211,153,0.25)" stroke="rgba(52,211,153,0.6)" strokeWidth="1"/>
            <polyline points="3,6 5.5,8.5 9,4" stroke="#34d399" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      {isDone&&!isActive&&summary&&(
        <div style={{marginTop:"5px",display:"flex",flexDirection:"column",gap:"2px"}}>
          {summary.map(s=>(
            <div key={s.label} style={{display:"flex",gap:"5px",alignItems:"baseline"}}>
              <span style={{fontSize:"9px",color:"rgba(255,255,255,0.28)"}}>{s.label}</span>
              <span style={{fontSize:"11px",fontWeight:600,color:"rgba(255,255,255,0.6)"}}>{s.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 작은 탭: body 60% center / 큰 탭: body 100%
const SMALL_TABS = ["product","verification","confirm"];

// ── TabWidget ─────────────────────────────────────────────────────────────
function TabWidget({cfg,onChange,selProd,onProductSelect}) {
  const [activeKey,setActiveKey]=useState("product");
  const [vis,setVis]=useState(false);
  useEffect(()=>{const t=setTimeout(()=>setVis(true),60);return()=>clearTimeout(t);},[]);

  const isDone=key=>{
    if(key==="product")  return !!cfg.prod_code;
    if(key==="district") return !!(cfg.total_col&&cfg.total_row);
    return false;
  };

  const renderBody=()=>{
    switch(activeKey){
      case "product":  return <ProductTab  cfg={cfg} onChange={onChange} selProd={selProd} onProductSelect={onProductSelect}/>;
      case "district": return <DistrictTab cfg={cfg} onChange={onChange}/>;
      default:         return <PlaceholderTab label={TABS.find(t=>t.key===activeKey)?.label||activeKey}/>;
    }
  };

  const isSmall = SMALL_TABS.includes(activeKey);

  return(
    <div style={{
      opacity:vis?1:0, transform:vis?"translateY(0)":"translateY(14px)",
      transition:"opacity 0.4s ease,transform 0.4s ease",
      width:"80vw", maxWidth:"80vw", minWidth:"800px",
    }}>
      {/* Tab bar — 항상 전체 너비에 걸쳐 */}
      <div style={{display:"flex",gap:"4px",alignItems:"flex-end"}}>
        {TABS.map(tab=>(
          <TabItem key={tab.key} tab={tab}
            isActive={activeKey===tab.key}
            isDone={isDone(tab.key)}
            summary={tab.getSummary(cfg,selProd)}
            onClick={()=>setActiveKey(tab.key)}
          />
        ))}
      </div>

      {/* Tab body — 항상 80vw, 내부에서 작은탭은 60% center */}
      <div style={{
        width:"100%",
        background:ACTIVE_BG,
        backdropFilter:"blur(22px) saturate(1.2)",
        WebkitBackdropFilter:"blur(22px) saturate(1.2)",
        border:`1px solid ${ACTIVE_BD}`,
        borderRadius:"0 10px 10px 10px",
        padding:"28px",
        boxShadow:"0 12px 48px rgba(0,0,0,0.5)",
        minHeight:"360px",
        boxSizing:"border-box",
      }}>
        {isSmall ? (
          <div style={{width:"60%"}}>
            {renderBody()}
          </div>
        ) : renderBody()}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────
export default function LayoutPage() {
  const [phase,setPhase]=useState("modal");
  const [cfg,setCfg]=useState({...EMPTY_CFG});
  const [selProd,setSelProd]=useState(null);
  const [saving,setSaving]=useState(false);
  const [saved,setSaved]=useState(false);

  const handleLoad=l=>{setCfg({...l,districts:l.districts||[]});setSelProd(productDB.find(p=>p.prod_code===l.prod_code)||null);setPhase("edit");};
  const handleNew=()=>{setCfg({...EMPTY_CFG});setSelProd(null);setPhase("edit");};
  const handleChange=(k,v)=>setCfg(c=>({...c,[k]:v}));
  const handleExport=()=>{const j=JSON.stringify({...cfg,product_info:selProd||null},null,2);const b=new Blob([j],{type:"application/json"});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download=`${cfg.layout_id||"layout"}.json`;a.click();URL.revokeObjectURL(u);};
  const handleSave=()=>{setSaving(true);setTimeout(()=>{setSaving(false);setSaved(true);setTimeout(()=>setSaved(false),2000);},700);};

  return(
    <div style={{position:"fixed",inset:0,background:"#020510",fontFamily:"'Inter',system-ui,sans-serif",color:"#fff",display:"flex",flexDirection:"column",overflow:"hidden"}}>

      <header style={{flexShrink:0,height:"60px",zIndex:100,background:"rgba(2,5,16,0.92)",backdropFilter:"blur(16px)",borderBottom:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",padding:"0 24px",gap:"14px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"10px",userSelect:"none"}}>
          <MiniGrid size={7}/>
          <div style={{display:"flex",alignItems:"baseline"}}>
            <span style={{fontSize:"21px",fontWeight:900,letterSpacing:"4px",color:"#fff",WebkitTextFillColor:"#fff"}}>LAY</span>
            <span style={{fontSize:"21px",fontWeight:900,color:"#fff",WebkitTextFillColor:"#fff",letterSpacing:"1px"}}>:D</span>
          </div>
        </div>
        <div style={{width:"1px",height:"20px",background:"rgba(255,255,255,0.12)"}}/>
        <span style={{fontSize:"13px",color:"rgba(255,255,255,0.4)",letterSpacing:"1px"}}>LAYOUT</span>
        {phase==="edit"&&cfg.layout_id&&(<><div style={{width:"1px",height:"14px",background:"rgba(255,255,255,0.1)"}}/><span style={{fontSize:"12px",color:"#818cf8"}}>{cfg.layout_id}</span></>)}
        <div style={{flex:1}}/>
        {phase==="edit"&&(
          <div style={{display:"flex",gap:"8px"}}>
            <button onClick={()=>setPhase("modal")} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"rgba(255,255,255,0.55)",padding:"6px 14px",fontSize:"12px",cursor:"pointer"}}>← Sessions</button>
            <button onClick={handleExport} style={{background:"rgba(20,184,166,0.12)",border:"1px solid rgba(20,184,166,0.28)",borderRadius:"8px",color:"#5eead4",padding:"6px 14px",fontSize:"12px",cursor:"pointer",fontWeight:600}}>Export JSON</button>
            <button onClick={handleSave} style={{background:saved?"linear-gradient(135deg,#34d399,#059669)":"linear-gradient(135deg,#4f46e5,#7c3aed)",border:"none",borderRadius:"8px",color:"#fff",padding:"6px 16px",fontSize:"12px",cursor:"pointer",fontWeight:700,transition:"background 0.3s"}}>
              {saving?"Saving…":saved?"✓ Saved":"Save"}
            </button>
          </div>
        )}
        <button onClick={()=>window.history.back()} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"rgba(255,255,255,0.5)",padding:"6px 14px",fontSize:"12px",cursor:"pointer"}}>← Home</button>
      </header>

      <div style={{flex:1,position:"relative",overflow:"hidden",minHeight:0}}>
        <BgSlideshow/>
        {phase==="modal"&&<LoadModal onLoad={handleLoad} onNew={handleNew} onClose={()=>window.history.back()}/>}
        {phase==="edit"&&(
          <div style={{position:"absolute",inset:0,zIndex:2,overflowY:"auto",padding:"28px",display:"flex",justifyContent:"center"}}>
            <TabWidget cfg={cfg} onChange={handleChange} selProd={selProd} onProductSelect={setSelProd}/>
          </div>
        )}
      </div>

      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        input,select{color-scheme:dark;}
        input[type=number]::-webkit-inner-spin-button{opacity:0.2;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.12);border-radius:2px;}
        @keyframes fadeSlideIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
    </div>
  );
}