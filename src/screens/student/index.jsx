import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useStore, actions } from '../../store'
import { Icon, Avatar } from '../../components/chrome'

// ─────────────────────────────────────────────────────────────
// Common bits
// ─────────────────────────────────────────────────────────────

const PageHeader = ({ eyebrow, title, subtitle, accent, right }) => (
  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 36, gap: 24, flexWrap: "wrap" }}>
    <div style={{ flex: "1 1 auto", minWidth: 0 }}>
      {eyebrow && (
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: 0.08, color: "var(--ink-3)", textTransform: "uppercase", marginBottom: 14 }}>
          {eyebrow}
        </div>
      )}
      <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: 64, lineHeight: 1.08, margin: 0, letterSpacing: -0.5, color: "var(--ink-1)" }}>
        <span style={{ display: "inline" }}>{title}</span>
        {accent && (
          <>
            {" "}
            <i style={{ color: "var(--c-rose-ink)" }}>{accent}</i>
          </>
        )}
      </h1>
      {subtitle && (
        <p style={{ fontSize: 15, color: "var(--ink-3)", marginTop: 18, marginBottom: 0, maxWidth: 460, lineHeight: 1.55 }}>{subtitle}</p>
      )}
    </div>
    {right && <div style={{ flexShrink: 0 }}>{right}</div>}
  </div>
);

const Chip = ({ active, onClick, children, count }) => (
  <button
    onClick={onClick}
    style={{
      appearance: "none",
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "9px 16px",
      borderRadius: 999,
      border: active ? "1px solid var(--ink-1)" : "1px solid var(--line)",
      background: active ? "var(--ink-1)" : "var(--bg-elevated)",
      color: active ? "var(--bg-elevated)" : "var(--ink-2)",
      fontFamily: "var(--font-sans)",
      fontSize: 13,
      fontWeight: 500,
      cursor: "pointer",
      transition: "all .15s ease",
    }}
  >
    {children}
    {count !== undefined && (
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          padding: "2px 6px",
          borderRadius: 999,
          background: active ? "rgba(255,255,255,.18)" : "var(--bg-sunken)",
          color: active ? "var(--bg-elevated)" : "var(--ink-3)",
        }}
      >
        {count}
      </span>
    )}
  </button>
);

const SearchInput = ({ placeholder = "Search…", value, onChange }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 16px",
      borderRadius: 999,
      background: "var(--bg-elevated)",
      border: "1px solid var(--line)",
      width: 280,
      color: "var(--ink-3)",
    }}
  >
    <Icon name="search" size={15} />
    <input
      value={value || ""}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      style={{ border: 0, outline: 0, background: "transparent", flex: 1, fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink-1)" }}
    />
  </div>
);

const StatusDot = ({ status }) => {
  const color = { new: "var(--c-rose)", learning: "var(--c-peach)", mastered: "var(--c-mint)" }[status] || "var(--ink-4)";
  return <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />;
};

// ═════════════════════════════════════════════════════════════
// HOME
// ═════════════════════════════════════════════════════════════

const ModuleCard = ({ tone, icon, eyebrow, title, body, footer, onClick, big }) => (
  <button
    onClick={onClick}
    style={{
      appearance: "none",
      border: 0,
      textAlign: "left",
      cursor: "pointer",
      background: `var(--c-${tone})`,
      color: `var(--c-${tone}-ink)`,
      borderRadius: "var(--r-lg)",
      padding: big ? "30px 30px 26px" : "26px 26px 22px",
      display: "flex",
      flexDirection: "column",
      gap: 18,
      minHeight: big ? 280 : 220,
      position: "relative",
      overflow: "hidden",
      transition: "transform .2s ease",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
    onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,.45)", display: "grid", placeItems: "center" }}>
        <Icon name={icon} size={17} />
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 0.08, textTransform: "uppercase", opacity: 0.7 }}>{eyebrow}</div>
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: big ? 40 : 32, lineHeight: 1.15, letterSpacing: -0.3, paddingBottom: 2 }}>{title}</div>
      {body && <div style={{ fontSize: 13, marginTop: 12, opacity: 0.78, lineHeight: 1.45 }}>{body}</div>}
    </div>
    {footer && (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, opacity: 0.85 }}>
        <span style={{ fontFamily: "var(--font-mono)", letterSpacing: 0.04 }}>{footer}</span>
        <Icon name="arrowR" size={16} />
      </div>
    )}
  </button>
);

const RecentWordRow = ({ word, pos, hint, status, onClick }) => {
  const statusColor = { new: "var(--c-rose)", learning: "var(--c-peach)", mastered: "var(--c-mint)" }[status];
  return (
    <button
      onClick={onClick}
      style={{ appearance: "none", border: 0, textAlign: "left", width: "100%", background: "transparent", display: "grid", gridTemplateColumns: "auto 1fr auto auto", alignItems: "center", gap: 16, padding: "14px 0", borderTop: "0.5px solid var(--line)", cursor: "pointer", color: "inherit" }}
    >
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor }} />
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--ink-1)", lineHeight: 1.25 }}>
          {word} <span style={{ fontStyle: "italic", color: "var(--ink-4)", fontSize: 14, marginLeft: 6 }}>{pos}</span>
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{hint}</div>
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 0.08, textTransform: "uppercase", color: "var(--ink-4)" }}>{status}</div>
      <Icon name="arrowR" size={14} />
    </button>
  );
};

