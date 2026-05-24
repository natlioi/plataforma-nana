import React from 'react'
import { useStore, actions } from '../store'

export const Icon = ({ name, size = 18, stroke = 1.6 }) => {
  const paths = {
    home: <><path d="M3 11.5 12 4l9 7.5" /><path d="M5 10v9h14v-9" /></>,
    book: <><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" /><path d="M5 17a3 3 0 0 1 3-3h11" /></>,
    pencil: <><path d="M4 20h4l11-11-4-4L4 16z" /><path d="m14 6 4 4" /></>,
    folder: <><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></>,
    spark: <><path d="M12 3v6m0 6v6M3 12h6m6 0h6" /><path d="m6 6 3 3m6 6 3 3M6 18l3-3m6-6 3-3" /></>,
    cal: <><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M3.5 10h17M8 3v4m8-4v4" /></>,
    cog: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></>,
    bell: <><path d="M6 8a6 6 0 1 1 12 0c0 3 1 5 2 6H4c1-1 2-3 2-6z" /><path d="M10 19a2 2 0 0 0 4 0" /></>,
    search: <><circle cx="11" cy="11" r="6" /><path d="m20 20-3.5-3.5" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    arrowR: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    arrowL: <><path d="M19 12H5M11 6l-6 6 6 6" /></>,
    check: <><path d="m5 12 5 5L20 6" /></>,
    flame: <><path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4-1 3 1 4 2 4s-1-3 1-10z" /></>,
    play: <><path d="M7 5v14l12-7z" /></>,
    dot: <circle cx="12" cy="12" r="3" fill="currentColor" />,
    grid: <><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></>,
    sliders: <><path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h12M18 18h2" /><circle cx="16" cy="6" r="2" /><circle cx="8" cy="12" r="2" /><circle cx="14" cy="18" r="2" /></>,
    headset: <><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><path d="M4 14a2 2 0 0 1 2-2h1v6H6a2 2 0 0 1-2-2zM20 14a2 2 0 0 0-2-2h-1v6h1a2 2 0 0 0 2-2z" /></>,
    paper: <><path d="M6 3h9l4 4v14H6z" /><path d="M15 3v4h4" /><path d="M9 12h7M9 16h7" /></>,
    link: <><path d="M10 14a4 4 0 0 0 5.6 0l2.8-2.8a4 4 0 1 0-5.6-5.6L11 7.4" /><path d="M14 10a4 4 0 0 0-5.6 0L5.6 12.8a4 4 0 1 0 5.6 5.6L13 16.6" /></>,
    quote: <><path d="M7 17v-4a4 4 0 0 1 4-4M14 17v-4a4 4 0 0 1 4-4" /></>,
    star: <><path d="m12 4 2.5 5.5L20 10l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z" /></>,
    bolt: <><path d="m13 3-9 12h7l-1 6 9-12h-7z" /></>,
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name] || null}
    </svg>
  )
}

export const Avatar = ({ name = "LM", size = 36, tone = "lavender" }) => (
  <div
    style={{
      width: size, height: size, borderRadius: "50%",
      background: `var(--c-${tone})`, color: `var(--c-${tone}-ink)`,
      display: "grid", placeItems: "center",
      fontFamily: "var(--font-display)", fontSize: size * 0.42,
      fontStyle: "italic", letterSpacing: 0, flexShrink: 0,
    }}
  >
    {name}
  </div>
)

export const NavBtn = ({ icon, active, dot, onClick, label }) => (
  <button
    onClick={onClick} title={label} aria-label={label}
    style={{
      position: "relative", width: 40, height: 40, borderRadius: "50%", border: 0,
      background: active ? "var(--ink-1)" : "transparent",
      color: active ? "var(--bg-elevated)" : "var(--ink-2)",
      display: "grid", placeItems: "center", cursor: "pointer",
      transition: "background .18s ease, color .18s ease",
    }}
    onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "var(--bg-sunken)" }}
    onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent" }}
  >
    <Icon name={icon} size={18} />
    {dot && (
      <span style={{ position: "absolute", top: 4, right: 4, width: 7, height: 7, borderRadius: "50%", background: "var(--c-rose-ink)", border: "1.5px solid var(--bg-window)" }} />
    )}
  </button>
)

