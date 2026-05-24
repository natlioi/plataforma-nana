import React from 'react'
import { useSession, actions } from '../store'
import { Icon, Avatar } from '../components/chrome'

export const LoginScreen = () => {
  const { profiles } = useSession()
  const admins = profiles.filter((p) => p.role === "admin")
  const students = profiles.filter((p) => p.role === "student")

  const enter = (id) => actions.login(id)

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-app)", display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
      <div style={{ width: "100%", maxWidth: 720, display: "flex", flexDirection: "column", gap: 36 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--c-lavender)", color: "var(--c-lavender-ink)", display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 36 }}>n</div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 36, lineHeight: 1.1, color: "var(--ink-1)", paddingBottom: 2 }}>Plataforma <i style={{ color: "var(--c-rose-ink)" }}>Nana</i></div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: 0.08, color: "var(--ink-3)", textTransform: "uppercase", marginTop: 4 }}>English coaching · with Natália</div>
          </div>
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: 0.08, color: "var(--ink-3)", textTransform: "uppercase", marginBottom: 10 }}>Demo · pick who you are</div>
          <p style={{ fontSize: 14, color: "var(--ink-3)", margin: 0, lineHeight: 1.55, maxWidth: 480 }}>Real email/password sign-in is on the roadmap. For now, click a profile to enter the platform with that role.</p>
        </div>
        {admins.map((a) => <ProfileCard key={a.id} profile={a} tone="peach" eyebrow="Administrator" onClick={() => enter(a.id)} />)}
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: 0.08, color: "var(--ink-3)", textTransform: "uppercase", marginBottom: 14 }}>Students</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
            {students.map((s) => <StudentMini key={s.id} profile={s} onClick={() => enter(s.id)} />)}
          </div>
        </div>
      </div>
    </div>
  )
}

const ProfileCard = ({ profile, tone, eyebrow, onClick }) => (
  <button onClick={onClick} style={{ appearance: "none", border: 0, cursor: "pointer", textAlign: "left", background: `var(--c-${tone})`, color: `var(--c-${tone}-ink)`, borderRadius: "var(--r-lg)", padding: "26px 28px", display: "flex", alignItems: "center", gap: 18, transition: "transform .15s ease, box-shadow .15s ease" }}
    onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
    onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}>
    <Avatar name={profile.initials} size={56} tone={profile.avatarTone || tone} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 0.08, textTransform: "uppercase", opacity: 0.7 }}>{eyebrow}</div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 28, lineHeight: 1.2, marginTop: 6, paddingBottom: 2 }}>Enter as <i>{profile.name.split(" ")[0]}</i></div>
      <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>{profile.email}</div>
    </div>
    <Icon name="arrowR" size={20} />
  </button>
)

const StudentMini = ({ profile, onClick }) => (
  <button onClick={onClick} style={{ appearance: "none", border: "0.5px solid var(--line)", cursor: "pointer", textAlign: "left", background: "var(--bg-elevated)", color: "var(--ink-1)", borderRadius: "var(--r-md)", padding: "18px 20px", display: "flex", alignItems: "center", gap: 14, transition: "transform .15s ease, background .15s ease" }}
    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-app)"; e.currentTarget.style.transform = "translateY(-1px)" }}
    onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-elevated)"; e.currentTarget.style.transform = "translateY(0)" }}>
    <Avatar name={profile.initials} size={40} tone={profile.avatarTone || "lavender"} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 18, lineHeight: 1.2, paddingBottom: 2 }}>{profile.name}</div>
      <div style={{ fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--font-mono)", letterSpacing: 0.04, marginTop: 4 }}>{profile.email}</div>
    </div>
  </button>
)
