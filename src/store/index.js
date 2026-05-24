import { useState, useEffect, useRef } from 'react'
import { supabase } from '../config/supabase'
import { seedState, dailyExpressions } from './seed'

export const NATALIA_ID = "u-natalia"
export const LAURA_ID = "u-laura"
export const PEDRO_ID = "u-pedro"
export const MARINA_ID = "u-marina"

const uid = (prefix = "id") => `${prefix}-${Math.random().toString(36).slice(2, 9)}`

// ����─ In-memory state + subscriber pattern ────────────────────
let state = structuredClone(seedState)
let initialized = false

const subscribers = new Set()
function notify() { subscribers.forEach((fn) => fn()) }

function _subscribe() {
  const [, setTick] = useState(0)
  useEffect(() => {
    const fn = () => setTick((t) => t + 1)
    subscribers.add(fn)
    return () => subscribers.delete(fn)
  }, [])
}

// ─── Session (localStorage only �� Supabase Auth is Phase 3) ──
const SESSION_KEY = "pn:session"
function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : { userId: null, role: null }
  } catch { return { userId: null, role: null } }
}
function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

state.session = loadSession()

// ─── Supabase data loading ───────────────────────────────────
async function loadFromSupabase() {
  const [
    { data: profiles },
    { data: studentMeta },
    { data: words },
    { data: homework },
    { data: materials },
    { data: classes },
    { data: reviews },
  ] = await Promise.all([
    supabase.from('profiles').select('*'),
    supabase.from('student_meta').select('*'),
    supabase.from('words').select('*'),
    supabase.from('homework').select('*'),
    supabase.from('materials').select('*'),
    supabase.from('classes').select('*'),
    supabase.from('flashcard_reviews').select('*'),
  ])

  const metaMap = {}
  for (const m of (studentMeta || [])) {
    metaMap[m.profile_id] = {
      cohort: m.cohort || '',
      paymentStatus: m.payment_status || 'active',
      isActive: m.is_active !== false,
      notes: m.notes || '',
      targetLang: m.target_lang || 'English',
      teacher: m.teacher || 'Natália',
      level: m.level || 'A1',
      pct: m.pct || 0,
      xp: m.xp || 0,
      xpToday: m.xp_today || 0,
      focusForNextClass: m.focus_for_next_class || '',
      dailyUnlockedDate: m.daily_unlocked_date || null,
      dailyJustUnlocked: m.daily_just_unlocked || false,
    }
  }

  const reviewsMap = {}
  for (const r of (reviews || [])) {
    reviewsMap[r.word_id] = { correct: r.correct, wrong: r.wrong, lastSeen: r.last_seen }
  }

  state = {
    session: state.session,
    profiles: (profiles || []).map(p => ({
      id: p.id, role: p.role, name: p.name, email: p.email,
      initials: p.initials, avatarTone: p.avatar_tone, createdAt: p.created_at,
    })),
    studentMeta: metaMap,
    words: (words || []).map(w => ({
      id: w.id, owner_id: w.owner_id, w: w.word, pos: w.pos,
      nat: w.native_def, tgt: w.target_def, ex: w.example,
      status: w.status, level: w.level, flag: w.flag, cls: w.class_label,
    })),
    homework: (homework || []).map(h => ({
      id: h.id, student_id: h.student_id, created_by: h.created_by,
      title: h.title, brief: h.brief || '',
      pdf_data_url: h.pdf_path || null, pdf_name: h.pdf_name || null,
      fields: h.fields || [], status: h.status,
      due_at: h.due_at, minutes: h.minutes,
      grade: h.grade, feedback: h.feedback,
      submitted_at: h.submitted_at, graded_at: h.graded_at,
      answers: h.answers || {}, comments: h.comments || [],
      created_at: h.created_at,
    })),
    materials: (materials || []).map(m => ({
      id: m.id, uploaded_by: m.uploaded_by, scope: m.scope,
      student_id: m.student_id, kind: m.kind, title: m.title,
      unit: m.unit || '', size_label: m.size_label || '',
      tone: m.tone || 'lavender', icon: m.icon || 'paper',
      file_data_url: m.file_path || null, file_name: m.file_name || null,
      external_url: m.external_url || null, fav_by: m.fav_by || [],
      created_at: m.created_at,
    })),
    classes: (classes || []).map(c => ({
      id: c.id, owner_id: c.owner_id, title: c.title,
      date: c.date, time: c.time, duration: c.duration,
      focus: c.focus || '', status: c.status, meetUrl: c.meet_url,
    })),
    reviews: reviewsMap,
  }

  initialized = true
  notify()
}