export const Sidebar = ({ route, setRoute, badges, initials = "LM", onLogout }) => {
  const items = [
    { id: "home", icon: "home", label: "Home" },
    { id: "dictionary", icon: "book", label: "Dictionary" },
    { id: "homework", icon: "pencil", label: "Homework" },
    { id: "materials", icon: "folder", label: "Materials" },
  ]
  const secondary = [
    { id: "calendar", icon: "cal", label: "Calendar" },
    { id: "flashcards", icon: "spark", label: "Flashcards" },
  ]
  return (
    <aside style={{ width: 76, background: "var(--bg-window)", borderRight: "0.5px solid var(--line)", display: "flex", flexDirection: "column", alignItems: "center", padding: "22px 0 18px", gap: 8 }}>
      <button onClick={() => setRoute("home")} title="Home" style={{ width: 40, height: 40, display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 28, color: "var(--ink-1)", marginBottom: 14, background: "transparent", border: 0, cursor: "pointer" }}>n</button>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        {items.map((it) => <NavBtn key={it.id} icon={it.icon} label={it.label} active={route === it.id} dot={badges?.[it.id]} onClick={() => setRoute(it.id)} />)}
        <div style={{ height: 1, width: 24, background: "var(--line)", margin: "10px auto" }} />
        {secondary.map((it) => <NavBtn key={it.id} icon={it.icon} label={it.label} active={route === it.id} onClick={() => setRoute(it.id)} />)}
      </div>
      <NavBtn icon="cog" label="Sign out" onClick={onLogout} />
      <div style={{ marginTop: 6 }}><Avatar name={initials} size={36} tone="lavender" /></div>
    </aside>
  )
}

export const DailyReward = ({ pendingCount, doneToday, unlockedToday, justUnlocked, expression, onView, onGoHomework }) => {
  if (justUnlocked) {
    return (
      <div style={{ background: "var(--c-butter)", color: "var(--c-butter-ink)", borderRadius: "var(--r-lg)", padding: "var(--d-card-pad)", display: "flex", flexDirection: "column", gap: 14, animation: "fadeIn .25s ease" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Icon name="spark" size={16} /><span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 0.08, textTransform: "uppercase", opacity: 0.75 }}>Just unlocked</span></div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 28, lineHeight: 1.2, fontStyle: "italic", paddingBottom: 4 }}>{expression.term}</div>
        <div style={{ fontSize: 13, lineHeight: 1.5, opacity: 0.85 }}>{expression.meaning}</div>
        <div style={{ fontSize: 12, lineHeight: 1.5, opacity: 0.7 }}>{expression.note}</div>
        <button onClick={onView} style={{ appearance: "none", background: "var(--c-butter-ink)", color: "var(--c-butter)", border: 0, padding: "10px 16px", borderRadius: 999, fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 500, cursor: "pointer", alignSelf: "flex-start" }}>Got it</button>
      </div>
    )
  }
  if (unlockedToday) {
    return (
      <div style={{ background: "var(--bg-elevated)", borderRadius: "var(--r-lg)", padding: "var(--d-card-pad)", border: "0.5px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Icon name="spark" size={14} /><span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 0.08, textTransform: "uppercase", color: "var(--ink-4)" }}>Today's phrasal</span></div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 22, lineHeight: 1.25, fontStyle: "italic", color: "var(--ink-1)", paddingBottom: 2 }}>{expression.term}</div>
        <div style={{ fontSize: 12, lineHeight: 1.5, color: "var(--ink-3)" }}>{expression.meaning}</div>
        <div style={{ fontSize: 11, lineHeight: 1.5, color: "var(--ink-4)", fontStyle: "italic" }}>{expression.note}</div>
      </div>
    )
  }
  return (
    <div style={{ background: "var(--c-lavender)", color: "var(--c-lavender-ink)", borderRadius: "var(--r-lg)", padding: "var(--d-card-pad)", display: "flex", flexDirection: "column", gap: 12, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 14, right: 16, fontSize: 16, opacity: 0.45 }}>🔒</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Icon name="spark" size={14} /><span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 0.08, textTransform: "uppercase", opacity: 0.75 }}>Phrasal of the day</span></div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 22, lineHeight: 1.3, paddingBottom: 2 }}>Finish your <i>homework</i> to unlock today's expression.</div>
      <div style={{ fontSize: 12, lineHeight: 1.5, opacity: 0.8 }}>{pendingCount === 0 ? "Nothing pending — come back when Natália sends new work." : `${pendingCount} ${pendingCount === 1 ? "assignment" : "assignments"} pending`}</div>
      {pendingCount > 0 && (
        <button onClick={onGoHomework} style={{ appearance: "none", background: "var(--c-lavender-ink)", color: "var(--c-lavender)", border: 0, padding: "10px 16px", borderRadius: 999, fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 500, cursor: "pointer", alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 6 }}>Open homework <Icon name="arrowR" size={13} /></button>
      )}
    </div>
  )
}

