function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inputStyle = { width: "100%", background: "var(--surface)", border: "1px solid var(--border)", padding: "12px 14px", color: "var(--text)", fontFamily: "'DM Mono', monospace", fontSize: 13, outline: "none", marginBottom: 12 };

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) { setError("Fill in both fields."); return; }
    setLoading(true); setError("");
    const hash = await hashPassword(password);
    if (mode === "register") {
      const { error: err } = await sb.from("users").insert([{ username: username.trim().toLowerCase(), password_hash: hash }]);
      if (err) { setError(err.code === "23505" ? "Username already taken." : "Error creating account."); setLoading(false); return; }
      const { data } = await sb.from("users").select("id").eq("username", username.trim().toLowerCase()).single();
      await sb.from("goals").insert([
        { user_id: data.id, text: "Win the TSA League", category: "short", done: false },
        { user_id: data.id, text: "Comfortable with both feet", category: "short", done: false },
        { user_id: data.id, text: "Play in a semi-pro league", category: "medium", done: false },
        { user_id: data.id, text: "Become the most dangerous midfielder in every game I play", category: "long", done: false },
      ]);
      await sb.from("juggling_record").insert([{ user_id: data.id, record: 0 }]);
      onLogin(data.id, username.trim().toLowerCase());
    } else {
      const { data, error: err } = await sb.from("users").select("id, password_hash").eq("username", username.trim().toLowerCase()).single();
      if (err || !data) { setError("Username not found."); setLoading(false); return; }
      if (data.password_hash !== hash) { setError("Wrong password."); setLoading(false); return; }
      onLogin(data.id, username.trim().toLowerCase());
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ marginBottom: 40, textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⚽</div>
          <div style={{ fontSize: 10, letterSpacing: 0.5, color: "var(--text3)", marginBottom: 6 }}>PERSONAL HQ</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "var(--text)" }}>SOCCER <span style={{ color: "var(--cyan)" }}>HQ</span></div>
          <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 8 }}>The flame is lit. Guard it.</div>
        </div>
        <div style={{ display: "flex", marginBottom: 24, borderBottom: "1px solid var(--border)" }}>
          {["login", "register"].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(""); }} style={{ flex: 1, padding: "10px", background: "transparent", border: "none", borderBottom: mode === m ? "2px solid #33EEFF" : "2px solid transparent", color: mode === m ? "var(--cyan)" : "var(--text3)", cursor: "pointer", fontSize: 10, letterSpacing: 0.3, fontFamily: "'DM Mono', monospace", textTransform: "uppercase", marginBottom: -1 }}>{m}</button>
          ))}
        </div>
        <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} style={inputStyle} />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} style={inputStyle} />
        {error && <div style={{ fontSize: 11, color: "var(--red)", marginBottom: 12 }}>{error}</div>}
        <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", background: loading ? "var(--surface)" : "var(--cyan)", color: loading ? "var(--text3)" : "#000", border: "none", padding: "12px", fontSize: 11, letterSpacing: 0.3, cursor: loading ? "default" : "pointer", fontFamily: "'DM Mono', monospace" }}>
          {loading ? "..." : mode === "login" ? "ENTER" : "CREATE ACCOUNT"}
        </button>
      </div>
    </div>
  );
}


const SKILL_CATEGORIES = {
  fundamentals: {
    label: "Fundamentals", color: "var(--cyan)",
    skills: [
      "Passing — Short", "Passing — Long", "Passing — Through Ball",
      "First Touch — Inside", "First Touch — Outside", "First Touch — Chest",
      "Shooting — Driven", "Shooting — Curl", "Shooting — Knuckleball",
      "Dribbling — Close Control", "Dribbling — Speed",
      "Defending — 1v1", "Defending — Positioning",
      "Heading", "Crossing", "Pressing",
    ]
  },
  leftfoot: {
    label: "Left Foot", color: "var(--cyan)",
    skills: [
      "Left Foot — Pass", "Left Foot — Shot", "Left Foot — First Touch",
      "Left Foot — Dribbling", "Left Foot — Cross", "Left Foot — Curl",
    ]
  },
  physical: {
    label: "Physical", color: "var(--gold)",
    skills: [
      "Sprint Speed", "Explosive First Step", "Stamina", "Strength",
      "Agility", "Balance", "Jumping",
    ]
  },
  tactical: {
    label: "Tactical IQ", color: "#FF8C00",
    skills: [
      "Scanning / Awareness", "Positioning Between Lines", "Transition Reading",
      "Space Creation", "Pressing Triggers", "Tempo Control",
      "Third Man Runs", "Overload Recognition",
    ]
  },
  flair: {
    label: "Flair & Advanced", color: "var(--red)",
    skills: [
      "Rabona", "Nutmeg", "Rainbow Flick", "Elastico",
      "Roulette (Zidane Turn)", "Cruyff Turn", "Step-Over",
      "Outside of Foot Pass (Trivela)", "Bicycle Kick",
      "No-Look Pass", "Heel Pass", "Chip Shot",
      "Scorpion Kick", "Juggling — Both Feet", "Juggling — Headers",
    ]
  },
  setpieces: {
    label: "Set Pieces", color: "#B87FFF",
    skills: [
      "Free Kick — Direct", "Free Kick — Curl", "Free Kick — Knuckleball",
      "Corner Kick — Inswing", "Corner Kick — Outswing",
      "Penalty", "Throw-In (Long)",
    ]
  },
};

const RATING_LABELS = ["—", "Beginner", "Learning", "Developing", "Competent", "Sharp", "Elite"];
const RATING_COLORS = ["var(--text3)", "var(--red)", "#FF8C00", "var(--gold)", "var(--cyan)", "var(--cyan)", "var(--text)"];

function RingChart({ value, max, size, color, label, sublabel, onClick }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const dash = pct * circ;
  return (
    <div onClick={onClick} style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: onClick ? "pointer" : "default" }}>
      <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--surface3)" strokeWidth="7"/>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="7"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            style={{ transition: "stroke-dasharray 1s cubic-bezier(0.4,0,0.2,1)", filter: `drop-shadow(0 0 8px ${color}66)` }}/>
        </svg>
        <div style={{ position: "relative", textAlign: "center", zIndex: 1 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: size > 100 ? 17 : 14, fontWeight: 800, color, lineHeight: 1 }}>{label}</div>
          {sublabel && <div style={{ fontSize: 9, color: "var(--text3)", marginTop: 3, fontWeight: 500 }}>{sublabel}</div>}
        </div>
      </div>
      {onClick && <div style={{ fontSize: 9, color: "var(--text3)", marginTop: 4, letterSpacing: 1, fontWeight: 600 }}>TAP</div>}
    </div>
  );
}

function RadarChart({ categories, size }) {
  const cx = size / 2, cy = size / 2;
  const r = size * 0.36;
  const n = categories.length;
  const angles = categories.map((_, i) => (i / n) * 2 * Math.PI - Math.PI / 2);
  const getPoint = (angle, radius) => ({ x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) });
  const dataPoints = categories.map((cat, i) => getPoint(angles[i], (cat.value / 6) * r));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <radialGradient id="rf" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0.03"/>
        </radialGradient>
      </defs>
      {[1,2,3,4,5,6].map(level => {
        const pts = angles.map(a => getPoint(a, (level/6)*r));
        const path = pts.map((p,i) => `${i===0?"M":"L"} ${p.x} ${p.y}`).join(" ") + " Z";
        return <path key={level} d={path} fill="none" stroke="var(--border)" strokeWidth="1"/>;
      })}
      {angles.map((angle, i) => { const outer = getPoint(angle, r); return <line key={i} x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke="var(--border)" strokeWidth="1"/>; })}
      <path d={dataPath} fill="url(#rf)" stroke="var(--cyan)" strokeWidth="2" style={{ filter: "drop-shadow(0 0 6px rgba(0,229,255,0.4))" }}/>
      {dataPoints.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="var(--cyan)" style={{ filter: "drop-shadow(0 0 4px var(--cyan))" }}/>)}
      {categories.map((cat, i) => {
        const labelPt = getPoint(angles[i], r * 1.25);
        return <text key={i} x={labelPt.x} y={labelPt.y} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="var(--text2)" fontFamily="var(--font-body)" fontWeight="600">{cat.label.toUpperCase()}</text>;
      })}
    </svg>
  );
}