// Kick off load immediately
loadFromSupabase()

// ─── Helpers ────────────────────────────────────────────────
export function profileById(id) { return state.profiles.find((p) => p.id === id) }
export function currentUser() { return state.session.userId ? profileById(state.session.userId) : null }

function studentViewFor(userId) {
  const profile = profileById(userId)
  const meta = state.studentMeta[userId] || {}
  if (!profile) return null

  const assignments = state.homework
    .filter((h) => h.student_id === userId)
    .map((h) => ({
      id: h.id, type: "PDF + answers", icon: "quote", title: h.title,
      cls: h.created_by === NATALIA_ID ? "From Natália" : "Assigned",
      due: h.due_at ? new Date(h.due_at + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "—",
      minutes: h.minutes,
      status: h.status === "assigned" ? "pending"
            : h.status === "in_progress" ? "in-progress"
            : h.status === "submitted" ? "submitted"
            : h.status === "graded" ? "done" : "pending",
      progress: h.status === "graded" || h.status === "submitted" ? 1
              : Object.keys(h.answers || {}).length / Math.max(1, h.fields.length),
      brief: h.brief, draft: "", feedback: h.feedback, grade: h.grade, _raw: h,
    }))

  return {
    profile,
    student: {
      name: profile.name, initials: profile.initials, avatarTone: profile.avatarTone,
      email: profile.email, targetLang: meta.targetLang || "English",
      teacher: meta.teacher || "Natália", level: meta.level || "A1",
      pct: meta.pct || 0, xp: meta.xp || 0, xpToday: meta.xpToday || 0,
      focusForNextClass: meta.focusForNextClass || "",
      dailyUnlockedDate: meta.dailyUnlockedDate,
      dailyJustUnlocked: meta.dailyJustUnlocked,
      notes: meta.notes || "", cohort: meta.cohort || "",
      paymentStatus: meta.paymentStatus || "active",
      isActive: meta.isActive !== false,
    },
    words: state.words.filter((w) => w.owner_id === userId),
    assignments,
    materials: state.materials
      .filter((m) => m.scope === "global" || m.student_id === userId)
      .map((m) => ({
        id: m.id, kind: m.kind, title: m.title, unit: m.unit,
        size: m.size_label, tone: m.tone, icon: m.icon,
        fav: (m.fav_by || []).includes(userId),
        file_data_url: m.file_data_url, file_name: m.file_name,
        external_url: m.external_url,
      })),
    classes: state.classes.filter((c) => c.owner_id === userId),
    reviews: state.reviews,
  }
}

function adminView() {
  const studentsList = state.profiles
    .filter((p) => p.role === "student")
    .map((p) => {
      const meta = state.studentMeta[p.id] || {}
      const myHw = state.homework.filter((h) => h.student_id === p.id)
      const pending = myHw.filter((h) => h.status === "assigned" || h.status === "in_progress")
      const toGrade = myHw.filter((h) => h.status === "submitted")
      const latest = [...myHw].sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""))[0]
      return { ...p, ...meta, pendingCount: pending.length, toGradeCount: toGrade.length, totalCount: myHw.length, latestHomework: latest || null }
    })
  return { students: studentsList, homework: state.homework, materials: state.materials, profiles: state.profiles }
}