const HomeScreen = ({ setRoute, setRunnerTarget }) => {
  const s = useStore();
  const student = s.student;
  const greeting = student.targetLang === "French" ? "Bonjour" : "Hello";
  const today = new Date();
  const todayLabel = `${today.toLocaleDateString("en-US", { weekday: "long" })} · ${today.toLocaleDateString("en-US", { month: "long", day: "numeric" })}`;
  const lastClass = [...s.classes].filter((c) => c.status === "done").sort((a, b) => b.date.localeCompare(a.date))[0];
  const lastClassLabel = lastClass ? new Date(lastClass.date).toLocaleDateString("en-US", { weekday: "long" }) : "your last class";
  const nextClass = s.classes.find((c) => c.status === "scheduled");
  const nextClassLabel = nextClass ? new Date(nextClass.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }) : null;

  const recentWords = useMemo(() => {
    return s.words.filter((w) => w.status !== "hidden").slice(0, 5);
  }, [s.words]);

  const pending = s.assignments.filter((a) => a.status !== "done");
  const allDone = pending.length === 0;
  const nextHomework = pending[0];
  const wordsInDict = s.words.filter((w) => w.status !== "hidden").length;
  const newWords = s.words.filter((w) => w.status === "new").length;
  const favMaterials = s.materials.filter((m) => m.fav).length;

  return (
    <div data-screen-label="Home" style={{ padding: "44px 56px 56px", maxWidth: 980 }}>
      <PageHeader
        eyebrow={todayLabel}
        title={`${greeting},`}
        accent={`${student.name.split(" ")[0]}.`}
        subtitle={allDone
          ? "All homework done — well played! Browse materials or practise flashcards."
          : `You have ${pending.length} pending ${pending.length === 1 ? "assignment" : "assignments"} and ${newWords} new words waiting.`
        }
      />

      {/* Module cards: homework big on left, dictionary + materials stacked on right */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "var(--d-gap)", marginBottom: "var(--d-gap)" }}>
        {allDone ? (
          <ModuleCard
            tone="mint"
            icon="check"
            eyebrow="Homework"
            title={<>Homework completed <span style={{ fontStyle: "normal" }}>🎉</span></>}
            body={nextClassLabel ? `Next class: ${nextClassLabel}. See your materials or review flashcards.` : "Great job — take a break or review flashcards."}
            footer="View materials & exercises"
            onClick={() => setRoute("materials")}
            big
          />
        ) : (
          <ModuleCard
            tone="peach"
            icon="pencil"
            eyebrow={`Homework · ${pending.length} pending`}
            title={nextHomework ? <>{nextHomework.title}</> : <>Your homework</>}
            body={nextHomework ? `Due ${nextHomework.due} · ${nextHomework.minutes} min` : "Open to see what's waiting."}
            footer={nextHomework ? "Continue" : "Open homework"}
            onClick={() => {
              if (nextHomework && setRunnerTarget) {
                setRunnerTarget(nextHomework.id);
                setRoute("homework-runner");
              } else {
                setRoute("homework");
              }
            }}
            big
          />
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--d-gap)" }}>
          <ModuleCard
            tone="lavender"
            icon="book"
            eyebrow={`Dictionary · ${wordsInDict} words`}
            title={<>{newWords} <i>new</i> words</>}
            body="Tap to review or mark as mastered."
            footer="Open dictionary"
            onClick={() => setRoute("dictionary")}
          />
          <ModuleCard
            tone="sky"
            icon="folder"
            eyebrow="Materials"
            title={<>{favMaterials} <i>favourites</i></>}
            body="Podcasts, reading, conjugation tables."
            footer="Browse library"
            onClick={() => setRoute("materials")}
          />
        </div>
      </div>

      {/* Words from last class — full width, with search on the right */}
      <div style={{ background: "var(--bg-elevated)", borderRadius: "var(--r-lg)", padding: "26px 28px", border: "0.5px solid var(--line)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: 0.08, color: "var(--ink-3)", textTransform: "uppercase", marginBottom: 6 }}>
              From your last class
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 30, color: "var(--ink-1)", lineHeight: 1.2, paddingBottom: 2 }}>
              Words you used on <i>{lastClassLabel}</i>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <SearchInput placeholder="Search anything…" />
            <button onClick={() => setRoute("dictionary")} style={{ background: "transparent", border: "1px solid var(--line-strong)", padding: "8px 14px", borderRadius: 999, fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--ink-2)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
              See all {wordsInDict} <Icon name="arrowR" size={13} />
            </button>
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          {recentWords.map((w) => (
            <RecentWordRow
              key={w.id}
              word={w.w}
              pos={w.pos}
              hint={w.tgt}
              status={w.status}
              onClick={() => setRoute("dictionary")}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════
// DICTIONARY
// ═════════════════════════════════════════════════════════════

const DictRow = ({ entry, selected, onClick }) => (
  <button
    onClick={onClick}
    style={{
      appearance: "none",
      width: "100%",
      textAlign: "left",
      border: 0,
      background: selected ? "var(--bg-elevated)" : "transparent",
      padding: "18px 22px",
      borderRadius: "var(--r-md)",
      display: "grid",
      gridTemplateColumns: "auto 1fr auto auto",
      alignItems: "center",
      gap: 16,
      cursor: "pointer",
      transition: "background .15s ease",
      borderBottom: "0.5px solid var(--line)",
      position: "relative",
    }}
    onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = "var(--bg-elevated)"; }}
    onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = "transparent"; }}
  >
    <StatusDot status={entry.status} />
    <div style={{ minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--ink-1)", lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{entry.w}</span>
        <span style={{ fontStyle: "italic", color: "var(--ink-4)", fontSize: 12, whiteSpace: "nowrap" }}>{entry.pos}</span>
        {entry.flag && (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, padding: "2px 6px", borderRadius: 999, background: "var(--c-butter)", color: "var(--c-butter-ink)", textTransform: "uppercase", letterSpacing: 0.08, whiteSpace: "nowrap" }}>
            {entry.flag}
          </span>
        )}
      </div>
      <div style={{ fontSize: 12.5, color: "var(--ink-3)", lineHeight: 1.45, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.tgt}</div>
    </div>
    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 0.08, color: "var(--ink-4)", textTransform: "uppercase" }}>{entry.level}</span>
    <Icon name="arrowR" size={14} />
  </button>
);

const Toast = ({ message }) => (
  <div style={{
    position: "absolute", top: 16, left: 28, right: 28,
    background: "var(--ink-1)", color: "var(--bg-elevated)",
    padding: "10px 16px", borderRadius: "var(--r-pill)",
    fontSize: 12, fontFamily: "var(--font-mono)", letterSpacing: 0.04,
    textAlign: "center", zIndex: 10,
    animation: "fadeIn .15s ease",
  }}>
    {message}
  </div>
);