function Dashboard({ userId, setPage }) {
  const [stats, setStats] = useState({ sessions: 0, juggling: 0, goals: "0/0", weakFoot: 0 });
  const [recentLog, setRecentLog] = useState(null);
  const [skillAvg, setSkillAvg] = useState(0);
  const [categoryAvgs, setCategoryAvgs] = useState([]);
  const [shootingStats, setShootingStats] = useState({ right: 0, rightTotal: 0, left: 0, leftTotal: 0 });
  const [showRadar, setShowRadar] = useState(false);

  useEffect(() => {
    async function load() {
      const [logs, goals, weakFoot, jugRec, skillData, shotData, recent] = await Promise.all([
        cached(`logs_${userId}`, () => sb.from("progress_logs").select("id").eq("user_id", userId)),
        cached(`goals_${userId}`, () => sb.from("goals").select("done").eq("user_id", userId)),
        cached(`weakfoot_${userId}`, () => sb.from("weak_foot_log").select("id").eq("user_id", userId)),
        cached(`jugrec_${userId}`, () => sb.from("juggling_record").select("record").eq("user_id", userId).single()),
        cached(`skills_${userId}`, () => sb.from("skills").select("*").eq("user_id", userId)),
        cached(`shots_${userId}`, () => sb.from("shot_logs").select("*").eq("user_id", userId)),
        cached(`recent_log_${userId}`, () => sb.from("progress_logs").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).single()),
      ]);
      const done = (goals.data||[]).filter(g=>g.done).length;
      setStats({ sessions:(logs.data||[]).length, juggling:jugRec.data?.record||0, goals:`${done}/${(goals.data||[]).length}`, weakFoot:(weakFoot.data||[]).length });
      if (recent.data) setRecentLog(recent.data);
      const skillMap = {};
      (skillData.data||[]).forEach(s => { if (s.rating>0) skillMap[s.skill_name]=s.rating; });
      const catAvgs = Object.entries(SKILL_CATEGORIES).map(([id,{label,skills}]) => {
        const rated = skills.filter(s=>skillMap[s]).map(s=>skillMap[s]);
        return { id, label:label.split(" ")[0], value:rated.length>0?rated.reduce((a,b)=>a+b,0)/rated.length:0 };
      });
      setCategoryAvgs(catAvgs);
      const allRated = Object.values(skillMap);
      setSkillAvg(allRated.length>0?allRated.reduce((a,b)=>a+b,0)/allRated.length:0);
      const shots = shotData.data||[];
      const r = shots.filter(s=>s.foot==="Right"), l = shots.filter(s=>s.foot==="Left");
      const rm=r.reduce((a,s)=>a+s.makes,0),rt=r.reduce((a,s)=>a+s.total,0);
      const lm=l.reduce((a,s)=>a+s.makes,0),lt=l.reduce((a,s)=>a+s.total,0);
      setShootingStats({ right:rt>0?rm/rt:0,rightTotal:rt,left:lt>0?lm/lt:0,leftTotal:lt });
    }
    load();
  }, [userId]);

  const ringSize = 112;

  return (
    <div style={{ padding: "28px 28px 40px" }} className="page-padding">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div className="page-eyebrow">Overview</div>
        <div className="page-title">Your <span>Dashboard</span></div>
      </div>

      {/* Rings */}
      <div style={{ display: "flex", gap: 20, marginBottom: 28, flexWrap: "wrap", alignItems: "flex-start" }}>
        {/* Skills ring */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text3)", letterSpacing: 2 }}>SKILLS</div>
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: ringSize, height: ringSize }}>
            <RingChart value={skillAvg} max={6} size={ringSize} color="var(--cyan)"
              label={skillAvg>0?`${Math.round((skillAvg/6)*100)}%`:"—"}
              sublabel={skillAvg>0?`${skillAvg.toFixed(1)}/6`:"no data"}
              onClick={() => setShowRadar(true)}/>
          </div>
        </div>
        {/* Shooting rings */}
        <div style={{ display: "flex", gap: 14 }}>
          {[
            { label: "RIGHT FOOT", value: shootingStats.right, total: shootingStats.rightTotal, color: "var(--cyan)" },
            { label: "LEFT FOOT", value: shootingStats.left, total: shootingStats.leftTotal, color: "var(--cyan)" },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text3)", letterSpacing: 2 }}>{s.label}</div>
              <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 96, height: 96 }}>
                <RingChart value={s.value} max={1} size={96} color={s.color}
                  label={s.total>0?`${Math.round(s.value*100)}%`:"—"}
                  sublabel={s.total>0?`${s.total} shots`:"no data"}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Radar modal */}
      {showRadar && categoryAvgs.length > 0 && (
        <div onClick={() => setShowRadar(false)} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:"var(--surface)",border:"1px solid var(--border2)",borderRadius:20,padding:28,maxWidth:360,width:"100%" }}>
            <div style={{ fontFamily:"var(--font-display)",fontSize:18,fontWeight:800,marginBottom:4 }}>Skill Radar</div>
            <div style={{ fontSize:12,color:"var(--text3)",marginBottom:20 }}>Average rating by category</div>
            <RadarChart categories={categoryAvgs} size={280}/>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:20 }}>
              {categoryAvgs.map(cat => (
                <div key={cat.id} style={{ display:"flex",justifyContent:"space-between",padding:"8px 12px",background:"var(--surface2)",borderRadius:8 }}>
                  <span style={{ fontSize:11,color:"var(--text2)",fontWeight:500 }}>{cat.label}</span>
                  <span style={{ fontSize:11,color:"var(--cyan)",fontWeight:700 }}>{cat.value>0?cat.value.toFixed(1):"—"}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize:11,color:"var(--text3)",textAlign:"center",marginTop:16 }}>Tap outside to close</div>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid-stats" style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:24 }}>
        {[
          { label:"Sessions", value:stats.sessions, color:"var(--cyan)" },
          { label:"Juggling PB", value:stats.juggling, color:"var(--cyan)" },
          { label:"Goals", value:stats.goals, color:"var(--gold)" },
          { label:"Weak Foot", value:stats.weakFoot, color:"#B06EFF" },
        ].map((s,i) => (
          <div key={i} className="stat-card" style={{ borderTop:`2px solid ${s.color}` }}>
            <div className="stat-value" style={{ color:s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Last session */}
      {recentLog && (
        <div className="card" style={{ padding:"16px",marginBottom:20 }}>
          <div style={{ fontSize:10,fontWeight:600,letterSpacing:2,color:"var(--text3)",marginBottom:10 }}>LAST SESSION</div>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <div>
              <div style={{ fontSize:14,fontWeight:600,color:"var(--text)",marginBottom:3 }}>{recentLog.type} · {recentLog.duration}</div>
              <div style={{ fontSize:12,color:"var(--text3)" }}>{recentLog.date}</div>
            </div>
            <div style={{ display:"flex",gap:4 }}>
              {[1,2,3,4,5].map(i => (
                <div key={i} style={{ width:7,height:7,borderRadius:"50%",background:i<=parseInt(recentLog.felt)?"var(--cyan)":"var(--surface3)" }}/>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick nav */}
      <div style={{ fontSize:10,fontWeight:600,letterSpacing:2,color:"var(--text3)",marginBottom:12 }}>QUICK NAV</div>
      <div className="quick-nav" style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8 }}>
        {navItems.filter(n=>n.id!=="dashboard").map(item => (
          <div key={item.id} onClick={() => setPage(item.id)} className="card" style={{ padding:"14px 10px",cursor:"pointer",textAlign:"center",transition:"all 0.15s" }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor="var(--green-border)"; e.currentTarget.style.background="var(--green-glow)"; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.background="var(--surface)"; }}>
            <div style={{ display:"flex",justifyContent:"center",marginBottom:6,opacity:0.7 }} dangerouslySetInnerHTML={{ __html: NAV_ICONS[item.icon] }}/>
            <div style={{ fontSize:10,fontWeight:600,color:"var(--text2)" }}>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrainingPlan() {
  const [activePhase, setActivePhase] = useState(0);
  const [activeTab, setActiveTab] = useState("field");
  const phase = phases[activePhase];
  const dailyRoom = ["100 inside foot touches — left foot", "100 inside foot touches — right foot", "50 outside foot rolls — each foot", "Ball juggling — max reps, log your record", "5 min visualization before sleep"];
  return (
    <div className="page-padding" style={{ padding: "32px" }}>
      <div className="page-eyebrow">TSA Domination Protocol</div>
      <div className="page-title" style={{ marginBottom: 24 }}>10-Week <span>Training Plan</span></div>
      <div className="phase-tabs" style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: 24, overflowX: "auto" }}>
        {phases.map((p, i) => (
          <button key={i} onClick={() => { setActivePhase(i); setActiveTab("field"); }} style={{ padding: "12px 16px", background: "transparent", border: "none", borderBottom: activePhase === i ? `2px solid ${p.color}` : "2px solid transparent", color: activePhase === i ? p.color : "var(--text3)", cursor: "pointer", fontSize: 10, letterSpacing: 0.2, fontFamily: 'var(--font-body)', whiteSpace: "nowrap", marginBottom: -1 }}>
            {p.title}<br /><span style={{ fontSize: 9, opacity: 0.7 }}>{p.weeks}</span>
          </button>
        ))}
      </div>
      <div style={{ padding: "16px 18px", borderLeft: `3px solid ${phase.color}`, background: `${phase.color}08`, marginBottom: 20, borderRadius: "0 10px 10px 0" }}>
        <div style={{ fontSize: 10, letterSpacing: 0.3, color: phase.color, marginBottom: 6 }}>{phase.subtitle.toUpperCase()}</div>
        <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>{phase.focus}</div>
      </div>
      <div style={{ display: "flex", marginBottom: 20, borderBottom: "1px solid var(--border)" }}>
        {["field", "gym", "mental"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "10px 20px", background: "transparent", border: "none", borderBottom: activeTab === tab ? `1px solid ${phase.color}` : "1px solid transparent", color: activeTab === tab ? phase.color : "var(--text3)", cursor: "pointer", fontSize: 11, letterSpacing: 0.3, fontFamily: 'var(--font-body)', textTransform: "uppercase", marginBottom: -1 }}>{tab}</button>
        ))}
      </div>
      {activeTab === "field" && <div>
        {phase.field.map((item, i) => (
          <div key={i} style={{ marginBottom: 12, padding: "16px", background: "var(--surface)", borderLeft: `3px solid ${phase.color}` }}>
            <div style={{ fontSize: 12, color: phase.color, marginBottom: 6 }}>{item.name}</div>
            <div style={{ fontSize: 13, color: "#777", lineHeight: 1.7 }}>{item.details}</div>
          </div>
        ))}
        <div style={{ marginTop: 24, borderTop: "1px solid var(--border)", paddingTop: 20 }}>
          <div style={{ fontSize: 10, letterSpacing: 0.3, color: "var(--text3)", marginBottom: 12 }}>EVERY NIGHT — INDOOR BALL</div>
          {dailyRoom.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid #0d0d0d" }}>
              <div style={{ width: 6, height: 6, background: phase.color, flexShrink: 0 }} />
              <div style={{ fontSize: 12, color: "var(--text2)" }}>{item}</div>
            </div>
          ))}
        </div>
      </div>}
      {activeTab === "gym" && <div>
        {phase.gym.map((block, i) => (
          <div key={i} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, letterSpacing: 0.3, color: "var(--text3)", marginBottom: 10 }}>{block.day}</div>
            {block.sessions.map((s, j) => (
              <div key={j} style={{ marginBottom: 10, padding: "16px", background: "var(--surface)", borderLeft: `3px solid ${phase.color}` }}>
                <div style={{ fontSize: 12, color: phase.color, marginBottom: 6 }}>{s.name}</div>
                <div style={{ fontSize: 13, color: "#777", lineHeight: 1.7 }}>{s.details}</div>
              </div>
            ))}
          </div>
        ))}
      </div>}
      {activeTab === "mental" && <div style={{ padding: "20px", background: "var(--surface)", borderLeft: `3px solid ${phase.color}`, fontSize: 13, color: "#777", lineHeight: 1.8 }}>{phase.mental}</div>}
    </div>
  );
}

