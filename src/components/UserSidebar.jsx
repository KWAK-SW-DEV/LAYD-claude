export default function UserSidebar({ open, onClose, user }) {
  return (
    <>
      <div onClick={onClose} style={{
        position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.4)",
        opacity:open?1:0,pointerEvents:open?"auto":"none",transition:"opacity 0.3s"
      }}/>
      <div style={{
        position:"fixed",top:0,right:0,bottom:0,width:"280px",zIndex:201,background:"#ffffff",borderLeft:"1px solid #e5e7eb",transform:open?"translateX(0)":"translateX(100%)",transition:"transform 0.35s cubic-bezier(0.4,0,0.2,1)",display:"flex",flexDirection:"column",padding:"28px 22px",boxShadow:"-8px 0 32px rgba(0,0,0,0.1)"
      }}>
        <button onClick={onClose} style={{ alignSelf:"flex-end",background:"none",border:"none",color:"#6b7280",fontSize:"20px",cursor:"pointer",marginBottom:"24px",lineHeight:1 }}>×</button>
        <div style={{ textAlign:"center",marginBottom:"22px" }}>
          <div style={{
            width:"72px",height:"72px",borderRadius:"50%",background:"linear-gradient(135deg,#0e7490,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"26px",color:"#fff",fontWeight:700,margin:"0 auto 10px"
          }}>{user.name[0]}</div>
          <p style={{ color:"#111827",fontWeight:700,fontSize:"15px",margin:0 }}>{user.name}</p>
          <p style={{ color:"#6b7280",fontSize:"12px",margin:"3px 0 0" }}>{user.role}</p>
        </div>
        <div style={{ borderTop:"1px solid #f3f4f6",paddingTop:"18px",marginBottom:"18px" }}>
          {[["Email",user.email],["Role",user.role]].map(([l,v])=>(
            <div key={l} style={{ marginBottom:"12px" }}>
              <p style={{ color:"#9ca3af",fontSize:"10px",letterSpacing:"2px",textTransform:"uppercase",margin:"0 0 2px" }}>{l}</p>
              <p style={{ color:"#111827",fontSize:"13px",margin:0 }}>{v}</p>
            </div>
          ))}
        </div>
        <button disabled style={{
          marginTop:"auto",background:"#f3f4f6",border:"1px solid #e5e7eb",borderRadius:"8px",color:"#9ca3af",padding:"11px",fontWeight:600,fontSize:"13px",cursor:"not-allowed",letterSpacing:"1px"
        }}>
          Edit Profile (Coming Soon)
        </button>
      </div>
    </>
  );
}
