import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useStore, getState, actions } from '../store'
import { Icon } from '../components/chrome'

export const HomeworkRunner = ({ homeworkId, setRoute }) => {
  const state = useStore() || {}
  const hwRaw = getState().homework.find((h) => h.id === homeworkId)

  const [activeField, setActiveField] = useState(null)

  if (!hwRaw) {
    return (
      <div style={{ padding: 56 }}>
        <button onClick={() => setRoute("homework")} style={ghostBtnStyle}>← Back to homework</button>
        <div style={{ marginTop: 40, textAlign: "center", color: "var(--ink-4)" }}>Homework not found.</div>
      </div>
    )
  }

  const isSubmitted = hwRaw.status === "submitted" || hwRaw.status === "graded"
  const isGraded = hwRaw.status === "graded"
  const isLocked = isSubmitted
  const hasPdf = !!hwRaw.pdf_data_url

  const totalAnswered = hwRaw.fields.filter((f) => (hwRaw.answers || {})[f.id] && (hwRaw.answers[f.id] || "").trim()).length
  const pct = Math.round((totalAnswered / hwRaw.fields.length) * 100)
  const canSubmit = totalAnswered === hwRaw.fields.length && !isLocked

  const submit = () => { if (!canSubmit) return; actions.submitHomework(hwRaw.id) }

  const commentsByField = useMemo(() => {
    const map = {}
    ;(hwRaw.comments || []).forEach((c) => { const k = c.field_id || "_general"; (map[k] = map[k] || []).push(c) })
    return map
  }, [hwRaw.comments])

  return (
    <div data-screen-label="Homework runner" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "20px 32px", borderBottom: "0.5px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, background: "var(--bg-window)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
          <button onClick={() => setRoute("homework")} style={ghostBtnStyle}>← Back</button>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 0.08, color: "var(--ink-3)", textTransform: "uppercase" }}>
              Homework {hwRaw.due_at && <>· due {new Date(hwRaw.due_at + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</>}
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--ink-1)", paddingBottom: 2 }}>{hwRaw.title}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {!isLocked && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ height: 6, width: 120, background: "var(--bg-sunken)", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: pct === 100 ? "var(--c-mint-ink)" : "var(--c-peach-ink)", transition: "width .3s ease" }} />
                </div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)" }}>{totalAnswered}/{hwRaw.fields.length}</span>
              </div>
              <button onClick={submit} disabled={!canSubmit} style={{ ...primaryBtnStyle, background: canSubmit ? "var(--ink-1)" : "var(--bg-sunken)", color: canSubmit ? "var(--bg-elevated)" : "var(--ink-4)", cursor: canSubmit ? "pointer" : "not-allowed" }}>
                Submit homework <Icon name="arrowR" size={13} />
              </button>
            </>
          )}
          {hwRaw.status === "submitted" && <span style={pillStyle("butter")}>Submitted · awaiting feedback</span>}
          {isGraded && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={pillStyle("mint")}>Graded</span>
              {hwRaw.grade != null && <span style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--c-mint-ink)" }}>{hwRaw.grade}/10</span>}
            </div>
          )}
        </div>
      </div>
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: hasPdf ? "1fr 1fr" : "1fr", minHeight: 0 }}>
        {hasPdf && (
          <div style={{ borderRight: "0.5px solid var(--line)", padding: 22, overflow: "hidden" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 0.08, color: "var(--ink-3)", textTransform: "uppercase", marginBottom: 12 }}>Reference</div>
            <PDFViewer dataUrl={hwRaw.pdf_data_url} name={hwRaw.pdf_name} height="calc(100vh - 200px)" />
          </div>
        )}
        <div style={{ padding: hasPdf ? 22 : "32px 56px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: hasPdf ? "block" : "none", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 0.08, color: "var(--ink-3)", textTransform: "uppercase" }}>Your answers</div>
          {hwRaw.brief && (
            <div style={{ background: "var(--c-lavender)", color: "var(--c-lavender-ink)", padding: "16px 20px", borderRadius: "var(--r-md)", fontSize: 14, lineHeight: 1.55 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 0.08, textTransform: "uppercase", opacity: 0.7, marginBottom: 6 }}>Brief</div>
              {hwRaw.brief}
            </div>
          )}
          {isGraded && hwRaw.feedback && (
            <div style={{ background: "var(--c-mint)", color: "var(--c-mint-ink)", padding: "18px 22px", borderRadius: "var(--r-md)", display: "flex", gap: 12, alignItems: "flex-start" }}>
              <Icon name="quote" size={16} />
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 0.08, textTransform: "uppercase", marginBottom: 4, opacity: 0.7 }}>From Natália</div>
                <div style={{ fontSize: 14, fontStyle: "italic", lineHeight: 1.55 }}>{hwRaw.feedback}</div>
              </div>
            </div>
          )}
          {hwRaw.fields.map((field, idx) => (
            <AnswerField key={field.id} field={field} idx={idx} hw={hwRaw} locked={isLocked} comments={commentsByField[field.id] || []} />
          ))}
        </div>
      </div>
    </div>
  )
}