const DictDetail = ({ entry, onClose }) => {
  const [toast, setToast] = useState(null);

  if (!entry) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--ink-4)", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: 0.04, textTransform: "uppercase" }}>
        Select a word to see its full entry
      </div>
    );
  }

  const setStatus = (status) => {
    actions.setWordStatus(entry.id, status);
    const msgs = { mastered: "Marked as mastered! +10 XP", learning: "Marked for review", hidden: "Word hidden" };
    setToast(msgs[status]);
    setTimeout(() => setToast(null), 2000);
  };

  const buttons = [
    { label: "Mastered", status: "mastered", icon: "check" },
    { label: "Need review", status: "learning" },
    { label: "Hide", status: "hidden" },
  ];

  return (
    <div style={{ padding: "32px 28px", display: "flex", flexDirection: "column", gap: 20, position: "relative" }}>
      {toast && <Toast message={toast} />}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <StatusDot status={entry.status} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: 0.08, color: "var(--ink-3)", textTransform: "uppercase" }}>
            {entry.status} · {entry.level}
          </span>
        </div>
        <button onClick={onClose} aria-label="Close" style={{ background: "transparent", border: 0, color: "var(--ink-3)", cursor: "pointer", transform: "rotate(45deg)" }}>
          <Icon name="plus" size={16} stroke={1.8} />
        </button>
      </div>

      <div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 56, lineHeight: 1.1, letterSpacing: -0.3, color: "var(--ink-1)", paddingBottom: 4 }}>{entry.w}</div>
        <div style={{ fontStyle: "italic", color: "var(--ink-4)", fontSize: 15, marginTop: 6 }}>{entry.pos}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 0.08, color: "var(--ink-4)", textTransform: "uppercase", marginBottom: 6 }}>Target language</div>
          <div style={{ fontSize: 15, color: "var(--ink-1)", lineHeight: 1.45 }}>{entry.tgt}</div>
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 0.08, color: "var(--ink-4)", textTransform: "uppercase", marginBottom: 6 }}>Portuguese</div>
          <div style={{ fontSize: 15, color: "var(--ink-1)", lineHeight: 1.45 }}>{entry.nat}</div>
        </div>
      </div>

      <div style={{ background: "var(--c-lavender)", color: "var(--c-lavender-ink)", padding: "20px 22px", borderRadius: "var(--r-md)", position: "relative" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 0.08, textTransform: "uppercase", marginBottom: 10, opacity: 0.7 }}>
          From your class
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 22, lineHeight: 1.3, fontStyle: "italic" }}>
          "{entry.ex}"
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {buttons.map(({ label, status, icon }) => {
          const isActive = entry.status === status;
          return (
            <button
              key={label}
              onClick={() => setStatus(status)}
              style={{
                appearance: "none",
                border: isActive ? "1px solid var(--ink-1)" : "1px solid var(--line-strong)",
                background: isActive ? "var(--ink-1)" : "transparent",
                color: isActive ? "var(--bg-elevated)" : "var(--ink-2)",
                padding: "8px 14px",
                borderRadius: 999,
                fontSize: 12,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                transition: "all .15s ease",
              }}
            >
              {icon && isActive && <Icon name={icon} size={13} stroke={2} />} {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const DictStat = ({ value, label, tone }) => (
  <div style={{ flex: 1, background: `var(--c-${tone})`, color: `var(--c-${tone}-ink)`, padding: "20px 22px", borderRadius: "var(--r-md)", display: "flex", flexDirection: "column", gap: 6 }}>
    <span style={{ fontFamily: "var(--font-display)", fontSize: 44, lineHeight: 1.15, paddingBottom: 4 }}>{value}</span>
    <span style={{ fontSize: 12, opacity: 0.78 }}>{label}</span>
  </div>
);

const DictionaryScreen = ({ setRoute }) => {
  const s = useStore();
  const allWords = s.words;
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(allWords[0]?.id || null);

  const visible = useMemo(() => allWords.filter((w) => w.status !== "hidden"), [allWords]);

  const counts = useMemo(() => ({
    all: visible.length,
    new: visible.filter((w) => w.status === "new").length,
    learning: visible.filter((w) => w.status === "learning").length,
    mastered: visible.filter((w) => w.status === "mastered").length,
  }), [visible]);

  // Group by class
  const groups = useMemo(() => {
    const byCls = new Map();
    visible.forEach((w) => {
      const key = w.cls || "Other";
      if (!byCls.has(key)) byCls.set(key, []);
      byCls.get(key).push(w);
    });
    return Array.from(byCls.entries()).map(([cls, items]) => ({
      cls,
      items: items.filter((it) =>
        (filter === "all" || it.status === filter) &&
        (!query || it.w.toLowerCase().includes(query.toLowerCase()) || (it.tgt || "").toLowerCase().includes(query.toLowerCase()))
      ),
    })).filter((g) => g.items.length > 0);
  }, [visible, filter, query]);

  const sel = allWords.find((w) => w.id === selectedId && w.status !== "hidden") || visible[0];

  return (
    <div data-screen-label="Dictionary" style={{ display: "grid", gridTemplateColumns: "1fr 420px", height: "100%" }}>
      <div style={{ padding: "44px 56px 56px", overflowY: "auto" }}>
        <PageHeader
          eyebrow={`${visible.length} words · since February 4`}
          title="Your"
          accent="dictionary."
          subtitle="Every word here came from a conversation with Natália. Tap a word to mark it as mastered or set it aside for review."
          right={
            <button
              onClick={() => setRoute && setRoute("flashcards")}
              style={{ appearance: "none", background: "var(--ink-1)", color: "var(--bg-elevated)", border: 0, padding: "10px 18px", borderRadius: 999, fontSize: 13, fontWeight: 500, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <Icon name="spark" size={14} /> Practise as flashcards
            </button>
          }
        />

        <div style={{ display: "flex", gap: 12, marginBottom: 26 }}>
          <DictStat value={counts.new} label="New" tone="rose" />
          <DictStat value={counts.learning} label="Learning" tone="peach" />
          <DictStat value={counts.mastered} label="Mastered" tone="mint" />
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 18, flexWrap: "wrap" }}>
          <Chip active={filter === "all"} onClick={() => setFilter("all")} count={counts.all}>All</Chip>
          <Chip active={filter === "new"} onClick={() => setFilter("new")} count={counts.new}>New</Chip>
          <Chip active={filter === "learning"} onClick={() => setFilter("learning")} count={counts.learning}>Learning</Chip>
          <Chip active={filter === "mastered"} onClick={() => setFilter("mastered")} count={counts.mastered}>Mastered</Chip>
          <div style={{ marginLeft: "auto" }}>
            <SearchInput placeholder="Search words…" value={query} onChange={setQuery} />
          </div>
        </div>

        {groups.length === 0 && (
          <div style={{ padding: 60, textAlign: "center", color: "var(--ink-4)", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: 0.04, textTransform: "uppercase" }}>
            No words match your filters
          </div>
        )}

        {groups.map((group) => (
          <div key={group.cls} style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: 0.08, color: "var(--ink-3)", textTransform: "uppercase", margin: "0 0 8px 22px" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--ink-3)" }} />
              {group.cls}
            </div>
            <div style={{ background: "var(--bg-elevated)", borderRadius: "var(--r-lg)", border: "0.5px solid var(--line)", overflow: "hidden" }}>
              {group.items.map((it) => (
                <DictRow key={it.id} entry={it} selected={selectedId === it.id} onClick={() => setSelectedId(it.id)} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: "var(--bg-elevated)", borderLeft: "0.5px solid var(--line)", overflowY: "auto", position: "sticky", top: 0, height: "100%" }}>
        <DictDetail entry={sel} onClose={() => setSelectedId(null)} />
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════
// HOMEWORK
// ═════════════════════════════════════════════════════════════

const HWPill = ({ status }) => {
  const map = {
    pending: { bg: "var(--c-rose)", ink: "var(--c-rose-ink)", l: "To do" },
    "in-progress": { bg: "var(--c-peach)", ink: "var(--c-peach-ink)", l: "In progress" },
    done: { bg: "var(--c-mint)", ink: "var(--c-mint-ink)", l: "Submitted" },
  }[status];
  if (!map) return null;
  return (
    <span style={{ background: map.bg, color: map.ink, padding: "4px 10px", borderRadius: 999, fontSize: 11, fontFamily: "var(--font-mono)", letterSpacing: 0.04, textTransform: "uppercase" }}>
      {map.l}
    </span>
  );
};

const FILL_SENTENCES = [
  { id: 0, parts: ["I ", " in London for five years (and I still live there)."], options: ["lived", "have lived", "live"], answer: "have lived", num: "01" },
  { id: 1, parts: ["She ", " her keys yesterday."], options: ["has lost", "lost", "loses"], answer: "lost", num: "02" },
  { id: 2, parts: ["We ", " each other since 2018."], options: ["know", "knew", "have known"], answer: "have known", num: "03" },
  { id: 3, parts: ["He ", " to Paris last summer."], options: ["has been", "went", "goes"], answer: "went", num: "04" },
];

const FillBlankExercise = ({ assignment }) => {
  const [picked, setPicked] = useState(assignment.answers || {});

  useEffect(() => {
    const completed = Object.values(picked).filter(Boolean).length;
    const progress = completed / FILL_SENTENCES.length;
    actions.setFillAnswers(assignment.id, picked);
    actions.setAssignmentProgress(assignment.id, progress);
  }, [picked]);

  const total = FILL_SENTENCES.length;
  const correctCount = FILL_SENTENCES.filter((s) => picked[s.id] === s.answer).length;
  const answeredCount = Object.values(picked).filter(Boolean).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)" }}>
        <span>{answeredCount} / {total} answered · {correctCount} correct</span>
        <div style={{ height: 4, flex: 1, margin: "0 16px", background: "var(--bg-sunken)", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ width: `${(answeredCount / total) * 100}%`, height: "100%", background: "var(--c-peach-ink)", transition: "width .3s ease" }} />
        </div>
      </div>

      {FILL_SENTENCES.map((s) => {
        const isCorrect = picked[s.id] === s.answer;
        const answered = picked[s.id] != null;
        return (
          <div key={s.id} style={{ background: "var(--bg-elevated)", padding: "22px 24px", borderRadius: "var(--r-md)", border: "0.5px solid var(--line)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 0.08, color: "var(--ink-4)" }}>{s.num} / {String(total).padStart(2, "0")}</span>
              {answered && (
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 0.08, textTransform: "uppercase", color: isCorrect ? "var(--c-mint-ink)" : "var(--c-rose-ink)" }}>
                  {isCorrect ? "Correct" : "Try again"}
                </span>
              )}
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 26, lineHeight: 1.55, color: "var(--ink-1)" }}>
              {s.parts[0]}
              <span style={{
                display: "inline-flex", minWidth: 88, height: 30, padding: "0 12px", borderRadius: 8,
                border: `1px ${picked[s.id] ? "solid" : "dashed"} ${picked[s.id] ? (isCorrect ? "var(--c-mint-ink)" : "var(--c-rose-ink)") : "var(--line-strong)"}`,
                background: picked[s.id] ? (isCorrect ? "var(--c-mint)" : "var(--c-rose)") : "transparent",
                color: picked[s.id] ? (isCorrect ? "var(--c-mint-ink)" : "var(--c-rose-ink)") : "var(--ink-4)",
                alignItems: "center", justifyContent: "center", fontSize: 18, fontStyle: "italic",
                verticalAlign: "middle", margin: "0 4px",
              }}>
                {picked[s.id] || "___"}
              </span>
              {s.parts[1]}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              {s.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setPicked({ ...picked, [s.id]: opt })}
                  style={{
                    appearance: "none",
                    border: picked[s.id] === opt ? "1px solid var(--ink-1)" : "1px solid var(--line-strong)",
                    background: picked[s.id] === opt ? "var(--ink-1)" : "transparent",
                    color: picked[s.id] === opt ? "var(--bg-elevated)" : "var(--ink-2)",
                    padding: "8px 16px", borderRadius: 999, fontSize: 13, fontStyle: "italic",
                    fontFamily: "var(--font-display)", cursor: "pointer",
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const MC_QUESTIONS = [
  { pre: "In English, ", mid: "eventually", post: " means…", options: [
    { k: "A", label: "Possibly, perhaps", correct: false },
    { k: "B", label: "In the end, after some time", correct: true },
    { k: "C", label: "Constantly, always", correct: false },
    { k: "D", label: "At any moment", correct: false },
  ], explanation: "False friend! 'Eventually' = in the end. The Portuguese 'eventualmente' is closer to 'occasionally / possibly'." },
  { pre: "What does ", mid: "to actually do something", post: " mean?", options: [
    { k: "A", label: "To do it currently / now", correct: false },
    { k: "B", label: "To do it in reality / in fact", correct: true },
    { k: "C", label: "To do it as a habit", correct: false },
    { k: "D", label: "To do it eventually", correct: false },
  ], explanation: "'Actually' = in fact / in reality. The Portuguese 'atualmente' means 'currently' — a classic false friend." },
  { pre: "", mid: "to pretend", post: " means…", options: [
    { k: "A", label: "To intend / plan to", correct: false },
    { k: "B", label: "To act as if something is true", correct: true },
    { k: "C", label: "To prefer", correct: false },
    { k: "D", label: "To pretend in court", correct: false },
  ], explanation: "'Pretend' = fingir, in Portuguese. The verb 'pretender' (to intend) is the false friend." },
  { pre: "", mid: "to push", post: " means…", options: [
    { k: "A", label: "To pull towards you", correct: false },
    { k: "B", label: "To press / move something away from you", correct: true },
    { k: "C", label: "To carry", correct: false },
    { k: "D", label: "To drop", correct: false },
  ], explanation: "Easy to mix up with Portuguese 'puxar' (to pull) — they look similar but mean opposite things!" },
];

const MCExercise = ({ assignment }) => {
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = MC_QUESTIONS[qIdx];
  const total = MC_QUESTIONS.length;

  useEffect(() => {
    const progress = done ? 1 : qIdx / total;
    actions.setAssignmentProgress(assignment.id, progress);
  }, [qIdx, done]);

  const pick = (opt) => {
    if (revealed) return;
    setSelected(opt.k);
    setRevealed(true);
    if (opt.correct) setScore((s) => s + 1);
  };

  const next = () => {
    if (qIdx + 1 >= total) {
      setDone(true);
    } else {
      setQIdx((i) => i + 1);
      setSelected(null);
      setRevealed(false);
    }
  };

  const restart = () => {
    setQIdx(0); setSelected(null); setRevealed(false); setScore(0); setDone(false);
  };

  if (done) {
    const pct = Math.round((score / total) * 100);
    return (
      <div style={{ background: "var(--bg-elevated)", border: "0.5px solid var(--line)", borderRadius: "var(--r-md)", padding: "36px 30px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 72, lineHeight: 1, color: pct >= 70 ? "var(--c-mint-ink)" : "var(--c-rose-ink)", paddingBottom: 4 }}>
          {pct}%
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 26, color: "var(--ink-1)" }}>
          {score} / {total} correct
        </div>
        <div style={{ fontSize: 13, color: "var(--ink-3)", maxWidth: 320, lineHeight: 1.5 }}>
          {pct === 100 ? "Perfect score — these false friends won't fool you again." : pct >= 70 ? "Good work. Review the ones you missed." : "Keep practising — these take time."}
        </div>
        <button onClick={restart} style={{ appearance: "none", background: "var(--ink-1)", color: "var(--bg-elevated)", border: 0, padding: "10px 22px", borderRadius: 999, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg-elevated)", border: "0.5px solid var(--line)", borderRadius: "var(--r-md)", padding: "28px 30px", display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 0.08, color: "var(--ink-4)", textTransform: "uppercase" }}>
          {String(qIdx + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </div>
        <div style={{ height: 4, flex: 1, margin: "0 16px", background: "var(--bg-sunken)", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ width: `${(qIdx / total) * 100}%`, height: "100%", background: "var(--c-peach-ink)", transition: "width .3s ease" }} />
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-3)" }}>{score} pts</div>
      </div>

      <div style={{ fontFamily: "var(--font-display)", fontSize: 30, lineHeight: 1.35, color: "var(--ink-1)", paddingBottom: 2 }}>
        {q.pre}<i>{q.mid}</i>{q.post}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {q.options.map((opt) => {
          let bg = "transparent", border = "1px solid var(--line-strong)", color = "var(--ink-1)";
          if (revealed) {
            if (opt.correct) { bg = "var(--c-mint)"; border = "1px solid var(--c-mint-ink)"; color = "var(--c-mint-ink)"; }
            else if (selected === opt.k) { bg = "var(--c-rose)"; border = "1px solid var(--c-rose-ink)"; color = "var(--c-rose-ink)"; }
          } else if (selected === opt.k) {
            bg = "var(--bg-sunken)";
          }
          return (
            <button key={opt.k} onClick={() => pick(opt)} style={{
              appearance: "none", textAlign: "left", border, background: bg, color,
              padding: "16px 18px", borderRadius: "var(--r-md)",
              cursor: revealed ? "default" : "pointer",
              display: "flex", alignItems: "center", gap: 14, fontSize: 14,
              transition: "background .15s ease, border .15s ease",
            }}>
              <span style={{
                width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                background: revealed && opt.correct ? "var(--c-mint-ink)" : revealed && selected === opt.k ? "var(--c-rose-ink)" : "var(--bg-sunken)",
                color: revealed && (opt.correct || selected === opt.k) ? "#fff" : "var(--ink-3)",
                display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontSize: 11,
              }}>
                {revealed && opt.correct ? <Icon name="check" size={12} stroke={2.5} /> : opt.k}
              </span>
              {opt.label}
            </button>
          );
        })}
      </div>

      {revealed && (
        <div style={{ background: "var(--c-butter)", color: "var(--c-butter-ink)", padding: "14px 18px", borderRadius: "var(--r-md)", fontSize: 13, lineHeight: 1.5 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 0.08, textTransform: "uppercase", opacity: 0.7, display: "block", marginBottom: 4 }}>Natália's note</span>
          {q.explanation}
        </div>
      )}

      {revealed && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={next} style={{ appearance: "none", background: "var(--ink-1)", color: "var(--bg-elevated)", border: 0, padding: "10px 20px", borderRadius: 999, fontSize: 13, fontWeight: 500, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
            {qIdx + 1 >= total ? "See results" : "Next"} <Icon name="arrowR" size={13} />
          </button>
        </div>
      )}
    </div>
  );
};

const TARGET_WORDS = 120;
const WrittenExercise = ({ assignment }) => {
  const s = useStore();
  const [text, setText] = useState(assignment.draft || "");
  const saveTimerRef = useRef(null);
  const [saved, setSaved] = useState(false);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const dictWords = s.words.map((w) => w.w).filter(Boolean);
  const lower = text.toLowerCase();
  const used = dictWords.filter((w) => lower.includes(w.toLowerCase().split(" ")[0]));
  const pct = Math.min(100, Math.round((wordCount / TARGET_WORDS) * 100));

  const onChange = (e) => {
    const v = e.target.value;
    setText(v);
    setSaved(false);
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      actions.saveDraft(assignment.id, v);
      actions.setAssignmentProgress(assignment.id, Math.min(1, wordCount / TARGET_WORDS));
      setSaved(true);
    }, 800);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: "var(--bg-elevated)", border: "0.5px solid var(--line)", borderRadius: "var(--r-md)", padding: "24px 26px", position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 0.08, color: "var(--ink-4)", textTransform: "uppercase" }}>
            Your draft · {wordCount} / {TARGET_WORDS} words
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ height: 4, width: 80, background: "var(--bg-sunken)", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: pct >= 100 ? "var(--c-mint-ink)" : "var(--c-peach-ink)", transition: "width .3s ease" }} />
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: pct >= 100 ? "var(--c-mint-ink)" : "var(--ink-3)" }}>{pct}%</span>
          </div>
        </div>
        <textarea
          value={text}
          onChange={onChange}
          placeholder="Start writing your paragraph here…"
          style={{
            width: "100%", minHeight: 200, border: 0, outline: 0, background: "transparent",
            fontFamily: "var(--font-display)", fontSize: 20, lineHeight: 1.55, color: "var(--ink-1)",
            resize: "vertical", boxSizing: "border-box",
          }}
        />
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", fontSize: 12, color: "var(--ink-3)" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: "var(--c-peach)" }} />
          Dictionary words used: {used.length} / 4 required
        </span>
        {used.length > 0 && (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-4)" }}>
            ({used.slice(0, 4).join(", ")}{used.length > 4 ? "…" : ""})
          </span>
        )}
        {saved && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--c-mint-ink)", marginLeft: "auto" }}>
            <Icon name="check" size={12} stroke={2} /> Saved
          </span>
        )}
      </div>
    </div>
  );
};

const HwCard = ({ a, selected, onClick }) => (
  <button
    onClick={onClick}
    style={{
      appearance: "none", border: 0, textAlign: "left", width: "100%",
      background: selected ? "var(--bg-elevated)" : "transparent",
      borderRadius: "var(--r-md)", padding: "22px 24px", cursor: "pointer",
      display: "flex", flexDirection: "column", gap: 12,
      borderBottom: "0.5px solid var(--line)",
      transition: "background .15s ease", position: "relative",
    }}
    onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = "var(--bg-elevated)"; }}
    onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = "transparent"; }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--bg-sunken)", display: "grid", placeItems: "center", color: "var(--ink-2)" }}>
          <Icon name={a.icon} size={15} />
        </div>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 0.08, color: "var(--ink-4)", textTransform: "uppercase" }}>{a.type}</span>
      </div>
      <HWPill status={a.status} />
    </div>
    <div style={{ fontFamily: "var(--font-display)", fontSize: 22, lineHeight: 1.35, color: "var(--ink-1)", paddingBottom: 6 }}>{a.title}</div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "var(--ink-3)" }}>
      <span>{a.cls}</span>
      <span style={{ fontFamily: "var(--font-mono)", letterSpacing: 0.04 }}>
        {a.status === "done" ? a.due : `Due ${a.due} · ${a.minutes} min`}
      </span>
    </div>
    {a.progress > 0 && a.progress < 1 && (
      <div style={{ height: 3, background: "var(--bg-sunken)", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ width: `${a.progress * 100}%`, height: "100%", background: "var(--c-peach-ink)" }} />
      </div>
    )}
  </button>
);

