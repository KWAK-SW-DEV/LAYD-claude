import { useState } from "react";

export default function HelpFAB() {
  const [open, setOpen] = useState(false);
  const items = [
    { label:"Info", icon:(
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
stroke="#fff" strokeWidth="2.2" strokeLinecap="round"
strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12"
y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
    )},
    { label:"Q&A", icon:(
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
stroke="#fff" strokeWidth="2.2" strokeLinecap="round"
strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
    )},
  ];
  return (
    <div onMouseEnter={()=>setOpen(true)}
onMouseLeave={()=>setOpen(false)}
      style={{
        position:"fixed",bottom:"36px",right:"32px",zIndex:300,display:"flex",flexDirection:"column",alignItems:"center",gap:"10px"
      }}>
      {items.map((item,i)=>(
        <div key={item.label} title={item.label} onClick={()=>alert(`${item.label} — Coming Soon`)}
          style={{
            width:"40px",height:"40px",borderRadius:"50%",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
            background:"linear-gradient(135deg,#3b82f6,#1d4ed8)",boxShadow:"0 4px 14px rgba(59,130,246,0.45)",
            opacity:open?1:0, transform:open?"translateY(0) scale(1)":`translateY(${18}px) scale(0.8)`,
            transition:`opacity 0.22s ease ${i*0.07}s, transform 0.28s cubic-bezier(0.34,1.56,0.64,1) ${i*0.07}s`,
            pointerEvents:open?"auto":"none"
          }}
          onMouseEnter={(e=>e.currentTarget.style.background="linear-gradient(135deg,#60a5fa,#2563eb)")}
          onMouseLeave={(e=>e.currentTarget.style.background="linear-gradient(135deg,#3b82f6,#1d4ed8)")}
        >
          {item.icon}
        </div>
      ))}
      <div style={{ width:"48px",height:"48px",borderRadius:"50%",
        background:open?"linear-gradient(135deg,#3b82f6,#1e40af)":"linear-gradient(135deg,#3b82f6,#1d4ed8)",
        display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",
        boxShadow:open?"0 6px 22px rgba(59,130,246,0.55)":"0 4px 14px rgba(59,130,246,0.4)",
        transition:"background 0.25s,box-shadow 0.25s,transform 0.2s",
        transform:open?"rotate(15deg) scale(1.08)":"rotate(0) scale(1)",userSelect:"none" }}>
        <span style={{ fontSize:"22px",fontWeight:900,color:"#fff",lineHeight:1,marginTop:"-1px" }}>?</span>
      </div>
    </div>
  );
}
