import React, { useState, useEffect, useRef, useCallback } from 'react'
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
  const mainRef = useRef(null)
  const scrollAccum = useRef(0)
  const scrollTimer = useRef(null)
  const scrollCooldown = useRef(false)

  if (!s) return <LoginScreen />

  const pendingHw = s.assignments.filter((a) => a.status !== "done").length
  const newWords = s.words.filter((w) => w.status === "new").length

  const isFullBleed = route === "homework-runner"
  const sections = ["home", "dictionary", "homework", "materials"]

  const handleWheel = useCallback((e) => {
    if (isFullBleed || scrollCooldown.current) return
    const container = mainRef.current?.querySelector('[data-scroll-inner]')
    if (!container) return

    const { scrollTop, scrollHeight, clientHeight } = container
    const currentIdx = sections.indexOf(route)
    if (currentIdx === -1) return

    const atTop = scrollTop <= 2
    const atBottom = scrollTop + clientHeight >= scrollHeight - 2

    if (!atTop && !atBottom) {
      scrollAccum.current = 0
      return
    }

    scrollAccum.current += e.deltaY

    clearTimeout(scrollTimer.current)
    scrollTimer.current = setTimeout(() => { scrollAccum.current = 0 }, 800)

    if (scrollAccum.current > 300 && atBottom && currentIdx < sections.length - 1) {
      scrollAccum.current = 0
      scrollCooldown.current = true
      setTimeout(() => { scrollCooldown.current = false }, 1200)
      setRoute(sections[currentIdx + 1])
    } else if (scrollAccum.current < -300 && atTop && currentIdx > 0) {
      scrollAccum.current = 0
      scrollCooldown.current = true
      setTimeout(() => { scrollCooldown.current = false }, 1200)
      setRoute(sections[currentIdx - 1])
    }
  }, [route, isFullBleed])

  if (isFullBleed) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "76px 1fr", height: "100vh", width: "100vw", background: "var(--bg-window)", color: "var(--ink-1)" }}>
        <Sidebar route="homework" setRoute={setRoute} initials={s.student.initials} badges={{ dictionary: newWords > 0, homework: pendingHw > 0 }} onLogout={() => actions.logout()} onAvatarClick={() => setShowProfile(!showProfile)} showProfileActive={showProfile} />
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
    <div style={{ display: "grid", gridTemplateColumns: "76px 1fr", height: "100vh", width: "100vw", background: "var(--bg-window)", color: "var(--ink-1)" }}>
      <div style={{ position: "relative", display: "flex" }}>
        <Sidebar route={route} setRoute={setRoute} initials={s.student.initials} badges={{ dictionary: newWords > 0, homework: pendingHw > 0 }} onLogout={() => actions.logout()} onAvatarClick={() => setShowProfile(!showProfile)} showProfileActive={showProfile} />

        {/* Profile panel — slides out from left, overlays content */}
        {showProfile && (
          <div style={{ position: "absolute", top: 0, left: 76, bottom: 0, width: 332, zIndex: 100, background: "var(--bg-window)", borderRight: "0.5px solid var(--line)", boxShadow: "4px 0 24px rgba(0,0,0,.08)", animation: "fadeIn .2s ease" }}>
            <RightRail setRoute={setRoute} />
          </div>
        )}
      </div>

      <main ref={mainRef} onWheel={handleWheel} style={{ overflow: "hidden", background: "var(--bg-window)", position: "relative" }}>
        <div data-scroll-inner style={{ height: "100%", overflowY: "auto" }}>{screens[route] || screens.home}</div>
      </main>
    </div>
  )
}