const HomeworkScreen = ({ setRoute, setRunnerTarget }) => {
  const s = useStore();
  const assignments = s.assignments;
  const [tab, setTab] = useState("pending");

  const visibleList = assignments.filter((a) => (tab === "pending" ? a.status !== "done" : a.status === "done"));
  const pendingCount = assignments.filter((a) => a.status !== "done").length;
  const doneCount = assignments.filter((a) => a.status === "done").length;

  const open = (a) => {
    setRunnerTarget(a.id);
    setRoute("homework-runner");
  };

  return (
    <div data-screen-label="Homework" style={{ padding: "44px 56px 56px", maxWidth: 920 }}>
      <PageHeader
        eyebrow={`${pendingCount} pending · ${doneCount} done`}
        title="Your"
        accent="homework."
        subtitle="Open one to see the brief and write your answers. Everything saves automatically as you type."
      />

      <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
        <Chip active={tab === "pending"} onClick={() => setTab("pending")} count={pendingCount}>Pending</Chip>
        <Chip active={tab === "done"} onClick={() => setTab("done")} count={doneCount}>Submitted</Chip>
      </div>

      <div style={{ background: "var(--bg-elevated)", borderRadius: "var(--r-lg)", border: "0.5px solid var(--line)", overflow: "hidden" }}>
        {visibleList.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center", color: "var(--ink-4)", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: 0.04, textTransform: "uppercase" }}>
            {tab === "pending" ? "All caught up!" : "Nothing submitted yet"}
          </div>
        ) : visibleList.map((a) => (
          <HwListRow key={a.id} a={a} onClick={() => open(a)} />
        ))}
      </div>
    </div>
  );
};