function SoccerBible() {
  const [activeChapter, setActiveChapter] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const [search, setSearch] = useState("");
  // mobile: "chapters" | "sections" | "article"
  const [mobileView, setMobileView] = useState("chapters");

  const chapter = bibleChapters[activeChapter];
  const section = chapter ? chapter.sections[activeSection] : null;

  const filteredSections = search.trim() ? (() => {
    const results = [];
    bibleChapters.forEach((ch, ci) => ch.sections.forEach((sec, si) => {
      if (sec.title.toLowerCase().includes(search.toLowerCase()) ||
          sec.content.toLowerCase().includes(search.toLowerCase()))
        results.push({ ci, si, chTitle: ch.title, secTitle: sec.title });
    }));
    return results;
  })() : [];

  const goToChapter = (ci) => {
    setActiveChapter(ci); setActiveSection(0); setSearch(""); setMobileView("sections");
  };
  const goToSection = (si) => {
    setActiveSection(si); setMobileView("article");
  };
  const goBack = (view) => { setMobileView(view); };

  // ── Shared search bar ──
  const SearchBar = () => (
    <div style={{ position:"relative" }}>
      <svg style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)",
        opacity:0.4, pointerEvents:"none" }} width="14" height="14" viewBox="0 0 24 24"
        fill="none" stroke="var(--text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input className="input" value={search}
        onChange={e => { setSearch(e.target.value); if (e.target.value) setMobileView("chapters"); }}
        placeholder="Search concepts..." style={{ paddingLeft:36 }}/>
    </div>
  );

  // ── Article body (shared between desktop + mobile) ──
  const ArticleBody = () => section ? (
    <div style={{ padding:"24px 20px 60px" }}>
      <div style={{ fontSize:10, fontWeight:600, letterSpacing:2, color:"var(--cyan)", marginBottom:8 }}>
        {chapter.title.toUpperCase()}
      </div>
      <h2 style={{ fontFamily:"var(--font-display)", fontSize:22, fontWeight:800,
        marginBottom:20, lineHeight:1.25, color:"var(--text)" }}>{section.title}</h2>
      <div style={{ fontSize:14, color:"var(--text2)", lineHeight:1.85, whiteSpace:"pre-wrap" }}>
        {section.content}
      </div>
    </div>
  ) : null;

  // ── Search results (shared) ──
  const SearchResults = ({ onPick }) => (
    <div style={{ padding:"16px 20px 60px" }}>
      <div style={{ fontSize:11, color:"var(--text3)", marginBottom:14, fontWeight:600 }}>
        {filteredSections.length} result{filteredSections.length!==1?"s":""} for "{search}"
      </div>
      {filteredSections.length === 0
        ? <div style={{ textAlign:"center", padding:"40px 0", color:"var(--text3)", fontSize:13 }}>Nothing found.</div>
        : filteredSections.map((r, i) => (
          <div key={i} className="list-item"
            onClick={() => onPick(r.ci, r.si)}
            style={{ marginBottom:8 }}>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:3 }}>{r.secTitle}</div>
            <div style={{ fontSize:11, color:"var(--text3)" }}>{r.chTitle}</div>
          </div>
        ))
      }
    </div>
  );

  return (
    <div>
      {/* ── Page header (always shown) ── */}
      <div style={{ padding:"20px 20px 14px", borderBottom:"1px solid var(--border)" }}>
        <div style={{ fontSize:10, fontWeight:600, letterSpacing:2, color:"var(--text3)", marginBottom:6 }}>KNOWLEDGE BASE</div>
        <div style={{ fontFamily:"var(--font-display)", fontSize:22, fontWeight:800, marginBottom:14 }}>
          The Soccer <span style={{ color:"var(--cyan)" }}>Bible</span>
        </div>
        <SearchBar />
      </div>

      {/* ══════════════════════════════════════════════
          DESKTOP LAYOUT
          A fixed-height split pane: sidebar | content
          Both scroll independently
      ══════════════════════════════════════════════ */}
      <div className="bible-desktop" style={{
        display:"flex", height:"calc(100vh - 220px)", overflow:"hidden"
      }}>
        {/* Chapter sidebar */}
        <div style={{
          width:180, borderRight:"1px solid var(--border)",
          overflowY:"auto", flexShrink:0, padding:"8px 6px"
        }}>
          {bibleChapters.map((ch, ci) => (
            <div key={ci} onClick={() => { setActiveChapter(ci); setActiveSection(0); setSearch(""); }}
              style={{
                padding:"9px 10px", borderRadius:8, cursor:"pointer", marginBottom:2,
                display:"flex", alignItems:"center", gap:8, transition:"all 0.15s",
                background:activeChapter===ci?"var(--green-glow)":"transparent",
                borderLeft:activeChapter===ci?"2px solid var(--cyan)":"2px solid transparent",
              }}>
              <span style={{ fontSize:16, flexShrink:0 }}>{ch.icon}</span>
              <span style={{
                fontSize:12, fontWeight:activeChapter===ci?600:500,
                color:activeChapter===ci?"var(--cyan)":"var(--text2)",
                whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"
              }}>{ch.title}</span>
            </div>
          ))}
        </div>

        {/* Content pane */}
        <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", minWidth:0 }}>
          {search.trim() ? (
            <SearchResults onPick={(ci,si) => { setActiveChapter(ci); setActiveSection(si); setSearch(""); }}/>
          ) : (
            <>
              {/* Section tabs — horizontal scroll */}
              <div className="tab-bar" style={{ padding:"0 16px", flexShrink:0 }}>
                {chapter && chapter.sections.map((sec, si) => (
                  <button key={si} onClick={() => setActiveSection(si)}
                    className={"tab-btn"+(activeSection===si?" active":"")}>
                    {sec.title}
                  </button>
                ))}
              </div>
              <ArticleBody />
            </>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          MOBILE LAYOUT
          Simple full-width stacked navigation
          No internal height tricks — just normal DOM flow
          The outer main-content div handles scrolling
      ══════════════════════════════════════════════ */}
      <div className="bible-mobile">

        {/* SEARCH RESULTS (shown when search has text) */}
        {search.trim() && (
          <SearchResults onPick={(ci,si) => {
            setActiveChapter(ci); setActiveSection(si); setSearch(""); setMobileView("article");
          }}/>
        )}

        {/* CHAPTER LIST */}
        {!search.trim() && mobileView === "chapters" && (
          <div style={{ padding:"12px 12px 80px" }}>
            {bibleChapters.map((ch, ci) => (
              <div key={ci} onClick={() => goToChapter(ci)}
                style={{
                  display:"flex", alignItems:"center", gap:14,
                  padding:"16px 14px", borderRadius:12, marginBottom:8, cursor:"pointer",
                  background:"var(--surface)", border:"1px solid var(--border)",
                }}>
                <span style={{ fontSize:26, flexShrink:0 }}>{ch.icon}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:"var(--text)", marginBottom:2 }}>{ch.title}</div>
                  <div style={{ fontSize:11, color:"var(--text3)" }}>{ch.subtitle}</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            ))}
          </div>
        )}

        {/* SECTION LIST */}
        {!search.trim() && mobileView === "sections" && (
          <div style={{ padding:"0 0 80px" }}>
            {/* breadcrumb */}
            <div style={{
              padding:"10px 16px", borderBottom:"1px solid var(--border)",
              display:"flex", alignItems:"center", gap:8
            }}>
              <button onClick={() => goBack("chapters")} style={{
                background:"none", border:"none", cursor:"pointer",
                color:"var(--text3)", padding:0, fontSize:13,
                display:"flex", alignItems:"center", gap:4, fontFamily:"var(--font-body)"
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                Chapters
              </button>
              <span style={{ color:"var(--border)", fontSize:14 }}>›</span>
              <span style={{ fontSize:13, fontWeight:700, color:"var(--text)" }}>
                {chapter?.icon} {chapter?.title}
              </span>
            </div>
            <div style={{ padding:"10px 12px" }}>
              {chapter && chapter.sections.map((sec, si) => (
                <div key={si} onClick={() => goToSection(si)}
                  style={{
                    padding:"14px 16px", borderRadius:12, marginBottom:8, cursor:"pointer",
                    background:"var(--surface)", border:"1px solid var(--border)",
                  }}>
                  <div style={{ fontSize:13, fontWeight:600, color:"var(--text)", marginBottom:4 }}>
                    {sec.title}
                  </div>
                  <div style={{
                    fontSize:11, color:"var(--text3)",
                    overflow:"hidden", textOverflow:"ellipsis",
                    display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical"
                  }}>
                    {sec.content.slice(0, 100)}...
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ARTICLE VIEW */}
        {!search.trim() && mobileView === "article" && section && (
          <div style={{ paddingBottom:80 }}>
            {/* breadcrumb */}
            <div style={{
              padding:"10px 16px", borderBottom:"1px solid var(--border)",
              display:"flex", alignItems:"center", gap:8
            }}>
              <button onClick={() => goBack("sections")} style={{
                background:"none", border:"none", cursor:"pointer",
                color:"var(--text3)", padding:0, fontSize:13,
                display:"flex", alignItems:"center", gap:4, fontFamily:"var(--font-body)"
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                {chapter?.title}
              </button>
            </div>
            <ArticleBody />
          </div>
        )}
      </div>
    </div>
  );
}

function MatchJournal({ userId }) {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ date: "", opponent: "", result: "", well: "", exposed: "", next: "" });
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => { sb.from("match_journal").select("*").eq("user_id", userId).order("created_at", { ascending: false }).then(({ data }) => { setEntries(data || []); setLoading(false); }); }, [userId]);
  const addEntry = async () => {
    if (!form.date) return;
    const { data } = await sb.from("match_journal").insert([{ ...form, user_id: userId }]).select().single();
    if (data) { setEntries([data, ...entries]); setForm({ date: "", opponent: "", result: "", well: "", exposed: "", next: "" }); setAdding(false); }
  };
  const deleteEntry = async (id) => { await sb.from("match_journal").delete().eq("id", id); setEntries(entries.filter(e => e.id !== id)); };
  const inputStyle = { background: "var(--surface)", border: "1px solid var(--border)", padding: "8px 10px", color: "var(--text2)", fontFamily: "'DM Mono', monospace", fontSize: 12, outline: "none", width: "100%" };
  const labelStyle = { fontSize: 10, letterSpacing: 0.3, color: "var(--text3)", marginBottom: 4, display: "block" };
  return (
    <div className="page-padding" style={{ padding: "32px" }}>
      <div className="header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div><div style={{ fontSize: 10, letterSpacing: 0.5, color: "var(--text3)", marginBottom: 8 }}>AFTER EVERY GAME</div><div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: "var(--text)" }}>MATCH <span style={{ color: "var(--cyan)" }}>JOURNAL</span></div></div>
        <button onClick={() => setAdding(!adding)} style={{ background: adding ? "var(--border)" : "var(--cyan)", color: adding ? "#666" : "#000", border: "none", padding: "10px 16px", fontSize: 11, letterSpacing: 0.2, cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>{adding ? "CANCEL" : "+ LOG MATCH"}</button>
      </div>
      {adding && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "20px", marginBottom: 24 }}>
          <div className="form-3col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            {[["date", "DATE", "date"], ["opponent", "OPPONENT", "text"], ["result", "RESULT", "text"]].map(([key, label, type]) => (
              <div key={key}><label style={labelStyle}>{label}</label><input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} style={inputStyle} /></div>
            ))}
          </div>
          {[["well", "WHAT I DID WELL"], ["exposed", "WHERE I GOT EXPOSED"], ["next", "WORK ON NEXT SESSION"]].map(([key, label]) => (
            <div key={key} style={{ marginBottom: 12 }}><label style={labelStyle}>{label}</label><textarea value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} rows={2} style={{ ...inputStyle, resize: "vertical" }} /></div>
          ))}
          <button onClick={addEntry} style={{ background: "var(--cyan)", color: "#000", border: "none", padding: "10px 20px", fontSize: 11, letterSpacing: 0.2, cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>SAVE</button>
        </div>
      )}
      {loading && <div style={{ fontSize: 12, color: "var(--text3)", padding: "40px 0", textAlign: "center" }}>Loading...</div>}
      {!loading && entries.length === 0 && !adding && <div style={{ fontSize: 12, color: "var(--text3)", padding: "40px 0", textAlign: "center" }}>No matches logged yet.</div>}
      {entries.map(entry => (
        <div key={entry.id} style={{ background: "var(--surface)", borderLeft: "3px solid #33EEFF", padding: "16px", marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <div><span style={{ fontSize: 12, color: "var(--text)" }}>{entry.date}</span>{entry.opponent && <span style={{ fontSize: 12, color: "var(--text2)", marginLeft: 12 }}>vs {entry.opponent}</span>}{entry.result && <span style={{ fontSize: 12, color: "var(--cyan)", marginLeft: 12 }}>{entry.result}</span>}</div>
            <span onClick={() => deleteEntry(entry.id)} style={{ fontSize: 10, color: "var(--text3)", cursor: "pointer" }}>✕</span>
          </div>
          {[["well", "DID WELL"], ["exposed", "GOT EXPOSED"], ["next", "WORK ON NEXT"]].map(([key, label]) => entry[key] && (
            <div key={key} style={{ marginBottom: 8 }}><div style={{ fontSize: 9, letterSpacing: 0.3, color: "var(--text3)", marginBottom: 3 }}>{label}</div><div style={{ fontSize: 12, color: "var(--text2)" }}>{entry[key]}</div></div>
          ))}
        </div>
      ))}
    </div>
  );
}

function ProgressLog({ userId }) {
  const [logs, setLogs] = useState([]);
  const [jugglingRecord, setJugglingRecord] = useState(0);
  const [form, setForm] = useState({ date: new Date().toISOString().split("T")[0], type: "Field", duration: "", juggling: "", notes: "", felt: "3" });
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function load() {
      const [logsRes, jrRes] = await Promise.all([
        sb.from("progress_logs").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        sb.from("juggling_record").select("record").eq("user_id", userId).single(),
      ]);
      setLogs(logsRes.data || []); setJugglingRecord(jrRes.data?.record || 0); setLoading(false);
    }
    load();
  }, [userId]);
  const addLog = async () => {
    if (!form.date) return;
    const jugglingVal = parseInt(form.juggling) || 0;
    if (jugglingVal > jugglingRecord) { await sb.from("juggling_record").update({ record: jugglingVal, updated_at: new Date().toISOString() }).eq("user_id", userId); setJugglingRecord(jugglingVal); }
    const { data } = await sb.from("progress_logs").insert([{ ...form, user_id: userId }]).select().single();
    if (data) { setLogs([data, ...logs]); setForm({ date: new Date().toISOString().split("T")[0], type: "Field", duration: "", juggling: "", notes: "", felt: "3" }); setAdding(false); }
  };
  const deleteLog = async (id) => { await sb.from("progress_logs").delete().eq("id", id); setLogs(logs.filter(l => l.id !== id)); };
  const inputStyle = { background: "var(--bg)", border: "1px solid var(--border)", padding: "8px 10px", color: "var(--text2)", fontFamily: "'DM Mono', monospace", fontSize: 12, outline: "none", width: "100%" };
  const thisWeek = logs.filter(l => { const d = new Date(l.date); const now = new Date(); return (now - d) / (1000 * 60 * 60 * 24) <= 7; }).length;
  return (
    <div className="page-padding" style={{ padding: "32px" }}>
      <div className="header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div><div style={{ fontSize: 10, letterSpacing: 0.5, color: "var(--text3)", marginBottom: 8 }}>EVERY SESSION</div><div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: "var(--text)" }}>PROGRESS <span style={{ color: "var(--cyan)" }}>LOG</span></div></div>
        <button onClick={() => setAdding(!adding)} style={{ background: adding ? "var(--border)" : "var(--cyan)", color: adding ? "#666" : "#000", border: "none", padding: "10px 16px", fontSize: 11, letterSpacing: 0.2, cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>{adding ? "CANCEL" : "+ LOG SESSION"}</button>
      </div>
      <div className="grid-3col" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
        {[{ label: "Total Sessions", value: logs.length, color: "var(--cyan)" }, { label: "Juggling Record", value: jugglingRecord + " touches", color: "var(--cyan)" }, { label: "This Week", value: thisWeek, color: "var(--gold)" }].map((s, i) => (
          <div key={i} style={{ padding: "16px", background: "var(--surface)", borderLeft: `3px solid ${s.color}` }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 4, letterSpacing: 0.2 }}>{s.label.toUpperCase()}</div>
          </div>
        ))}
      </div>
      {adding && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "20px", marginBottom: 24 }}>
          <div className="form-3col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><label style={{ fontSize: 10, letterSpacing: 0.3, color: "var(--text3)", marginBottom: 4, display: "block" }}>DATE</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={inputStyle} /></div>
            <div><label style={{ fontSize: 10, letterSpacing: 0.3, color: "var(--text3)", marginBottom: 4, display: "block" }}>TYPE</label><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }}>{["Field", "Gym", "Conditioning", "Pickup Game", "Indoor/Room"].map(t => <option key={t}>{t}</option>)}</select></div>
            <div><label style={{ fontSize: 10, letterSpacing: 0.3, color: "var(--text3)", marginBottom: 4, display: "block" }}>DURATION (min)</label><input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} style={inputStyle} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><label style={{ fontSize: 10, letterSpacing: 0.3, color: "var(--text3)", marginBottom: 4, display: "block" }}>JUGGLING (touches)</label><input type="number" placeholder={`Record: ${jugglingRecord}`} value={form.juggling} onChange={e => setForm({ ...form, juggling: e.target.value })} style={inputStyle} /></div>
            <div><label style={{ fontSize: 10, letterSpacing: 0.3, color: "var(--text3)", marginBottom: 4, display: "block" }}>FELT (1–5)</label><select value={form.felt} onChange={e => setForm({ ...form, felt: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }}>{["1","2","3","4","5"].map(v => <option key={v}>{v}</option>)}</select></div>
          </div>
          <div style={{ marginBottom: 12 }}><label style={{ fontSize: 10, letterSpacing: 0.3, color: "var(--text3)", marginBottom: 4, display: "block" }}>NOTES</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} style={{ ...inputStyle, resize: "vertical" }} /></div>
          <button onClick={addLog} style={{ background: "var(--cyan)", color: "#000", border: "none", padding: "10px 20px", fontSize: 11, letterSpacing: 0.2, cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>SAVE</button>
        </div>
      )}
      {loading && <div style={{ fontSize: 12, color: "var(--text3)", padding: "40px 0", textAlign: "center" }}>Loading...</div>}
      {logs.map(log => (
        <div key={log.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #0d0d0d" }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ fontSize: 11, color: "var(--text2)", width: 90 }}>{log.date}</div>
            <div style={{ fontSize: 12, color: "var(--cyan)" }}>{log.type}</div>
            {log.duration && <div style={{ fontSize: 11, color: "var(--text3)" }}>{log.duration}min</div>}
            {log.juggling && <div style={{ fontSize: 11, color: "var(--cyan)" }}>⚽ {log.juggling}</div>}
            {log.felt && <div style={{ fontSize: 11, color: "var(--text3)" }}>{"★".repeat(parseInt(log.felt))}</div>}
          </div>
          <span onClick={() => deleteLog(log.id)} style={{ fontSize: 10, color: "#222", cursor: "pointer", flexShrink: 0 }}>✕</span>
        </div>
      ))}
      {!loading && logs.length === 0 && <div style={{ fontSize: 12, color: "var(--text3)", padding: "40px 0", textAlign: "center" }}>No sessions logged yet.</div>}
    </div>
  );
}

