const ZOOM_ROOM = "https://us02web.zoom.us/j/5167696677"
const NATALIA_ID = "u-natalia"
const LAURA_ID = "u-laura"
const PEDRO_ID = "u-pedro"
const MARINA_ID = "u-marina"

const isoOffset = (days) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}
const uid = (prefix = "id") => `${prefix}-${Math.random().toString(36).slice(2, 9)}`

const seedProfiles = [
  { id: NATALIA_ID, role: "admin", name: "Natália Lioi", email: "nat11.lioi10@gmail.com", initials: "NL", avatarTone: "peach", createdAt: isoOffset(-180) },
  { id: LAURA_ID, role: "student", name: "Laura Mendes", email: "laura@example.com", initials: "LM", avatarTone: "lavender", createdAt: isoOffset(-90) },
  { id: PEDRO_ID, role: "student", name: "Pedro Alves", email: "pedro@example.com", initials: "PA", avatarTone: "mint", createdAt: isoOffset(-45) },
  { id: MARINA_ID, role: "student", name: "Marina Costa", email: "marina@example.com", initials: "MC", avatarTone: "sky", createdAt: isoOffset(-120) },
]

const seedStudentMeta = {
  [LAURA_ID]: {
    cohort: "B1 · Wednesdays", paymentStatus: "active", isActive: true, notes: "",
    targetLang: "English", teacher: "Natália", level: "B1", pct: 64,
    xp: 2840, xpToday: 120, focusForNextClass: "present perfect — when to use it vs past simple",
    dailyUnlockedDate: null, dailyJustUnlocked: false,
  },
  [PEDRO_ID]: {
    cohort: "A2 · Tuesdays", paymentStatus: "overdue", isActive: true,
    notes: "Paused for one week in April.", targetLang: "English", teacher: "Natália",
    level: "A2", pct: 32, xp: 980, xpToday: 0, focusForNextClass: "",
    dailyUnlockedDate: null, dailyJustUnlocked: false,
  },
  [MARINA_ID]: {
    cohort: "B2 · Fridays", paymentStatus: "active", isActive: true,
    notes: "Preparing for IELTS in July.", targetLang: "English", teacher: "Natália",
    level: "B2", pct: 80, xp: 4120, xpToday: 60,
    focusForNextClass: "discursive writing — argument structure",
    dailyUnlockedDate: null, dailyJustUnlocked: false,
  },
}

const seedWords = [
  { id: uid("w"), owner_id: LAURA_ID, w: "to get by", pos: "phr. v.", nat: "se virar, dar um jeito", tgt: "to manage with what you have, especially in a difficult situation", ex: "My French isn't great, but I get by when I travel.", status: "new", level: "B1", cls: "Wednesday · daily routine role-play" },
  { id: uid("w"), owner_id: LAURA_ID, w: "daily routine", pos: "n. phr.", nat: "rotina diária, cotidiano", tgt: "the things you do every day at the same time", ex: "Tell me about your daily routine — what do you do first?", status: "new", level: "A2", cls: "Wednesday · daily routine role-play" },
  { id: uid("w"), owner_id: LAURA_ID, w: "eventually", pos: "adv.", nat: "no fim das contas, com o tempo (NÃO 'eventualmente')", tgt: "in the end, after some time", ex: "I struggled at first, but eventually I got the hang of it.", status: "learning", level: "B1", flag: "false friend", cls: "Wednesday · daily routine role-play" },
  { id: uid("w"), owner_id: LAURA_ID, w: "despite everything", pos: "phr.", nat: "apesar de tudo", tgt: "in spite of all the difficulties", ex: "It was a tough week, but despite everything, I'm happy.", status: "learning", level: "B1", cls: "Wednesday · daily routine role-play" },
  { id: uid("w"), owner_id: LAURA_ID, w: "to realise", pos: "v.", nat: "se dar conta, perceber", tgt: "to suddenly understand something", ex: "I realised I'd forgotten my keys halfway to work.", status: "new", level: "B1", cls: "Wednesday · daily routine role-play" },
  { id: uid("w"), owner_id: LAURA_ID, w: "to be honest", pos: "phr.", nat: "para falar a verdade", tgt: "used when giving an honest opinion", ex: "To be honest, I'm not sure yet.", status: "new", level: "A2", cls: "Wednesday · daily routine role-play" },
  { id: uid("w"), owner_id: LAURA_ID, w: "it's worth it", pos: "phr.", nat: "vale a pena", tgt: "the reward is greater than the effort or cost", ex: "The hike is long, but the view at the top is worth it.", status: "mastered", level: "B1", cls: "Monday · talking about the weekend" },
  { id: uid("w"), owner_id: LAURA_ID, w: "nonsense", pos: "n.", nat: "bobagem, besteira", tgt: "words or ideas that have no sense", ex: "Stop talking nonsense — that's not what happened.", status: "learning", level: "B1", cls: "Monday · talking about the weekend" },
  { id: uid("w"), owner_id: LAURA_ID, w: "to look forward to", pos: "phr. v.", nat: "estar ansioso para", tgt: "to feel excited about something that will happen", ex: "I'm really looking forward to the weekend.", status: "learning", level: "A2", cls: "Monday · talking about the weekend" },
  { id: uid("w"), owner_id: LAURA_ID, w: "by chance", pos: "phr.", nat: "por acaso", tgt: "without planning or expecting it", ex: "I ran into an old friend at the café by chance.", status: "mastered", level: "A2", cls: "Wednesday · travel & memory" },
  { id: uid("w"), owner_id: LAURA_ID, w: "to drift away", pos: "phr. v.", nat: "afastar-se, sair do assunto", tgt: "to move slowly away or go off-topic", ex: "We're drifting away from the main point.", status: "mastered", level: "B1", cls: "Wednesday · travel & memory" },
]