const HwListRow = ({ a, onClick }) => {
  const raw = a._raw;
  const hasPdf = !!(raw && raw.pdf_data_url);
  const pillTone = a.status === "pending" ? "rose" : a.status === "in-progress" ? "peach" : a.status === "submitted" ? "butter" : "mint";
  const pillLabel = a.status === "pending" ? "To do" : a.status === "in-progress" ? "In progress" : a.status === "submitted" ? "Submitted" : "Graded";
  return (
    <button
      onClick={onClick}
      style={{
        appearance: "none", border: 0, width: "100%", textAlign: "left",
        background: "transparent", cursor: "pointer",
        padding: "20px 24px", borderTop: "0.5px solid var(--line)",
        display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: 18, alignItems: "center",
        transition: "background .15s ease",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-window)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
    >
      <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--bg-sunken)", display: "grid", placeItems: "center", color: "var(--ink-2)" }}>
        <Icon name={hasPdf ? "paper" : "quote"} size={16} />
      </div>
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--ink-1)", lineHeight: 1.25, paddingBottom: 4 }}>{a.title}</div>
        <div style={{ display: "flex", gap: 14, alignItems: "center", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-4)", letterSpacing: 0.04, marginTop: 4 }}>
          <span>{raw?.fields?.length || 0} {raw?.fields?.length === 1 ? "question" : "questions"}</span>
          <span>·</span>
          <span>{a.status === "done" ? a.due : `Due ${a.due}`}</span>
          {a.minutes && <><span>·</span><span>{a.minutes} min</span></>}
        </div>
      </div>
      {a.grade != null && (
        <span style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--c-mint-ink)" }}>{a.grade}/10</span>
      )}
      <span style={{ background: `var(--c-${pillTone})`, color: `var(--c-${pillTone}-ink)`, padding: "4px 10px", borderRadius: 999, fontSize: 11, fontFamily: "var(--font-mono)", letterSpacing: 0.04, textTransform: "uppercase" }}>
        {pillLabel}
      </span>
    </button>
  );
};