function GoalsBoard({ userId }) {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState("");
  const [newCat, setNewCat] = useState("short");
  const [loading, setLoading] = useState(true);
  useEffect(() => { sb.from("goals").select("*").eq("user_id", userId).order("created_at", { ascending: true }).then(({ data }) => { setGoals(data || []); setLoading(false); }); }, [userId]);
  const toggleGoal = async (id, done) => { await sb.from("goals").update({ done: !done }).eq("id", id); setGoals(goals.map(g => g.id === id ? { ...g, done: !done } : g)); };
  const addGoal = async () => {
    if (!newGoal.trim()) return;
    const { data } = await sb.from("goals").insert([{ user_id: userId, text: newGoal, category: newCat, done: false }]).select().single();
    if (data) { setGoals([...goals, data]); setNewGoal(""); }
  };
  const deleteGoal = async (id) => { await sb.from("goals").delete().eq("id", id); setGoals(goals.filter(g => g.id !== id)); };
  const cats = [{ key: "short", label: "SHORT TERM", color: "var(--cyan)", desc: "Next 3 months" }, { key: "medium", label: "MEDIUM TERM", color: "var(--gold)", desc: "Next 1–2 years" }, { key: "long", label: "LONG TERM", color: "var(--red)", desc: "The vision" }];
  return (
    <div className="page-padding" style={{ padding: "32px" }}>
      <div style={{ fontSize: 10, letterSpacing: 0.5, color: "var(--text3)", marginBottom: 8 }}>WRITTEN DOWN. VISIBLE.</div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: "var(--text)", marginBottom: 24 }}>GOALS <span style={{ color: "var(--cyan)" }}>BOARD</span></div>
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <input value={newGoal} onChange={e => setNewGoal(e.target.value)} onKeyDown={e => e.key === "Enter" && addGoal()} placeholder="Add a new goal..." style={{ flex: 1, background: "var(--surface)", border: "1px solid var(--border)", padding: "8px 12px", color: "var(--text2)", fontFamily: "'DM Mono', monospace", fontSize: 12, outline: "none" }} />
        <select value={newCat} onChange={e => setNewCat(e.target.value)} style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "8px 12px", color: "var(--text2)", fontFamily: "'DM Mono', monospace", fontSize: 11, outline: "none", cursor: "pointer" }}>
          {cats.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
        </select>
        <button onClick={addGoal} style={{ background: "var(--cyan)", color: "#000", border: "none", padding: "8px 16px", fontSize: 11, letterSpacing: 0.2, cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>ADD</button>
      </div>
      {loading && <div style={{ fontSize: 12, color: "var(--text3)", padding: "40px 0", textAlign: "center" }}>Loading...</div>}
      <div className="grid-goals" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
        {cats.map(cat => (
          <div key={cat.key} style={{ background: "var(--bg)", border: `1px solid ${cat.color}22` }}>
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${cat.color}22` }}>
              <div style={{ fontSize: 10, letterSpacing: 0.3, color: cat.color }}>{cat.label}</div>
              <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 2 }}>{cat.desc}</div>
            </div>
            <div style={{ padding: "8px" }}>
              {goals.filter(g => g.category === cat.key).map(goal => (
                <div key={goal.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 8px", borderBottom: "1px solid #0d0d0d" }}>
                  <div onClick={() => toggleGoal(goal.id, goal.done)} style={{ width: 14, height: 14, border: `1px solid ${goal.done ? cat.color : "var(--text3)"}`, background: goal.done ? cat.color : "transparent", cursor: "pointer", flexShrink: 0 }} />
                  <div style={{ fontSize: 12, color: goal.done ? "var(--text3)" : "var(--text2)", textDecoration: goal.done ? "line-through" : "none", flex: 1 }}>{goal.text}</div>
                  <span onClick={() => deleteGoal(goal.id)} style={{ fontSize: 10, color: "#222", cursor: "pointer" }}>✕</span>
                </div>
              ))}
              {goals.filter(g => g.category === cat.key).length === 0 && <div style={{ fontSize: 11, color: "#222", padding: "12px 8px" }}>No goals set yet.</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WeakFoot({ userId }) {
  const [log, setLog] = useState([]);
  const [jugglingRecord, setJugglingRecord] = useState(0);
  const [form, setForm] = useState({ date: new Date().toISOString().split("T")[0], drill: "", reps: "", notes: "" });
  const [adding, setAdding] = useState(false);
  const [newJuggling, setNewJuggling] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function load() {
      const [logRes, jrRes] = await Promise.all([
        sb.from("weak_foot_log").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        sb.from("juggling_record").select("record").eq("user_id", userId).single(),
      ]);
      setLog(logRes.data || []); setJugglingRecord(jrRes.data?.record || 0); setLoading(false);
    }
    load();
  }, [userId]);
  const addEntry = async () => {
    if (!form.date) return;
    const { data } = await sb.from("weak_foot_log").insert([{ ...form, user_id: userId }]).select().single();
    if (data) { setLog([data, ...log]); setForm({ date: new Date().toISOString().split("T")[0], drill: "", reps: "", notes: "" }); setAdding(false); }
  };
  const updateRecord = async () => {
    const val = parseInt(newJuggling);
    if (val > jugglingRecord) { await sb.from("juggling_record").update({ record: val, updated_at: new Date().toISOString() }).eq("user_id", userId); setJugglingRecord(val); setNewJuggling(""); }
  };
  const drills = ["Wall passes — weak foot only", "Shooting at target — weak foot", "First touch control — weak foot", "Inside rolls — weak foot", "Juggling — weak foot only", "Dribble course — weak foot"];
  const inputStyle = { background: "var(--bg)", border: "1px solid var(--border)", padding: "8px 10px", color: "var(--text2)", fontFamily: "'DM Mono', monospace", fontSize: 12, outline: "none", width: "100%" };
  return (
    <div className="page-padding" style={{ padding: "32px" }}>
      <div style={{ fontSize: 10, letterSpacing: 0.5, color: "var(--text3)", marginBottom: 8 }}>SEPARATE ATTENTION OR IT GETS NEGLECTED</div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: "var(--text)", marginBottom: 24 }}>WEAK FOOT <span style={{ color: "var(--cyan)" }}>TRACKER</span></div>
      <div className="grid-stats" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div style={{ padding: "20px", background: "var(--surface)", borderLeft: "3px solid #00BFFF" }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: "var(--cyan)" }}>{jugglingRecord}</div>
          <div style={{ fontSize: 10, color: "var(--text3)", letterSpacing: 0.2, marginTop: 4 }}>JUGGLING RECORD</div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <input type="number" placeholder="New record..." value={newJuggling} onChange={e => setNewJuggling(e.target.value)} onKeyDown={e => e.key === "Enter" && updateRecord()} style={{ ...inputStyle, flex: 1 }} />
            <button onClick={updateRecord} style={{ background: "var(--cyan)", color: "#000", border: "none", padding: "8px 12px", fontSize: 10, cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>SET</button>
          </div>
        </div>
        <div style={{ padding: "20px", background: "var(--surface)", borderLeft: "3px solid #444" }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: "var(--text)" }}>{log.length}</div>
          <div style={{ fontSize: 10, color: "var(--text3)", letterSpacing: 0.2, marginTop: 4 }}>WEAK FOOT SESSIONS</div>
          <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 8 }}>Every session is the gap closing.</div>
        </div>
      </div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, letterSpacing: 0.3, color: "var(--text3)", marginBottom: 12 }}>RECOMMENDED DRILLS</div>
        {drills.map((d, i) => <div key={i} style={{ padding: "8px 0", borderBottom: "1px solid #0d0d0d", fontSize: 12, color: "var(--text2)", display: "flex", alignItems: "center", gap: 10 }}><div style={{ width: 4, height: 4, background: "var(--cyan)", flexShrink: 0 }} />{d}</div>)}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: "var(--text3)" }}>Session Log</div>
        <button onClick={() => setAdding(!adding)} style={{ background: adding ? "var(--border)" : "var(--cyan)", color: adding ? "#666" : "#000", border: "none", padding: "8px 14px", fontSize: 10, letterSpacing: 0.2, cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>{adding ? "CANCEL" : "+ LOG SESSION"}</button>
      </div>
      {adding && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "16px", marginBottom: 16 }}>
          <div className="form-3col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><label style={{ fontSize: 10, letterSpacing: 0.3, color: "var(--text3)", marginBottom: 4, display: "block" }}>DATE</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={inputStyle} /></div>
            <div><label style={{ fontSize: 10, letterSpacing: 0.3, color: "var(--text3)", marginBottom: 4, display: "block" }}>DRILL</label>
              <select value={form.drill} onChange={e => setForm({ ...form, drill: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="">Select...</option>
                {drills.map(d => <option key={d}>{d}</option>)}
                <option value="Other">Other</option>
              </select>
            </div>
            <div><label style={{ fontSize: 10, letterSpacing: 0.3, color: "var(--text3)", marginBottom: 4, display: "block" }}>REPS</label><input type="number" value={form.reps} onChange={e => setForm({ ...form, reps: e.target.value })} style={inputStyle} /></div>
          </div>
          <div style={{ marginBottom: 12 }}><label style={{ fontSize: 10, letterSpacing: 0.3, color: "var(--text3)", marginBottom: 4, display: "block" }}>NOTES</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} style={{ ...inputStyle, resize: "vertical" }} /></div>
          <button onClick={addEntry} style={{ background: "var(--cyan)", color: "#000", border: "none", padding: "10px 20px", fontSize: 11, letterSpacing: 0.2, cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>SAVE</button>
        </div>
      )}
      {loading && <div style={{ fontSize: 12, color: "var(--text3)", padding: "20px 0", textAlign: "center" }}>Loading...</div>}
      {log.map(entry => (
        <div key={entry.id} style={{ padding: "10px 0", borderBottom: "1px solid #0d0d0d", display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ fontSize: 11, color: "var(--text3)", width: 90 }}>{entry.date}</div>
          <div style={{ fontSize: 12, color: "var(--cyan)", flex: 1 }}>{entry.drill}</div>
          {entry.reps && <div style={{ fontSize: 11, color: "var(--text2)" }}>{entry.reps} reps</div>}
        </div>
      ))}
    </div>
  );
}

function VideoNotes({ userId }) {
  const [view, setView] = useState("folders"); // folders | videos | player
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [stamps, setStamps] = useState([]);
  const [generalNotes, setGeneralNotes] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [stampNote, setStampNote] = useState("");
  const [showStampInput, setShowStampInput] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [timerSecs, setTimerSecs] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [showNewVideo, setShowNewVideo] = useState(false);
  const [draggingIdx, setDraggingIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renameVal, setRenameVal] = useState("");
  const dragNode = React.useRef(null);
  const playerRef = React.useRef(null);
  const timerRef = React.useRef(null);
  const iframeRef = React.useRef(null);

  useEffect(() => { loadFolders(); }, [userId]);

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setTimerSecs(s => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerRunning]);

  const loadFolders = async () => {
    const { data } = await sb.from("vn_folders").select("*").eq("user_id", userId).order("order_index", { ascending: true }).order("created_at", { ascending: true });
    setFolders(data || []);
    setLoading(false);
  };

  const saveOrder = async (reordered) => {
    // Save order_index to supabase for each folder
    await Promise.all(reordered.map((f, i) =>
      sb.from("vn_folders").update({ order_index: i }).eq("id", f.id)
    ));
  };

  // Desktop drag handlers
  const onDragStart = (e, idx) => {
    setDraggingIdx(idx);
    dragNode.current = e.currentTarget;
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => { if (dragNode.current) dragNode.current.style.opacity = "0.4"; }, 0);
  };
  const onDragEnd = () => {
    if (dragNode.current) dragNode.current.style.opacity = "1";
    setDraggingIdx(null);
    setDragOverIdx(null);
    dragNode.current = null;
  };
  const onDragOver = (e, idx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIdx(idx);
  };
  const onDrop = async (e, idx) => {
    e.preventDefault();
    if (draggingIdx === null || draggingIdx === idx) return;
    const reordered = [...folders];
    const [moved] = reordered.splice(draggingIdx, 1);
    reordered.splice(idx, 0, moved);
    setFolders(reordered);
    setDraggingIdx(null);
    setDragOverIdx(null);
    await saveOrder(reordered);
  };

  // Mobile touch drag handlers
  const touchDragIdx = React.useRef(null);
  const touchStartY = React.useRef(0);
  const touchClone = React.useRef(null);
  const onTouchStart = (e, idx) => {
    touchDragIdx.current = idx;
    touchStartY.current = e.touches[0].clientY;
    const el = e.currentTarget;
    const clone = el.cloneNode(true);
    clone.style.cssText = `position:fixed;left:${el.getBoundingClientRect().left}px;top:${el.getBoundingClientRect().top}px;width:${el.offsetWidth}px;opacity:0.85;zIndex:9999;pointerEvents:none;border:1px solid #33EEFF;`;
    document.body.appendChild(clone);
    touchClone.current = clone;
    el.style.opacity = "0.3";
  };
  const onTouchMove = (e) => {
    e.preventDefault();
    if (!touchClone.current) return;
    const dy = e.touches[0].clientY - touchStartY.current;
    touchClone.current.style.transform = `translateY(${dy}px)`;
    // Find which element we're over
    const touch = e.touches[0];
    const els = document.querySelectorAll(".folder-drag-item");
    els.forEach((el, i) => {
      const rect = el.getBoundingClientRect();
      if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
        setDragOverIdx(i);
      }
    });
  };
  const onTouchEnd = async (e) => {
    if (touchClone.current) { touchClone.current.remove(); touchClone.current = null; }
    const els = document.querySelectorAll(".folder-drag-item");
    els.forEach(el => el.style.opacity = "1");
    const fromIdx = touchDragIdx.current;
    const toIdx = dragOverIdx;
    touchDragIdx.current = null;
    setDragOverIdx(null);
    if (fromIdx !== null && toIdx !== null && fromIdx !== toIdx) {
      const reordered = [...folders];
      const [moved] = reordered.splice(fromIdx, 1);
      reordered.splice(toIdx, 0, moved);
      setFolders(reordered);
      await saveOrder(reordered);
    }
  };

  const startRename = (f) => { setRenamingId(f.id); setRenameVal(f.name); };
  const saveRename = async (id) => {
    if (!renameVal.trim()) return;
    await sb.from("vn_folders").update({ name: renameVal.trim() }).eq("id", id);
    setFolders(prev => prev.map(f => f.id === id ? { ...f, name: renameVal.trim() } : f));
    setRenamingId(null);
  };

  const loadVideos = async (folderId) => {
    const { data } = await sb.from("vn_videos").select("*").eq("folder_id", folderId).order("created_at", { ascending: false });
    setVideos(data || []);
  };

  const loadVideoData = async (video) => {
    const { data } = await sb.from("vn_stamps").select("*").eq("video_id", video.id).order("timestamp_secs", { ascending: true });
    setStamps(data || []);
    setGeneralNotes(video.notes || "");
    setTimerSecs(0);
    setTimerRunning(false);
    setPlayerReady(false);
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    const { data } = await sb.from("vn_folders").insert([{ user_id: userId, name: newFolderName.trim() }]).select().single();
    setFolders(prev => [data, ...prev]);
    setNewFolderName("");
    setShowNewFolder(false);
  };

  const extractYoutubeId = (url) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  const fetchVideoTitle = async (videoId) => {
    try {
      const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      const data = await res.json();
      return data.title || "YouTube Video";
    } catch { return "YouTube Video"; }
  };

  const addVideo = async () => {
    if (!newVideoUrl.trim()) return;
    const ytId = extractYoutubeId(newVideoUrl.trim());
    if (!ytId) { alert("Invalid YouTube URL"); return; }
    const title = await fetchVideoTitle(ytId);
    const { data } = await sb.from("vn_videos").insert([{
      folder_id: selectedFolder.id, user_id: userId,
      youtube_id: ytId, title, notes: "", url: newVideoUrl.trim()
    }]).select().single();
    setVideos(prev => [data, ...prev]);
    setNewVideoUrl("");
    setShowNewVideo(false);
  };

  const addStamp = async () => {
    if (!stampNote.trim()) return;
    const secs = timerSecs;
    const { data } = await sb.from("vn_stamps").insert([{
      video_id: selectedVideo.id, user_id: userId,
      timestamp_secs: secs, note: stampNote.trim(),
    }]).select().single();
    setStamps(prev => [...prev, data].sort((a,b) => a.timestamp_secs - b.timestamp_secs));
    setStampNote("");
    setShowStampInput(false);
  };

  const saveNotes = async () => {
    await sb.from("vn_videos").update({ notes: generalNotes }).eq("id", selectedVideo.id);
  };

  const seekTo = (secs) => {
    setTimerSecs(secs);
    if (iframeRef.current) {
      iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: "command", func: "seekTo", args: [secs, true] }), "*");
    }
  };

  const deleteStamp = async (id) => {
    await sb.from("vn_stamps").delete().eq("id", id);
    setStamps(prev => prev.filter(s => s.id !== id));
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const inputStyle = {
    background: "var(--bg)", border: "1px solid var(--border)", padding: "10px 12px",
    color: "var(--text)", fontFamily: "'DM Mono', monospace", fontSize: 12,
    outline: "none", width: "100%",
  };
  const btnBase = { border: "none", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontWeight: 900, letterSpacing: 0.2, WebkitTapHighlightColor: "transparent" };

  if (loading) return <div style={{ padding: 32, fontSize: 12, color: "var(--text3)" }}>Loading...</div>;

  // PLAYER VIEW
  if (view === "player" && selectedVideo) {
    const ytId = selectedVideo.youtube_id;
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* Back header */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12, background: "var(--bg)" }}>
          <div onClick={() => { setView("videos"); setTimerRunning(false); setTimerSecs(0); }} style={{ fontSize: 9, color: "var(--text2)", letterSpacing: 0.2, cursor: "pointer" }}>← BACK</div>
          <div style={{ fontSize: 11, color: "var(--text)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedVideo.title}</div>
        </div>

        {/* YouTube embed */}
        <div style={{ position: "relative", paddingBottom: "56.25%", background: "#000" }}>
          <iframe ref={iframeRef}
            src={`https://www.youtube.com/embed/${ytId}?enablejsapi=1&origin=${window.location.origin}`}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Timer + controls */}
        <div style={{ padding: "12px 16px", background: "var(--bg)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: timerRunning ? "var(--cyan)" : "var(--text2)", fontFamily: "'DM Mono', monospace", minWidth: 60 }}>
            {formatTime(timerSecs)}
          </div>
          <button onClick={() => setTimerRunning(r => !r)} style={{
            ...btnBase, padding: "8px 16px", fontSize: 10,
            background: timerRunning ? "#FF444422" : "#33EEFF22",
            color: timerRunning ? "var(--red)" : "var(--cyan)",
            border: `1px solid ${timerRunning ? "var(--red)" : "var(--cyan)"}`,
          }}>{timerRunning ? "⏸ PAUSE" : "▶ PLAY"}</button>
          <button onClick={() => { setTimerSecs(0); setTimerRunning(false); }} style={{
            ...btnBase, padding: "8px 12px", fontSize: 10,
            background: "transparent", color: "var(--text3)", border: "1px solid var(--border)",
          }}>RESET</button>
          <button onClick={() => { setShowStampInput(true); setTimerRunning(false); }} style={{
            ...btnBase, padding: "8px 16px", fontSize: 10,
            background: "#FFD70022", color: "var(--gold)",
            border: "1px solid #FFD700", marginLeft: "auto",
          }}>⚑ STAMP {formatTime(timerSecs)}</button>
        </div>

        {/* Stamp input */}
        {showStampInput && (
          <div style={{ padding: "12px 16px", background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
            <div style={{ fontSize: 9, color: "var(--gold)", letterSpacing: 0.2, marginBottom: 8 }}>STAMP AT {formatTime(timerSecs)}</div>
            <textarea value={stampNote} onChange={e => setStampNote(e.target.value)}
              placeholder="What did you notice?"
              style={{ ...inputStyle, height: 60, resize: "none", marginBottom: 8 }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={addStamp} style={{ ...btnBase, flex: 1, padding: "10px", background: "var(--gold)", color: "#000", fontSize: 10 }}>SAVE STAMP</button>
              <button onClick={() => { setShowStampInput(false); setStampNote(""); setTimerRunning(true); }} style={{ ...btnBase, padding: "10px 16px", background: "transparent", color: "var(--text2)", border: "1px solid var(--border)", fontSize: 10 }}>CANCEL</button>
            </div>
          </div>
        )}

        {/* Tabs: Stamps | Notes */}
        <div style={{ flex: 1, overflow: "auto" }}>
          <div style={{ padding: "16px 16px 0" }}>
            {/* Stamps list */}
            {stamps.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 9, letterSpacing: 0.3, color: "var(--gold)", marginBottom: 12 }}>TIMESTAMPS ({stamps.length})</div>
                {stamps.map(s => (
                  <div key={s.id} style={{ padding: "10px 12px", background: "var(--surface)", borderLeft: "2px solid #FFD700", marginBottom: 8, display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div onClick={() => seekTo(s.timestamp_secs)} style={{ fontSize: 11, color: "var(--gold)", fontWeight: 900, cursor: "pointer", flexShrink: 0, fontFamily: "'DM Mono', monospace" }}>
                      {formatTime(s.timestamp_secs)}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text2)", flex: 1, lineHeight: 1.5 }}>{s.note}</div>
                    <div onClick={() => deleteStamp(s.id)} style={{ fontSize: 9, color: "var(--text3)", cursor: "pointer", flexShrink: 0 }}>✕</div>
                  </div>
                ))}
              </div>
            )}
            {stamps.length === 0 && (
              <div style={{ fontSize: 11, color: "var(--text3)", textAlign: "center", padding: "20px 0", marginBottom: 20 }}>
                No stamps yet. Hit ⚑ STAMP while watching.
              </div>
            )}
            {/* General notes */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 9, letterSpacing: 0.3, color: "var(--text3)", marginBottom: 8 }}>GENERAL NOTES</div>
              <textarea value={generalNotes} onChange={e => setGeneralNotes(e.target.value)} onBlur={saveNotes}
                placeholder="Overall takeaways, patterns you noticed..."
                style={{ ...inputStyle, height: 100, resize: "none" }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // VIDEOS VIEW
  if (view === "videos" && selectedFolder) {
    return (
      <div>
        <div className="page-padding" style={{ padding: "24px 24px 0" }}>
          <div onClick={() => setView("folders")} style={{ fontSize: 9, color: "var(--text2)", letterSpacing: 0.2, cursor: "pointer", marginBottom: 16 }}>← FOLDERS</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }} className="header-row">
            <div>
              <div style={{ fontSize: 9, letterSpacing: 0.3, color: "var(--text3)", marginBottom: 4 }}>FOLDER</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "var(--text)" }}>{selectedFolder.name}</div>
            </div>
            <button onClick={() => setShowNewVideo(v => !v)} style={{ ...btnBase, padding: "8px 16px", background: "#33EEFF22", color: "var(--cyan)", border: "1px solid var(--green-border)", fontSize: 10 }}>+ ADD VIDEO</button>
          </div>

          {showNewVideo && (
            <div style={{ padding: "14px", background: "var(--surface)", border: "1px solid var(--border)", marginBottom: 20 }}>
              <div style={{ fontSize: 9, letterSpacing: 0.3, color: "var(--text3)", marginBottom: 8 }}>PASTE YOUTUBE LINK</div>
              <input value={newVideoUrl} onChange={e => setNewVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                style={{ ...inputStyle, marginBottom: 10 }}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={addVideo} style={{ ...btnBase, flex: 1, padding: "10px", background: "var(--cyan)", color: "#000", fontSize: 10 }}>ADD VIDEO</button>
                <button onClick={() => setShowNewVideo(false)} style={{ ...btnBase, padding: "10px 14px", background: "transparent", color: "var(--text3)", border: "1px solid var(--border)", fontSize: 10 }}>CANCEL</button>
              </div>
            </div>
          )}
        </div>

        <div className="page-padding" style={{ padding: "8px 24px 40px" }}>
          {videos.length === 0 ? (
            <div style={{ fontSize: 12, color: "var(--text3)", textAlign: "center", padding: "40px 0" }}>No videos yet. Add a YouTube link above.</div>
          ) : (
            videos.map(v => (
              <div key={v.id} onClick={async () => { setSelectedVideo(v); await loadVideoData(v); setView("player"); }}
                style={{ padding: "14px", background: "var(--surface)", borderLeft: "2px solid var(--border)", marginBottom: 8, cursor: "pointer", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--cyan)"; e.currentTarget.style.background = "var(--surface2)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--surface)"; }}>
                <div style={{ fontSize: 13, color: "var(--text)", marginBottom: 4 }}>{v.title}</div>
                <div style={{ fontSize: 9, color: "var(--text3)", letterSpacing: 1 }}>
                  {v.stamp_count || 0} stamps · tap to open
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // FOLDERS VIEW
  return (
    <div>
      <div className="page-padding" style={{ padding: "32px 24px 0" }}>
        <div style={{ fontSize: 9, letterSpacing: 0.5, color: "var(--text3)", marginBottom: 8 }}>STUDY THE GAME</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }} className="header-row">
          <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: "var(--text)" }}>VIDEO <span style={{ color: "var(--cyan)" }}>LIBRARY</span></div>
          <button onClick={() => setShowNewFolder(v => !v)} style={{ ...btnBase, padding: "8px 16px", background: "#33EEFF22", color: "var(--cyan)", border: "1px solid var(--green-border)", fontSize: 10 }}>+ NEW FOLDER</button>
        </div>

        {showNewFolder && (
          <div style={{ padding: "14px", background: "var(--surface)", border: "1px solid var(--border)", marginBottom: 20 }}>
            <div style={{ fontSize: 9, letterSpacing: 0.3, color: "var(--text3)", marginBottom: 8 }}>FOLDER NAME</div>
            <input value={newFolderName} onChange={e => setNewFolderName(e.target.value)}
              placeholder="e.g. Pirlo Study, Midfield Movement..."
              style={{ ...inputStyle, marginBottom: 10 }}
              onKeyDown={e => e.key === "Enter" && createFolder()}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={createFolder} style={{ ...btnBase, flex: 1, padding: "10px", background: "var(--cyan)", color: "#000", fontSize: 10 }}>CREATE</button>
              <button onClick={() => setShowNewFolder(false)} style={{ ...btnBase, padding: "10px 14px", background: "transparent", color: "var(--text3)", border: "1px solid var(--border)", fontSize: 10 }}>CANCEL</button>
            </div>
          </div>
        )}
      </div>

      <div className="page-padding" style={{ padding: "8px 24px 40px" }}>
        {folders.length === 0 ? (
          <div style={{ fontSize: 12, color: "var(--text3)", textAlign: "center", padding: "40px 0" }}>
            No folders yet.<br/><span style={{ fontSize: 10 }}>Create one to start building your library.</span>
          </div>
        ) : (
          folders.map((f, idx) => (
            <div key={f.id}
              className="folder-drag-item"
              draggable
              onDragStart={e => onDragStart(e, idx)}
              onDragEnd={onDragEnd}
              onDragOver={e => onDragOver(e, idx)}
              onDrop={e => onDrop(e, idx)}
              onTouchStart={e => onTouchStart(e, idx)}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              style={{
                padding: "14px", background: "var(--surface)",
                borderLeft: dragOverIdx === idx ? "2px solid #33EEFF" : "2px solid #141414",
                marginBottom: 8, transition: "border-color 0.1s, background 0.15s",
                transform: dragOverIdx === idx ? "scale(1.01)" : "scale(1)",
              }}>
              {renamingId === f.id ? (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }} onClick={e => e.stopPropagation()}>
                  <input value={renameVal} onChange={e => setRenameVal(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") saveRename(f.id); if (e.key === "Escape") setRenamingId(null); }}
                    autoFocus
                    style={{ flex: 1, background: "var(--surface2)", border: "1px solid var(--green-border)", padding: "6px 10px", color: "var(--text)", fontFamily: "'DM Mono', monospace", fontSize: 12, outline: "none" }}
                  />
                  <div onClick={() => saveRename(f.id)} style={{ fontSize: 9, color: "var(--cyan)", cursor: "pointer", letterSpacing: 1, padding: "6px 10px", border: "1px solid var(--green-border)", whiteSpace: "nowrap" }}>SAVE</div>
                  <div onClick={() => setRenamingId(null)} style={{ fontSize: 9, color: "var(--text3)", cursor: "pointer", padding: "6px 8px" }}>✕</div>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ color: "var(--text3)", cursor: "grab", fontSize: 14, flexShrink: 0, userSelect: "none", touchAction: "none" }}>⠿</div>
                  <div onClick={async () => { setSelectedFolder(f); await loadVideos(f.id); setView("videos"); }}
                    style={{ flex: 1, cursor: "pointer" }}>
                    <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 900 }}>📁 {f.name}</div>
                  </div>
                  <div onClick={e => { e.stopPropagation(); startRename(f); }}
                    style={{ fontSize: 9, color: "var(--text3)", cursor: "pointer", padding: "4px 8px", letterSpacing: 1, flexShrink: 0 }}>✎</div>
                  <div onClick={async () => { setSelectedFolder(f); await loadVideos(f.id); setView("videos"); }}
                    style={{ fontSize: 11, color: "var(--text3)", flexShrink: 0 }}>→</div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}


// --- SKILLS CENTER ------------------------------------------------------------

function SkillsCenter({ userId }) {
  const [tab, setTab] = useState("overview");
  const [skillData, setSkillData] = useState({});   // { skillName: { rating, is_goal, id } }
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState(null); // { name, cat }
  const [filterCat, setFilterCat] = useState("all");

  useEffect(() => {
    async function load() {
      const { data } = await sb.from("skills").select("*").eq("user_id", userId);
      const map = {};
      (data || []).forEach(s => { map[s.skill_name] = { rating: s.rating || 0, is_goal: s.is_goal, id: s.id }; });
      setSkillData(map);
      setLoading(false);
    }
    load();
  }, [userId]);

  const upsertSkill = async (skillName, patch) => {
    const existing = skillData[skillName];
    if (existing?.id) {
      await sb.from("skills").update(patch).eq("id", existing.id);
      setSkillData(prev => ({ ...prev, [skillName]: { ...prev[skillName], ...patch } }));
    } else {
      const { data } = await sb.from("skills").insert([{ user_id: userId, skill_name: skillName, rating: 0, is_goal: false, ...patch }]).select().single();
      if (data) setSkillData(prev => ({ ...prev, [skillName]: { rating: data.rating, is_goal: data.is_goal, id: data.id } }));
    }
  };

  const rateSkill = async (name, rating) => {
    await upsertSkill(name, { rating });
    setSelectedSkill(prev => prev ? { ...prev } : null);
  };

  const toggleGoal = async (name) => {
    const current = skillData[name]?.is_goal || false;
    await upsertSkill(name, { is_goal: !current });
  };

  const allSkillsFlat = Object.entries(SKILL_CATEGORIES).flatMap(([cat, { skills }]) =>
    skills.map(s => ({ name: s, cat }))
  );

  const goalSkills = allSkillsFlat.filter(s => skillData[s.name]?.is_goal);
  const filteredSkills = filterCat === "all" ? allSkillsFlat : allSkillsFlat.filter(s => s.cat === filterCat);

  const avgRating = () => {
    const rated = allSkillsFlat.filter(s => skillData[s.name]?.rating > 0);
    if (!rated.length) return 0;
    return (rated.reduce((a, s) => a + (skillData[s.name]?.rating || 0), 0) / rated.length).toFixed(1);
  };

  const catAvg = (cat) => {
    const catSkills = SKILL_CATEGORIES[cat]?.skills || [];
    const rated = catSkills.filter(s => skillData[s]?.rating > 0);
    if (!rated.length) return 0;
    return (rated.reduce((a, s) => a + (skillData[s]?.rating || 0), 0) / rated.length).toFixed(1);
  };

  if (loading) return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:"60vh",color:"var(--text3)",fontSize:13 }}>
      Loading skills...
    </div>
  );

  return (
    <div style={{ display:"flex",flexDirection:"column",height:"100%",background:"var(--bg)" }}>

      {/* Header */}
      <div style={{ padding:"28px 24px 0",flexShrink:0 }}>
        <div style={{ fontSize:10,fontWeight:600,letterSpacing:2,color:"var(--text3)",marginBottom:6 }}>59 SKILLS TRACKED</div>
        <div style={{ fontFamily:"var(--font-display)",fontSize:26,fontWeight:800,marginBottom:4 }}>
          SKILLS <span style={{ color:"var(--cyan)" }}>CENTER</span>
        </div>
        <div style={{ fontSize:13,color:"var(--text3)",marginBottom:20 }}>
          Overall avg: <span style={{ color:"var(--cyan)",fontWeight:700 }}>{avgRating()}/6</span>
          &nbsp;·&nbsp;Goals set: <span style={{ color:"var(--gold)",fontWeight:700 }}>{goalSkills.length}</span>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex",gap:4,marginBottom:20,background:"var(--surface)",borderRadius:10,padding:4 }}>
          {[["overview","Overview"],["goals","My Goals"]].map(([id,label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              flex:1,padding:"8px 0",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,
              background:tab===id?"var(--surface2)":"transparent",
              color:tab===id?"var(--text)":"var(--text3)",transition:"all 0.15s"
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex:1,overflowY:"auto",padding:"0 24px 40px",WebkitOverflowScrolling:"touch" }}>

        {tab === "overview" && (
          <div>
            {/* Category filter */}
            <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom:20 }}>
              <button onClick={() => setFilterCat("all")} style={{
                padding:"5px 12px",borderRadius:99,border:"1px solid",fontSize:11,fontWeight:600,cursor:"pointer",
                borderColor:filterCat==="all"?"var(--cyan)":"var(--border)",
                background:filterCat==="all"?"var(--green-glow)":"transparent",
                color:filterCat==="all"?"var(--cyan)":"var(--text3)"
              }}>All</button>
              {Object.entries(SKILL_CATEGORIES).map(([cat, { label }]) => (
                <button key={cat} onClick={() => setFilterCat(cat)} style={{
                  padding:"5px 12px",borderRadius:99,border:"1px solid",fontSize:11,fontWeight:600,cursor:"pointer",
                  borderColor:filterCat===cat?"var(--cyan)":"var(--border)",
                  background:filterCat===cat?"var(--green-glow)":"transparent",
                  color:filterCat===cat?"var(--cyan)":"var(--text3)"
                }}>{label}</button>
              ))}
            </div>

            {/* Category sections */}
            {(filterCat === "all" ? Object.entries(SKILL_CATEGORIES) : [[filterCat, SKILL_CATEGORIES[filterCat]]]).map(([cat, { label, skills }]) => (
              <div key={cat} style={{ marginBottom:28 }}>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12 }}>
                  <div style={{ fontSize:11,fontWeight:700,letterSpacing:1.5,color:"var(--text3)" }}>{label.toUpperCase()}</div>
                  <div style={{ fontSize:11,color:"var(--cyan)",fontWeight:600 }}>{catAvg(cat)}/6</div>
                </div>
                <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                  {skills.map(skillName => {
                    const d = skillData[skillName] || { rating: 0, is_goal: false };
                    const ratingColor = d.rating >= 5 ? "var(--cyan)" : d.rating >= 3 ? "var(--gold)" : d.rating >= 1 ? "var(--red)" : "var(--border)";
                    return (
                      <div key={skillName} onClick={() => setSelectedSkill({ name: skillName, cat })}
                        style={{ display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:"var(--surface)",borderRadius:12,cursor:"pointer",transition:"background 0.15s",border:"1px solid var(--border)" }}>
                        <div style={{ flex:1,minWidth:0 }}>
                          <div style={{ fontSize:13,fontWeight:500,color:"var(--text)",marginBottom:6,display:"flex",alignItems:"center",gap:6 }}>
                            {skillName}
                            {d.is_goal && <div style={{ width:6,height:6,borderRadius:"50%",background:"var(--cyan)",flexShrink:0 }}/>}
                          </div>
                          <div style={{ height:3,background:"var(--surface3)",borderRadius:99,overflow:"hidden" }}>
                            <div style={{ height:"100%",width:`${(d.rating/6)*100}%`,background:ratingColor,borderRadius:99,transition:"width 0.4s ease" }}/>
                          </div>
                        </div>
                        <div style={{ fontSize:13,fontWeight:700,color:ratingColor,minWidth:28,textAlign:"right" }}>
                          {d.rating > 0 ? `${d.rating}/6` : "—"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "goals" && (
          <div>
            {goalSkills.length === 0 ? (
              <div style={{ textAlign:"center",padding:"64px 0",color:"var(--text3)",fontSize:13 }}>
                No goals set yet.<br/>
                <span style={{ fontSize:11 }}>Tap any skill → mark it as a goal to master.</span>
              </div>
            ) : (
              <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                {goalSkills.map(({ name, cat }) => {
                  const d = skillData[name] || { rating: 0 };
                  const pct = Math.round((d.rating/6)*100);
                  const col = d.rating >= 5 ? "var(--cyan)" : d.rating >= 3 ? "var(--gold)" : "var(--red)";
                  return (
                    <div key={name} onClick={() => setSelectedSkill({ name, cat })}
                      style={{ padding:"14px 16px",background:"var(--surface)",borderRadius:12,border:"1px solid var(--green-border)",cursor:"pointer" }}>
                      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10 }}>
                        <div>
                          <div style={{ fontSize:13,fontWeight:600 }}>{name}</div>
                          <div style={{ fontSize:10,color:"var(--text3)",marginTop:2 }}>{SKILL_CATEGORIES[cat]?.label}</div>
                        </div>
                        <div style={{ fontSize:18,fontWeight:800,color:col }}>{pct}%</div>
                      </div>
                      <div style={{ height:4,background:"var(--surface3)",borderRadius:99,overflow:"hidden" }}>
                        <div style={{ height:"100%",width:`${pct}%`,background:col,borderRadius:99,transition:"width 0.4s" }}/>
                      </div>
                      {d.rating === 6 && <div style={{ marginTop:8 }}><span className="badge badge-green">ELITE</span></div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Skill modal */}
      {selectedSkill && (
        <div onClick={() => setSelectedSkill(null)}
          style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center",padding:20 }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background:"var(--surface)",border:"1px solid var(--border2)",borderRadius:20,padding:24,width:"100%",maxWidth:440 }}>
            <div style={{ fontSize:16,fontWeight:700,marginBottom:2 }}>{selectedSkill.name}</div>
            <div style={{ fontSize:11,color:"var(--text3)",marginBottom:20 }}>
              {SKILL_CATEGORIES[selectedSkill.cat]?.label} · Current: {skillData[selectedSkill.name]?.rating || 0}/6
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:6,marginBottom:20 }}>
              {RATING_LABELS.map((label, i) => {
                const level = i + 1;
                const isActive = (skillData[selectedSkill.name]?.rating || 0) === level;
                const col = RATING_COLORS[level];
                return (
                  <div key={level} onClick={() => rateSkill(selectedSkill.name, level)}
                    style={{ padding:"10px 4px",borderRadius:10,border:"1px solid",borderColor:isActive?col:"var(--border2)",background:isActive?`${col}22`:"var(--surface2)",cursor:"pointer",textAlign:"center",transition:"all 0.15s" }}>
                    <div style={{ fontSize:14,fontWeight:800,color:isActive?col:"var(--text3)" }}>{level}</div>
                    <div style={{ fontSize:8,color:isActive?col:"var(--text3)",marginTop:2,fontWeight:600 }}>{label.slice(0,4).toUpperCase()}</div>
                  </div>
                );
              })}
            </div>
            <div onClick={() => toggleGoal(selectedSkill.name)}
              style={{ display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:"var(--surface2)",borderRadius:10,cursor:"pointer",marginBottom:16 }}>
              <div style={{ width:18,height:18,borderRadius:5,border:"2px solid",borderColor:skillData[selectedSkill.name]?.is_goal?"var(--cyan)":"var(--border2)",background:skillData[selectedSkill.name]?.is_goal?"var(--green-glow)":"transparent",display:"flex",alignItems:"center",justifyContent:"center" }}>
                {skillData[selectedSkill.name]?.is_goal && <div style={{ width:8,height:8,borderRadius:2,background:"var(--cyan)" }}/>}
              </div>
              <span style={{ fontSize:13,fontWeight:500 }}>Mark as goal to master</span>
            </div>
            <button onClick={() => setSelectedSkill(null)} className="btn btn-ghost" style={{ width:"100%" }}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}


function GoalMap({ data }) {
  const [showFoot, setShowFoot] = useState("Right");
  const ANGLES = ["Left", "Center", "Right"];
  const DISTANCES = ["Close", "Mid", "Long"];

  const getCell = (angle, distance) => {
    const shots = (data||[]).filter(s=>s.foot===showFoot&&s.angle===angle&&s.distance===distance);
    if (!shots.length) return null;
    const makes = shots.reduce((a,s)=>a+(s.makes||0),0);
    const total = shots.reduce((a,s)=>a+(s.total||0),0);
    return total>0 ? {makes,total,pct:makes/total} : null;
  };

  const colors = (pct) => {
    if (pct===null) return {stroke:"rgba(255,255,255,0.14)",fill:"rgba(255,255,255,0.03)",text:"rgba(255,255,255,0.25)",line:"rgba(255,255,255,0.08)"};
    if (pct>=0.7) return {stroke:"#00E87A",fill:"rgba(0,232,122,0.13)",text:"#00E87A",line:"rgba(0,232,122,0.4)"};
    if (pct>=0.4) return {stroke:"#F5A623",fill:"rgba(245,166,35,0.13)",text:"#F5A623",line:"rgba(245,166,35,0.4)"};
    return {stroke:"#FF4D4D",fill:"rgba(255,77,77,0.13)",text:"#FF4D4D",line:"rgba(255,77,77,0.4)"};
  };

  // ViewBox is wide — fills container naturally
  const VW=500, VH=560;
  const GW=300, GH=72, GX=(VW-300)/2, GY=32;
  const spotR=42;
  const colX=[VW*0.17,VW*0.5,VW*0.83];
  const rowY=[GY+GH+100, GY+GH+225, GY+GH+350];
  const goalZX=[GX+GW*0.165, GX+GW*0.5, GX+GW*0.835];

  return (
    <div style={{width:"100%"}}>
      <div style={{display:"flex",justifyContent:"center",gap:10,marginBottom:20}}>
        {["Right","Left"].map(f=>(
          <button key={f} onClick={()=>setShowFoot(f)} style={{
            padding:"8px 28px",borderRadius:99,border:"1.5px solid",
            borderColor:showFoot===f?(f==="Right"?"var(--cyan)":"var(--magenta)"):"rgba(255,255,255,0.1)",
            background:showFoot===f?(f==="Right"?"var(--cyan-glow)":"var(--magenta-glow)"):"transparent",
            color:showFoot===f?(f==="Right"?"var(--cyan)":"var(--magenta)"):"rgba(255,255,255,0.35)",
            fontSize:13,fontWeight:700,cursor:"pointer",letterSpacing:0.5,fontFamily:"var(--font-body)",
          }}>{f} Foot</button>
        ))}
      </div>
      <svg viewBox={`0 0 ${VW} ${VH}`} style={{width:"100%",height:"auto",display:"block"}} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="gField" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#0d2a0d"/>
            <stop offset="60%" stopColor="#071507"/>
            <stop offset="100%" stopColor="#030a03"/>
          </radialGradient>
          <radialGradient id="gGoalBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1a1a1a" stopOpacity="0.6"/>
            <stop offset="100%" stopColor="#000" stopOpacity="0.8"/>
          </radialGradient>
          <filter id="fPost" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="fGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="7" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="fLineGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          {/* Spotlight under goal */}
          <radialGradient id="gSpot" cx="50%" cy="0%" r="60%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.06)"/>
            <stop offset="100%" stopColor="transparent"/>
          </radialGradient>
        </defs>

        {/* Sky / atmosphere */}
        <rect x="0" y="0" width={VW} height={GY+GH+30} fill="#050505"/>

        {/* Field */}
        <rect x="0" y={GY+GH} width={VW} height={VH-GY-GH} fill="url(#gField)"/>

        {/* Field stripes */}
        {[0,1,2,3].map(i=>(
          <rect key={i} x="0" y={GY+GH+i*((VH-GY-GH)/4)} width={VW} height={(VH-GY-GH)/4}
            fill={i%2===0?"rgba(255,255,255,0.016)":"transparent"}/>
        ))}

        {/* Spotlight cone from goal */}
        <ellipse cx={VW/2} cy={GY+GH+16} rx={GW*0.85} ry={36}
          fill="none" stroke="rgba(100,255,150,0.06)" strokeWidth="1.5"/>
        <ellipse cx={VW/2} cy={GY+GH+16} rx={GW*0.5} ry={22}
          fill="rgba(100,255,150,0.025)"/>

        {/* Goal shadow/depth */}
        <rect x={GX+7} y={GY+7} width={GW} height={GH+3} fill="rgba(0,0,0,0.7)" rx="2"/>

        {/* Goal net background */}
        <rect x={GX} y={GY} width={GW} height={GH} fill="url(#gGoalBg)" rx="1"/>

        {/* Net mesh — horizontal */}
        {Array.from({length:9}).map((_,i)=>(
          <line key={`nh${i}`} x1={GX} y1={GY+(GH/8)*i} x2={GX+GW} y2={GY+(GH/8)*i}
            stroke="rgba(255,255,255,0.11)" strokeWidth="0.7"/>
        ))}
        {/* Net mesh — vertical */}
        {Array.from({length:17}).map((_,i)=>(
          <line key={`nv${i}`} x1={GX+(GW/16)*i} y1={GY} x2={GX+(GW/16)*i} y2={GY+GH}
            stroke="rgba(255,255,255,0.11)" strokeWidth="0.7"/>
        ))}
        {/* Net depth lines */}
        {[0.2,0.4,0.6,0.8].map((t,i)=>(
          <line key={`nd${i}`} x1={GX+GW*t} y1={GY} x2={GX+14+(GW-28)*t} y2={GY+GH}
            stroke="rgba(255,255,255,0.045)" strokeWidth="1"/>
        ))}

        {/* Goal frame */}
        {/* Crossbar */}
        <rect x={GX-6} y={GY-6} width={GW+12} height={8} fill="#dedede" rx="4" filter="url(#fPost)"/>
        {/* Left post */}
        <rect x={GX-6} y={GY-6} width={8} height={GH+10} fill="#dedede" rx="4" filter="url(#fPost)"/>
        {/* Right post */}
        <rect x={GX+GW-2} y={GY-6} width={8} height={GH+10} fill="#dedede" rx="4" filter="url(#fPost)"/>
        {/* Goal line */}
        <line x1={GX-6} y1={GY+GH+4} x2={GX+GW+6} y2={GY+GH+4} stroke="rgba(255,255,255,0.5)" strokeWidth="2"/>

        {/* Goal zone dividers */}
        {[1/3,2/3].map((t,i)=>(
          <line key={i} x1={GX+GW*t} y1={GY+6} x2={GX+GW*t} y2={GY+GH-4}
            stroke="rgba(255,255,255,0.18)" strokeWidth="0.9" strokeDasharray="4,3"/>
        ))}

        {/* Zone labels inside goal */}
        {ANGLES.map((a,ai)=>(
          <text key={a} x={GX+(ai+0.5)*(GW/3)} y={GY+GH-8} textAnchor="middle"
            fontSize="8" fill="rgba(255,255,255,0.3)" fontFamily="var(--font-body)" fontWeight="600" letterSpacing="1">
            {a.toUpperCase()}
          </text>
        ))}

        {/* SHOT LINES — drawn before spots */}
        {DISTANCES.map((dist,di)=>ANGLES.map((angle,ai)=>{
          const cell=getCell(angle,dist);
          const c=colors(cell?cell.pct:null);
          return (
            <g key={`line${ai}${di}`}>
              {/* Glow version */}
              {cell && <line x1={colX[ai]} y1={rowY[di]-spotR} x2={goalZX[ai]} y2={GY+GH+4}
                stroke={c.line} strokeWidth="5" strokeOpacity="0.35" filter="url(#fLineGlow)"/>}
              {/* Crisp line */}
              <line x1={colX[ai]} y1={rowY[di]-spotR} x2={goalZX[ai]} y2={GY+GH+4}
                stroke={c.stroke} strokeWidth={cell?1.8:0.8}
                strokeOpacity={cell?0.55:0.15}
                strokeDasharray={cell?"none":"5,5"}/>
            </g>
          );
        }))}

        {/* SPOTS */}
        {DISTANCES.map((dist,di)=>ANGLES.map((angle,ai)=>{
          const cell=getCell(angle,dist);
          const c=colors(cell?cell.pct:null);
          const cx=colX[ai], cy=rowY[di];
          return (
            <g key={`spot${ai}${di}`}>
              {/* Outer glow */}
              {cell && <circle cx={cx} cy={cy} r={spotR+14} fill={c.line} filter="url(#fGlow)" opacity="0.5"/>}
              {/* Circle body */}
              <circle cx={cx} cy={cy} r={spotR} fill={c.fill} stroke={c.stroke} strokeWidth={cell?2:1.2}/>
              {/* Inner ring */}
              {cell && <circle cx={cx} cy={cy} r={spotR-8} fill="none" stroke={c.stroke} strokeWidth="0.7" opacity="0.35"/>}
              {/* Percentage */}
              <text x={cx} y={cell?cy-3:cy+5} textAnchor="middle"
                fontSize={cell?"18":"14"} fontWeight="800" fill={c.text} fontFamily="var(--font-body)">
                {cell?`${Math.round(cell.pct*100)}%`:"—"}
              </text>
              {cell && (
                <text x={cx} y={cy+16} textAnchor="middle" fontSize="10" fontWeight="600"
                  fill={c.text} fontFamily="var(--font-body)" opacity="0.7">
                  {cell.makes}/{cell.total}
                </text>
              )}
            </g>
          );
        }))}

        {/* Distance labels */}
        {DISTANCES.map((dist,di)=>(
          <text key={dist} x={10} y={rowY[di]+5} fontSize="9" fontWeight="700" letterSpacing="1.5"
            fill="rgba(255,255,255,0.25)" fontFamily="var(--font-body)">
            {dist.toUpperCase()}
          </text>
        ))}

        {/* Angle labels above close row */}
        {ANGLES.map((angle,ai)=>(
          <text key={angle} x={colX[ai]} y={rowY[0]-spotR-13} textAnchor="middle"
            fontSize="9" fontWeight="700" letterSpacing="1.2"
            fill="rgba(255,255,255,0.2)" fontFamily="var(--font-body)">
            {angle.toUpperCase()}
          </text>
        ))}

        {/* Legend */}
        {[["#00E87A",">=70%"],["#F5A623","40-69%"],["#FF4D4D","<40%"]].map(([col,lbl],i)=>(
          <g key={i} transform={`translate(${VW-90},${VH-52+i*16})`}>
            <circle r="5" cx="5" cy="-2" fill={`${col}22`} stroke={col} strokeWidth="1.2"/>
            <text x="14" y="2" fontSize="9" fill="rgba(255,255,255,0.35)" fontFamily="var(--font-body)">{lbl}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function AccuracyGraph({ data }) {
  if (!data || !data.length) return null;

  const byDate = {};
  data.forEach(s => {
    if (!byDate[s.session_date]) byDate[s.session_date] = { Right:{makes:0,total:0}, Left:{makes:0,total:0} };
    byDate[s.session_date][s.foot].makes += s.makes;
    byDate[s.session_date][s.foot].total += s.total;
  });

  const dates = Object.keys(byDate).sort();
  if (dates.length < 2) return null;

  const W = 300, H = 120, padL = 28, padB = 20, padT = 10;
  const plotW = W - padL - 10, plotH = H - padB - padT;

  const getPoints = (foot) => dates.map((d, i) => {
    const { makes, total } = byDate[d][foot];
    const x = padL + (i / (dates.length-1)) * plotW;
    const y = padT + plotH - (total>0 ? (makes/total) : 0) * plotH;
    return `${x},${y}`;
  });

  return (
    <div style={{ marginTop:20 }}>
      <div style={{ fontSize:10, fontWeight:600, letterSpacing:2, color:"var(--text3)", marginBottom:10 }}>ACCURACY TREND</div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ maxWidth:W, display:"block" }}>
        {[0,0.5,1].map(v => (
          <g key={v}>
            <line x1={padL} y1={padT + plotH*(1-v)} x2={W-10} y2={padT + plotH*(1-v)} stroke="var(--border)" strokeWidth="1"/>
            <text x={padL-4} y={padT + plotH*(1-v)+4} textAnchor="end" fontSize="8" fill="var(--text3)" fontFamily="var(--font-body)">{Math.round(v*100)}%</text>
          </g>
        ))}
        <polyline points={getPoints("Right")} fill="none" stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points={getPoints("Left")} fill="none" stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <text x={W-8} y={H-8} textAnchor="end" fontSize="8" fill="var(--cyan)" fontFamily="var(--font-body)">R</text>
        <text x={W-18} y={H-8} textAnchor="end" fontSize="8" fill="var(--cyan)" fontFamily="var(--font-body)">L</text>
      </svg>
    </div>
  );
}

function ShotCounter({ userId }) {
  const [subTab, setSubTab] = useState("counter");
  const [angle, setAngle] = useState("Center");
  const [distance, setDistance] = useState("Mid");
  const [foot, setFoot] = useState("Right");
  const [shotCount, setShotCount] = useState(10);
  const [shooting, setShooting] = useState(false);
  const [currentShot, setCurrentShot] = useState(1);
  const [makes, setMakes] = useState(0);
  const [shotResults, setShotResults] = useState([]);
  const [allShots, setAllShots] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [todayData, setTodayData] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const today = new Date().toISOString().slice(0,10);

  useEffect(() => { loadShots(); }, [userId]);

  async function loadShots() {
    const { data } = await sb.from("shot_logs").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    const shots = data || [];
    setAllShots(shots);
    setTodayData(shots.filter(s => s.session_date === today));
    const dates = [...new Set(shots.map(s => s.session_date))].sort((a,b) => b.localeCompare(a));
    setSessions(dates);
  }

  function startShooting() { setShooting(true); setCurrentShot(1); setMakes(0); setShotResults([]); }

  async function recordShot(isMake) {
    const results = [...shotResults, isMake];
    setShotResults(results);
    if (isMake) setMakes(m => m+1);
    if (currentShot >= shotCount) {
      // Session done - save
      const totalMakes = results.filter(Boolean).length;
      const existing = allShots.find(s => s.session_date===today && s.angle===angle && s.distance===distance && s.foot===foot);
      if (existing) {
        const newMakes = existing.makes + totalMakes;
        const newTotal = existing.total + shotCount;
        await sb.from("shot_logs").update({ makes: newMakes, total: newTotal, ratio: newTotal>0?newMakes/newTotal:0 }).eq("id", existing.id);
      } else {
        await sb.from("shot_logs").insert({ user_id: userId, session_date: today, angle, distance, foot, makes: totalMakes, total: shotCount, ratio: shotCount>0?totalMakes/shotCount:0 });
      }
      setShooting(false);
      loadShots();
    } else {
      setCurrentShot(s => s+1);
    }
  }

  return (
    <div className="page-padding" style={{ padding: "28px" }}>
      <div className="page-eyebrow">Track Every Shot</div>
      <div className="page-title" style={{ marginBottom: 24 }}>Shot <span>Counter</span></div>

      <div className="tab-bar" style={{ marginBottom: 24 }}>
        {[["counter","Counter"],["today","Today"],["sessions","Sessions"],["all_time","All Time"]].map(([id,label]) => (
          <button key={id} onClick={() => setSubTab(id)} className={"tab-btn" + (subTab===id?" active":"")}>
            {label}
          </button>
        ))}
      </div>

      {/* ── COUNTER: SETUP ── */}
      {subTab==="counter" && !shooting && (
        <div style={{ maxWidth: 480 }}>
          {[
            { label:"ANGLE", options:["Left","Center","Right"], val:angle, set:setAngle, color:"var(--cyan)" },
            { label:"DISTANCE", options:["Close","Mid","Long"], val:distance, set:setDistance, color:"var(--cyan)" },
            { label:"FOOT", options:["Right","Left"], val:foot, set:setFoot, color:"var(--cyan)" },
          ].map(({ label, options, val, set, color }) => (
            <div key={label} style={{ marginBottom: 14 }}>
              <div style={{ fontSize:10, fontWeight:600, letterSpacing:1.5, color:"var(--text3)", marginBottom:8 }}>{label}</div>
              <div style={{ display:"flex", gap:8 }}>
                {options.map(v => (
                  <button key={v} onClick={() => set(v)} style={{
                    flex:1, padding:"12px 0", borderRadius:10, cursor:"pointer",
                    fontFamily:"var(--font-body)", fontSize:13, fontWeight:600, transition:"all 0.15s",
                    border: `1.5px solid ${val===v ? color : "var(--border2)"}`,
                    background: val===v ? `${color}18` : "var(--surface2)",
                    color: val===v ? color : "var(--text2)",
                  }}>{v}</button>
                ))}
              </div>
            </div>
          ))}

          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:10, fontWeight:600, letterSpacing:1.5, color:"var(--text3)", marginBottom:8 }}>SHOTS FROM THIS SPOT</div>
            <div style={{ display:"flex", gap:8 }}>
              {[5,10,15,20].map(v => (
                <button key={v} onClick={() => setShotCount(v)} style={{
                  flex:1, padding:"12px 0", borderRadius:10, cursor:"pointer",
                  fontFamily:"var(--font-body)", fontSize:14, fontWeight:700, transition:"all 0.15s",
                  border: `1.5px solid ${shotCount===v ? "var(--gold)" : "var(--border2)"}`,
                  background: shotCount===v ? "rgba(245,166,35,0.12)" : "var(--surface2)",
                  color: shotCount===v ? "var(--gold)" : "var(--text2)",
                }}>{v}</button>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding:"12px 16px", marginBottom:20, borderLeft:"3px solid var(--cyan)" }}>
            <div style={{ fontSize:10, fontWeight:600, letterSpacing:1.5, color:"var(--text3)", marginBottom:3 }}>SPOT</div>
            <div style={{ fontSize:14, fontWeight:600 }}>{angle} · {distance} · {foot} Foot · {shotCount} shots</div>
          </div>

          <button onClick={startShooting} style={{
            width:"100%", padding:"15px 0", borderRadius:12, border:"none",
            background:"var(--cyan)", color:"#000", fontFamily:"var(--font-body)",
            fontSize:14, fontWeight:700, cursor:"pointer",
            boxShadow:"0 4px 24px rgba(0,229,255,0.25)", transition:"all 0.15s",
          }}>START SHOOTING</button>
        </div>
      )}

      {/* ── COUNTER: SHOOTING ── */}
      {subTab==="counter" && shooting && (
        <div style={{ maxWidth:400, margin:"0 auto", textAlign:"center" }}>
          <div style={{ fontSize:12, color:"var(--text3)", marginBottom:4 }}>{angle} · {distance} · {foot} Foot</div>
          <div style={{ fontSize:13, color:"var(--text2)", marginBottom:16 }}>Shot {currentShot} of {shotCount}</div>
          <div style={{ height:4, background:"var(--surface3)", borderRadius:99, overflow:"hidden", marginBottom:28 }}>
            <div style={{ height:"100%", width:`${((currentShot-1)/shotCount)*100}%`, background:"var(--cyan)", borderRadius:99, transition:"width 0.3s" }}/>
          </div>
          <div style={{ display:"flex", justifyContent:"center", gap:40, marginBottom:32 }}>
            <div>
              <div style={{ fontFamily:"var(--font-display)", fontSize:52, fontWeight:800, color:"var(--cyan)", lineHeight:1 }}>{makes}</div>
              <div style={{ fontSize:10, fontWeight:600, letterSpacing:1.5, color:"var(--text3)", marginTop:4 }}>MAKES</div>
            </div>
            <div style={{ width:1, background:"var(--border)", alignSelf:"stretch" }}/>
            <div>
              <div style={{ fontFamily:"var(--font-display)", fontSize:52, fontWeight:800, color:"var(--text3)", lineHeight:1 }}>{(currentShot-1)-makes}</div>
              <div style={{ fontSize:10, fontWeight:600, letterSpacing:1.5, color:"var(--text3)", marginTop:4 }}>MISSES</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:12, marginBottom:24 }}>
            <button onClick={() => recordShot(true)} style={{ flex:1, padding:"38px 0", borderRadius:16, border:"1.5px solid var(--green-border)", background:"var(--green-glow)", color:"var(--cyan)", fontFamily:"var(--font-display)", fontSize:20, fontWeight:800, cursor:"pointer", transition:"all 0.1s" }}>
              ✓ MAKE
            </button>
            <button onClick={() => recordShot(false)} style={{ flex:1, padding:"38px 0", borderRadius:16, border:"1.5px solid rgba(255,77,77,0.2)", background:"rgba(255,77,77,0.07)", color:"var(--red)", fontFamily:"var(--font-display)", fontSize:20, fontWeight:800, cursor:"pointer", transition:"all 0.1s" }}>
              ✗ MISS
            </button>
          </div>
          <div style={{ display:"flex", justifyContent:"center", gap:5, flexWrap:"wrap" }}>
            {shotResults.map((r,i) => <div key={i} style={{ width:10, height:10, borderRadius:"50%", background:r?"var(--cyan)":"var(--red)" }}/>)}
            {Array(shotCount-shotResults.length).fill(0).map((_,i) => <div key={"e"+i} style={{ width:10, height:10, borderRadius:"50%", background:"var(--surface3)" }}/>)}
          </div>
        </div>
      )}

      {/* ── TODAY ── */}
      {subTab==="today" && (
        <div>
          {todayData.length===0 ? (
            <div style={{ textAlign:"center", padding:"48px 0", color:"var(--text3)", fontSize:13 }}>No shots logged today yet.</div>
          ) : (
            <>
              <div style={{ maxWidth:520, margin:"0 auto" }}><GoalMap data={todayData}/></div>
              <div style={{ marginTop:16 }}>
                {["Right","Left"].map(f => {
                  const d=todayData.filter(s=>s.foot===f), m=d.reduce((a,s)=>a+s.makes,0), t=d.reduce((a,s)=>a+s.total,0);
                  return t>0 ? (
                    <div key={f} className="card" style={{ padding:"14px 16px", marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <span style={{ fontSize:13, fontWeight:600 }}>{f} Foot</span>
                      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                        <span style={{ fontSize:12, color:"var(--text3)" }}>{m}/{t}</span>
                        <span style={{ fontFamily:"var(--font-display)", fontSize:18, fontWeight:800, color:m/t>=0.7?"var(--cyan)":m/t>=0.4?"var(--gold)":"var(--red)" }}>{Math.round(m/t*100)}%</span>
                      </div>
                    </div>
                  ) : null;
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── SESSIONS ── */}
      {subTab==="sessions" && (
        <div>
          {sessions.length===0 ? (
            <div style={{ textAlign:"center", padding:"48px 0", color:"var(--text3)", fontSize:13 }}>No sessions yet.</div>
          ) : selectedSession ? (
            <div>
              <button onClick={() => setSelectedSession(null)} className="btn btn-ghost" style={{ marginBottom:16 }}>← Back</button>
              <div style={{ fontSize:14, fontWeight:700, marginBottom:16 }}>{selectedSession}</div>
              <div style={{ maxWidth:520, margin:"0 auto" }}><GoalMap data={allShots.filter(s=>s.session_date===selectedSession)}/></div>
            </div>
          ) : sessions.map(date => {
            const d=allShots.filter(s=>s.session_date===date), m=d.reduce((a,s)=>a+s.makes,0), t=d.reduce((a,s)=>a+s.total,0);
            return (
              <div key={date} className="list-item" onClick={() => setSelectedSession(date)} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, marginBottom:2 }}>{date}</div>
                  <div style={{ fontSize:11, color:"var(--text3)" }}>{t} shots total</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontFamily:"var(--font-display)", fontSize:18, fontWeight:800, color:t>0&&m/t>=0.7?"var(--cyan)":t>0&&m/t>=0.4?"var(--gold)":"var(--red)" }}>{t>0?Math.round(m/t*100)+"%":"—"}</div>
                  <div style={{ fontSize:10, color:"var(--text3)" }}>{m}/{t}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── ALL TIME ── */}
      {subTab==="all_time" && (
        <div>
          {allShots.length===0 ? (
            <div style={{ textAlign:"center", padding:"48px 0", color:"var(--text3)", fontSize:13 }}>No shots logged yet.</div>
          ) : (
            <>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
                {["Right","Left"].map(f => {
                  const d=allShots.filter(s=>s.foot===f), m=d.reduce((a,s)=>a+s.makes,0), t=d.reduce((a,s)=>a+s.total,0);
                  const pct=t>0?Math.round(m/t*100):0;
                  const col=pct>=70?"var(--cyan)":pct>=40?"var(--gold)":"var(--red)";
                  return (
                    <div key={f} className="stat-card" style={{ borderTop:`2px solid ${col}` }}>
                      <div className="stat-value" style={{ color:col, fontSize:28 }}>{t>0?pct+"%":"—"}</div>
                      <div className="stat-label">{f} Foot</div>
                      <div style={{ fontSize:11, color:"var(--text3)", marginTop:4 }}>{m}/{t} shots</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ maxWidth:520, margin:"0 auto" }}><GoalMap data={allShots}/></div>
              <div style={{ maxWidth:520, margin:"0 auto" }}><AccuracyGraph data={allShots}/></div>
            </>
          )}
        </div>
      )}
    </div>
  );
}