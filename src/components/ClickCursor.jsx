import { useState, useEffect } from "react";

export default function ClickCursor() {
  const [clicking, setClicking] = useState(false);
  useEffect(() => {
    const trigger = () => { setClicking(true);
setTimeout(()=>setClicking(false), 420); };
    trigger();
    const id = setInterval(trigger, 2200);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{
      position:"relative",width:"28px",height:"28px",flexShrink:0 }}>
      {clicking && <>
        <div style={{
          position:"absolute",inset:0,borderRadius:"50%",border:"1.5px solid rgba(120,113,108,0.6)",animation:"ripple1 0.42s ease-out forwards"
        }}/>
        <div style={{
          position:"absolute",inset:0,borderRadius:"50%",border:"1.5px solid rgba(120,113,108,0.35)",animation:"ripple2 0.42s ease-out 0.08s forwards"
        }}/>
      </>}
      <svg viewBox="0 0 24 24" width="22" height="22"
        style={{
          position:"absolute",top:"3px",left:"3px",transform:clicking?"scale(0.82)":"scale(1)",transition:"transform 0.12s ease",filter:"drop-shadow(0 1px 2px rgba(0,0,0,0.15))"
        }}>
        <path d="M4 2 L4 17 L8 13 L11 19 L13 18 L10 12 L15 12 Z"
          fill={clicking?"#44403c":"#78716c"} stroke="#ede8df"
strokeWidth="0.8" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}