// ═════════════════════════════════════════════════════════════
// MATERIALS
// ═════════════════════════════════════════════════════════════

const MaterialCard = ({ m, onToggleFav }) => (
  <div
    style={{
      background: `var(--c-${m.tone})`, color: `var(--c-${m.tone}-ink)`,
      borderRadius: "var(--r-lg)", padding: "26px 24px 22px",
      display: "flex", flexDirection: "column", gap: 16,
      minHeight: 220, cursor: "pointer",
      transition: "transform .2s ease", position: "relative",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
    onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,.45)", display: "grid", placeItems: "center" }}>
        <Icon name={m.icon} size={16} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFav(m.id); }}
          aria-label={m.fav ? "Unfavorite" : "Favorite"}
          style={{ appearance: "none", border: 0, background: m.fav ? "rgba(255,255,255,.6)" : "transparent", color: "inherit", cursor: "pointer", padding: 4, borderRadius: 999, opacity: m.fav ? 1 : 0.5, display: "grid", placeItems: "center" }}
        >
          <Icon name="star" size={14} stroke={1.8} />
        </button>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 0.08, textTransform: "uppercase", opacity: 0.7 }}>{m.kind}</span>
      </div>
    </div>
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 22, lineHeight: 1.35, letterSpacing: -0.2, paddingBottom: 6 }}>{m.title}</div>
      <div style={{ fontSize: 12, marginTop: 8, opacity: 0.75 }}>
        {m.unit} <span style={{ opacity: 0.6 }}>· {m.size}</span>
      </div>
    </div>
  </div>
);

