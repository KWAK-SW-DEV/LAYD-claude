import { useState, useEffect, useRef, useMemo, useCallback } from "react";

const EMERALD="#10b981",CYAN="#38bdf8",PURPLE="#a78bfa",ORANGE="#fb923c",YELLOW="#facc15";
const MOCK_LAYERS=[{name:"OD",shrink_ratios:[0.985,0.982]},{name:"POLY",shrink_ratios:[0.982]},{name:"CO",shrink_ratios:[0.978,0.975]},{name:"M1",shrink_ratios:[0.975]},{name:"VIA1",shrink_ratios:[0.972]},{name:"M2",shrink_ratios:[0.970,0.969]}];
const MOCK_FNS=[{name:"field"}];
const ALIGN9=["top-left","top","top-right","left","center","right","bottom-left","bottom","bottom-right"];
const ALIGN8=ALIGN9.filter(a=>a!=="center");
const RDIR=[...ALIGN8,"ALL"];
const SEC={fontSize:"9px",letterSpacing:"2.5px",textTransform:"uppercase",color:"rgba(255,255,255,0.32)",fontWeight:600,margin:"0 0 10px"};
const PANEL={background:"rgba(200,200,215,0.07)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"12px",display:"flex",flexDirection:"column",overflow:"hidden"};
const iS={background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"5px",padding:"3px 7px",color:"#fff",fontSize:"11px",outline:"none",fontFamily:"inherit"};
const iF={...iS,width:"100%",padding:"7px 10px",fontSize:"12px",boxSizing:"border-box",display:"block"};
const sS={...iS,cursor:"pointer"};
const sF={...iF,cursor:"pointer"};
const bS={padding:"4px 10px",borderRadius:"6px",cursor:"pointer",fontSize:"11px",fontWeight:600,transition:"all 0.15s"};
const bI={background:"none",border:"none",cursor:"pointer",fontSize:"13px",lineHeight:1,padding:"3px",transition:"color 0.15s"};
const r3=v=>Math.round(v*1000)/1000;
const r6=v=>Math.round(v*1000000)/1000000;
const uid=()=>Math.random().toString(36).slice(2,8);

function calcField(x,y,p,ac,ar){const d=Math.sqrt(Math.pow(ac*p/2,2)+Math.pow(ar*p/2,2));return d?Math.sqrt(x*x+y*y)/d:0;}

// gao: returns [bx,by] = bottom-left corner of bbox (ow×oh)
// placed at `align` inside container [0,pw]×[0,ph] (Y-up).
// "top"    = y near ph,   "bottom" = y near 0
// "left"   = x near 0,    "right"  = x near pw
function gao(align,pw,ph,ow,oh){
  const bx=align.includes("left")?0:align.includes("right")?pw-ow:(pw-ow)/2;
  const by=align.includes("bottom")?0:align.includes("top")?ph-oh:(ph-oh)/2;
  return[bx,by];
}

function applyAlgs(obj,algs,x,y,p,ac,ar){
  let{ox=0,oy=0,w,h}=obj;
  for(const a of algs){
    if(!a.fn||!a.command||!a.direction) continue;
    const f=parseFloat(a.factor)||0;
    let d=0;
    if(a.fn==="field") d=r6(calcField(x,y,p,ac,ar)*f);
    if(a.command==="move"){
      if(a.direction.includes("top"))    oy+=d;
      if(a.direction.includes("bottom")) oy-=d;
      if(a.direction.includes("left"))   ox-=d;
      if(a.direction.includes("right"))  ox+=d;
    }
    if(a.command==="resize"){
      if(a.direction==="ALL"){w+=d*2;h+=d*2;ox-=d;oy-=d;}
      else{
        if(a.direction.includes("right"))  w+=d;
        if(a.direction.includes("left")) {w+=d;ox-=d;}
        if(a.direction.includes("top"))    h+=d;
        if(a.direction.includes("bottom")){h+=d;oy-=d;}
      }
    }
  }
  return{ox,oy,w,h};
}

function getBBox(pts){const xs=pts.map(p=>p.x),ys=pts.map(p=>p.y);return{minX:Math.min(...xs),maxX:Math.max(...xs),minY:Math.min(...ys),maxY:Math.max(...ys),w:Math.max(...xs)-Math.min(...xs),h:Math.max(...ys)-Math.min(...ys)};}

function computeRendered(polygon,pcellW,pcellH,cx,cy,pitch,ac,ar){
  if(!polygon) return [];
  const pts=polygon.points||[];
  if(pts.length<3) return [];
  const bbox=getBBox(pts);
  // gao gives target bottom-left corner of bbox inside pcell
  const[bx,by]=gao(polygon.align||"center",pcellW,pcellH,bbox.w,bbox.h);
  // translate so that polygon bbox bottom-left = (bx,by)
  // current bbox bottom-left = (bbox.minX, bbox.minY)
  const tx=bx-bbox.minX, ty=by-bbox.minY;
  // basePts: polygon in PCell-local coords (PCell bottom-left = 0,0)
  const basePts=pts.map(p=>({x:p.x+tx,y:p.y+ty}));
  const baseOx=bx, baseOy=by;
  const pa=applyAlgs({ox:baseOx,oy:baseOy,w:bbox.w,h:bbox.h},polygon.algorithms||[],cx,cy,pitch,ac,ar);
  const dx=pa.ox-baseOx,dy=pa.oy-baseOy;
  // World coords: PCell bottom-left is at (cx,cy) = coordX,coordY
  const oPts=basePts.map(p=>({x:p.x+dx+cx,y:p.y+dy+cy}));
  // Shift pa bbox to world coords too
  const paWorld={ox:pa.ox+cx,oy:pa.oy+cy,w:pa.w,h:pa.h};
  const objs=[{id:"polygon",type:"polygon",pts:oPts,bbox:paWorld,color:{fill:"rgba(56,189,248,0.13)",stroke:CYAN,sw:1.5}}];
  // Serifs and holes use paWorld (world coords)
  (polygon.serifs||[]).forEach((sf,si)=>{
    if(!sf.align) return;
    const a=sf.align;
    let sox=a.includes("left")?paWorld.ox-sf.w+sf.overlapW:a.includes("right")?paWorld.ox+paWorld.w-sf.overlapW:paWorld.ox+paWorld.w/2-sf.w/2;
    let soy=a.includes("top")?paWorld.oy+paWorld.h-sf.overlapH:a.includes("bottom")?paWorld.oy-sf.h+sf.overlapH:paWorld.oy+paWorld.h/2-sf.h/2;
    const sr=applyAlgs({ox:sox,oy:soy,w:sf.w,h:sf.h},sf.algorithms||[],cx,cy,pitch,ac,ar);
    objs.push({id:`s${si}`,type:"serif",serifIdx:si,ox:sr.ox,oy:sr.oy,w:sr.w,h:sr.h,color:{fill:"rgba(167,139,250,0.2)",stroke:PURPLE,sw:1}});
  });
  if(polygon.hole){
    const h=polygon.hole;
    const N=parseInt(h.gridN)||1,M=parseInt(h.gridM)||1;
    const hw=parseFloat(h.holeW)||0,hh=parseFloat(h.holeH)||0;
    const gX=h.spacingOn?parseFloat(h.gapX)||0:(paWorld.w-(hw*N))/(N+1);
    const gY=h.spacingOn?parseFloat(h.gapY)||0:(paWorld.h-(hh*M))/(M+1);
    const tW=N*hw+(N+1)*gX,tH=M*hh+(M+1)*gY;
    const[hax,hay]=gao(h.align||"center",paWorld.w,paWorld.h,tW,tH);
    // hole group bottom-left in world = paWorld bottom-left + gao offset
    const sX=paWorld.ox+hax,sY=paWorld.oy+hay;
    // row=0 is visually top → in Y-up, higher y = top → subtract from group top
    for(let row=0;row<M;row++)for(let col=0;col<N;col++){
      const dis=(h.disabled||[]).some(d=>d.r===row&&d.c===col);
      const holeOy=sY+(M-1-row)*(hh+gY)+gY; // Y-up: row=0 at top
      const holeOx=sX+gX+(hw+gX)*col;
      objs.push({id:`h${row}-${col}`,type:"hole",serifIdx:-1,row,col,dis,
        ox:holeOx,oy:holeOy,w:hw,h:hh,
        color:{fill:dis?"rgba(180,180,180,0.08)":"rgba(251,146,60,0.22)",stroke:dis?"rgba(180,180,180,0.2)":ORANGE,sw:0.8}});
    }
  }
  return objs;
}

function hitTest(o,wx,wy){
  if(o.type==="polygon"){let inside=false;const pts=o.pts;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const xi=pts[i].x,yi=pts[i].y,xj=pts[j].x,yj=pts[j].y;if(((yi>wy)!==(yj>wy))&&(wx<(xj-xi)*(wy-yi)/(yj-yi)+xi))inside=!inside;}return inside;}
  return wx>=o.ox&&wx<=o.ox+o.w&&wy>=o.oy&&wy<=o.oy+o.h;
}