const TodayClass = ({ nextClass, targetLang = "FR", level = "B1" }) => {
  const todayISO = new Date().toISOString().slice(0, 10)
  const isToday = nextClass && nextClass.date === todayISO
  const when = isToday ? "Today" : nextClass ? new Date(nextClass.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "—"
  const langCode = targetLang === "French" ? "FR" : "EN"
  return (
    <div style={{ background: "var(--c-mint)", color: "var(--c-mint-ink)", borderRadius: "var(--r-lg)", padding: "var(--d-card-pad)", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.08, opacity: 0.7 }}>Next class</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 26, lineHeight: 1.35, marginTop: 10, paddingBottom: 4, whiteSpace: "nowrap" }}>{when}, <i>{nextClass?.time || "—"}</i></div>
        </div>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 0.08, padding: "4px 8px", borderRadius: 999, background: "rgba(255,255,255,.5)", whiteSpace: "nowrap", flexShrink: 0, marginTop: 2 }}>{langCode} · {level}</span>
      </div>
      {nextClass?.focus ? (
        <div style={{ fontSize: 13, lineHeight: 1.55, marginTop: 4 }}>
          <span style={{ opacity: 0.65, fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 0.08, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Your focus</span>
          <i>"{nextClass.focus}"</i>
        </div>
      ) : (
        <div style={{ fontSize: 12, lineHeight: 1.55, opacity: 0.7, marginTop: 4 }}>No focus set yet — add one from the Calendar.</div>
      )}
      <button onClick={() => nextClass?.meetUrl && window.open(nextClass.meetUrl, "_blank")} disabled={!nextClass?.meetUrl} style={{ appearance: "none", background: "var(--c-mint-ink)", color: "var(--c-mint)", border: 0, padding: "10px 16px", borderRadius: 999, fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 500, cursor: nextClass?.meetUrl ? "pointer" : "not-allowed", opacity: nextClass?.meetUrl ? 1 : 0.5, display: "inline-flex", alignItems: "center", gap: 8, alignSelf: "flex-start", whiteSpace: "nowrap" }}>Join your class <Icon name="arrowR" size={14} /></button>
    </div>
  )
}