const MaterialsScreen = () => {
  const s = useStore();
  const materials = s.materials;
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => ({
    all: materials.length,
    PDF: materials.filter((m) => m.kind === "PDF").length,
    Audio: materials.filter((m) => m.kind === "Audio").length,
    Link: materials.filter((m) => m.kind === "Link").length,
    fav: materials.filter((m) => m.fav).length,
  }), [materials]);

  const filtered = materials.filter(
    (m) =>
      (filter === "all" || (filter === "fav" && m.fav) || m.kind === filter) &&
      (!query || m.title.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div data-screen-label="Materials" style={{ padding: "44px 56px 56px", overflowY: "auto", height: "100%" }}>
      <PageHeader
        eyebrow={`${counts.all} items · ${s.student.targetLang} ${s.student.level}`}
        title="Materials"
        accent="library."
        subtitle="Everything Natália has shared with you. Filter by type or what you've starred."
        right={<SearchInput placeholder="Search materials…" value={query} onChange={setQuery} />}
      />

      <div style={{ display: "flex", gap: 8, marginBottom: 26, flexWrap: "wrap" }}>
        <Chip active={filter === "all"} onClick={() => setFilter("all")} count={counts.all}>Everything</Chip>
        <Chip active={filter === "PDF"} onClick={() => setFilter("PDF")} count={counts.PDF}>PDFs</Chip>
        <Chip active={filter === "Audio"} onClick={() => setFilter("Audio")} count={counts.Audio}>Audio</Chip>
        <Chip active={filter === "Link"} onClick={() => setFilter("Link")} count={counts.Link}>Links</Chip>
        <Chip active={filter === "fav"} onClick={() => setFilter("fav")} count={counts.fav}>
          <Icon name="star" size={12} /> Favorites
        </Chip>
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: 60, textAlign: "center", color: "var(--ink-4)", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: 0.04, textTransform: "uppercase" }}>
          No materials match your filters
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--d-gap)" }}>
          {filtered.map((m) => (
            <MaterialCard key={m.id} m={m} onToggleFav={actions.toggleFavorite} />
          ))}
        </div>
      )}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════
// FLASHCARDS
// ═════════════════════════════════════════════════════════════