// ─── Actions (optimistic update + async Supabase write) ─────
export const actions = {
  login(userId) {
    const p = profileById(userId)
    if (!p) return false
    state = { ...state, session: { userId, role: p.role } }
    saveSession(state.session)
    notify()
    return true
  },
  logout() {
    state = { ...state, session: { userId: null, role: null } }
    saveSession(state.session)
    notify()
  },

  setWordStatus(wordId, newStatus) {
    state = { ...state, words: state.words.map((w) => (w.id === wordId ? { ...w, status: newStatus } : w)) }
    notify()
    supabase.from('words').update({ status: newStatus }).eq('id', wordId).then()
    if (newStatus === "mastered") actions.addXP(10)
  },

  addXP(amount) {
    const uid = state.session.userId
    if (!uid) return
    const meta = state.studentMeta[uid] || {}
    const newXp = (meta.xp || 0) + amount
    const newXpToday = (meta.xpToday || 0) + amount
    state = { ...state, studentMeta: { ...state.studentMeta, [uid]: { ...meta, xp: newXp, xpToday: newXpToday } } }
    notify()
    supabase.from('student_meta').update({ xp: newXp, xp_today: newXpToday }).eq('profile_id', uid).then()
  },

  setClassFocus(classId, focus) {
    state = { ...state, classes: state.classes.map((c) => (c.id === classId ? { ...c, focus } : c)) }
    notify()
    supabase.from('classes').update({ focus }).eq('id', classId).then()
  },

  toggleFavorite(materialId) {
    const uid = state.session.userId
    if (!uid) return
    state = {
      ...state,
      materials: state.materials.map((m) => {
        if (m.id !== materialId) return m
        const favBy = m.fav_by || []
        return { ...m, fav_by: favBy.includes(uid) ? favBy.filter((x) => x !== uid) : [...favBy, uid] }
      }),
    }
    notify()
    const mat = state.materials.find(m => m.id === materialId)
    if (mat) supabase.from('materials').update({ fav_by: mat.fav_by }).eq('id', materialId).then()
  },

  recordReview(wordId, correct) {
    const prev = state.reviews[wordId] || { correct: 0, wrong: 0, lastSeen: null }
    const updated = {
      correct: prev.correct + (correct ? 1 : 0),
      wrong: prev.wrong + (correct ? 0 : 1),
      lastSeen: new Date().toISOString(),
    }
    state = { ...state, reviews: { ...state.reviews, [wordId]: updated } }
    notify()
    supabase.from('flashcard_reviews').upsert({ word_id: wordId, correct: updated.correct, wrong: updated.wrong, last_seen: updated.lastSeen }).then()
    if (correct) actions.addXP(5)
  },

  dismissDailyCelebration() {
    const uid = state.session.userId
    if (!uid) return
    const meta = state.studentMeta[uid] || {}
    state = { ...state, studentMeta: { ...state.studentMeta, [uid]: { ...meta, dailyJustUnlocked: false } } }
    notify()
    supabase.from('student_meta').update({ daily_just_unlocked: false }).eq('profile_id', uid).then()
  },

  getDailyExpression() {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
    return dailyExpressions[dayOfYear % dailyExpressions.length]
  },

  saveAnswer(homeworkId, fieldId, value) {
    state = {
      ...state,
      homework: state.homework.map((h) => {
        if (h.id !== homeworkId) return h
        const answers = { ...(h.answers || {}), [fieldId]: value }
        const wasAssigned = h.status === "assigned"
        return { ...h, answers, status: wasAssigned ? "in_progress" : h.status }
      }),
    }
    notify()
    const hw = state.homework.find(h => h.id === homeworkId)
    if (hw) supabase.from('homework').update({ answers: hw.answers, status: hw.status }).eq('id', homeworkId).then()
  },

  submitHomework(homeworkId) {
    const now = new Date().toISOString()
    state = { ...state, homework: state.homework.map((h) => h.id === homeworkId ? { ...h, status: "submitted", submitted_at: now } : h) }
    notify()
    supabase.from('homework').update({ status: 'submitted', submitted_at: now }).eq('id', homeworkId).then()

    const uid = state.session.userId
    if (uid) {
      const todayDate = new Date().toISOString().slice(0, 10)
      const meta = state.studentMeta[uid] || {}
      const wasUnlocked = meta.dailyUnlockedDate === todayDate
      state = { ...state, studentMeta: { ...state.studentMeta, [uid]: { ...meta, dailyUnlockedDate: todayDate, dailyJustUnlocked: !wasUnlocked } } }
      notify()
      supabase.from('student_meta').update({ daily_unlocked_date: todayDate, daily_just_unlocked: !wasUnlocked }).eq('profile_id', uid).then()
      actions.addXP(40)
    }
  },

  createStudent({ name, email, level = "A1", cohort = "" }) {
    const id = uid("u")
    const initials = name.split(/\s+/).map((s) => s[0]).slice(0, 2).join("").toUpperCase() || "ST"
    const tones = ["mint", "sky", "lavender", "peach", "clay", "rose", "butter"]
    const avatarTone = tones[Math.floor(Math.random() * tones.length)]
    const profile = { id, role: "student", name, email, initials, avatarTone, createdAt: new Date().toISOString() }
    const meta = { cohort, paymentStatus: "active", isActive: true, notes: "", targetLang: "English", teacher: "Natália", level, pct: 0, xp: 0, xpToday: 0, focusForNextClass: "", dailyUnlockedDate: null, dailyJustUnlocked: false }

    state = { ...state, profiles: [...state.profiles, profile], studentMeta: { ...state.studentMeta, [id]: meta } }
    notify()

    supabase.from('profiles').insert({ id, role: 'student', name, email, initials, avatar_tone: avatarTone }).then()
    supabase.from('student_meta').insert({ profile_id: id, cohort, payment_status: 'active', is_active: true, target_lang: 'English', teacher: 'Natália', level }).then()
    return id
  },

  updateStudent(studentId, patch) {
    state = {
      ...state,
      profiles: state.profiles.map((p) => (p.id === studentId ? { ...p, ...patch } : p)),
      studentMeta: { ...state.studentMeta, [studentId]: { ...(state.studentMeta[studentId] || {}), ...patch } },
    }
    notify()
    const dbPatch = {}
    if (patch.name) dbPatch.name = patch.name
    if (patch.email) dbPatch.email = patch.email
    if (Object.keys(dbPatch).length) supabase.from('profiles').update(dbPatch).eq('id', studentId).then()
    const metaPatch = {}
    if (patch.notes !== undefined) metaPatch.notes = patch.notes
    if (patch.level) metaPatch.level = patch.level
    if (patch.cohort !== undefined) metaPatch.cohort = patch.cohort
    if (patch.pct !== undefined) metaPatch.pct = patch.pct
    if (patch.focusForNextClass !== undefined) metaPatch.focus_for_next_class = patch.focusForNextClass
    if (Object.keys(metaPatch).length) supabase.from('student_meta').update(metaPatch).eq('profile_id', studentId).then()
  },

  setPaymentStatus(studentId, paymentStatus) {
    const meta = state.studentMeta[studentId] || {}
    state = { ...state, studentMeta: { ...state.studentMeta, [studentId]: { ...meta, paymentStatus } } }
    notify()
    supabase.from('student_meta').update({ payment_status: paymentStatus }).eq('profile_id', studentId).then()
  },

  toggleActive(studentId) {
    const meta = state.studentMeta[studentId] || {}
    const isActive = !meta.isActive
    state = { ...state, studentMeta: { ...state.studentMeta, [studentId]: { ...meta, isActive } } }
    notify()
    supabase.from('student_meta').update({ is_active: isActive }).eq('profile_id', studentId).then()
  },

  deleteStudent(studentId) {
    state = {
      ...state,
      profiles: state.profiles.filter((p) => p.id !== studentId),
      studentMeta: Object.fromEntries(Object.entries(state.studentMeta).filter(([k]) => k !== studentId)),
      words: state.words.filter((w) => w.owner_id !== studentId),
      homework: state.homework.filter((h) => h.student_id !== studentId),
      classes: state.classes.filter((c) => c.owner_id !== studentId),
      materials: state.materials.filter((m) => m.student_id !== studentId),
    }
    notify()
    supabase.from('profiles').delete().eq('id', studentId).then()
  },

  createHomework({ studentId, title, brief, pdf_data_url, pdf_name, fields, due_at, minutes }) {
    const id = uid("hw")
    const me = state.session.userId || NATALIA_ID
    const hw = {
      id, student_id: studentId, created_by: me, title, brief: brief || "",
      pdf_data_url: pdf_data_url || null, pdf_name: pdf_name || null,
      fields: fields && fields.length ? fields : [{ id: uid("f"), label: "Your answer", type: "textarea" }],
      status: "assigned", due_at: due_at || null, minutes: minutes || 15,
      grade: null, feedback: null, submitted_at: null, graded_at: null,
      answers: {}, comments: [], created_at: new Date().toISOString(),
    }
    state = { ...state, homework: [...state.homework, hw] }
    notify()
    supabase.from('homework').insert({
      id, student_id: studentId, created_by: me, title, brief: hw.brief,
      pdf_path: hw.pdf_data_url, pdf_name: hw.pdf_name, fields: hw.fields,
      status: 'assigned', due_at: hw.due_at, minutes: hw.minutes,
    }).then()
    return id
  },

  updateHomework(homeworkId, patch) {
    state = { ...state, homework: state.homework.map((h) => (h.id === homeworkId ? { ...h, ...patch } : h)) }
    notify()
    const dbPatch = {}
    if (patch.title) dbPatch.title = patch.title
    if (patch.brief !== undefined) dbPatch.brief = patch.brief
    if (patch.fields) dbPatch.fields = patch.fields
    if (patch.due_at !== undefined) dbPatch.due_at = patch.due_at
    if (patch.minutes !== undefined) dbPatch.minutes = patch.minutes
    if (Object.keys(dbPatch).length) supabase.from('homework').update(dbPatch).eq('id', homeworkId).then()
  },

  deleteHomework(homeworkId) {
    state = { ...state, homework: state.homework.filter((h) => h.id !== homeworkId) }
    notify()
    supabase.from('homework').delete().eq('id', homeworkId).then()
  },

  addHomeworkComment(homeworkId, fieldId, body) {
    const me = state.session.userId || NATALIA_ID
    const comment = { id: uid("cm"), field_id: fieldId, author_id: me, body, created_at: new Date().toISOString() }
    state = {
      ...state,
      homework: state.homework.map((h) => h.id === homeworkId ? { ...h, comments: [...(h.comments || []), comment] } : h),
    }
    notify()
    const hw = state.homework.find(h => h.id === homeworkId)
    if (hw) supabase.from('homework').update({ comments: hw.comments }).eq('id', homeworkId).then()
  },

  deleteHomeworkComment(homeworkId, commentId) {
    state = {
      ...state,
      homework: state.homework.map((h) => h.id === homeworkId ? { ...h, comments: (h.comments || []).filter((c) => c.id !== commentId) } : h),
    }
    notify()
    const hw = state.homework.find(h => h.id === homeworkId)
    if (hw) supabase.from('homework').update({ comments: hw.comments }).eq('id', homeworkId).then()
  },

  gradeHomework(homeworkId, { grade, feedback }) {
    const now = new Date().toISOString()
    state = {
      ...state,
      homework: state.homework.map((h) => h.id === homeworkId ? { ...h, grade, feedback, status: "graded", graded_at: now } : h),
    }
    notify()
    supabase.from('homework').update({ grade, feedback, status: 'graded', graded_at: now }).eq('id', homeworkId).then()
  },

  uploadMaterial({ kind, title, unit, size_label, tone = "lavender", icon = "paper", file_data_url, file_name, external_url, scope = "global", studentId = null }) {
    const id = uid("m")
    const me = state.session.userId || NATALIA_ID
    const mat = { id, uploaded_by: me, scope, student_id: studentId, kind, title, unit: unit || "", size_label: size_label || "", tone, icon, file_data_url: file_data_url || null, file_name: file_name || null, external_url: external_url || null, fav_by: [], created_at: new Date().toISOString() }
    state = { ...state, materials: [...state.materials, mat] }
    notify()
    supabase.from('materials').insert({
      id, uploaded_by: me, scope, student_id: studentId, kind, title,
      unit: mat.unit, size_label: mat.size_label, tone, icon,
      file_path: mat.file_data_url, file_name: mat.file_name,
      external_url: mat.external_url,
    }).then()
    return id
  },

  deleteMaterial(materialId) {
    state = { ...state, materials: state.materials.filter((m) => m.id !== materialId) }
    notify()
    supabase.from('materials').delete().eq('id', materialId).then()
  },

  resetAll() {
    state = { ...structuredClone(seedState), session: state.session }
    notify()
  },
}

// ─── Hooks ──────────────────────────────────────────────────
export function useStore() {
  _subscribe()
  if (!state.session.userId) return null
  if (state.session.role === "student") return studentViewFor(state.session.userId)
  if (state.session.role === "admin") return { profile: profileById(state.session.userId) }
  return null
}

export function useAdminStore() {
  _subscribe()
  return adminView()
}

export function useSession() {
  _subscribe()
  return {
    userId: state.session.userId,
    role: state.session.role,
    profile: state.session.userId ? profileById(state.session.userId) : null,
    profiles: state.profiles,
  }
}

export function useStudentViewFor(studentId) {
  _subscribe()
  return studentViewFor(studentId)
}

export function getState() { return state }