const StatPill = ({ label, value, hint, color = "var(--ink-3)" }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
    <span style={{ fontSize: 10, letterSpacing: 0.06, color: "var(--ink-4)", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>{label}</span>
    <span style={{ fontFamily: "var(--font-display)", fontSize: 28, lineHeight: 1.2, color: "var(--ink-1)", paddingBottom: 2 }}>{value}</span>
    {hint && <span style={{ fontSize: 11, color, marginTop: 4, whiteSpace: "nowrap" }}>{hint}</span>}
  </div>
)

export const CEFRBar = ({ level = "B1", pct = 64 }) => {
  const levels = ["A1", "A2", "B1", "B2", "C1", "C2"]
  const idx = levels.indexOf(level)
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10, gap: 8 }}>
        <span style={{ fontSize: 11, letterSpacing: 0.04, color: "var(--ink-4)", textTransform: "uppercase" }}>Level</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-3)", whiteSpace: "nowrap" }}>{pct}% → {levels[idx + 1] || "C2"}</span>
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {levels.map((l, i) => (
          <div key={l} style={{ flex: 1, height: 28, borderRadius: 6, background: i < idx ? "var(--ink-2)" : i === idx ? "var(--ink-1)" : "var(--bg-sunken)", color: i <= idx ? "var(--bg-elevated)" : "var(--ink-4)", display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 0.06, position: "relative" }}>
            {l}
            {i === idx && <div style={{ position: "absolute", left: 0, right: `${100 - pct}%`, bottom: -1, height: 2, background: "var(--c-peach-ink)" }} />}
          </div>
        ))}
      </div>
    </div>
  )
}

export const RightRail = ({ setRoute }) => {
  const s = useStore()
  if (!s || !s.student) return null
  const student = s.student
  const nextClass = s.classes.find((c) => c.status === "scheduled")
  const wordCount = s.words.filter((w) => w.status !== "hidden").length
  const wordsToReview = s.words.filter((w) => w.status === "new" || w.status === "learning").length
  const xp = student.xp.toLocaleString()
  const xpToday = student.xpToday || 0
  const today = new Date().toISOString().slice(0, 10)
  const pendingCount = s.assignments.filter((a) => a.status !== "done").length
  const unlockedToday = student.dailyUnlockedDate === today
  const justUnlocked = !!student.dailyJustUnlocked
  const expression = actions.getDailyExpression()

  return (
    <aside style={{ width: 332, background: "var(--bg-window)", borderLeft: "0.5px solid var(--line)", padding: "26px 22px", display: "flex", flexDirection: "column", gap: "var(--d-gap)", overflowY: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button style={{ border: 0, background: "transparent", padding: 8, marginLeft: -8, color: "var(--ink-3)", cursor: "pointer", display: "grid", placeItems: "center", borderRadius: 999 }} aria-label="Notifications"><Icon name="bell" size={18} /></button>
        <button onClick={() => { if (confirm("Reset all data back to seed?")) actions.resetAll() }} style={{ border: 0, background: "transparent", padding: 8, marginRight: -8, color: "var(--ink-3)", cursor: "pointer", display: "grid", placeItems: "center", borderRadius: 999 }} aria-label="Settings" title="Reset data"><Icon name="cog" size={18} /></button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginTop: -8 }}>
        <Avatar name={student.initials} size={72} tone="lavender" />
        <div style={{ textAlign: "center", width: "100%" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 24, lineHeight: 1.25, paddingBottom: 4, whiteSpace: "nowrap" }}>{student.name}</div>
          <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 8, fontFamily: "var(--font-mono)", letterSpacing: 0.04 }}>{student.targetLang} · with {student.teacher}</div>
        </div>
      </div>
      <CEFRBar level={student.level} pct={student.pct} />
      <TodayClass nextClass={nextClass} targetLang={student.targetLang} level={student.level} />
      <DailyReward pendingCount={pendingCount} unlockedToday={unlockedToday} justUnlocked={justUnlocked} expression={expression} onView={() => actions.dismissDailyCelebration()} onGoHomework={() => setRoute && setRoute("homework")} />
      <div style={{ background: "var(--bg-elevated)", borderRadius: "var(--r-lg)", padding: "var(--d-card-pad)", border: "0.5px solid var(--line)", display: "flex", gap: 20 }}>
        <StatPill label="XP" value={xp} hint={xpToday ? `+${xpToday} today` : "—"} color="var(--c-mint-ink)" />
        <div style={{ width: 1, background: "var(--line)" }} />
        <StatPill label="Words" value={wordCount} hint={`${wordsToReview} to review`} color="var(--c-peach-ink)" />
      </div>
    </aside>
  )
}
