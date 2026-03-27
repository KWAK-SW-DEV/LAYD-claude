import { useEffect, useRef } from "react";

const PALETTE = [
  "#00f0ff","#38bdf8","#818cf8","#a855f7","#ec4899",
  "#f97316","#facc15","#4ade80","#2dd4bf","#60a5fa",
  "#e879f9","#fb7185","#34d399","#fbbf24","#c084fc",
];
const rnd  = () => PALETTE[Math.floor(Math.random() * PALETTE.length)];
const rndA = () => +(0.75 + Math.random() * 0.25).toFixed(2);

export default function MiniGrid({ size = 7 }) {
  const containerRef = useRef(null);
  const timersRef    = useRef([]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    timersRef.current.forEach(id => { clearInterval(id); clearTimeout(id); });
    timersRef.current = [];
    el.innerHTML = "";
    el.style.gridTemplateColumns = `repeat(${size},1fr)`;
    el.style.gridTemplateRows    = `repeat(${size},1fr)`;
    const cells = [];

    for (let i = 0; i < size * size; i++) {
      const d = document.createElement("div");
      d.style.cssText = `background-color:${rnd()};opacity:${rndA()};transition:background-color 1.6s ease,opacity 1.6s ease;border-radius:1px;`;
      el.appendChild(d);
      cells.push(d);
    }
    for (let i = 0; i < size * size; i++) {
      const t = setTimeout(() => {
        const id = setInterval(() => {
          if (cells[i]) { cells[i].style.backgroundColor = rnd();
cells[i].style.opacity = rndA(); }
        }, 1000 + Math.random() * 2000);
        timersRef.current.push(id);
      }, Math.random() * 2000);
      timersRef.current.push(t);
    }
    return () => { timersRef.current.forEach(id => { clearInterval(id); clearTimeout(id); }); };
  }, [size]);

  return (
    <div ref={containerRef} style={{ display:"grid", width:"36px",
height:"36px", gap:"1px", backgroundColor:"#1a1a2e",
borderRadius:"4px", overflow:"hidden", flexShrink:0 }} />
  );
}