const seedHomework = [
  {
    id: uid("hw"), student_id: LAURA_ID, created_by: NATALIA_ID,
    title: "Present perfect vs past simple",
    brief: "Read the worksheet on the left, then answer all four questions on the right. Use full sentences.",
    pdf_data_url: null, pdf_name: null,
    fields: [
      { id: "q1", label: "1. Complete: 'I __________ in London for five years (and still live there).'", type: "text" },
      { id: "q2", label: "2. Complete: 'She __________ her keys yesterday.'", type: "text" },
      { id: "q3", label: "3. Complete: 'We __________ each other since 2018.'", type: "text" },
      { id: "q4", label: "4. In your own words, what's the difference between present perfect and past simple?", type: "textarea" },
    ],
    status: "assigned", due_at: isoOffset(3), minutes: 18,
    grade: null, feedback: null, submitted_at: null, graded_at: null,
    answers: {}, comments: [], created_at: isoOffset(-1),
  },
  {
    id: uid("hw"), student_id: LAURA_ID, created_by: NATALIA_ID,
    title: "Recap of last weekend",
    brief: "Write a 120-word paragraph about your weekend in the past simple.",
    pdf_data_url: null, pdf_name: null,
    fields: [{ id: "story", label: "Your paragraph", type: "textarea" }],
    status: "graded", due_at: isoOffset(-4), minutes: 22,
    grade: 8.5, feedback: "Nice work! Watch the simple past / present perfect switch in §2 — we'll review next class.",
    submitted_at: isoOffset(-5), graded_at: isoOffset(-4),
    answers: { story: "Last weekend I went to the park with my sister. We walked for about an hour, then we had lunch at a small café near the lake. The weather was great, and we have taken many pictures together." },
    comments: [{ id: uid("cm"), field_id: "story", author_id: NATALIA_ID, body: "'we have taken' → 'we took' — keep it in past simple here.", created_at: isoOffset(-4) }],
    created_at: isoOffset(-7),
  },
  {
    id: uid("hw"), student_id: PEDRO_ID, created_by: NATALIA_ID,
    title: "Daily routine vocabulary",
    brief: "Match the activities with the right time of day.",
    pdf_data_url: null, pdf_name: null,
    fields: [
      { id: "morning", label: "Two things you do in the morning", type: "text" },
      { id: "evening", label: "Two things you do in the evening", type: "text" },
    ],
    status: "assigned", due_at: isoOffset(2), minutes: 10,
    grade: null, feedback: null, submitted_at: null, graded_at: null,
    answers: {}, comments: [], created_at: isoOffset(-1),
  },
  {
    id: uid("hw"), student_id: MARINA_ID, created_by: NATALIA_ID,
    title: "IELTS — argument structure",
    brief: "Read the prompt, draft an outline, write your introduction (max 80 words).",
    pdf_data_url: null, pdf_name: null,
    fields: [
      { id: "outline", label: "Outline (bullet points)", type: "textarea" },
      { id: "intro", label: "Introduction paragraph", type: "textarea" },
    ],
    status: "submitted", due_at: isoOffset(1), minutes: 30,
    grade: null, feedback: null, submitted_at: isoOffset(-1), graded_at: null,
    answers: {
      outline: "• Hook: education statistic\n• Thesis: technology helps, but not equally\n• Body 1: access\n• Body 2: quality\n• Conclusion: hybrid models",
      intro: "Over the past two decades, technology has transformed how we learn. While many argue it has democratised education, the reality is more uneven: access alone does not guarantee outcomes. This essay argues that, although technology offers real opportunities, its benefits are unevenly distributed between socioeconomic groups.",
    },
    comments: [], created_at: isoOffset(-3),
  },
]

