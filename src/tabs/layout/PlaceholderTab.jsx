//
// ─────────────────────────────────────────────────────────────────────────────
// 공통 Placeholder 컴포넌트 — 각 파일에서 re-export
// ─────────────────────────────────────────────────────────────────────────────

function PlaceholderTab({ label }) {
  return (
    <div style={{
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      minHeight:"320px", gap:"12px",
      color:"rgba(255,255,255,0.2)",
    }}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
        stroke="rgba(255,255,255,0.15)" strokeWidth="1.2"
        strokeLinecap="round">
        <rect x="3" y="3" width="18" height="18" rx="3"/>
        <line x1="9" y1="12" x2="15" y2="12"/>
        <line x1="12" y1="9" x2="12" y2="15"/>
      </svg>
      <p style={{ fontSize:"13px", letterSpacing:"1px", margin:0 }}
      >{label} — Coming Soon</p>
      <p style={{ fontSize:"11px", color:"rgba(255,255,255,0.12)", margin:0 }}>
        This section has not been configured yet.
      </p>
    </div>
  );
}

export default PlaceholderTab;