// ── AlignBtn ──────────────────────────────────────────────────────────────
function AlignBtn({selected,onClick,include9=false}){
  return(
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,28px)",gap:"3px"}}>
      {ALIGN9.map(a=>{
        if(!include9&&a==="center") return <div key={a} style={{width:"28px",height:"28px"}}/>;
        const sel=selected===a;
        const hasT=a.includes("top"),hasB=a.includes("bottom"),hasL=a.includes("left"),hasR=a.includes("right"),isC=a==="center";
        const ac=sel?CYAN:"rgba(255,255,255,0.2)";
        return(
          <button key={a} onClick={()=>onClick(a)} title={a}
            style={{width:"28px",height:"28px",padding:0,cursor:"pointer",borderRadius:"4px",background:sel?"rgba(56,189,248,0.12)":"rgba(255,255,255,0.03)",border:sel?"1px solid rgba(56,189,248,0.3)":"1px solid rgba(255,255,255,0.08)",transition:"all 0.12s"}}>
            <svg width="28" height="28" viewBox="0 0 28 28">
              <rect x="5" y="5" width="18" height="18" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" rx="1"/>
              {isC&&<circle cx="14" cy="14" r="3" fill={ac}/>}
              {hasT&&<line x1="5" y1="5" x2="23" y2="5" stroke={ac} strokeWidth="2.5"/>}
              {hasB&&<line x1="5" y1="23" x2="23" y2="23" stroke={ac} strokeWidth="2.5"/>}
              {hasL&&<line x1="5" y1="5" x2="5" y2="23" stroke={ac} strokeWidth="2.5"/>}
              {hasR&&<line x1="23" y1="5" x2="23" y2="23" stroke={ac} strokeWidth="2.5"/>}
            </svg>
          </button>
        );
      })}
    </div>
  );
}

