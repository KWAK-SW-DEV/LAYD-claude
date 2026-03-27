import { useState, useEffect, useRef } from "react";

const SLIDES = [
  { img:"https://image.semiconductor.samsung.com/content/samsung/p6/semiconductor/image-sensor/gnj/ISOCELL_GNJ_KV.jpg",
    fallback:"https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=90",
    tag:"ISOCELL GNJ", title:"50MP Dual Pixel\nMobile Sensor",
    desc:"Every pixel captures more light. Dual-pixel autofocus meets 1.0µm precision." },
  { img:"https://image.semiconductor.samsung.com/content/samsung/p6/semiconductor/image-sensor/smart-iso-pro/isocell_smart_iso_pro_kv.jpg",
    fallback:"https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1600&q=90",
    tag:"ISOCELL Smart ISO Pro", title:"HDR Redefined\nIn Every Frame",
    desc:"Smart-ISO Pro merges high and low gain readouts for true 12-bit HDR output." },
  { img:"https://image.semiconductor.samsung.com/content/samsung/p6/semiconductor/image-sensor/gn3/ISOCELL_GN3_KV.jpg",
    fallback:"https://images.unsplash.com/photo-1557804506-669a3a8774a9?w=1600&q=90",
    tag:"ISOCELL GN3", title:"200MP Ultra-Fine\nPixel Technology",
    desc:"0.56µm pixels in a 1/1.4\" format. The smallest pixel, the biggest detail." },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [fading, setFading]   = useState(false);
  const prevRef = useRef(null);

  const goTo = (idx) => {
    if (idx === current || fading) return;
    prevRef.current = current; setCurrent(idx);setFading(true);
    setTimeout(() => { prevRef.current = null; setFading(false); },
700);
  };

  useEffect(() => {
    const id = setInterval(() => goTo((current + 1) % SLIDES.length),
5000);
    return () => clearInterval(id);
  }, [current, fading]);

  const s = SLIDES[current];
  return (
    <div style={{ position:"relative", width:"100%", height:"100%",
overflow:"hidden", background:"#000" }}>
      {prevRef.current !== null && (
        <img src={SLIDES[prevRef.current].img}
onError={(e)=>{e.target.src=SLIDES[prevRef.current]?.fallback;}} alt=""
          style={{
position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",
opacity:fading?0:1,transition:"opacity 0.7s ease" }}/>
      )}
      <img key={current} src={s.img}
onError={(e)=>{e.target.src=s.fallback;}} alt={s.tag}
        style={{
position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",
opacity:fading?0.4:1,transition:"opacity 0.7s ease" }}/>
      <div style={{
position:"absolute",inset:0,background:"rgba(0,0,0,0.46)" }}/>
      <div style={{ position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.42) 0%,transparent 50%)" }}/>
      <div style={{
position:"absolute",left:"50%",top:"50%",transform:"translate(-50%,-50%)",zIndex:2,maxWidth:"600px",width:"90%",textAlign:"center" }}>
        <span style={{ display:"inline-block",fontSize:"10px",letterSpacing:"4px",textTransform:"uppercase",color:"#67e8f9",border:"1px solid rgba(103,232,249,0.4)",borderRadius:"20px",padding:"3px 12px",marginBottom:"18px",fontWeight:500 }}>{s.tag}</span>
        <h1 style={{
fontSize:"clamp(28px,4.5vw,58px)",fontWeight:900,lineHeight:1.1,color:"#ffffff",margin:"0 0 18px",whiteSpace:"pre-line" }}>{s.title}</h1>
        <p style={{
fontSize:"clamp(12px,1.3vw,15px)",color:"rgba(255,255,255,0.65)",lineHeight:1.75 }}>{s.desc}</p>
      </div>
      <div style={{
position:"absolute",bottom:"28px",left:"50%",transform:"translateX(-50%)",zIndex:2,display:"flex",gap:"8px",alignItems:"center" }}>
        {SLIDES.map((_,i) => (
          <button key={i} onClick={()=>goTo(i)} style={{
width:i===current?"28px":"8px",height:"4px",borderRadius:"2px",border:"none",cursor:"pointer",background:i===current?"#67e8f9":"rgba(255,255,255,0.3)",padding:0,transition:"width 0.35s ease,background 0.35s ease" }}/>
        ))}
      </div>
      <div style={{
position:"absolute",bottom:0,left:0,right:0,height:"2px",background:"rgba(255,255,255,0.08)",zIndex:2 }}>
        <div key={current} style={{ height:"100%",background:"linear-gradient(90deg,#67e8f9,#a78bfa)",animation:"progress 5s linear forwards" }}/>
      </div>
    </div>
  );
}