const PDFViewer = ({ dataUrl, name, height = "500px" }) => {
  const containerRef = useRef(null)
  useEffect(() => {
    if (!dataUrl || !containerRef.current) return
    const loadPdf = async () => {
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
      const pdf = await pdfjsLib.getDocument(dataUrl).promise
      const container = containerRef.current
      container.innerHTML = ''
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 1.2 })
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        canvas.style.width = '100%'
        canvas.style.marginBottom = '8px'
        container.appendChild(canvas)
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
      }
    }
    loadPdf().catch(console.error)
  }, [dataUrl])
  return <div ref={containerRef} style={{ height, overflowY: "auto" }} />
}

const AnswerField = ({ field, idx, hw, locked, comments }) => {
  const initial = (hw.answers || {})[field.id] || ""
  const [value, setValue] = useState(initial)
  const [saved, setSaved] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => { setValue(initial) }, [initial])

  const onChange = (v) => {
    setValue(v)
    setSaved(false)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => { actions.saveAnswer(hw.id, field.id, v); setSaved(true) }, 500)
  }

  const isMultiline = field.type === "textarea"
  const Element = isMultiline ? "textarea" : "input"

  return (
    <div style={{ background: "var(--bg-elevated)", border: "0.5px solid var(--line)", borderRadius: "var(--r-md)", padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 0.06, color: "var(--ink-4)", textTransform: "uppercase" }}>Question {String(idx + 1).padStart(2, "0")}</div>
        {!locked && saved && value && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--c-mint-ink)", letterSpacing: 0.04 }}><Icon name="check" size={11} stroke={2} /> Saved</span>
        )}
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--ink-1)", lineHeight: 1.4, marginBottom: 14 }}>{field.label}</div>
      <Element value={value} onChange={(e) => onChange(e.target.value)} disabled={locked} rows={isMultiline ? 5 : undefined}
        placeholder={locked ? "—" : (isMultiline ? "Write your answer here…" : "Type your answer")}
        style={{ appearance: "none", width: "100%", border: "1px solid var(--line-strong)", background: "var(--bg-window)", color: "var(--ink-1)", borderRadius: "var(--r-md)", padding: "12px 14px", fontFamily: isMultiline ? "var(--font-display)" : "var(--font-sans)", fontSize: isMultiline ? 16 : 15, outline: 0, resize: isMultiline ? "vertical" : "none", lineHeight: 1.55, boxSizing: "border-box" }}
      />
      {comments.length > 0 && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          {comments.map((c) => (
            <div key={c.id} style={{ background: "var(--c-butter)", color: "var(--c-butter-ink)", padding: "10px 14px", borderRadius: "var(--r-md)", fontSize: 13, lineHeight: 1.5 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 0.08, textTransform: "uppercase", opacity: 0.7, marginBottom: 4 }}>Natália's comment</div>
              {c.body}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const ghostBtnStyle = { appearance: "none", background: "transparent", border: "1px solid var(--line-strong)", color: "var(--ink-2)", padding: "8px 14px", borderRadius: 999, fontSize: 12, cursor: "pointer", fontFamily: "var(--font-sans)" }
const primaryBtnStyle = { appearance: "none", background: "var(--ink-1)", color: "var(--bg-elevated)", border: 0, padding: "10px 18px", borderRadius: 999, fontSize: 13, fontWeight: 500, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-sans)" }
const pillStyle = (tone) => ({ background: `var(--c-${tone})`, color: `var(--c-${tone}-ink)`, padding: "4px 10px", borderRadius: 999, fontSize: 11, fontFamily: "var(--font-mono)", letterSpacing: 0.04, textTransform: "uppercase" })
