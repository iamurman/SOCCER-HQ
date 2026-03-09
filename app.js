function App() {
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState("");
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("soccerhq_session");
      if (saved) {
        const { id, uname } = JSON.parse(saved);
        if (id && uname) { setUserId(id); setUsername(uname); }
      }
    } catch(e) {}
    setAuthChecked(true);
  }, []);

  const handleLogin = (id, u) => {
    setUserId(id); setUsername(u);
    try { localStorage.setItem("soccerhq_session", JSON.stringify({ id, uname: u })); } catch(e) {}
  };

  const handleLogout = () => {
    setUserId(null); setUsername(""); setPage("dashboard");
    try { localStorage.removeItem("soccerhq_session"); } catch(e) {}
  };

  if (!authChecked) return <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ color: "var(--cyan)", fontSize: 10, letterSpacing: 0.3 }}>LOADING...</div></div>;

  if (!userId) return <AuthScreen onLogin={handleLogin} />;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>

      {/* ── DESKTOP SIDEBAR ── */}
      <div className="desktop-sidebar" style={{
        width: sidebarOpen ? "var(--sidebar-w)" : "var(--sidebar-collapsed)",
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        flexShrink: 0,
        transition: "width 0.2s cubic-bezier(0.4,0,0.2,1)",
        overflow: "hidden",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        height: "100vh",
      }}>
        {/* Logo */}
        <div style={{ padding: sidebarOpen ? "20px 16px 16px" : "20px 14px 16px", borderBottom: "1px solid var(--border)" }}>
          <div onClick={() => setSidebarOpen(!sidebarOpen)} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
            <img src="data:image/png;base64,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" style={{ width: 28, height: 28, borderRadius: 6, flexShrink: 0, objectFit: "cover" }}/>
            {sidebarOpen && <span style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 800, color: "var(--text)", whiteSpace: "nowrap", letterSpacing: -0.3 }}>Soccer HQ</span>}
          </div>
        </div>

        {/* Nav items */}
        <div style={{ flex: 1, padding: "10px 8px", overflowY: "auto" }}>
          {navItems.map(item => {
            const isActive = page === item.id;
            return (
              <div key={item.id} onClick={() => setPage(item.id)} style={{
                padding: sidebarOpen ? "9px 10px" : "9px 8px",
                margin: "2px 0",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 10,
                borderRadius: 10,
                background: isActive ? "var(--cyan-glow)" : "transparent",
                borderLeft: isActive ? "2px solid var(--cyan)" : "2px solid transparent",
                paddingLeft: isActive ? "8px" : "10px",
                color: isActive ? "var(--cyan)" : "var(--text3)",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "var(--surface2)"; e.currentTarget.style.color = "var(--text2)"; }}}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text3)"; }}}>
                <span style={{ flexShrink: 0, display: "flex", alignItems: "center", opacity: isActive ? 1 : 0.7 }} dangerouslySetInnerHTML={{ __html: NAV_ICONS[item.icon] }}/>
                {sidebarOpen && <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 500, whiteSpace: "nowrap", letterSpacing: -0.1 }}>{item.label}</span>}
                {sidebarOpen && isActive && <div style={{ marginLeft: "auto", width: 5, height: 5, borderRadius: "50%", background: "var(--cyan)", flexShrink: 0 }}/>}
              </div>
            );
          })}
        </div>

        {/* User */}
        {sidebarOpen && (
          <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)", marginBottom: 6, letterSpacing: -0.1 }}>{username}</div>
            <div onClick={handleLogout} style={{ fontSize: 11, color: "var(--text3)", cursor: "pointer", fontWeight: 500, letterSpacing: 0.5 }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--red)"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--text3)"}>SIGN OUT</div>
          </div>
        )}
      </div>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflowX: "hidden" }}>

        {/* Mobile header */}
        <div className="mobile-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src="data:image/png;base64,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" style={{ width: 26, height: 26, borderRadius: 6, objectFit: "cover", flexShrink: 0 }}/>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 800, color: "var(--text)", letterSpacing: 1, textTransform: "uppercase" }}>Soccer <span style={{ color: "var(--cyan)" }}>HQ</span></span>
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text3)" }}>{username}</div>
        </div>

        {/* Page content */}
        <div className="main-content" style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", background: "var(--bg)" }}>
          {page === "dashboard" && <Dashboard userId={userId} setPage={setPage} />}
          {page === "training" && <TrainingPlan />}
          {page === "bible" && <SoccerBible />}
          {page === "journal" && <MatchJournal userId={userId} />}
          {page === "tracker" && <ProgressLog userId={userId} />}
          {page === "goals" && <GoalsBoard userId={userId} />}
          {page === "weakfoot" && <WeakFoot userId={userId} />}
          {page === "vidnotes" && <VideoNotes userId={userId} />}
          {page === "skills" && <SkillsCenter userId={userId} />}
          {page === "shots" && <ShotCounter userId={userId} />}
        </div>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <div className="bottom-nav">
        {navItems.map(item => {
          const isActive = page === item.id;
          return (
            <div key={item.id} onClick={() => setPage(item.id)}
              className={"bottom-nav-item" + (isActive ? " active" : "")}>
              <div className="bottom-nav-icon-wrap">
                <div className="bottom-nav-icon" dangerouslySetInnerHTML={{ __html: NAV_ICONS[item.icon] }}/>
              </div>
              <span className="bottom-nav-label">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));