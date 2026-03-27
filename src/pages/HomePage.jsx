import { useState } from "react";
import MiniGrid    from "../components/MiniGrid";
import HeroBanner  from "../components/HeroBanner";
import SectionCard from "../components/SectionCard";
import UserSidebar from "../components/UserSidebar";
import HelpFAB     from "../components/HelpFAB";
import ClickCursor from "../components/ClickCursor";

const mockUser = { name: "Kim Laydi", email: "laydi@layd.com", role: "Designer" };

// ── Logo ──────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"10px", userSelect:"none" }}>
      <MiniGrid size={7} />
      <div style={{ display:"flex", alignItems:"baseline" }}>
        <span style={{ fontSize:"21px", fontWeight:900, letterSpacing:"4px", color:"#ffffff", WebkitTextFillColor:"#ffffff" }}>LAY</span>
        <span style={{ fontSize:"21px", fontWeight:900, color:"#ffffff", WebkitTextFillColor:"#ffffff", letterSpacing:"1px" }}>:D</span>
      </div>
    </div>
  );
}

// ── HomePage ──────────────────────────────────────────────────────────────
export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div style={{ position:"fixed", inset:0, background:"#0d0b14", fontFamily:"'Inter',system-ui,sans-serif", color:"#ffffff", display:"flex", flexDirection:"column", overflow:"hidden" }}>

      {/* TOPBAR */}
      <header style={{ flexShrink:0, height:"60px", zIndex:100, background:"rgba(8,8,24,0.85)", backdropFilter:"blur(16px)", borderBottom:"1px solid rgba(255,255,255,0.07)", display:"flex", alignItems:"center", padding:"0 24px", gap:"16px" }}>
        <Logo />
        <div style={{ flex:1 }} />
        <div style={{ display:"flex", alignItems:"center", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"24px", padding:"6px 14px", gap:"8px", width:"200px" }}>
          <svg width="13" height="13" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search products…"
            style={{ background:"none", border:"none", outline:"none", color:"#fff", fontSize:"13px", width:"100%" }}/>
        </div>
        <button onClick={() => setSidebarOpen(true)} style={{ width:"34px", height:"34px", borderRadius:"50%", background:"linear-gradient(135deg,#0e7490,#7c3aed)", border:"2px solid rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:"14px", color:"#fff", fontWeight:700 }}>
          {mockUser.name[0]}
        </button>
      </header>

      {/* HERO */}
      <div style={{ flex:1, minHeight:0, position:"relative" }}>
        <HeroBanner />
      </div>

      {/* SECTIONS */}
      <section style={{ flexShrink:0, background:"linear-gradient(180deg,#e8dfd0 0%,#dfd4c0 100%)", padding:"44px 40px 52px", overflowY:"auto", boxShadow:"inset 0 1px 0 rgba(0,0,0,0.06)" }}>
        <div style={{ textAlign:"center", marginBottom:"32px" }}>
          <h2 style={{ fontSize:"clamp(18px,3vw,30px)", fontWeight:800, color:"#1c1917", letterSpacing:"0.5px", margin:"0 0 10px" }}>
            How can we help you?
          </h2>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"8px" }}>
            <p style={{ fontSize:"13px", color:"#78716c", fontWeight:400, margin:0 }}>
              Please select the service you need
            </p>
            <ClickCursor />
          </div>
        </div>
        <div style={{ display:"flex", gap:"16px", maxWidth:"1200px", margin:"0 auto", flexWrap:"wrap" }}>
          {["PRODUCT","SHRINK","LAYOUT"].map(k => <SectionCard key={k} pageKey={k} />)}
        </div>
      </section>

      <UserSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} user={mockUser} />
      <HelpFAB />

      <style>{`
        * { box-sizing:border-box; margin:0; padding:0; }
        input::placeholder { color:rgba(255,255,255,0.28); }
        @keyframes progress  { from{width:0%} to{width:100%} }
        @keyframes ripple1   { 0%{transform:scale(0.5);opacity:1}   100%{transform:scale(2.2);opacity:0} }
        @keyframes ripple2   { 0%{transform:scale(0.5);opacity:0.8} 100%{transform:scale(2.8);opacity:0} }
      `}</style>
    </div>
  );
}