const FlashcardsScreen = ({ setRoute }) => {
  const s = useStore();
  const deck = useMemo(() => s.words.filter((w) => w.status === "new" || w.status === "learning"), [s.words]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [stats, setStats] = useState({ known: 0, unknown: 0 });
  const [done, setDone] = useState(false);

  const card = deck[idx];

  const handle = (correct) => {
    if (!card) return;
    actions.recordReview(card.id, correct);
    if (correct) {
      actions.setWordStatus(card.id, "mastered");
    }
    setStats((s) => ({ known: s.known + (correct ? 1 : 0), unknown: s.unknown + (correct ? 0 : 1) }));
    if (idx + 1 >= deck.length) {
      setDone(true);
    } else {
      setFlipped(false);
      setIdx(idx + 1);
    }
  };

  const restart = () => {
    setIdx(0); setFlipped(false); setStats({ known: 0, unknown: 0 }); setDone(false);
  };

  if (deck.length === 0) {
    return (
      <div data-screen-label="Flashcards" style={{ padding: "44px 56px 56px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 56, lineHeight: 1.05, color: "var(--ink-1)", paddingBottom: 10 }}>
            Nothing to <i style={{ color: "var(--c-rose-ink)" }}>review.</i>
          </div>
          <p style={{ fontSize: 14, color: "var(--ink-3)", lineHeight: 1.55 }}>
            Every word in your dictionary is already mastered or hidden. Add new words from your next class.
          </p>
          <button
            onClick={() => setRoute("dictionary")}
            style={{ marginTop: 20, appearance: "none", background: "var(--ink-1)", color: "var(--bg-elevated)", border: 0, padding: "10px 18px", borderRadius: 999, fontSize: 13, fontWeight: 500, cursor: "pointer" }}
          >
            Back to dictionary
          </button>
        </div>
      </div>
    );
  }

  if (done) {
    const total = stats.known + stats.unknown;
    const pct = total ? Math.round((stats.known / total) * 100) : 0;
    return (
      <div data-screen-label="Flashcards" style={{ padding: "44px 56px 56px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 20 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 100, lineHeight: 1, color: pct >= 70 ? "var(--c-mint-ink)" : "var(--c-rose-ink)" }}>{pct}%</div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 32, color: "var(--ink-1)" }}>
          {stats.known} known · {stats.unknown} to review
        </div>
        <p style={{ fontSize: 14, color: "var(--ink-3)", maxWidth: 360, textAlign: "center", lineHeight: 1.55 }}>
          Words you knew were marked as mastered. The rest stay in your learning pile.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={restart} style={{ appearance: "none", background: "var(--ink-1)", color: "var(--bg-elevated)", border: 0, padding: "10px 18px", borderRadius: 999, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
            Practise again
          </button>
          <button onClick={() => setRoute("dictionary")} style={{ appearance: "none", background: "transparent", color: "var(--ink-2)", border: "1px solid var(--line-strong)", padding: "10px 18px", borderRadius: 999, fontSize: 13, cursor: "pointer" }}>
            Back to dictionary
          </button>
        </div>
      </div>
    );
  }

  return (
    <div data-screen-label="Flashcards" style={{ padding: "44px 56px 56px", height: "100%", display: "flex", flexDirection: "column" }}>
      <PageHeader
        eyebrow={`Card ${idx + 1} of ${deck.length}`}
        title="Practise."
        subtitle="Tap the card to reveal the meaning, then say whether you knew it."
        right={
          <div style={{ display: "flex", gap: 14, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)" }}>
            <span style={{ color: "var(--c-mint-ink)" }}>✓ {stats.known}</span>
            <span style={{ color: "var(--c-rose-ink)" }}>✗ {stats.unknown}</span>
          </div>
        }
      />

      <div style={{ height: 6, background: "var(--bg-sunken)", borderRadius: 999, overflow: "hidden", marginBottom: 28 }}>
        <div style={{ width: `${((idx) / deck.length) * 100}%`, height: "100%", background: "var(--c-peach-ink)", transition: "width .3s ease" }} />
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28 }}>
        <button
          onClick={() => setFlipped((f) => !f)}
          style={{
            appearance: "none", border: 0, cursor: "pointer",
            width: "min(560px, 100%)", minHeight: 320,
            background: flipped ? "var(--c-lavender)" : "var(--c-peach)",
            color: flipped ? "var(--c-lavender-ink)" : "var(--c-peach-ink)",
            borderRadius: "var(--r-xl)",
            padding: "40px",
            display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 16,
            transition: "background .3s ease",
            animation: "flipIn .3s ease",
          }}
          key={`${idx}-${flipped}`}
        >
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 0.08, textTransform: "uppercase", opacity: 0.6 }}>
            {flipped ? "Translation" : "Word"}
          </div>
          {flipped ? (
            <>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 36, lineHeight: 1.2, textAlign: "center", paddingBottom: 6 }}>{card.tgt}</div>
              <div style={{ fontSize: 14, opacity: 0.7, textAlign: "center", maxWidth: 400 }}>{card.nat}</div>
              {card.ex && <div style={{ fontStyle: "italic", fontSize: 14, opacity: 0.7, marginTop: 12, textAlign: "center", maxWidth: 420 }}>"{card.ex}"</div>}
            </>
          ) : (
            <>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 64, lineHeight: 1.1, textAlign: "center", paddingBottom: 6 }}>{card.w}</div>
              <div style={{ fontStyle: "italic", fontSize: 16, opacity: 0.6 }}>{card.pos}</div>
            </>
          )}
          <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", opacity: 0.5, marginTop: 12 }}>
            {flipped ? "tap to flip back" : "tap to reveal"}
          </div>
        </button>

        <div style={{ display: "flex", gap: 14 }}>
          <button
            onClick={() => handle(false)}
            disabled={!flipped}
            style={{
              appearance: "none", border: 0, cursor: flipped ? "pointer" : "not-allowed",
              opacity: flipped ? 1 : 0.4,
              background: "var(--c-rose)", color: "var(--c-rose-ink)",
              padding: "14px 28px", borderRadius: 999, fontSize: 14, fontWeight: 500,
              display: "inline-flex", alignItems: "center", gap: 8,
              transition: "all .15s ease",
            }}
          >
            Didn't know
          </button>
          <button
            onClick={() => handle(true)}
            disabled={!flipped}
            style={{
              appearance: "none", border: 0, cursor: flipped ? "pointer" : "not-allowed",
              opacity: flipped ? 1 : 0.4,
              background: "var(--c-mint)", color: "var(--c-mint-ink)",
              padding: "14px 28px", borderRadius: 999, fontSize: 14, fontWeight: 500,
              display: "inline-flex", alignItems: "center", gap: 8,
              transition: "all .15s ease",
            }}
          >
            <Icon name="check" size={14} stroke={2} /> Knew it (+5 XP)
          </button>
        </div>
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════
// CALENDAR
// ═════════════════════════════════════════════════════════════

const CalendarScreen = () => {
  const s = useStore();
  const classes = s.classes;
  const upcoming = classes.filter((c) => c.status === "scheduled").sort((a, b) => a.date.localeCompare(b.date));
  const past = classes.filter((c) => c.status === "done").sort((a, b) => b.date.localeCompare(a.date));
  const [editingId, setEditingId] = useState(upcoming[0]?.id);
  const [focusText, setFocusText] = useState(upcoming[0]?.focus || "");
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    const editingClass = classes.find((c) => c.id === editingId);
    if (editingClass) setFocusText(editingClass.focus || "");
  }, [editingId, classes]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  };
  const formatShortDate = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  const saveFocus = () => {
    actions.setClassFocus(editingId, focusText);
    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(null), 2000);
  };

  return (
    <div data-screen-label="Calendar" style={{ padding: "44px 56px 56px", overflowY: "auto", height: "100%" }}>
      <PageHeader
        eyebrow={`${upcoming.length} upcoming · ${past.length} completed`}
        title="Your"
        accent="schedule."
        subtitle="Upcoming classes and what you'd like to focus on. Natália sees your focus before each lesson."
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--d-gap)", marginBottom: 28 }}>
        <div style={{ background: "var(--bg-elevated)", borderRadius: "var(--r-lg)", border: "0.5px solid var(--line)", padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: 0.08, color: "var(--ink-3)", textTransform: "uppercase" }}>Upcoming</div>
          {upcoming.length === 0 && (
            <div style={{ color: "var(--ink-4)", fontSize: 13 }}>No classes scheduled.</div>
          )}
          {upcoming.map((c) => {
            const isEditing = editingId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setEditingId(c.id)}
                style={{
                  appearance: "none", border: 0, textAlign: "left", cursor: "pointer",
                  background: isEditing ? "var(--c-mint)" : "var(--bg-window)",
                  color: isEditing ? "var(--c-mint-ink)" : "var(--ink-1)",
                  padding: "14px 18px", borderRadius: "var(--r-md)",
                  display: "flex", flexDirection: "column", gap: 4,
                  transition: "background .15s ease",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 22 }}>{formatShortDate(c.date)}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{c.time}</div>
                </div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                  {c.focus ? `Focus: ${c.focus}` : "No focus set"}
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ background: "var(--c-lavender)", color: "var(--c-lavender-ink)", borderRadius: "var(--r-lg)", padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: 0.08, textTransform: "uppercase", opacity: 0.7 }}>
            Focus for {editingId ? formatDate(classes.find((c) => c.id === editingId).date) : "—"}
          </div>
          <textarea
            value={focusText}
            onChange={(e) => setFocusText(e.target.value)}
            placeholder="What would you like to focus on? e.g. 'le subjonctif après les conjonctions'"
            style={{
              flex: 1, minHeight: 120, padding: "14px 16px",
              border: "1px solid rgba(0,0,0,.15)", borderRadius: "var(--r-md)",
              background: "rgba(255,255,255,.55)", outline: 0,
              fontFamily: "var(--font-display)", fontSize: 18, lineHeight: 1.4,
              color: "var(--c-lavender-ink)", resize: "vertical",
            }}
          />
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              onClick={saveFocus}
              style={{ appearance: "none", background: "var(--c-lavender-ink)", color: "var(--c-lavender)", border: 0, padding: "10px 18px", borderRadius: 999, fontSize: 13, fontWeight: 500, cursor: "pointer" }}
            >
              Send to Natália
            </button>
            {savedAt && <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, opacity: 0.7 }}>✓ Sent</span>}
          </div>
        </div>
      </div>

      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: 0.08, color: "var(--ink-3)", textTransform: "uppercase", marginBottom: 14, marginLeft: 4 }}>
        Past classes
      </div>
      <div style={{ background: "var(--bg-elevated)", borderRadius: "var(--r-lg)", border: "0.5px solid var(--line)", overflow: "hidden" }}>
        {past.map((c) => (
          <div key={c.id} style={{ padding: "16px 22px", borderBottom: "0.5px solid var(--line)", display: "grid", gridTemplateColumns: "150px 1fr auto", alignItems: "center", gap: 18 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--ink-1)" }}>{formatShortDate(c.date)}</div>
            <div style={{ fontSize: 13, color: "var(--ink-3)" }}>{c.focus || "—"}</div>
            <HWPill status="done" />
          </div>
        ))}
      </div>
    </div>
  );
};

export { HomeScreen, DictionaryScreen, HomeworkScreen, MaterialsScreen, FlashcardsScreen, CalendarScreen }