const seedMaterials = [
  { id: uid("m"), uploaded_by: NATALIA_ID, scope: "global", student_id: null, kind: "PDF", title: "Present perfect — complete sheet", unit: "Grammar · B1", size_label: "12 pages", tone: "peach", icon: "paper", file_data_url: null, file_name: null, external_url: null, fav_by: [LAURA_ID], created_at: isoOffset(-30) },
  { id: uid("m"), uploaded_by: NATALIA_ID, scope: "global", student_id: null, kind: "Audio", title: "Plain English — episode #42", unit: "Listening · podcast", size_label: "18 min", tone: "lavender", icon: "headset", file_data_url: null, file_name: null, external_url: "https://example.com/pe-42", fav_by: [], created_at: isoOffset(-25) },
  { id: uid("m"), uploaded_by: NATALIA_ID, scope: "global", student_id: null, kind: "Link", title: "Interactive conjugation drills", unit: "Practice · web", size_label: "external", tone: "sky", icon: "link", file_data_url: null, file_name: null, external_url: "https://example.com/conjugate", fav_by: [LAURA_ID], created_at: isoOffset(-20) },
  { id: uid("m"), uploaded_by: NATALIA_ID, scope: "global", student_id: null, kind: "PDF", title: "Everyday vocabulary", unit: "Theme · A2-B1", size_label: "6 pages", tone: "mint", icon: "paper", file_data_url: null, file_name: null, external_url: null, fav_by: [], created_at: isoOffset(-18) },
  { id: uid("m"), uploaded_by: NATALIA_ID, scope: "global", student_id: null, kind: "PDF", title: "False friends EN↔PT — appendix", unit: "Reference", size_label: "4 pages", tone: "rose", icon: "paper", file_data_url: null, file_name: null, external_url: null, fav_by: [LAURA_ID], created_at: isoOffset(-15) },
  { id: uid("m"), uploaded_by: NATALIA_ID, scope: "global", student_id: null, kind: "Audio", title: "Dictation · level B1", unit: "Listening · drill", size_label: "8 min", tone: "butter", icon: "headset", file_data_url: null, file_name: null, external_url: "https://example.com/dictation", fav_by: [], created_at: isoOffset(-12) },
  { id: uid("m"), uploaded_by: NATALIA_ID, scope: "global", student_id: null, kind: "Link", title: "The Guardian — article of the day", unit: "Reading · current", size_label: "external", tone: "clay", icon: "link", file_data_url: null, file_name: null, external_url: "https://www.theguardian.com", fav_by: [], created_at: isoOffset(-10) },
  { id: uid("m"), uploaded_by: NATALIA_ID, scope: "global", student_id: null, kind: "PDF", title: "Irregular verbs · cheatsheet", unit: "Grammar · A2-B2", size_label: "2 pages", tone: "peach", icon: "paper", file_data_url: null, file_name: null, external_url: null, fav_by: [LAURA_ID], created_at: isoOffset(-8) },
  { id: uid("m"), uploaded_by: NATALIA_ID, scope: "global", student_id: null, kind: "Audio", title: "Conversation at the market", unit: "Listening · scene", size_label: "5 min", tone: "sky", icon: "headset", file_data_url: null, file_name: null, external_url: "https://example.com/market", fav_by: [], created_at: isoOffset(-5) },
]

const seedClasses = [
  { id: uid("c"), owner_id: LAURA_ID, title: "EN conversation · B1", date: isoOffset(0), time: "16:30", duration: 60, focus: "present perfect — when to use it vs past simple", status: "scheduled", meetUrl: ZOOM_ROOM },
  { id: uid("c"), owner_id: LAURA_ID, title: "EN conversation · B1", date: isoOffset(3), time: "16:30", duration: 60, focus: "", status: "scheduled", meetUrl: ZOOM_ROOM },
  { id: uid("c"), owner_id: LAURA_ID, title: "EN conversation · B1", date: isoOffset(7), time: "16:30", duration: 60, focus: "", status: "scheduled", meetUrl: ZOOM_ROOM },
  { id: uid("c"), owner_id: LAURA_ID, title: "EN conversation · B1", date: isoOffset(-4), time: "16:30", duration: 60, focus: "daily routine role-play", status: "done", meetUrl: ZOOM_ROOM },
  { id: uid("c"), owner_id: LAURA_ID, title: "EN conversation · B1", date: isoOffset(-6), time: "16:30", duration: 60, focus: "weekend recap", status: "done", meetUrl: ZOOM_ROOM },
]

export const dailyExpressions = [
  { term: "to spill the beans", meaning: "to reveal a secret", note: "Casual. 'Come on, spill the beans — who told you?'" },
  { term: "to hit the books", meaning: "to study hard", note: "Often used before exams. 'I can't go out — I have to hit the books tonight.'" },
  { term: "under the weather", meaning: "feeling unwell", note: "Mild illness. 'She's a bit under the weather today, so she stayed home.'" },
  { term: "to cost an arm and a leg", meaning: "to be very expensive", note: "'That new phone costs an arm and a leg — I'll wait for a sale.'" },
  { term: "to break the ice", meaning: "to start a conversation in an awkward situation", note: "'He told a joke to break the ice at the meeting.'" },
  { term: "a piece of cake", meaning: "very easy", note: "'The exam was a piece of cake — I finished in 20 minutes.'" },
  { term: "to call it a day", meaning: "to stop working on something", note: "'We've done enough — let's call it a day.'" },
]

export const seedState = {
  session: { userId: null, role: null },
  profiles: seedProfiles,
  studentMeta: seedStudentMeta,
  words: seedWords,
  homework: seedHomework,
  materials: seedMaterials,
  classes: seedClasses,
  reviews: {},
}