// ── AlgorithmEditor ──────────────────────────────────────────────────────
function AlgEditor({algorithms,onChange}){
  const add=()=>onChange([...algorithms,{id:uid(),fn:"field",command:"resize",direction:"ALL",factor:"0.000000"}]);
  const upd=(i,p)=>onChange(algorithms.map((a,j)=>j===i?{...a,...p}:a));
  const del=i=>onChange(algorithms.filter((_,j)=>j!==i));
  const up=i=>{if(i===0)return;const n=[...algorithms];[n[i-1],n[i]]=[n[i],n[i-1]];onChange(n);};
  return(
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px"}}>
        <span style={{...SEC,margin:0}}>Algorithm</span>
        <button onClick={add} style={{...bS,background:"rgba(167,139,250,0.15)",color:PURPLE,border:"1px solid rgba(167,139,250,0.3)"}}>+ Add</button>
      </div>
      {algorithms.length===0&&<p style={{fontSize:"11px",color:"rgba(255,255,255,0.2)",margin:0}}>No algorithms.</p>}
      {algorithms.map((alg,i)=>(
        <div key={alg.id} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"8px",padding:"8px",marginBottom:"6px"}}>
          <div style={{display:"flex",gap:"4px",flexWrap:"wrap",alignItems:"center"}}>
            <span style={{fontSize:"10px",color:"rgba(255,255,255,0.3)",minWidth:"16px"}}>#{i+1}</span>
            <select value={alg.fn} onChange={e=>upd(i,{fn:e.target.value})} style={sS}>{MOCK_FNS.map(f=><option key={f.name} value={f.name} style={{background:"#1a1a2e"}}>{f.name}</option>)}</select>
            <select value={alg.command} onChange={e=>upd(i,{command:e.target.value,direction:e.target.value==="resize"?"ALL":"top"})} style={sS}>
              <option value="resize" style={{background:"#1a1a2e"}}>resize</option>
              <option value="move" style={{background:"#1a1a2e"}}>move</option>
            </select>
            <select value={alg.direction} onChange={e=>upd(i,{direction:e.target.value})} style={sS}>
              {(alg.command==="resize"?RDIR:ALIGN8).map(d=><option key={d} value={d} style={{background:"#1a1a2e"}}>{d}</option>)}
            </select>
            <input type="number" value={alg.factor} onChange={e=>upd(i,{factor:e.target.value})} onBlur={e=>upd(i,{factor:String(r6(parseFloat(e.target.value)||0))})} step="0.000001" min="-999999" max="999999" style={{...iS,width:"78px"}}/>
            <div style={{display:"flex",gap:"3px",marginLeft:"auto"}}>
              {i>0&&<button onClick={()=>up(i)} style={{...bI,color:"rgba(255,255,255,0.4)"}}>↑</button>}
              <button onClick={()=>del(i)} style={{...bI,color:"rgba(255,80,80,0.5)"}} onMouseEnter={e=>e.currentTarget.style.color="rgba(255,80,80,0.9)"} onMouseLeave={e=>e.currentTarget.style.color="rgba(255,80,80,0.5)"}>✕</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── SerifDialog ──────────────────────────────────────────────────────────
function SerifDialog({serif,pitch,onSave,onClose}){
  const[form,setForm]=useState({...serif});
  const upd=p=>setForm(f=>({...f,...p}));
  return(
    <div style={{position:"fixed",inset:0,zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.65)"}}>
      <div style={{background:"rgba(14,12,30,0.99)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"14px",padding:"22px",width:"400px",boxShadow:"0 30px 80px rgba(0,0,0,0.9)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
          <h3 style={{margin:0,fontSize:"14px",fontWeight:800,color:"#fff"}}>Serif</h3>
          <button onClick={onClose} style={{background:"none",border:"none",color:"rgba(255,255,255,0.4)",fontSize:"18px",cursor:"pointer"}}>✕</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
          <div><p style={SEC}>Align on Polygon</p><AlignBtn selected={form.align} onClick={a=>upd({align:a})} include9={false}/></div>
          <div style={{display:"flex",gap:"10px"}}>
            <label style={{flex:1,fontSize:"11px",color:"rgba(255,255,255,0.5)"}}>W(nm)<input type="number" value={form.w} onChange={e=>upd({w:r3(parseFloat(e.target.value)||0)})} style={{...iF,marginTop:"4px"}}/></label>
            <label style={{flex:1,fontSize:"11px",color:"rgba(255,255,255,0.5)"}}>H(nm)<input type="number" value={form.h} onChange={e=>upd({h:r3(parseFloat(e.target.value)||0)})} style={{...iF,marginTop:"4px"}}/></label>
          </div>
          <div style={{display:"flex",gap:"10px"}}>
            <label style={{flex:1,fontSize:"11px",color:"rgba(255,255,255,0.5)"}}>Overlap W<input type="number" value={form.overlapW} onChange={e=>upd({overlapW:r3(parseFloat(e.target.value)||0)})} style={{...iF,marginTop:"4px"}}/></label>
            <label style={{flex:1,fontSize:"11px",color:"rgba(255,255,255,0.5)"}}>Overlap H<input type="number" value={form.overlapH} onChange={e=>upd({overlapH:r3(parseFloat(e.target.value)||0)})} style={{...iF,marginTop:"4px"}}/></label>
          </div>
          <AlgEditor algorithms={form.algorithms||[]} onChange={v=>upd({algorithms:v})}/>
        </div>
        <div style={{display:"flex",gap:"10px",marginTop:"14px",justifyContent:"flex-end"}}>
          <button onClick={onClose} style={{...bS,background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.5)",border:"1px solid rgba(255,255,255,0.1)"}}>Cancel</button>
          <button onClick={()=>onSave(form)} style={{...bS,background:PURPLE,color:"#fff",border:"none",fontWeight:700}}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ── HoleDialog ────────────────────────────────────────────────────────────
function HoleDialog({hole,pitch,onSave,onClose}){
  const[form,setForm]=useState(hole??{id:uid(),align:"center",gridN:2,gridM:2,holeW:r3(pitch*0.2),holeH:r3(pitch*0.2),spacingOn:false,gapX:r3(pitch*0.1),gapY:r3(pitch*0.1),disabled:[],algorithms:[]});
  const upd=p=>setForm(f=>({...f,...p}));
  const N=parseInt(form.gridN)||1,M=parseInt(form.gridM)||1;
  const toggleDis=(r,c)=>{const k=d=>d.r===r&&d.c===c;const al=(form.disabled||[]).some(k);upd({disabled:al?form.disabled.filter(d=>!k(d)):[...(form.disabled||[]),{r,c}]});};
  return(
    <div style={{position:"fixed",inset:0,zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.65)"}}>
      <div style={{background:"rgba(14,12,30,0.99)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"14px",padding:"22px",width:"440px",maxHeight:"80vh",overflowY:"auto",boxShadow:"0 30px 80px rgba(0,0,0,0.9)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"}}>
          <h3 style={{margin:0,fontSize:"14px",fontWeight:800,color:"#fff"}}>Hole</h3>
          <button onClick={onClose} style={{background:"none",border:"none",color:"rgba(255,255,255,0.4)",fontSize:"18px",cursor:"pointer"}}>✕</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
          <div><p style={SEC}>Align (BBox)</p><AlignBtn selected={form.align} onClick={a=>upd({align:a})} include9={true}/></div>
          <div style={{display:"flex",gap:"10px"}}>
            <label style={{flex:1,fontSize:"11px",color:"rgba(255,255,255,0.5)"}}>N(cols)<input type="number" value={form.gridN} min="1" onChange={e=>upd({gridN:parseInt(e.target.value)||1})} style={{...iF,marginTop:"4px"}}/></label>
            <label style={{flex:1,fontSize:"11px",color:"rgba(255,255,255,0.5)"}}>M(rows)<input type="number" value={form.gridM} min="1" onChange={e=>upd({gridM:parseInt(e.target.value)||1})} style={{...iF,marginTop:"4px"}}/></label>
          </div>
          <div style={{display:"flex",gap:"10px"}}>
            <label style={{flex:1,fontSize:"11px",color:"rgba(255,255,255,0.5)"}}>W(nm)<input type="number" value={form.holeW} onChange={e=>upd({holeW:r3(parseFloat(e.target.value)||0)})} style={{...iF,marginTop:"4px"}}/></label>
            <label style={{flex:1,fontSize:"11px",color:"rgba(255,255,255,0.5)"}}>H(nm)<input type="number" value={form.holeH} onChange={e=>upd({holeH:r3(parseFloat(e.target.value)||0)})} style={{...iF,marginTop:"4px"}}/></label>
          </div>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"5px"}}>
              <p style={{...SEC,margin:0}}>Spacing</p>
              <label style={{display:"flex",alignItems:"center",gap:"4px",fontSize:"11px",color:"rgba(255,255,255,0.5)",cursor:"pointer"}}><input type="checkbox" checked={form.spacingOn} onChange={e=>upd({spacingOn:e.target.checked})} style={{accentColor:CYAN}}/>Manual</label>
            </div>
            {form.spacingOn&&<div style={{display:"flex",gap:"10px"}}>
              <label style={{flex:1,fontSize:"11px",color:"rgba(255,255,255,0.5)"}}>GapX<input type="number" value={form.gapX} onChange={e=>upd({gapX:r3(parseFloat(e.target.value)||0)})} style={{...iF,marginTop:"4px"}}/></label>
              <label style={{flex:1,fontSize:"11px",color:"rgba(255,255,255,0.5)"}}>GapY<input type="number" value={form.gapY} onChange={e=>upd({gapY:r3(parseFloat(e.target.value)||0)})} style={{...iF,marginTop:"4px"}}/></label>
            </div>}
            {!form.spacingOn&&<p style={{fontSize:"9px",color:"rgba(255,255,255,0.3)",margin:0}}>Auto gap=(poly_w−hole_w×N)/(N+1)</p>}
          </div>
          <div>
            <p style={SEC}>Disable holes</p>
            <div style={{display:"grid",gridTemplateColumns:`repeat(${N},28px)`,gap:"3px"}}>
              {Array.from({length:M},(_,row)=>Array.from({length:N},(_,col)=>{
                const dis=(form.disabled||[]).some(d=>d.r===row&&d.c===col);
                return <button key={`${row}-${col}`} onClick={()=>toggleDis(row,col)} style={{width:"28px",height:"28px",borderRadius:"4px",cursor:"pointer",fontSize:"10px",background:dis?"rgba(255,80,80,0.15)":"rgba(251,146,60,0.2)",color:dis?"rgba(255,80,80,0.6)":ORANGE,border:`1px solid ${dis?"rgba(255,80,80,0.3)":"rgba(251,146,60,0.4)"}`}}>{dis?"✕":"●"}</button>;
              }))}
            </div>
          </div>
          <AlgEditor algorithms={form.algorithms||[]} onChange={v=>upd({algorithms:v})}/>
        </div>
        <div style={{display:"flex",gap:"10px",marginTop:"14px",justifyContent:"flex-end"}}>
          <button onClick={onClose} style={{...bS,background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.5)",border:"1px solid rgba(255,255,255,0.1)"}}>Cancel</button>
          <button onClick={()=>onSave(form)} style={{...bS,background:ORANGE,color:"#fff",border:"none",fontWeight:700}}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ── PolygonDialog ─────────────────────────────────────────────────────────
function PolygonDialog({pcell,pitch,polygon,onSave,onClose}){
  const cvRef=useRef(null);
  const[mode,setMode]=useState(polygon?.mode??"rect");
  const[points,setPoints]=useState(polygon?.points??[]);
  const[rectW,setRectW]=useState(polygon?.rectW??r3(pitch));
  const[rectH,setRectH]=useState(polygon?.rectH??r3(pitch));
  const[align,setAlign]=useState(polygon?.align??"center");
  const[algs,setAlgs]=useState(polygon?.algorithms??[]);
  const[snap,setSnap]=useState(pitch);
  const[marginP,setMarginP]=useState(1);
  const[hov,setHov]=useState(null);
  const[editMode,setEditMode]=useState(false);
  const[hovPtIdx,setHovPtIdx]=useState(null);
  const dragRef=useRef(null);
  const CS=360;
  const pcW=(pcell.gridN||1)*pitch,pcH=(pcell.gridM||1)*pitch;
  const mNm=marginP*pitch;
  const sc=Math.min(CS/(pcW+2*mNm),CS/(pcH+2*mNm))*0.88;
  // PCell center (pcW/2, pcH/2) maps to canvas center
  const pcCX=pcW/2, pcCY=pcH/2;
  const toC=(nx,ny)=>({cx:CS/2+(nx-pcCX)*sc, cy:CS/2-(ny-pcCY)*sc});
  const toN=(cx,cy)=>({
    nx:r3(Math.round(((cx-CS/2)/sc+pcCX)/(snap||pitch))*(snap||pitch)),
    ny:r3(Math.round((-(cy-CS/2)/sc+pcCY)/(snap||pitch))*(snap||pitch)),
  });
  const ePts=useMemo(()=>{if(mode==="rect"){const cx_=pcW/2,cy_=pcH/2,hw=rectW/2,hh=rectH/2;return[{x:cx_-hw,y:cy_-hh},{x:cx_+hw,y:cy_-hh},{x:cx_+hw,y:cy_+hh},{x:cx_-hw,y:cy_+hh}];}return points;},[mode,rectW,rectH,points,pcW,pcH]);
  const findNearPt=(cx,cy)=>{let b=null,bd=Infinity;ePts.forEach(({x,y},i)=>{const{cx:px,cy:py}=toC(x,y);const d=Math.hypot(cx-px,cy-py);if(d<bd){bd=d;b=i;}});return bd<14?b:null;};

  useEffect(()=>{
    const kd=e=>{if(e.key==="e"||e.key==="E")setEditMode(true);if(e.key==="Escape")setEditMode(false);if(e.key==="Backspace"&&mode==="poly")setPoints(ps=>ps.slice(0,-1));};
    const ku=e=>{if(e.key==="e"||e.key==="E")setEditMode(false);};
    window.addEventListener("keydown",kd);window.addEventListener("keyup",ku);
    return()=>{window.removeEventListener("keydown",kd);window.removeEventListener("keyup",ku);};
  },[mode]);

  useEffect(()=>{
    const cv=cvRef.current;if(!cv)return;
    const ctx=cv.getContext("2d");
    ctx.clearRect(0,0,CS,CS);
    ctx.fillStyle="#ffffff";ctx.fillRect(0,0,CS,CS);
    const gs=(snap||pitch)*sc;
    ctx.strokeStyle="rgba(0,0,0,0.07)";ctx.lineWidth=0.5;
    for(let x=CS/2%gs;x<CS;x+=gs){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,CS);ctx.stroke();}
    for(let y=CS/2%gs;y<CS;y+=gs){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(CS,y);ctx.stroke();}
    // PCell bottom-left corner
    const{cx:ox,cy:oy_}=toC(0,0);
    // Also draw PCell center crosshair (dashed)
    const{cx:pcx,cy:pcy}=toC(pcW/2,pcH/2);
    ctx.strokeStyle="rgba(0,0,0,0.08)";ctx.lineWidth=0.6;ctx.setLineDash([2,5]);
    ctx.beginPath();ctx.moveTo(pcx,0);ctx.lineTo(pcx,CS);ctx.stroke();
    ctx.beginPath();ctx.moveTo(0,pcy);ctx.lineTo(CS,pcy);ctx.stroke();
    ctx.setLineDash([]);
    // Hard corner marker at (0,0)
    ctx.strokeStyle="rgba(0,0,0,0.2)";ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(ox,pcy);ctx.lineTo(ox,CS);ctx.stroke();
    ctx.beginPath();ctx.moveTo(0,oy_);ctx.lineTo(pcx,oy_);ctx.stroke();
    // PCell box: [0,pcW]×[0,pcH]
    const{cx:bx0,cy:by0}=toC(0,pcH);const{cx:bx1,cy:by1}=toC(pcW,0);
    ctx.strokeStyle="rgba(0,0,0,0.2)";ctx.lineWidth=1;ctx.setLineDash([5,4]);ctx.strokeRect(bx0,by0,bx1-bx0,by1-by0);ctx.setLineDash([]);
    if(ePts.length>=3){
      ctx.beginPath();ePts.forEach(({x,y},i)=>{const{cx,cy}=toC(x,y);i===0?ctx.moveTo(cx,cy):ctx.lineTo(cx,cy);});
      ctx.closePath();ctx.fillStyle="rgba(56,189,248,0.1)";ctx.fill();
      ctx.strokeStyle=CYAN;ctx.lineWidth=1.5;ctx.stroke();
    }
    ePts.forEach(({x,y},i)=>{
      const{cx,cy}=toC(x,y);const isH=editMode&&hovPtIdx===i;
      ctx.beginPath();ctx.arc(cx,cy,isH?5.5:3.5,0,Math.PI*2);ctx.fillStyle=isH?"#ff6b6b":CYAN;ctx.fill();
    });
    if(hov&&mode==="poly"&&!editMode){
      const{cx,cy}=toC(hov.nx,hov.ny);ctx.beginPath();ctx.arc(cx,cy,4,0,Math.PI*2);ctx.fillStyle="rgba(56,189,248,0.4)";ctx.fill();
      if(ePts.length>0){const last=ePts[ePts.length-1];const{cx:lx,cy:ly}=toC(last.x,last.y);ctx.strokeStyle="rgba(56,189,248,0.25)";ctx.lineWidth=1;ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(lx,ly);ctx.lineTo(cx,cy);ctx.stroke();ctx.setLineDash([]);}
    }
    ctx.fillStyle="rgba(0,0,0,0.35)";ctx.font="9px monospace";ctx.fillText("(0,0)",ox+3,oy_-3);
    // PCell corners
    const{cx:cBL_x,cy:cBL_y}=toC(0,0);
    ctx.fillStyle="rgba(0,0,0,0.25)";ctx.font="8px monospace";
    ctx.fillText("BL(0,0)",cBL_x+2,cBL_y-2);
  },[ePts,hov,editMode,hovPtIdx,sc,snap,pcW,pcH]);

  const onCvClick=e=>{
    const rect=cvRef.current.getBoundingClientRect();const cx=e.clientX-rect.left,cy=e.clientY-rect.top;
    if(mode==="poly"&&!editMode){const{nx,ny}=toN(cx,cy);setPoints(ps=>[...ps,{x:nx,y:ny}]);}
  };
  const onCvMove=e=>{
    const rect=cvRef.current.getBoundingClientRect();const cx=e.clientX-rect.left,cy=e.clientY-rect.top;
    if(mode==="poly"){if(editMode)setHovPtIdx(findNearPt(cx,cy));else setHov(toN(cx,cy));}
  };
  const onCvMD=e=>{if(!editMode||mode!=="poly")return;const rect=cvRef.current.getBoundingClientRect();dragRef.current=findNearPt(e.clientX-rect.left,e.clientY-rect.top);};
  const onCvMU=e=>{
    if(dragRef.current!==null&&editMode&&mode==="poly"){const rect=cvRef.current.getBoundingClientRect();const{nx,ny}=toN(e.clientX-rect.left,e.clientY-rect.top);setPoints(ps=>ps.map((p,i)=>i===dragRef.current?{x:nx,y:ny}:p));}
    dragRef.current=null;
  };

  return(
    <div style={{position:"fixed",inset:0,zIndex:700,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.7)",backdropFilter:"blur(8px)"}}>
      <div style={{background:"rgba(14,12,30,0.98)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px",padding:"22px",width:"820px",maxWidth:"96vw",maxHeight:"90vh",overflow:"auto",boxShadow:"0 40px 100px rgba(0,0,0,0.9)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"16px"}}>
          <div><p style={{...SEC,margin:"0 0 2px"}}>Polygon Editor</p><h3 style={{margin:0,fontSize:"15px",fontWeight:800,color:"#fff"}}>{polygon?"Edit":"New"} Polygon</h3></div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"rgba(255,255,255,0.4)",fontSize:"20px",cursor:"pointer"}}>✕</button>
        </div>
        <div style={{display:"flex",gap:"20px"}}>
          <div style={{flexShrink:0}}>
            <div style={{display:"flex",gap:"6px",marginBottom:"8px",alignItems:"center"}}>
              <button onClick={()=>setMode("rect")} style={{...bS,background:mode==="rect"?"rgba(56,189,248,0.2)":"rgba(255,255,255,0.06)",color:mode==="rect"?CYAN:"rgba(255,255,255,0.5)",border:`1px solid ${mode==="rect"?"rgba(56,189,248,0.4)":"rgba(255,255,255,0.1)"}`}}>Rectangle</button>
              <button onClick={()=>setMode("poly")} style={{...bS,background:mode==="poly"?"rgba(56,189,248,0.2)":"rgba(255,255,255,0.06)",color:mode==="poly"?CYAN:"rgba(255,255,255,0.5)",border:`1px solid ${mode==="poly"?"rgba(56,189,248,0.4)":"rgba(255,255,255,0.1)"}`}}>Polygon</button>
              {mode==="poly"&&<>
                <button onClick={()=>setEditMode(v=>!v)} style={{...bS,background:editMode?"rgba(255,107,107,0.2)":"rgba(255,255,255,0.06)",color:editMode?"#ff6b6b":"rgba(255,255,255,0.5)",border:`1px solid ${editMode?"rgba(255,107,107,0.4)":"rgba(255,255,255,0.1)"}`}}>Edit Pts</button>
                {points.length>0&&<button onClick={()=>setPoints(ps=>ps.slice(0,-1))} style={{...bS,background:"rgba(255,80,80,0.1)",color:"rgba(255,80,80,0.7)",border:"1px solid rgba(255,80,80,0.2)"}}>Undo</button>}
              </>}
            </div>
            <canvas ref={cvRef} width={CS} height={CS}
              style={{borderRadius:"8px",border:"1px solid rgba(0,0,0,0.15)",cursor:mode==="poly"?(editMode?"grab":"crosshair"):"default",display:"block"}}
              onClick={onCvClick} onMouseMove={onCvMove} onMouseLeave={()=>{setHov(null);setHovPtIdx(null);}}
              onMouseDown={onCvMD} onMouseUp={onCvMU}/>
            <div style={{display:"flex",gap:"10px",marginTop:"7px"}}>
              <label style={{fontSize:"10px",color:"rgba(255,255,255,0.4)"}}>Snap(nm)<input type="number" value={snap} onChange={e=>setSnap(parseFloat(e.target.value)||pitch)} style={{...iS,width:"56px",marginLeft:"5px"}}/></label>
              <label style={{fontSize:"10px",color:"rgba(255,255,255,0.4)"}}>Margin(p)<input type="number" value={marginP} onChange={e=>setMarginP(parseFloat(e.target.value)||1)} style={{...iS,width:"44px",marginLeft:"5px"}}/></label>
            </div>
          </div>
          <div style={{flex:1,display:"flex",flexDirection:"column",gap:"14px",overflowY:"auto",maxHeight:"480px"}}>
            {mode==="rect"&&<div><p style={SEC}>Rectangle (nm)</p><div style={{display:"flex",gap:"10px"}}><label style={{flex:1,fontSize:"11px",color:"rgba(255,255,255,0.5)"}}>W<input type="number" value={rectW} onChange={e=>setRectW(r3(parseFloat(e.target.value)||0))} style={{...iF,marginTop:"4px"}}/></label><label style={{flex:1,fontSize:"11px",color:"rgba(255,255,255,0.5)"}}>H<input type="number" value={rectH} onChange={e=>setRectH(r3(parseFloat(e.target.value)||0))} style={{...iF,marginTop:"4px"}}/></label></div></div>}
            {mode==="poly"&&<div><p style={SEC}>Points ({ePts.length})</p><div style={{maxHeight:"90px",overflowY:"auto"}}>{ePts.map((pt,i)=><div key={i} style={{display:"flex",gap:"8px",fontSize:"10px",color:"rgba(255,255,255,0.5)",marginBottom:"2px"}}><span style={{color:"rgba(255,255,255,0.3)",minWidth:"16px"}}>#{i+1}</span><span style={{color:CYAN}}>x:{pt.x}</span><span style={{color:CYAN}}>y:{pt.y}</span></div>)}</div></div>}
            <div><p style={SEC}>Align in PCell</p><AlignBtn selected={align} onClick={setAlign} include9={true}/></div>
            <AlgEditor algorithms={algs} onChange={setAlgs}/>
          </div>
        </div>
        <div style={{display:"flex",gap:"10px",marginTop:"16px",justifyContent:"flex-end"}}>
          <button onClick={onClose} style={{...bS,background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.5)",border:"1px solid rgba(255,255,255,0.1)",padding:"8px 18px"}}>Cancel</button>
          <button onClick={()=>{const pts=ePts;if(pts.length<3){alert("Need ≥3 points");return;}onSave({id:polygon?.id||uid(),name:polygon?.name,mode,points:pts,rectW,rectH,align,algorithms:algs,serifs:polygon?.serifs??[],hole:polygon?.hole??null});}} style={{...bS,background:"linear-gradient(135deg,#4f46e5,#7c3aed)",color:"#fff",border:"none",padding:"8px 18px",fontWeight:700}}>{polygon?"Update":"Add"} Polygon</button>
        </div>
      </div>
    </div>
  );
}

// ── PCellDialog ───────────────────────────────────────────────────────────
function PCellDialog({pcell,selProd,onSave,onClose}){
  const layers=selProd?Object.entries(selProd.shrink_ratio).map(([n,v])=>({name:n,shrink_ratios:v})):MOCK_LAYERS;
  const[form,setForm]=useState({name:pcell?.name??"",gridN:pcell?.gridN??1,gridM:pcell?.gridM??1,layer:pcell?.layer??layers[0]?.name??"",shrinkRatio:pcell?.shrinkRatio??(layers[0]?.shrink_ratios?.[0]??1),algorithms:pcell?.algorithms??[]});
  const upd=p=>setForm(f=>({...f,...p}));
  const cl=layers.find(l=>l.name===form.layer)??layers[0];
  return(
    <div style={{position:"fixed",inset:0,zIndex:700,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.65)",backdropFilter:"blur(8px)"}}>
      <div style={{background:"rgba(14,12,30,0.98)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px",padding:"22px",width:"400px",boxShadow:"0 40px 100px rgba(0,0,0,0.9)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
          <div><p style={{...SEC,margin:"0 0 2px"}}>PCell</p><h3 style={{margin:0,fontSize:"15px",fontWeight:800,color:"#fff"}}>{pcell?"Edit":"New"} PCell</h3></div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"rgba(255,255,255,0.4)",fontSize:"20px",cursor:"pointer"}}>✕</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
          <label style={{fontSize:"11px",color:"rgba(255,255,255,0.5)"}}>Name<input value={form.name} onChange={e=>upd({name:e.target.value})} style={{...iF,marginTop:"4px"}} placeholder="PCell name"/></label>
          <div style={{display:"flex",gap:"10px"}}>
            <label style={{flex:1,fontSize:"11px",color:"rgba(255,255,255,0.5)"}}>N(cols)<input type="number" value={form.gridN} min="1" onChange={e=>upd({gridN:parseInt(e.target.value)||1})} style={{...iF,marginTop:"4px"}}/></label>
            <label style={{flex:1,fontSize:"11px",color:"rgba(255,255,255,0.5)"}}>M(rows)<input type="number" value={form.gridM} min="1" onChange={e=>upd({gridM:parseInt(e.target.value)||1})} style={{...iF,marginTop:"4px"}}/></label>
          </div>
          <label style={{fontSize:"11px",color:"rgba(255,255,255,0.5)"}}>Layer<select value={form.layer} onChange={e=>{const l=layers.find(x=>x.name===e.target.value)??layers[0];upd({layer:e.target.value,shrinkRatio:l.shrink_ratios?.[0]??1});}} style={{...sF,marginTop:"4px"}}>{layers.map(l=><option key={l.name} value={l.name} style={{background:"#1a1a2e"}}>{l.name}</option>)}</select></label>
          <label style={{fontSize:"11px",color:"rgba(255,255,255,0.5)"}}>Shrink Ratio<select value={form.shrinkRatio} onChange={e=>upd({shrinkRatio:parseFloat(e.target.value)})} style={{...sF,marginTop:"4px"}}>{(cl?.shrink_ratios??[]).map(v=><option key={v} value={v} style={{background:"#1a1a2e"}}>{v}</option>)}</select></label>
          <AlgEditor algorithms={form.algorithms} onChange={v=>upd({algorithms:v})}/>
        </div>
        <div style={{display:"flex",gap:"10px",marginTop:"16px",justifyContent:"flex-end"}}>
          <button onClick={onClose} style={{...bS,background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.5)",border:"1px solid rgba(255,255,255,0.1)",padding:"8px 18px"}}>Cancel</button>
          <button onClick={()=>onSave({...form,id:pcell?.id??uid(),polygons:pcell?.polygons??[]})} style={{...bS,background:"linear-gradient(135deg,#4f46e5,#7c3aed)",color:"#fff",border:"none",padding:"8px 18px",fontWeight:700}}>{pcell?"Update":"Create"}</button>
        </div>
      </div>
    </div>
  );
}

// ── PreviewCanvas ─────────────────────────────────────────────────────────
// Fixed canvas size: initial clean size w=420, h=630 (1.5x)
const CW=420, CH=630;

function PreviewCanvas({pcell,polygon,pitch,coordX,coordY,adc,adr,onUpdatePolygon}){
  const cvRef=useRef(null);
  const[zoom,setZoom]=useState(1);
  const[imode,setImode]=useState(null);
  const imodeRef=useRef(null);
  const[rulers,setRulers]=useState([]);
  const rulerPt1=useRef(null);
  const[serifDlg,setSerifDlg]=useState(null);
  const[holeDlg,setHoleDlg]=useState(false);
  const[cursorNm,setCursorNm]=useState(null);
  const cursorPxRef=useRef(null);
  const pcW=(pcell?(pcell.gridN||1):1)*pitch;
  const pcH=(pcell?(pcell.gridM||1):1)*pitch;
  // Scale so PCell fits comfortably — padding = 0.6*pcell on each side
  // padding factor 1.6: PCell takes ~62% of canvas width/height
  const sc=Math.min(CW/(pcW*1.6),CH/(pcH*1.6))*zoom;
  // Viewport center = PCell center in world coords
  const vpCX=coordX+pcW/2, vpCY=coordY+pcH/2;
  const orX=CW/2, orY=CH/2;
  // toC: world → canvas. PCell center maps to canvas center.
  const toC=(wx,wy)=>({cx:orX+(wx-vpCX)*sc, cy:orY-(wy-vpCY)*sc});
  const toW=(cx,cy)=>({wx:r3((cx-orX)/sc+vpCX), wy:r3(-(cy-orY)/sc+vpCY)});

  const objs=useMemo(()=>computeRendered(polygon,pcW,pcH,coordX,coordY,pitch,adc,adr),[polygon,pcW,pcH,coordX,coordY,pitch,adc,adr]);

  // Keyboard
  useEffect(()=>{
    const el=document.getElementById("pvp");if(!el)return;
    const kd=e=>{
      if(e.key==="s"||e.key==="S"){imodeRef.current="serif-add";setImode("serif-add");}
      else if(e.key==="h"||e.key==="H"){imodeRef.current="hole-add";setImode("hole-add");}
      else if((e.key==="d"||e.key==="D")&&e.shiftKey){imodeRef.current="delete";setImode("delete");}
      else if(e.key==="e"||e.key==="E"){imodeRef.current="edit";setImode("edit");}
      else if(e.key==="Escape"){imodeRef.current=null;setImode(null);rulerPt1.current=null;}
    };
    const ml=()=>{imodeRef.current=null;setImode(null);};
    el.addEventListener("keydown",kd);
    el.addEventListener("mouseleave",ml);
    return()=>{el.removeEventListener("keydown",kd);el.removeEventListener("mouseleave",ml);};
  },[]);

  // Draw
  useEffect(()=>{
    const cv=cvRef.current;if(!cv)return;
    const ctx=cv.getContext("2d");
    ctx.clearRect(0,0,CW,CH);
    ctx.fillStyle="#ffffff";ctx.fillRect(0,0,CW,CH);
    // Grid
    const gs=pitch*sc;ctx.strokeStyle="rgba(0,0,0,0.07)";ctx.lineWidth=0.5;
    for(let x=orX%gs;x<CW;x+=gs){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,CH);ctx.stroke();}
    for(let y=orY%gs;y<CH;y+=gs){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(CW,y);ctx.stroke();}
    // Axes
    const{cx:ax,cy:ay}=toC(0,0);
    ctx.strokeStyle="rgba(0,0,0,0.15)";ctx.lineWidth=0.7;ctx.setLineDash([3,4]);
    ctx.beginPath();ctx.moveTo(ax,0);ctx.lineTo(ax,CH);ctx.stroke();
    ctx.beginPath();ctx.moveTo(0,ay);ctx.lineTo(CW,ay);ctx.stroke();
    ctx.setLineDash([]);
    // PCell dashed box: bottom-left=(coordX,coordY), top-right=(coordX+pcW,coordY+pcH)
    const{cx:bx0,cy:by0}=toC(coordX,coordY+pcH);const{cx:bx1,cy:by1}=toC(coordX+pcW,coordY);
    ctx.strokeStyle="rgba(0,0,0,0.22)";ctx.lineWidth=1;ctx.setLineDash([6,4]);ctx.strokeRect(bx0,by0,bx1-bx0,by1-by0);ctx.setLineDash([]);
    // Axis ticks + labels — relative to PCell anchor
    ctx.fillStyle="rgba(0,0,0,0.35)";ctx.font="9px monospace";
    const tickStep=pitch; const tickCount=6;
    for(let i=-tickCount;i<=tickCount;i++){
      const vx=r3(coordX+i*tickStep);
      const{cx:tx}=toC(vx,coordY);
      if(tx>8&&tx<CW-8){
        ctx.fillStyle="rgba(0,0,0,0.3)";ctx.fillText(String(vx),tx-10,ay+13);
        ctx.strokeStyle="rgba(0,0,0,0.12)";ctx.lineWidth=0.5;
        ctx.beginPath();ctx.moveTo(tx,ay-3);ctx.lineTo(tx,ay+3);ctx.stroke();
      }
      const vy=r3(coordY+i*tickStep);
      const{cy:ty}=toC(coordX,vy);
      if(ty>8&&ty<CH-8){ctx.fillStyle="rgba(0,0,0,0.3)";ctx.fillText(String(vy),ax+4,ty+3);}
    }
    ctx.fillStyle="rgba(0,0,0,0.4)";ctx.fillText(`(${r3(coordX)},${r3(coordY)})`,ax+4,ay-4);
    // Objects
    objs.forEach(o=>{
      ctx.fillStyle=o.color.fill;ctx.strokeStyle=o.color.stroke;ctx.lineWidth=o.color.sw;
      if(o.type==="polygon"){
        ctx.beginPath();o.pts.forEach(({x,y},i)=>{const{cx,cy}=toC(x,y);i===0?ctx.moveTo(cx,cy):ctx.lineTo(cx,cy);});ctx.closePath();ctx.fill();ctx.stroke();
      } else {
        const{cx,cy}=toC(o.ox,o.oy+o.h);ctx.fillRect(cx,cy,o.w*sc,-o.h*sc);ctx.strokeRect(cx,cy,o.w*sc,-o.h*sc);
      }
    });
    // Coord dot (small, subtle)
    const{cx:cdx,cy:cdy}=toC(coordX,coordY);
    ctx.beginPath();ctx.arc(cdx,cdy,3,0,Math.PI*2);
    ctx.fillStyle="rgba(250,204,21,0.6)";ctx.fill();
    // Rulers
    rulers.forEach(rl=>{
      const{cx:rx0,cy:ry0}=toC(rl.x0,rl.y0);const{cx:rx1,cy:ry1}=toC(rl.x1,rl.y1);
      ctx.strokeStyle="rgba(220,80,0,0.85)";ctx.lineWidth=1.2;ctx.setLineDash([4,3]);ctx.beginPath();ctx.moveTo(rx0,ry0);ctx.lineTo(rx1,ry1);ctx.stroke();ctx.setLineDash([]);
      // tick ends
      const ang=Math.atan2(ry1-ry0,rx1-rx0)+Math.PI/2;
      [[rx0,ry0],[rx1,ry1]].forEach(([tx,ty])=>{ctx.strokeStyle="rgba(220,80,0,0.85)";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(tx+Math.cos(ang)*5,ty+Math.sin(ang)*5);ctx.lineTo(tx-Math.cos(ang)*5,ty-Math.sin(ang)*5);ctx.stroke();});
      ctx.fillStyle="rgba(220,80,0,0.9)";ctx.font="bold 10px monospace";ctx.fillText(`${r3(rl.dist).toFixed(3)}nm`,(rx0+rx1)/2+3,(ry0+ry1)/2-5);
    });
    // ruler first-click preview
    if(rulerPt1.current&&cursorNm){
      const{cx:p1x,cy:p1y}=toC(rulerPt1.current.wx,rulerPt1.current.wy);
      const{cx:p2x,cy:p2y}=toC(cursorNm.wx,cursorNm.wy);
      ctx.strokeStyle="rgba(220,80,0,0.4)";ctx.lineWidth=1;ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(p1x,p1y);ctx.lineTo(p2x,p2y);ctx.stroke();ctx.setLineDash([]);
      ctx.beginPath();ctx.arc(p1x,p1y,4,0,Math.PI*2);ctx.fillStyle="rgba(220,80,0,0.8)";ctx.fill();
    }
    // cursor coord label — use raw canvas px from ref
    if(cursorPxRef.current){
      const{px:mlx,py:mly}=cursorPxRef.current;
      const label=`(${cursorNm?.wx??""}, ${cursorNm?.wy??""})`;
      ctx.font="bold 11px monospace";
      const tw=ctx.measureText(label).width;
      const lx=mlx+14+tw+8>CW?mlx-tw-10:mlx+14;
      const ly=mly+18+16>CH?mly-4:mly+18;
      ctx.fillStyle="rgba(0,0,0,0.7)";
      const rr=3,rx2=lx-4,ry2=ly-13,rw2=tw+8,rh2=17;
      ctx.beginPath();ctx.moveTo(rx2+rr,ry2);ctx.lineTo(rx2+rw2-rr,ry2);ctx.arcTo(rx2+rw2,ry2,rx2+rw2,ry2+rr,rr);ctx.lineTo(rx2+rw2,ry2+rh2-rr);ctx.arcTo(rx2+rw2,ry2+rh2,rx2+rw2-rr,ry2+rh2,rr);ctx.lineTo(rx2+rr,ry2+rh2);ctx.arcTo(rx2,ry2+rh2,rx2,ry2+rh2-rr,rr);ctx.lineTo(rx2,ry2+rr);ctx.arcTo(rx2,ry2,rx2+rr,ry2,rr);ctx.closePath();ctx.fill();
      ctx.fillStyle="#fff";ctx.fillText(label,lx,ly);
    }
    // mode label top-left
    if(imode){
      const mc={"serif-add":PURPLE,"hole-add":ORANGE,"delete":"#f87171","edit":CYAN,"ruler-h-between":ORANGE,"ruler-v-between":ORANGE,"ruler-h-within":ORANGE,"ruler-v-within":ORANGE}[imode]||CYAN;
      const ml={"serif-add":"[S] ADD SERIF","hole-add":"[H] ADD HOLE","delete":"[⇧D] DELETE","edit":"[E] EDIT","ruler-h-between":"↔ click 2pts","ruler-v-between":"↕ click 2pts","ruler-h-within":"↔ click obj","ruler-v-within":"↕ click obj"}[imode]||imode;
      ctx.fillStyle=mc+"dd";ctx.font="bold 10px monospace";ctx.fillText(ml,8,16);
    }
  },[objs,rulers,coordX,coordY,zoom,imode,cursorNm,pcW,pcH]); // cursorPxRef is a ref, no dep needed

  // Get all edges of rendered objects (world coords)
  const getObjEdges=(isH)=>{
    const edges=[];
    objs.forEach(o=>{
      if(o.type==="polygon"){
        const xs=o.pts.map(p=>p.x),ys=o.pts.map(p=>p.y);
        if(isH){edges.push({v:Math.min(...xs),y:(Math.min(...ys)+Math.max(...ys))/2,side:"left",obj:o});
                edges.push({v:Math.max(...xs),y:(Math.min(...ys)+Math.max(...ys))/2,side:"right",obj:o});}
        else   {edges.push({v:Math.min(...ys),x:(Math.min(...xs)+Math.max(...xs))/2,side:"bottom",obj:o});
                edges.push({v:Math.max(...ys),x:(Math.min(...xs)+Math.max(...xs))/2,side:"top",obj:o});}
      } else {
        if(isH){edges.push({v:o.ox,     y:o.oy+o.h/2,side:"left", obj:o});
                edges.push({v:o.ox+o.w, y:o.oy+o.h/2,side:"right",obj:o});}
        else   {edges.push({v:o.oy,     x:o.ox+o.w/2,side:"bottom",obj:o});
                edges.push({v:o.oy+o.h, x:o.ox+o.w/2,side:"top",   obj:o});}
      }
    });
    return edges;
  };
  // Find nearest edge to a world coordinate
  const nearestEdge=(coord,edges)=>edges.reduce((b,e)=>Math.abs(e.v-coord)<Math.abs(b.v-coord)?e:b,edges[0]);

  const handleClick=e=>{
    const rect=cvRef.current.getBoundingClientRect();
    const cx=e.clientX-rect.left,cy=e.clientY-rect.top;
    const{wx,wy}=toW(cx,cy);
    const m=imodeRef.current;
    if(m==="serif-add"){setSerifDlg({id:uid(),align:"top",w:r3(pitch*0.1),h:r3(pitch*0.1),overlapW:r3(pitch*0.02),overlapH:r3(pitch*0.02),algorithms:[]});imodeRef.current=null;setImode(null);return;}
    if(m==="hole-add"){setHoleDlg(true);imodeRef.current=null;setImode(null);return;}
    if(m==="delete"||m==="edit"){
      const hit=objs.find(o=>o.type!=="polygon"&&hitTest(o,wx,wy));
      if(!hit)return;
      if(m==="delete"){
        if(hit.type==="serif"){onUpdatePolygon({...polygon,serifs:(polygon.serifs||[]).filter((_,i)=>i!==hit.serifIdx)});}
        else if(hit.type==="hole"){onUpdatePolygon({...polygon,hole:null});}
        imodeRef.current=null; setImode(null);
      }
      if(m==="edit"){
        if(hit.type==="serif"){setSerifDlg({...(polygon.serifs||[])[hit.serifIdx],_idx:hit.serifIdx});}
        else if(hit.type==="hole"){setHoleDlg(true);}
        imodeRef.current=null; setImode(null);
      }
      return;
    }
    if(m&&m.startsWith("ruler-")){
      const isH=m==="ruler-h-between"||m==="ruler-h-within";
      const edges=getObjEdges(isH);
      if(!edges.length) return;
      if(!rulerPt1.current){
        // Snap first click to nearest edge
        const e1=nearestEdge(isH?wx:wy,edges);
        rulerPt1.current=isH?{wx:e1.v,wy:e1.y??wy}:{wx:e1.x??wx,wy:e1.v};
      } else {
        // Snap second click to nearest edge (different from first)
        const p1=rulerPt1.current;
        // Filter edges on the other side of cursor from p1
        const e2=edges.filter(e=>isH?e.v!==p1.wx:e.v!==p1.wy).reduce((b,e)=>{
          // prefer edges closest to cursor
          return Math.abs(e.v-(isH?wx:wy))<Math.abs(b.v-(isH?wx:wy))?e:b;
        },edges[0]);
        let x0,y0,x1,y1;
        if(isH){
          x0=Math.min(p1.wx,e2.v); x1=Math.max(p1.wx,e2.v);
          y0=y1=(p1.wy+wy)/2;
        } else {
          y0=Math.min(p1.wy,e2.v); y1=Math.max(p1.wy,e2.v);
          x0=x1=(p1.wx+wx)/2;
        }
        const dist=isH?Math.abs(x1-x0):Math.abs(y1-y0);
        setRulers(rs=>[...rs,{x0,y0,x1,y1,dist}]);
        rulerPt1.current=null;
      }
    }
  };

  const saveSerif=sf=>{
    if(!polygon)return;
    const serifs=[...(polygon.serifs||[])];
    if(sf._idx!==undefined){const{_idx,...rest}=sf;serifs[_idx]=rest;}
    else{const{_idx,...rest}=sf;serifs.push(rest);}
    onUpdatePolygon({...polygon,serifs});setSerifDlg(null);
  };
  const saveHole=h=>{if(!polygon)return;onUpdatePolygon({...polygon,hole:h});setHoleDlg(false);};

  const getCur=()=>{
    if(imode==="serif-add"||imode==="hole-add"||imode?.startsWith("ruler"))return"crosshair";
    if(imode==="delete")return"not-allowed";
    if(imode==="edit")return"pointer";
    return"default";
  };

  const RULER_MODES=["ruler-h-between","ruler-v-between","ruler-h-within","ruler-v-within"];
  const setM=m=>{ const v=imodeRef.current===m?null:m; imodeRef.current=v; setImode(v); rulerPt1.current=null; };

  return(
    <div style={{display:"flex",flexDirection:"column",width:"100%"}}>
      {/* Toolbar */}
      <div style={{background:"rgba(0,0,0,0.03)",borderBottom:"1px solid rgba(0,0,0,0.08)",padding:"6px 10px",display:"flex",flexDirection:"column",gap:"5px"}}>
        {/* Row 1: Ruler */}
        <div style={{display:"flex",alignItems:"center",gap:"5px"}}>
          <span style={{fontSize:"9px",fontWeight:700,color:"rgba(0,0,0,0.35)",letterSpacing:"1px",minWidth:"44px"}}>RULER</span>
          {[{m:"ruler-h-between",icon:"↔",t:"H between"},{m:"ruler-v-between",icon:"↕",t:"V between"},{m:"ruler-h-within",icon:"⟺",t:"H within"},{m:"ruler-v-within",icon:"⇕",t:"V within"}].map(({m,icon,t})=>(
            <button key={m} title={t} onClick={()=>setM(m)} style={{...bS,padding:"3px 9px",fontSize:"13px",background:imode===m?"rgba(220,120,0,0.15)":"rgba(0,0,0,0.05)",color:imode===m?ORANGE:"rgba(0,0,0,0.45)",border:`1px solid ${imode===m?"rgba(220,120,0,0.45)":"rgba(0,0,0,0.1)"}`}}>{icon}</button>
          ))}
          {rulers.length>0&&<button onClick={()=>{setRulers([]);rulerPt1.current=null;}} style={{...bS,padding:"2px 7px",fontSize:"9px",background:"rgba(220,80,0,0.08)",color:"rgba(220,80,0,0.7)",border:"1px solid rgba(220,80,0,0.25)"}}>✕</button>}
          {imode?.startsWith("ruler")&&<span style={{fontSize:"9px",color:"rgba(0,0,0,0.35)",marginLeft:"4px"}}>{rulerPt1.current?"→ click 2nd point":"→ click 1st point"}</span>}
        </div>
        {/* Row 2: Edit actions */}
        <div style={{display:"flex",alignItems:"center",gap:"5px"}}>
          <span style={{fontSize:"9px",fontWeight:700,color:"rgba(0,0,0,0.35)",letterSpacing:"1px",minWidth:"44px"}}>EDIT</span>
          {[{m:"serif-add",icon:"⊕",k:"S",color:PURPLE,t:"[S] Add Serif"},{m:"hole-add",icon:"⊞",k:"H",color:ORANGE,t:"[H] Add Hole"},{m:"edit",icon:"✎",k:"E",color:CYAN,t:"[E] Edit object"},{m:"delete",icon:"✕",k:"⇧D",color:"#f87171",t:"[⇧D] Delete"}].map(({m,icon,k,color,t})=>(
            <button key={m} title={t} onClick={()=>setM(m)} style={{...bS,padding:"3px 8px",fontSize:"11px",display:"flex",alignItems:"center",gap:"3px",background:imode===m?`${color}22`:"rgba(0,0,0,0.05)",color:imode===m?color:"rgba(0,0,0,0.45)",border:`1px solid ${imode===m?color+"66":"rgba(0,0,0,0.1)"}`}}>
              <span>{icon}</span><span style={{fontSize:"8px",opacity:0.7}}>{k}</span>
            </button>
          ))}
          <div style={{marginLeft:"auto",display:"flex",gap:"3px"}}>
            <button onClick={()=>setZoom(z=>Math.min(z*1.3,6))} style={{...bS,padding:"2px 8px",fontSize:"13px",background:"rgba(0,0,0,0.05)",color:"rgba(0,0,0,0.4)",border:"1px solid rgba(0,0,0,0.1)"}}>+</button>
            <button onClick={()=>setZoom(1)} style={{...bS,padding:"2px 6px",fontSize:"9px",background:"rgba(0,0,0,0.05)",color:"rgba(0,0,0,0.35)",border:"1px solid rgba(0,0,0,0.1)"}}>1:1</button>
            <button onClick={()=>setZoom(z=>Math.max(z/1.3,0.2))} style={{...bS,padding:"2px 8px",fontSize:"13px",background:"rgba(0,0,0,0.05)",color:"rgba(0,0,0,0.4)",border:"1px solid rgba(0,0,0,0.1)"}}>−</button>
          </div>
        </div>
      </div>
      <canvas ref={cvRef} width={CW} height={CH} style={{display:"block",cursor:getCur(),width:"100%",height:"auto",flexShrink:0}}
        onClick={handleClick}
        onMouseMove={e=>{const rect=cvRef.current.getBoundingClientRect();const px=e.clientX-rect.left,py=e.clientY-rect.top;cursorPxRef.current={px,py};setCursorNm(toW(px,py));}}
        onMouseLeave={()=>{setCursorNm(null);cursorPxRef.current=null;}}/>
      {serifDlg&&<SerifDialog serif={serifDlg} pitch={pitch} onSave={saveSerif} onClose={()=>setSerifDlg(null)}/>}
      {holeDlg&&<HoleDialog hole={polygon?.hole??null} pitch={pitch} onSave={saveHole} onClose={()=>setHoleDlg(false)}/>}
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────
export default function ParameterTab({cfg,onChange,selProd}){
  const pitch=selProd?.pitch??1;
  const adc=cfg.actv_dum_col||300,adr=cfg.actv_dum_row||200;
  const[pcells,setPcells]=useState([]);
  const[selPcellId,setSelPcellId]=useState(null);
  const[selPolyId,setSelPolyId]=useState(null);
  const[pcellDlg,setPcellDlg]=useState(null);
  const[polyDlg,setPolyDlg]=useState(null);
  const[coordX,setCoordX]=useState(0);
  const[coordY,setCoordY]=useState(0);
  const[useField,setUseField]=useState(false);
  const[fieldVal,setFieldVal]=useState(0);
  const[quadrant,setQuadrant]=useState(1);
  const[hovPcellId,setHovPcellId]=useState(null);
  const[hovPolyId,setHovPolyId]=useState(null);
  const pcRef=useRef(null),pgRef=useRef(null);

  const selPcell=pcells.find(p=>p.id===selPcellId)??null;
  const selPolygon=useMemo(()=>{if(!selPcell)return null;return selPcell.polygons?.find(p=>p.id===selPolyId)??selPcell.polygons?.[0]??null;},[selPcell,selPolyId]);

  useEffect(()=>{if(!useField)return;const d=Math.sqrt(Math.pow(adc*pitch/2,2)+Math.pow(adr*pitch/2,2));const r=fieldVal*d;const a=[Math.PI/4,3*Math.PI/4,5*Math.PI/4,7*Math.PI/4][quadrant-1]??0;setCoordX(r3(r*Math.cos(a)));setCoordY(r3(r*Math.sin(a)));},[ fieldVal,quadrant,useField,adc,adr,pitch]);

  const addPcell=pc=>{setPcells(ps=>[...ps,pc]);setSelPcellId(pc.id);setPcellDlg(null);};
  const editPcell=pc=>{setPcells(ps=>ps.map(p=>p.id===pc.id?{...p,...pc}:p));setPcellDlg(null);};
  const delPcell=id=>{setPcells(ps=>ps.filter(p=>p.id!==id));if(selPcellId===id)setSelPcellId(null);};
  const addPolygon=poly=>{const n=`P${(selPcell?.polygons?.length??0)+1}`;const np={...poly,name:n};setPcells(ps=>ps.map(p=>p.id===selPcellId?{...p,polygons:[...(p.polygons||[]),np]}:p));setSelPolyId(np.id);setPolyDlg(null);};
  const editPolygon=poly=>{setPcells(ps=>ps.map(p=>p.id===selPcellId?{...p,polygons:(p.polygons||[]).map(pg=>pg.id===poly.id?poly:pg)}:p));setPolyDlg(null);};
  const delPolygon=id=>{setPcells(ps=>ps.map(p=>p.id===selPcellId?{...p,polygons:(p.polygons||[]).filter(pg=>pg.id!==id)}:p));if(selPolyId===id)setSelPolyId(null);};
  const updatePolygon=useCallback(poly=>{setPcells(ps=>ps.map(p=>p.id===selPcellId?{...p,polygons:(p.polygons||[]).map(pg=>pg.id===poly.id?poly:pg)}:p));},[selPcellId]);

  return(
    <div style={{display:"flex",gap:"10px",height:"100%",minHeight:"400px",position:"relative"}}>
      {/* PCell Panel */}
      <div ref={pcRef} tabIndex={0} style={{...PANEL,flex:1,outline:"none"}}>
        <div style={{padding:"12px 12px 8px",borderBottom:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <p style={{...SEC,margin:0}}>PCell</p>
          <button onClick={()=>setPcellDlg("new")} style={{width:"22px",height:"22px",borderRadius:"50%",border:"none",cursor:"pointer",background:"linear-gradient(135deg,#4f46e5,#7c3aed)",color:"#fff",fontSize:"16px",fontWeight:300,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"8px"}}>
          {pcells.length===0&&<p style={{fontSize:"11px",color:"rgba(255,255,255,0.2)",textAlign:"center",paddingTop:"16px",margin:0}}>No PCells<br/>Click +</p>}
          {pcells.map(pc=>{
            const isSel=pc.id===selPcellId,isHov=pc.id===hovPcellId;
            return(
              <div key={pc.id} onMouseEnter={()=>setHovPcellId(pc.id)} onMouseLeave={()=>setHovPcellId(null)}
                onClick={()=>{setSelPcellId(pc.id);setSelPolyId(null);}}
                style={{background:isSel?"rgba(99,102,241,0.15)":isHov?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.03)",border:`1px solid ${isSel?"rgba(99,102,241,0.4)":"rgba(255,255,255,0.08)"}`,borderRadius:"8px",padding:"8px 10px",marginBottom:"5px",cursor:"pointer",transition:"all 0.15s"}}>
                <div style={{display:"flex",alignItems:"center",gap:"4px"}}>
                  <span style={{fontSize:"12px",fontWeight:700,color:isSel?"#a5b4fc":"#fff",flex:1}}>{pc.name||"(unnamed)"}</span>
                  <button onClick={e=>{e.stopPropagation();setPcellDlg(pc);}} title="Edit PCell"
                    style={{...bI,color:"rgba(255,255,255,0.35)"}} onMouseEnter={e=>e.currentTarget.style.color=CYAN} onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.35)"}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button onClick={e=>{e.stopPropagation();if(window.confirm(`Delete PCell "${pc.name||"(unnamed)"}"?`))delPcell(pc.id);}} title="Delete PCell"
                    style={{...bI,color:"rgba(255,80,80,0.4)"}} onMouseEnter={e=>e.currentTarget.style.color="rgba(255,80,80,0.9)"} onMouseLeave={e=>e.currentTarget.style.color="rgba(255,80,80,0.4)"}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  </button>
                </div>
                <div style={{display:"flex",gap:"6px",marginTop:"3px",flexWrap:"wrap"}}>
                  <span style={{fontSize:"9px",color:"rgba(255,255,255,0.35)"}}>Grid {pc.gridN}×{pc.gridM}</span>
                  <span style={{fontSize:"9px",color:"rgba(255,255,255,0.35)"}}>{pc.layer}</span>
                  <span style={{fontSize:"9px",color:EMERALD}}>{pc.shrinkRatio}</span>
                  <span style={{fontSize:"9px",color:"rgba(255,255,255,0.3)"}}>{pc.polygons?.length??0}P</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Polygon Panel */}
      <div ref={pgRef} tabIndex={0} style={{...PANEL,flex:1,outline:"none"}}>
        <div style={{padding:"12px 12px 8px",borderBottom:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <p style={{...SEC,margin:0}}>Polygon{selPcell?` · ${selPcell.name||"?"}`:""}</p>
          {selPcell&&<button onClick={()=>setPolyDlg("new")} style={{width:"22px",height:"22px",borderRadius:"50%",border:"none",cursor:"pointer",background:"linear-gradient(135deg,#0891b2,#38bdf8)",color:"#fff",fontSize:"16px",fontWeight:300,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>}
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"8px"}}>
          {!selPcell&&<p style={{fontSize:"11px",color:"rgba(255,255,255,0.2)",textAlign:"center",paddingTop:"16px",margin:0}}>Select a PCell</p>}
          {selPcell&&(selPcell.polygons?.length??0)===0&&<p style={{fontSize:"11px",color:"rgba(255,255,255,0.2)",textAlign:"center",paddingTop:"16px",margin:0}}>No polygons<br/>Click +</p>}
          {(selPcell?.polygons||[]).map(pg=>{
            const isSel=pg.id===(selPolyId??selPcell?.polygons?.[0]?.id),isHov=pg.id===hovPolyId;
            return(
              <div key={pg.id} onMouseEnter={()=>setHovPolyId(pg.id)} onMouseLeave={()=>setHovPolyId(null)}
                onClick={()=>setSelPolyId(pg.id)}
                style={{background:isSel?"rgba(56,189,248,0.12)":isHov?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.03)",border:`1px solid ${isSel?"rgba(56,189,248,0.35)":"rgba(255,255,255,0.08)"}`,borderRadius:"8px",padding:"8px 10px",marginBottom:"5px",cursor:"pointer",transition:"all 0.15s"}}>
                <div style={{display:"flex",alignItems:"center",gap:"4px"}}>
                  <span style={{fontSize:"12px",fontWeight:700,color:isSel?CYAN:"#fff",flex:1}}>{pg.name}</span>
                  <button onClick={e=>{e.stopPropagation();setPolyDlg(pg);}} title="Edit Polygon"
                    style={{...bI,color:"rgba(255,255,255,0.35)"}} onMouseEnter={e=>e.currentTarget.style.color=CYAN} onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.35)"}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button onClick={e=>{e.stopPropagation();if(window.confirm(`Delete Polygon "${pg.name}"?`))delPolygon(pg.id);}} title="Delete Polygon"
                    style={{...bI,color:"rgba(255,80,80,0.4)"}} onMouseEnter={e=>e.currentTarget.style.color="rgba(255,80,80,0.9)"} onMouseLeave={e=>e.currentTarget.style.color="rgba(255,80,80,0.4)"}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  </button>
                </div>
                <div style={{display:"flex",gap:"5px",marginTop:"3px",flexWrap:"wrap"}}>
                  <span style={{fontSize:"9px",color:"rgba(255,255,255,0.35)"}}>{pg.mode}</span>
                  <span style={{fontSize:"9px",color:"rgba(255,255,255,0.35)"}}>{pg.points?.length}pts</span>
                  <span style={{fontSize:"9px",color:"rgba(255,255,255,0.3)"}}>⊕{pg.align}</span>
                  {(pg.serifs?.length>0)&&<span style={{fontSize:"9px",color:PURPLE}}>{pg.serifs.length}S</span>}
                  {pg.hole&&<span style={{fontSize:"9px",color:ORANGE}}>H{pg.hole.gridN}×{pg.hole.gridM}</span>}
                  {(pg.algorithms?.length>0)&&<span style={{fontSize:"9px",color:"rgba(167,139,250,0.6)"}}>⚙{pg.algorithms.length}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Preview Panel */}
      <div id="pvp" tabIndex={0} style={{...PANEL,flex:2,outline:"none",background:"rgba(255,255,255,0.96)"}}>
        {/* coord input */}
        <div style={{padding:"7px 10px",borderBottom:"1px solid rgba(0,0,0,0.08)",flexShrink:0,display:"flex",alignItems:"center",gap:"6px",flexWrap:"wrap"}}>
          <span style={{fontSize:"9px",fontWeight:700,color:"rgba(0,0,0,0.35)",letterSpacing:"1px",minWidth:"44px"}}>COORD</span>
          <label style={{display:"flex",alignItems:"center",gap:"4px",fontSize:"10px",color:"rgba(0,0,0,0.45)",cursor:"pointer"}}><input type="checkbox" checked={useField} onChange={e=>setUseField(e.target.checked)} style={{accentColor:CYAN}}/>Field</label>
          {useField?(<>
            <select value={quadrant} onChange={e=>setQuadrant(parseInt(e.target.value))} style={{...sS,color:"rgba(0,0,0,0.6)",background:"rgba(0,0,0,0.05)",border:"1px solid rgba(0,0,0,0.1)",width:"46px"}}>{[1,2,3,4].map(q=><option key={q} value={q}>Q{q}</option>)}</select>
            <input type="number" value={fieldVal} step="0.01" min="0" max="1.1" onChange={e=>setFieldVal(r3(parseFloat(e.target.value)||0))} style={{...iS,width:"58px",color:"rgba(0,0,0,0.65)",background:"rgba(0,0,0,0.05)",border:"1px solid rgba(0,0,0,0.1)"}}/>

          </>):(<>
            <span style={{fontSize:"10px",color:"rgba(0,0,0,0.4)"}}>x</span>
            <input type="number" value={coordX} step={pitch} onChange={e=>setCoordX(r3(parseFloat(e.target.value)||0))} style={{...iS,width:"60px",color:"rgba(0,0,0,0.65)",background:"rgba(0,0,0,0.05)",border:"1px solid rgba(0,0,0,0.1)"}}/>
            <span style={{fontSize:"10px",color:"rgba(0,0,0,0.4)"}}>y</span>
            <input type="number" value={coordY} step={pitch} onChange={e=>setCoordY(r3(parseFloat(e.target.value)||0))} style={{...iS,width:"60px",color:"rgba(0,0,0,0.65)",background:"rgba(0,0,0,0.05)",border:"1px solid rgba(0,0,0,0.1)"}}/>
          </>)}
          <span style={{fontSize:"11px",fontWeight:700,color:"rgba(0,0,0,0.55)",marginLeft:"auto",background:"rgba(0,0,0,0.07)",padding:"2px 8px",borderRadius:"4px",fontFamily:"monospace"}}>({coordX}, {coordY}) · f:{r3(calcField(coordX,coordY,pitch,adc,adr)).toFixed(3)}</span>
        </div>
        <div style={{flex:1,overflow:"auto",background:"#f8f8f8",display:"flex",justifyContent:"center"}}>
          {selPcell
            ?<PreviewCanvas pcell={selPcell} polygon={selPolygon} pitch={pitch} coordX={coordX} coordY={coordY} adc={adc} adr={adr} onUpdatePolygon={updatePolygon}/>
            :<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",color:"rgba(0,0,0,0.3)",fontSize:"12px"}}>Select a PCell to preview</div>
          }
        </div>
        {selPcell&&<div style={{padding:"4px 10px",borderTop:"1px solid rgba(0,0,0,0.06)",fontSize:"9px",color:"rgba(0,0,0,0.3)",flexShrink:0}}>
          pitch:{pitch}μm · PCell:{r3((selPcell.gridN||1)*pitch)}×{r3((selPcell.gridM||1)*pitch)}
        </div>}
      </div>

      {/* Dialogs */}
      {(pcellDlg==="new"||typeof pcellDlg==="object"&&pcellDlg)&&<PCellDialog pcell={pcellDlg==="new"?null:pcellDlg} selProd={selProd} onSave={pc=>pcellDlg==="new"?addPcell(pc):editPcell(pc)} onClose={()=>setPcellDlg(null)}/>}
      {(polyDlg==="new"||typeof polyDlg==="object"&&polyDlg)&&selPcell&&<PolygonDialog pcell={selPcell} pitch={pitch} polygon={polyDlg==="new"?null:polyDlg} onSave={poly=>polyDlg==="new"?addPolygon(poly):editPolygon(poly)} onClose={()=>setPolyDlg(null)}/>}
    </div>
  );
}