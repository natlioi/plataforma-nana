import React, { useState, useEffect, useRef } from 'react'
import { useSession, useStore, actions } from './store'
import { Sidebar, RightRail } from './components/chrome'
import { HomeScreen, DictionaryScreen, HomeworkScreen, MaterialsScreen, FlashcardsScreen, CalendarScreen } from './screens/student'
import { AdminApp } from './screens/admin'
import { HomeworkRunner } from './screens/homework-runner'
import { LoginScreen } from './screens/login'

export default function App() {
  const session = useSession()

  useEffect(() => {
    if (session.userId && !session.profile) {
      actions.logout()
    }
  }, [session.userId, session.profile])

  if (!session.profile) return <LoginScreen />
  if (session.role === "admin") return <AdminApp />
  return <StudentApp />
}

function StudentApp() {
  const [route, setRoute] = useState("home")
  const [runnerTarget, setRunnerTarget] = useState(null)
  const [showProfile, setShowProfile] = useState(false)
  const s = useStore()
  const scrollRef = useRef(null)

  if (!s) return <LoginScreen />

  const pendingHw = s.assignments.filter((a) => a.status !== "done").length
  const newWords = s.words.filter((w) => w.status === "new").length

  const isFullBleed = route === "homework-runner"

  // Full-page scroll sections (only on main view, not homework-runner)
  const sections = ["home", "dictionary", "homework", "materials"]

  const handleWheel = (e) => {
    if (isFullBleed) return
    const container = scrollRef.current
    if (!container) return

    // Only snap if we're at a section boundary (top or bottom of current section)
    const { scrollTop, scrollHeight, clientHeight } = container
    const currentIdx = sections.indexOf(route)
    if (currentIdx === -1) return

    const atTop = scrollTop <= 5
    const atBottom = scrollTop + clientHeight >= scrollHeight - 5

    if (e.deltaY > 40 && atBottom && currentIdx < sections.length - 1) {
      e.preventDefault()
      setRoute(sections[currentIdx + 1])
    } else if (e.deltaY < -40 && atTop && currentIdx > 0) {
      e.preventDefault()
      setRoute(sections[currentIdx - 1])
    }
  }

  if (isFullBleed) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "76px 1fr", height: "100vh", width: "100vw", background: "var(--bg-window)", color: "var(--ink-1)" }}>
        <Sidebar route="homework" setRoute={setRoute} initials={s.student.initials} badges={{ dictionary: newWords > 0, homework: pendingHw > 0 }} onLogout={() => actions.logout()} onAvatarClick={() => setShowProfile(!showProfile)} />
        <main style={{ overflow: "hidden", background: "var(--bg-window)", position: "relative" }}>
          <div style={{ height: "100%", overflowY: "auto" }}>
            <HomeworkRunner homeworkId={runnerTarget} setRoute={setRoute} />
          </div>
        </main>
      </div>
    )
  }

  const screens = {
    home: <HomeScreen setRoute={setRoute} setRunnerTarget={setRunnerTarget} />,
    dictionary: <DictionaryScreen setRoute={setRoute} />,
    homework: <HomeworkScreen setRoute={setRoute} setRunnerTarget={setRunnerTarget} />,
    materials: <MaterialsScreen />,
    flashcards: <FlashcardsScreen setRoute={setRoute} />,
    calendar: <CalendarScreen />,
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: showProfile ? "76px 1fr 332px" : "76px 1fr", height: "100vh", width: "100vw", background: "var(--bg-window)", color: "var(--ink-1)", transition: "grid-template-columns .3s ease" }}>
      <Sidebar route={route} setRoute={setRoute} initials={s.student.initials} badges={{ dictionary: newWords > 0, homework: pendingHw > 0 }} onLogout={() => actions.logout()} onAvatarClick={() => setShowProfile(!showProfile)} showProfileActive={showProfile} />
      <main ref={scrollRef} onWheel={handleWheel} style={{ overflow: "hidden", background: "var(--bg-window)", position: "relative" }}>
        <div style={{ height: "100%", overflowY: "auto" }}>{screens[route] || screens.home}</div>
      </main>
      {showProfile && <RightRail setRoute={setRoute} />}
    </div>
  )
}
