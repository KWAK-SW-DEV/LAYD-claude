import { useState } from "react";
import { useNavigate } from "react-router-dom";
import pageDescriptions from "../data/pageDescriptions";
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

// ── Section Card ──────────────────────────────────────────────────────────
const SECTION_IMAGES = {
  PRODUCT: "https://images.unsplash.com/photo-1567581935884-3349723552ca?w=800&q=80",
  SHRINK:  "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
  LAYOUT:  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
};

function SectionCard({ pageKey }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const info = pageDescriptions[pageKey];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(info.route)}
      style={{
        flex:"1 1 240px", height:"320px", position:"relative",
        overflow:"hidden", cursor:"pointer", borderRadius:"12px",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 28px 56px rgba(0,0,0,0.22), inset 0 0 0 1px rgba(255,255,255,0.12)"
          : "0 4px 24px rgba(0,0,0,0.12), inset 0 0 0 1px rgba(0,0,0,0.06)",
        transition: "transform 0.35s ease, box-shadow 0.35s ease",
      }}
    >
      <img src={SECTION_IMAGES[pageKey]} alt={pageKey} style={{
        position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover",
        filter: hovered ? "brightness(0.45) contrast(1.1)" : "brightness(0.65) contrast(1.05)",
        transition:"filter 0.35s ease",
      }}/>
      <div style={{ position:"absolute", inset:0,
        background:"linear-gradient(to top,rgba(0,0,0,0.82) 0%,rgba(0,0,0,0.1) 55%), linear-gradient(to right,rgba(0,0,0,0.3) 0%,transparent 30%), linear-gradient(to left,rgba(0,0,0,0.3) 0%,transparent 30%)",
      }}/>
      <div style={{ position:"relative", zIndex:2, padding:"24px 22px", height:"100%", display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
        <p style={{ fontSize:"10px", letterSpacing:"4px", textTransform:"uppercase", color:"rgba(255,255,255,0.6)", margin:"0 0 4px", fontWeight:500 }}>{info.subtitle}</p>
        <h2 style={{ fontSize:"24px", fontWeight:800, letterSpacing:"2px", color:"#ffffff", margin:"0 0 10px" }}>{info.title}</h2>
        <div style={{ maxHeight: hovered ? "200px" : "0", overflow:"hidden", transition:"max-height 0.4s ease" }}>
          <p style={{ fontSize:"12px", color:"rgba(255,255,255,0.75)", lineHeight:1.75, margin:"0 0 12px" }}>{info.description}</p>
          <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", marginBottom:"14px" }}>
            {info.tags.map(t => (
              <span key={t} style={{ fontSize:"9px", letterSpacing:"1.5px", textTransform:"uppercase", border:"1px solid rgba(255,255,255,0.35)", color:"#ffffff", borderRadius:"20px", padding:"2px 8px" }}>{t}</span>
            ))}
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"6px", color:"#ffffff", fontSize:"12px", fontWeight:600, letterSpacing:"1px" }}>
          <span>{info.cta}</span>
          <span style={{ transform: hovered ? "translateX(4px)" : "translateX(0)", transition:"transform 0.3s" }}>→</span>
        </div>
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