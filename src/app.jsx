import React, { useState, useEffect } from 'react'
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
  const s = useStore()

  if (!s) return <LoginScreen />

  const pendingHw = s.assignments.filter((a) => a.status !== "done").length
  const newWords = s.words.filter((w) => w.status === "new").length

  const screens = {
    home: <HomeScreen setRoute={setRoute} />,
    dictionary: <DictionaryScreen setRoute={setRoute} />,
    homework: <HomeworkScreen setRoute={setRoute} setRunnerTarget={setRunnerTarget} />,
    "homework-runner": <HomeworkRunner homeworkId={runnerTarget} setRoute={setRoute} />,
    materials: <MaterialsScreen />,
    flashcards: <FlashcardsScreen setRoute={setRoute} />,
    calendar: <CalendarScreen />,
  }

  const isFullBleed = route === "homework-runner"

  if (isFullBleed) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "76px 1fr", height: "100vh", width: "100vw", background: "var(--bg-window)", color: "var(--ink-1)" }}>
        <Sidebar route="homework" setRoute={setRoute} initials={s.student.initials} badges={{ dictionary: newWords > 0, homework: pendingHw > 0 }} onLogout={() => actions.logout()} />
        <main style={{ overflow: "hidden", background: "var(--bg-window)", position: "relative" }}>
          <div style={{ height: "100%", overflowY: "auto" }}>{screens[route]}</div>
        </main>
      </div>
    )
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "76px 1fr 332px", height: "100vh", width: "100vw", background: "var(--bg-window)", color: "var(--ink-1)" }}>
      <Sidebar route={route} setRoute={setRoute} initials={s.student.initials} badges={{ dictionary: newWords > 0, homework: pendingHw > 0 }} onLogout={() => actions.logout()} />
      <main style={{ overflow: "hidden", background: "var(--bg-window)", position: "relative" }}>
        <div style={{ height: "100%", overflowY: "auto" }}>{screens[route] || screens.home}</div>
      </main>
      <RightRail setRoute={setRoute} />
    </div>
  )
}
