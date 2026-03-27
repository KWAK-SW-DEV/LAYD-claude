import { useState } from "react";
import { useNavigate } from "react-router-dom";
import pageDescriptions from "../data/pageDescriptions";

const SECTION_IMAGES = {
  PRODUCT: "https://images.unsplash.com/photo-1567581935884-3349723552ca?w=800&q=80",
  SHRINK:  "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
  LAYOUT:  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
};

export default function SectionCard({ pageKey }) {
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
        filter: hovered ? "brightness(0.45) contrast(1.1)" :
"brightness(0.65) contrast(1.05)",
        transition:"filter 0.35s ease",
      }}/>
      <div style={{ position:"absolute", inset:0,
        background:"linear-gradient(to top,rgba(0,0,0,0.82) 0%,rgba(0,0,0,0.1) 55%), linear-gradient(to right,rgba(0,0,0,0.3) 0%,transparent 30%), linear-gradient(to left,rgba(0,0,0,0.3) 0%,transparent 30%)",
      }}/>
      <div style={{ position:"relative", zIndex:2, padding:"24px 22px",
height:"100%", display:"flex", flexDirection:"column",
justifyContent:"flex-end" }}>
        <p style={{ fontSize:"10px", letterSpacing:"4px",
textTransform:"uppercase", color:"rgba(255,255,255,0.6)",
margin:"0 0 4px", fontWeight:500 }}>{info.subtitle}</p>
        <h2 style={{ fontSize:"24px", fontWeight:800,
letterSpacing:"2px", color:"#ffffff", margin:"0 0 10px" }}>{info.title}</h2>
        <div style={{ maxHeight: hovered ? "200px" : "0",
overflow:"hidden", transition:"max-height 0.4s ease" }}>
          <p style={{ fontSize:"12px", color:"rgba(255,255,255,0.75)",
lineHeight:1.75, margin:"0 0 12px" }}>{info.description}</p>
          <div style={{ display:"flex", gap:"6px", flexWrap:"wrap",
marginBottom:"14px" }}>
            {info.tags.map(t => (
              <span key={t} style={{ fontSize:"9px", letterSpacing:"1.5px",
textTransform:"uppercase", border:"1px solid rgba(255,255,255,0.35)", color:"#ffffff", borderRadius:"20px",
padding:"2px 8px" }}>{t}</span>
            ))}
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"6px",
color:"#ffffff", fontSize:"12px", fontWeight:600, letterSpacing:"1px"
}}>
          <span>{info.cta}</span>
          <span style={{ transform: hovered ? "translateX(4px)" :
"translateX(0)", transition:"transform 0.3s" }}>→</span>
        </div>
      </div>
    </div>
  );
}
