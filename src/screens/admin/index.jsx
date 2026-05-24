import React from 'react'
import { useAdminStore, useStudentViewFor, useSession, getState, actions } from '../../store'
import { Icon, Avatar, Sidebar, CEFRBar, NavBtn } from '../../components/chrome'

const { useState: aState, useMemo: aMemo, useEffect: aEffect, useRef: aRef } = React

// ═════════════════════════════════════════════════════════════
// SHARED PIECES
// ═════════════════════════════════════════════════════════════

const AdminPageHeader = ({ eyebrow, title, accent, subtitle, right }) => (
  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 30, gap: 24, flexWrap: "wrap" }}>
    <div style={{ flex: "1 1 auto", minWidth: 0 }}>
      {eyebrow && (
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: 0.08, color: "var(--ink-3)", textTransform: "uppercase", marginBottom: 12 }}>
          {eyebrow}
        </div>
      )}
      <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: 56, lineHeight: 1.08, margin: 0, letterSpacing: -0.5, color: "var(--ink-1)" }}>
        <span>{title}</span>
        {accent && <> <i style={{ color: "var(--c-rose-ink)" }}>{accent}</i></>}
      </h1>
      {subtitle && <p style={{ fontSize: 14, color: "var(--ink-3)", marginTop: 14, marginBottom: 0, maxWidth: 540, lineHeight: 1.55 }}>{subtitle}</p>}
    </div>
    {right && <div style={{ flexShrink: 0 }}>{right}</div>}
  </div>
);

const PaymentBadge = ({ status }) => {
  const map = {
    active:   { tone: "mint",   ink: "mint-ink",   label: "Active",   dot: true },
    overdue:  { tone: "butter", ink: "butter-ink", label: "Overdue",  dot: true },
    blocked:  { tone: "rose",   ink: "rose-ink",   label: "Blocked",  dot: true },
    trial:    { tone: "sky",    ink: "sky-ink",    label: "Trial",    dot: true },
  }[status] || { tone: "sky", ink: "sky-ink", label: status };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: `var(--c-${map.tone})`, color: `var(--c-${map.ink})`,
      padding: "4px 10px", borderRadius: 999,
      fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 0.06, textTransform: "uppercase",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} />
      {map.label}
    </span>
  );
};

const HwStatusPill = ({ status }) => {
  const map = {
    assigned:    { bg: "var(--c-rose)",   ink: "var(--c-rose-ink)",   l: "Assigned" },
    in_progress: { bg: "var(--c-peach)",  ink: "var(--c-peach-ink)",  l: "In progress" },
    submitted:   { bg: "var(--c-butter)", ink: "var(--c-butter-ink)", l: "Submitted" },
    graded:      { bg: "var(--c-mint)",   ink: "var(--c-mint-ink)",   l: "Graded" },
  }[status];
  if (!map) return null;
  return (
    <span style={{ background: map.bg, color: map.ink, padding: "4px 10px", borderRadius: 999, fontSize: 11, fontFamily: "var(--font-mono)", letterSpacing: 0.04, textTransform: "uppercase" }}>
      {map.l}
    </span>
  );
};

const GhostButton = ({ children, onClick, danger, small }) => (
  <button
    onClick={onClick}
    style={{
      appearance: "none",
      background: "transparent",
      border: `1px solid ${danger ? "var(--c-rose-ink)" : "var(--line-strong)"}`,
      color: danger ? "var(--c-rose-ink)" : "var(--ink-2)",
      padding: small ? "6px 12px" : "10px 16px",
      borderRadius: 999, fontSize: small ? 12 : 13, cursor: "pointer",
      display: "inline-flex", alignItems: "center", gap: 6,
      fontFamily: "var(--font-sans)", fontWeight: 500,
      transition: "all .15s ease",
    }}
  >
    {children}
  </button>
);

const PrimaryButton = ({ children, onClick, disabled, small }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      appearance: "none",
      background: disabled ? "var(--bg-sunken)" : "var(--ink-1)",
      color: disabled ? "var(--ink-4)" : "var(--bg-elevated)",
      border: 0,
      padding: small ? "8px 14px" : "10px 18px",
      borderRadius: 999, fontSize: small ? 12 : 13, fontWeight: 500,
      cursor: disabled ? "not-allowed" : "pointer",
      display: "inline-flex", alignItems: "center", gap: 6,
      fontFamily: "var(--font-sans)",
      transition: "all .15s ease",
    }}
  >
    {children}
  </button>
);

const TextField = ({ label, value, onChange, placeholder, type = "text", required, multiline, rows = 4, hint }) => {
  const Element = multiline ? "textarea" : "input";
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 0.08, color: "var(--ink-3)", textTransform: "uppercase" }}>
        {label} {required && <span style={{ color: "var(--c-rose-ink)" }}>*</span>}
      </span>
      <Element
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{
          appearance: "none",
          border: "1px solid var(--line-strong)",
          background: "var(--bg-elevated)",
          borderRadius: "var(--r-md)",
          padding: "12px 14px",
          fontFamily: multiline ? "var(--font-display)" : "var(--font-sans)",
          fontSize: multiline ? 16 : 14,
          color: "var(--ink-1)",
          outline: 0,
          resize: multiline ? "vertical" : "none",
          lineHeight: multiline ? 1.55 : 1.4,
        }}
      />
      {hint && <span style={{ fontSize: 11, color: "var(--ink-4)" }}>{hint}</span>}
    </label>
  );
};

const SelectField = ({ label, value, onChange, options }) => (
  <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 0.08, color: "var(--ink-3)", textTransform: "uppercase" }}>
      {label}
    </span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        appearance: "none",
        border: "1px solid var(--line-strong)",
        background: "var(--bg-elevated)",
        borderRadius: "var(--r-md)",
        padding: "12px 14px",
        fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--ink-1)",
        outline: 0, cursor: "pointer",
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </label>
);

const SearchInput = ({ placeholder = "Search…", value, onChange }) => (
  <div style={{ position: "relative", flex: "1 1 180px", maxWidth: 320 }}>
    <input
      type="text" placeholder={placeholder} value={value || ""} onChange={(e) => onChange && onChange(e.target.value)}
      style={{ width: "100%", height: 34, paddingLeft: 32, paddingRight: 12, border: "0.5px solid var(--line-strong)", borderRadius: 999, background: "var(--bg-elevated)", fontSize: 12, fontFamily: "var(--font-sans)", color: "var(--ink-1)", outline: "none", boxSizing: "border-box" }}
    />
    <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--ink-4)", pointerEvents: "none", display: "flex" }}>
      <Icon name="search" size={14} />
    </span>
  </div>
);

// ─── File dropzone ──────────────────────────────────────────
const FileDropzone = ({ accept = "application/pdf", onFile, currentName, sublabel }) => {
  const [drag, setDrag] = aState(false);
  const inputRef = aRef(null);

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => onFile({ dataUrl: e.target.result, name: file.name, size: file.size, type: file.type });
    reader.readAsDataURL(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
      onClick={() => inputRef.current?.click()}
      style={{
        border: `2px dashed ${drag ? "var(--ink-2)" : "var(--line-strong)"}`,
        background: drag ? "var(--bg-elevated)" : "var(--bg-window)",
        borderRadius: "var(--r-md)",
        padding: "40px 24px",
        textAlign: "center",
        cursor: "pointer",
        transition: "all .15s ease",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files[0])}
      />
      <Icon name="paper" size={24} />
      <div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--ink-1)", marginTop: 10 }}>
        {currentName ? <>Replace <i>{currentName}</i></> : "Drag & drop a PDF here"}
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)", marginTop: 6, letterSpacing: 0.04 }}>
        {sublabel || "or click to browse"}
      </div>
    </div>
  );
};

// ─── PDF viewer ─────────────────────────────────────────────
const PDFViewer = ({ dataUrl, name, height = 600 }) => {
  const containerRef = aRef(null);
  const [error, setError] = aState(null);
  const [loading, setLoading] = aState(false);

  aEffect(() => {
    if (!dataUrl) return;
    if (!window.pdfjsLib) {
      setError("PDF library not loaded yet.");
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        // dataUrl is base64; convert to Uint8Array for pdf.js stability
        const base64 = dataUrl.split(",")[1];
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

        const loadingTask = window.pdfjsLib.getDocument({ data: bytes });
        const pdf = await loadingTask.promise;
        if (cancelled || !containerRef.current) return;
        containerRef.current.innerHTML = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const containerWidth = containerRef.current.clientWidth - 24;
          const baseViewport = page.getViewport({ scale: 1 });
          const scale = Math.min(2, Math.max(0.5, containerWidth / baseViewport.width));
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.display = "block";
          canvas.style.width = "100%";
          canvas.style.marginBottom = "12px";
          canvas.style.borderRadius = "8px";
          canvas.style.background = "white";
          canvas.style.boxShadow = "0 1px 3px rgba(0,0,0,0.08)";
          const ctx = canvas.getContext("2d");
          await page.render({ canvasContext: ctx, viewport }).promise;
          if (cancelled) return;
          containerRef.current.appendChild(canvas);
        }
        setLoading(false);
      } catch (e) {
        if (!cancelled) {
          setError(e.message || "Could not render PDF");
          setLoading(false);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [dataUrl]);

  if (!dataUrl) {
    return (
      <div style={{
        height, background: "var(--bg-window)", border: "0.5px dashed var(--line-strong)",
        borderRadius: "var(--r-md)", display: "grid", placeItems: "center",
        color: "var(--ink-4)", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: 0.04, textTransform: "uppercase",
      }}>
        No PDF attached
      </div>
    );
  }

  return (
    <div style={{
      background: "var(--bg-window)", border: "0.5px solid var(--line)",
      borderRadius: "var(--r-md)", height, overflow: "hidden",
      display: "flex", flexDirection: "column",
    }}>
      {name && (
        <div style={{
          padding: "10px 14px", borderBottom: "0.5px solid var(--line)",
          fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)",
          letterSpacing: 0.04, display: "flex", alignItems: "center", gap: 8,
        }}>
          <Icon name="paper" size={13} /> {name}
          {loading && <span style={{ marginLeft: "auto" }}>rendering…</span>}
        </div>
      )}
      {error ? (
        <div style={{ padding: 20, color: "var(--c-rose-ink)", fontSize: 13 }}>
          Couldn't render PDF: {error}
        </div>
      ) : (
        <div ref={containerRef} style={{ flex: 1, overflowY: "auto", padding: 12 }} />
      )}
    </div>
  );
};

// ─── Field builder ──────────────────────────────────────────
const FieldBuilder = ({ fields, onChange }) => {
  const update = (idx, patch) => onChange(fields.map((f, i) => (i === idx ? { ...f, ...patch } : f)));
  const remove = (idx) => onChange(fields.filter((_, i) => i !== idx));
  const add = () => onChange([...fields, { id: `f-${Math.random().toString(36).slice(2, 7)}`, label: `Question ${fields.length + 1}`, type: "text" }]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {fields.length === 0 && (
        <div style={{ padding: 16, color: "var(--ink-4)", fontSize: 13, fontStyle: "italic", textAlign: "center" }}>
          No questions yet. Add one below.
        </div>
      )}
      {fields.map((f, idx) => (
        <div key={f.id} style={{
          background: "var(--bg-elevated)", border: "0.5px solid var(--line)",
          borderRadius: "var(--r-md)", padding: 16,
          display: "grid", gridTemplateColumns: "auto 1fr 160px auto", gap: 12, alignItems: "center",
        }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-4)" }}>
            {String(idx + 1).padStart(2, "0")}
          </span>
          <input
            value={f.label}
            onChange={(e) => update(idx, { label: e.target.value })}
            placeholder="Question prompt"
            style={{
              appearance: "none", border: 0, background: "transparent",
              fontFamily: "var(--font-display)", fontSize: 16, color: "var(--ink-1)", outline: 0, padding: 0,
            }}
          />
          <select
            value={f.type}
            onChange={(e) => update(idx, { type: e.target.value })}
            style={{
              appearance: "none", border: "1px solid var(--line-strong)", background: "var(--bg-window)",
              borderRadius: "var(--r-pill)", padding: "6px 12px",
              fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-2)", letterSpacing: 0.04,
              outline: 0, cursor: "pointer",
            }}
          >
            <option value="text">Short text</option>
            <option value="textarea">Long text</option>
            <option value="multiple_choice">Multiple choice</option>
          </select>
          <button
            onClick={() => remove(idx)}
            aria-label="Remove"
            style={{ appearance: "none", border: 0, background: "transparent", color: "var(--ink-4)", cursor: "pointer", padding: 6 }}
          >
            <Icon name="plus" size={16} stroke={1.8} />
          </button>
        </div>
      ))}
      <button
        onClick={add}
        style={{
          appearance: "none", background: "transparent",
          border: "1px dashed var(--line-strong)", color: "var(--ink-3)",
          padding: "12px 16px", borderRadius: "var(--r-md)",
          fontFamily: "var(--font-sans)", fontSize: 13, cursor: "pointer",
          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}
      >
        <Icon name="plus" size={14} /> Add a question
      </button>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════
// ADMIN DASHBOARD — student grid
// ═════════════════════════════════════════════════════════════

const AdminDashboard = ({ setRoute, setAdminTarget }) => {
  const { students, homework } = useAdminStore();
  const [query, setQuery] = aState("");
  const [cohortFilter, setCohortFilter] = aState("all");
  const [statusFilter, setStatusFilter] = aState("all");
  const [showNewStudent, setShowNewStudent] = aState(false);

  const cohorts = aMemo(() => Array.from(new Set(students.map((s) => s.cohort).filter(Boolean))), [students]);

  const filtered = students.filter((s) => {
    if (query && !s.name.toLowerCase().includes(query.toLowerCase()) && !s.email.toLowerCase().includes(query.toLowerCase())) return false;
    if (cohortFilter !== "all" && s.cohort !== cohortFilter) return false;
    if (statusFilter !== "all" && s.paymentStatus !== statusFilter) return false;
    return true;
  });

  const inboxCount = homework.filter((h) => h.status === "submitted").length;

  return (
    <div data-screen-label="Admin · Dashboard" style={{ padding: "44px 56px 56px", maxWidth: 1280, margin: "0 auto" }}>
      <AdminPageHeader
        eyebrow={`${students.length} students · ${inboxCount} to grade`}
        title="Your"
        accent="students."
        subtitle="Manage everyone in one place. Click a row for details, or use the actions to assign new homework."
        right={
          <div style={{ display: "flex", gap: 10 }}>
            {inboxCount > 0 && (
              <GhostButton onClick={() => setRoute("admin-inbox")}>
                <Icon name="bell" size={14} /> Inbox · {inboxCount}
              </GhostButton>
            )}
            <PrimaryButton onClick={() => setShowNewStudent(true)}>
              <Icon name="plus" size={14} /> New student
            </PrimaryButton>
          </div>
        }
      />

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 18, flexWrap: "wrap" }}>
        <SearchInput placeholder="Search by name or email…" value={query} onChange={setQuery} />
        <select
          value={cohortFilter}
          onChange={(e) => setCohortFilter(e.target.value)}
          style={selectStyle}
        >
          <option value="all">All cohorts</option>
          {cohorts.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={selectStyle}
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="overdue">Overdue</option>
          <option value="blocked">Blocked</option>
          <option value="trial">Trial</option>
        </select>
      </div>

      {/* Grid */}
      <div style={{ background: "var(--bg-elevated)", borderRadius: "var(--r-lg)", border: "0.5px solid var(--line)", overflow: "hidden" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "minmax(220px, 2fr) 1fr 1fr 2fr auto",
          gap: 16, padding: "14px 22px",
          background: "var(--bg-sunken)",
          fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 0.08, textTransform: "uppercase", color: "var(--ink-3)",
        }}>
          <div>Student</div>
          <div>Cohort</div>
          <div>Status</div>
          <div>Current homework</div>
          <div>Actions</div>
        </div>
        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: "var(--ink-4)", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: 0.04, textTransform: "uppercase" }}>
            No students match your filters
          </div>
        )}
        {filtered.map((s) => (
          <StudentRow key={s.id} student={s} setRoute={setRoute} setAdminTarget={setAdminTarget} />
        ))}
      </div>

      {showNewStudent && <NewStudentModal onClose={() => setShowNewStudent(false)} setRoute={setRoute} setAdminTarget={setAdminTarget} />}
    </div>
  );
};

const selectStyle = {
  appearance: "none",
  background: "var(--bg-elevated)",
  border: "1px solid var(--line)",
  borderRadius: 999,
  padding: "10px 14px",
  fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink-2)",
  outline: 0, cursor: "pointer",
};

const StudentRow = ({ student, setRoute, setAdminTarget }) => {
  const hw = student.latestHomework;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(220px, 2fr) 1fr 1fr 2fr auto",
        gap: 16, padding: "18px 22px",
        borderTop: "0.5px solid var(--line)",
        alignItems: "center",
        background: student.isActive ? "transparent" : "rgba(0,0,0,0.02)",
        opacity: student.isActive ? 1 : 0.6,
        cursor: "pointer",
        transition: "background .15s ease",
      }}
      onClick={() => { setAdminTarget(student.id); setRoute("admin-student"); }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-window)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = student.isActive ? "transparent" : "rgba(0,0,0,0.02)"; }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <Avatar name={student.initials} size={36} tone={student.avatarTone} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 18, lineHeight: 1.2, color: "var(--ink-1)", paddingBottom: 2 }}>
            {student.name}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-4)", letterSpacing: 0.04 }}>
            {student.email}
          </div>
        </div>
      </div>
      <div style={{ fontSize: 13, color: "var(--ink-2)" }}>
        {student.cohort || <span style={{ color: "var(--ink-4)" }}>—</span>}
      </div>
      <div>
        <PaymentBadge status={student.paymentStatus} />
      </div>
      <div onClick={(e) => e.stopPropagation()}>
        {hw ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <HwStatusPill status={hw.status} />
            <span style={{ fontSize: 13, color: "var(--ink-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{hw.title}</span>
            {hw.status === "submitted" && (
              <GhostButton small onClick={() => { setAdminTarget(hw.id); setRoute("admin-homework-grade"); }}>
                Grade →
              </GhostButton>
            )}
            {hw.status === "graded" && (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--c-mint-ink)" }}>
                {hw.grade != null ? `${hw.grade}/10` : "✓"}
              </span>
            )}
          </div>
        ) : (
          <PrimaryButton small onClick={() => { setAdminTarget(student.id); setRoute("admin-homework-new"); }}>
            <Icon name="plus" size={12} /> Assign
          </PrimaryButton>
        )}
      </div>
      <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", gap: 6 }}>
        <GhostButton small onClick={() => { setAdminTarget(student.id); setRoute("admin-student"); }}>
          Edit
        </GhostButton>
      </div>
    </div>
  );
};

const NewStudentModal = ({ onClose, setRoute, setAdminTarget }) => {
  const [name, setName] = aState("");
  const [email, setEmail] = aState("");
  const [level, setLevel] = aState("A1");
  const [cohort, setCohort] = aState("");

  const create = () => {
    if (!name.trim() || !email.trim()) return;
    const id = actions.createStudent({ name: name.trim(), email: email.trim(), level, cohort });
    setAdminTarget(id);
    setRoute("admin-student");
    onClose();
  };

  return (
    <ModalShell onClose={onClose} title="New student">
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <TextField label="Full name" value={name} onChange={setName} placeholder="Laura Mendes" required />
        <TextField label="Email" value={email} onChange={setEmail} placeholder="laura@example.com" type="email" required hint="They'll use this to log in once Auth is enabled." />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 14 }}>
          <SelectField label="CEFR level" value={level} onChange={setLevel} options={[
            { value: "A1", label: "A1" }, { value: "A2", label: "A2" },
            { value: "B1", label: "B1" }, { value: "B2", label: "B2" },
            { value: "C1", label: "C1" }, { value: "C2", label: "C2" },
          ]} />
          <TextField label="Cohort / class" value={cohort} onChange={setCohort} placeholder="B1 · Wednesdays" />
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton onClick={create} disabled={!name.trim() || !email.trim()}>Create student</PrimaryButton>
        </div>
      </div>
    </ModalShell>
  );
};

const ModalShell = ({ onClose, title, children, width = 520 }) => (
  <div
    onClick={onClose}
    style={{
      position: "fixed", inset: 0,
      background: "rgba(29,24,18,.4)",
      display: "grid", placeItems: "center",
      zIndex: 100,
      animation: "fadeIn .15s ease",
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background: "var(--bg-window)",
        borderRadius: "var(--r-lg)",
        padding: 32, width, maxWidth: "calc(100vw - 32px)",
        maxHeight: "90vh", overflowY: "auto",
        border: "0.5px solid var(--line)",
        boxShadow: "0 12px 60px rgba(0,0,0,.25)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "var(--ink-1)" }}>{title}</div>
        <button onClick={onClose} aria-label="Close" style={{ background: "transparent", border: 0, color: "var(--ink-3)", cursor: "pointer", transform: "rotate(45deg)" }}>
          <Icon name="plus" size={18} stroke={1.8} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

// ═════════════════════════════════════════════════════════════
// ADMIN STUDENT DETAIL
// ═════════════════════════════════════════════════════════════

const AdminStudentDetail = ({ studentId, setRoute, setAdminTarget }) => {
  const view = useStudentViewFor(studentId);
  const { homework } = useAdminStore();
  const [editing, setEditing] = aState(false);
  const [confirmDelete, setConfirmDelete] = aState(false);

  if (!view) {
    return (
      <div style={{ padding: 56 }}>
        <GhostButton onClick={() => setRoute("admin-dashboard")}>← Back to students</GhostButton>
        <div style={{ marginTop: 40, color: "var(--ink-4)", textAlign: "center" }}>Student not found.</div>
      </div>
    );
  }

  const profile = view.profile;
  const meta = view.student;
  const myHomework = homework.filter((h) => h.student_id === studentId);
  const isActive = getState().studentMeta[studentId]?.isActive;
  const paymentStatus = getState().studentMeta[studentId]?.paymentStatus;

  return (
    <div data-screen-label="Admin · Student" style={{ padding: "44px 56px 56px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <GhostButton onClick={() => setRoute("admin-dashboard")} small>← All students</GhostButton>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: 24, marginBottom: 36, flexWrap: "wrap" }}>
        <Avatar name={profile.initials} size={88} tone={profile.avatarTone} />
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: 0.08, color: "var(--ink-3)", textTransform: "uppercase", marginBottom: 10 }}>
            Student · {meta.targetLang} · {meta.level}
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: 56, lineHeight: 1.08, margin: 0, letterSpacing: -0.5, color: "var(--ink-1)" }}>
            {profile.name}
          </h1>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-3)", marginTop: 10, letterSpacing: 0.04 }}>
            {profile.email}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <PaymentBadge status={paymentStatus} />
          <GhostButton onClick={() => setEditing(true)} small>Edit</GhostButton>
          <PrimaryButton onClick={() => { setAdminTarget(studentId); setRoute("admin-homework-new"); }}>
            <Icon name="plus" size={14} /> New homework
          </PrimaryButton>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 26 }}>
        <StatTile tone="lavender" value={view.words.length} label="Dictionary words" />
        <StatTile tone="peach" value={myHomework.length} label="Total homework" />
        <StatTile tone="butter" value={myHomework.filter((h) => h.status === "submitted").length} label="To grade" />
        <StatTile tone="mint" value={meta.xp.toLocaleString()} label="XP" />
      </div>

      {/* Homework history */}
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: 0.08, color: "var(--ink-3)", textTransform: "uppercase", marginBottom: 14 }}>
        Homework history
      </div>
      <div style={{ background: "var(--bg-elevated)", borderRadius: "var(--r-lg)", border: "0.5px solid var(--line)", overflow: "hidden" }}>
        {myHomework.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--ink-4)", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: 0.04, textTransform: "uppercase" }}>
            No homework yet — assign the first one
          </div>
        ) : myHomework.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || "")).map((h) => (
          <HomeworkRow key={h.id} hw={h} setRoute={setRoute} setAdminTarget={setAdminTarget} />
        ))}
      </div>

      {/* Notes */}
      <div style={{ marginTop: 30 }}>
        <TextField
          label="Internal notes"
          value={meta.notes || ""}
          onChange={(v) => actions.updateStudent(studentId, { notes: v })}
          multiline
          rows={3}
          placeholder="Private notes only you see…"
          hint="Visible to admins only."
        />
      </div>

      {/* Danger zone */}
      <div style={{ marginTop: 36, padding: 22, background: "var(--bg-elevated)", border: "0.5px solid var(--line)", borderRadius: "var(--r-lg)" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: 0.08, color: "var(--ink-3)", textTransform: "uppercase", marginBottom: 14 }}>
          Account actions
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <SelectField
            label="Payment status"
            value={paymentStatus}
            onChange={(v) => actions.setPaymentStatus(studentId, v)}
            options={[
              { value: "active", label: "Active" },
              { value: "overdue", label: "Overdue" },
              { value: "blocked", label: "Blocked (no access)" },
              { value: "trial", label: "Trial" },
            ]}
          />
          <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
            <GhostButton onClick={() => actions.toggleActive(studentId)}>
              {isActive ? "Deactivate" : "Reactivate"}
            </GhostButton>
            <GhostButton onClick={() => setConfirmDelete(true)} danger>
              Delete student
            </GhostButton>
          </div>
        </div>
      </div>

      {editing && <EditStudentModal studentId={studentId} onClose={() => setEditing(false)} />}
      {confirmDelete && (
        <ModalShell onClose={() => setConfirmDelete(false)} title="Delete student?">
          <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.55, marginTop: 0 }}>
            This permanently removes <b>{profile.name}</b>, their dictionary, homework history, and materials. This cannot be undone.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
            <GhostButton onClick={() => setConfirmDelete(false)}>Cancel</GhostButton>
            <button
              onClick={() => { actions.deleteStudent(studentId); setRoute("admin-dashboard"); }}
              style={{
                appearance: "none", background: "var(--c-rose-ink)", color: "var(--c-rose)",
                border: 0, padding: "10px 18px", borderRadius: 999,
                fontSize: 13, fontWeight: 500, cursor: "pointer",
              }}
            >
              Delete permanently
            </button>
          </div>
        </ModalShell>
      )}
    </div>
  );
};

const StatTile = ({ tone, value, label }) => (
  <div style={{ background: `var(--c-${tone})`, color: `var(--c-${tone}-ink)`, padding: "20px 22px", borderRadius: "var(--r-md)" }}>
    <div style={{ fontFamily: "var(--font-display)", fontSize: 36, lineHeight: 1.15, paddingBottom: 4 }}>{value}</div>
    <div style={{ fontSize: 12, opacity: 0.8 }}>{label}</div>
  </div>
);

const HomeworkRow = ({ hw, setRoute, setAdminTarget }) => (
  <div style={{
    display: "grid",
    gridTemplateColumns: "auto 1fr auto auto auto",
    gap: 14, padding: "16px 22px",
    borderTop: "0.5px solid var(--line)", alignItems: "center",
  }}>
    <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--bg-sunken)", display: "grid", placeItems: "center" }}>
      <Icon name={hw.pdf_data_url ? "paper" : "quote"} size={14} />
    </div>
    <div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--ink-1)", paddingBottom: 2 }}>{hw.title}</div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-4)", marginTop: 4 }}>
        {hw.fields.length} {hw.fields.length === 1 ? "question" : "questions"}
        {hw.due_at && <> · due {new Date(hw.due_at + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</>}
      </div>
    </div>
    <HwStatusPill status={hw.status} />
    {hw.grade != null && (
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--c-mint-ink)" }}>{hw.grade}/10</span>
    )}
    <div style={{ display: "flex", gap: 6 }}>
      {hw.status === "submitted" || hw.status === "graded" ? (
        <GhostButton small onClick={() => { setAdminTarget(hw.id); setRoute("admin-homework-grade"); }}>
          {hw.status === "submitted" ? "Grade →" : "Review →"}
        </GhostButton>
      ) : (
        <GhostButton small onClick={() => { setAdminTarget(hw.id); setRoute("admin-homework-edit"); }}>
          Edit
        </GhostButton>
      )}
    </div>
  </div>
);

const EditStudentModal = ({ studentId, onClose }) => {
  const state = getState();
  const profile = state.profiles.find((p) => p.id === studentId);
  const meta = state.studentMeta[studentId] || {};
  const [name, setName] = aState(profile.name);
  const [email, setEmail] = aState(profile.email);
  const [level, setLevel] = aState(meta.level);
  const [cohort, setCohort] = aState(meta.cohort || "");
  const [pct, setPct] = aState(meta.pct);

  const save = () => {
    actions.updateStudent(studentId, { name, email, level, cohort, pct: Number(pct) || 0 });
    onClose();
  };

  return (
    <ModalShell onClose={onClose} title={`Edit ${profile.name}`}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <TextField label="Full name" value={name} onChange={setName} />
        <TextField label="Email" value={email} onChange={setEmail} type="email" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 14 }}>
          <SelectField label="CEFR level" value={level} onChange={setLevel} options={[
            { value: "A1", label: "A1" }, { value: "A2", label: "A2" },
            { value: "B1", label: "B1" }, { value: "B2", label: "B2" },
            { value: "C1", label: "C1" }, { value: "C2", label: "C2" },
          ]} />
          <TextField label="Cohort / class" value={cohort} onChange={setCohort} />
        </div>
        <TextField label="Progress to next level (%)" value={pct} onChange={setPct} type="number" hint="0–100" />
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton onClick={save}>Save changes</PrimaryButton>
        </div>
      </div>
    </ModalShell>
  );
};

// ═════════════════════════════════════════════════════════════
// ADMIN HOMEWORK FORM (new + edit)
// ═════════════════════════════════════════════════════════════

const AdminHomeworkForm = ({ mode, target, setRoute, setAdminTarget }) => {
  const { students, homework } = useAdminStore();
  const editingHw = mode === "edit" ? homework.find((h) => h.id === target) : null;

  const [studentId, setStudentId] = aState(editingHw?.student_id || (typeof target === "string" && students.find((s) => s.id === target) ? target : students[0]?.id));
  const [title, setTitle] = aState(editingHw?.title || "");
  const [brief, setBrief] = aState(editingHw?.brief || "");
  const [pdf, setPdf] = aState(editingHw ? { dataUrl: editingHw.pdf_data_url, name: editingHw.pdf_name } : { dataUrl: null, name: null });
  const [fields, setFields] = aState(editingHw?.fields || [{ id: "q1", label: "Your answer", type: "textarea" }]);
  const [dueAt, setDueAt] = aState(editingHw?.due_at || "");
  const [minutes, setMinutes] = aState(editingHw?.minutes || 15);

  const canSave = studentId && title.trim() && fields.length > 0;

  const save = () => {
    if (!canSave) return;
    if (mode === "edit" && editingHw) {
      actions.updateHomework(editingHw.id, {
        title: title.trim(), brief, pdf_data_url: pdf.dataUrl, pdf_name: pdf.name,
        fields, due_at: dueAt || null, minutes: Number(minutes) || 15,
      });
      setRoute("admin-dashboard");
    } else {
      const id = actions.createHomework({
        studentId, title: title.trim(), brief,
        pdf_data_url: pdf.dataUrl, pdf_name: pdf.name,
        fields, due_at: dueAt || null, minutes: Number(minutes) || 15,
      });
      setAdminTarget(studentId);
      setRoute("admin-student");
    }
  };

  return (
    <div data-screen-label="Admin · Homework form" style={{ padding: "44px 56px 56px", maxWidth: 980, margin: "0 auto" }}>
      <div style={{ marginBottom: 18 }}>
        <GhostButton small onClick={() => setRoute(editingHw ? "admin-student" : "admin-dashboard")}>← Back</GhostButton>
      </div>

      <AdminPageHeader
        eyebrow={mode === "edit" ? "Editing homework" : "Step 1 of 3 — assign new homework"}
        title={mode === "edit" ? "Edit" : "New"}
        accent="homework."
        subtitle="Upload a reference PDF and add the questions the student should answer inside the platform."
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {/* 1. Student */}
        <Section number="01" title="For whom?">
          <SelectField
            label="Student"
            value={studentId}
            onChange={setStudentId}
            options={students.map((s) => ({ value: s.id, label: `${s.name} · ${s.cohort || "—"}` }))}
          />
        </Section>

        {/* 2. PDF */}
        <Section number="02" title="Reference PDF (optional)">
          <FileDropzone
            accept="application/pdf"
            onFile={(f) => setPdf({ dataUrl: f.dataUrl, name: f.name })}
            currentName={pdf.name}
            sublabel="Max 5MB · PDF only"
          />
          {pdf.dataUrl && (
            <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center" }}>
              <Icon name="check" size={14} />
              <span style={{ fontSize: 13, color: "var(--c-mint-ink)" }}>PDF attached: <b>{pdf.name}</b></span>
              <GhostButton small onClick={() => setPdf({ dataUrl: null, name: null })}>Remove</GhostButton>
            </div>
          )}
        </Section>

        {/* 3. Questions */}
        <Section number="03" title="What should the student answer?">
          <TextField label="Title" value={title} onChange={setTitle} placeholder="Present perfect vs past simple" required />
          <TextField label="Instructions (optional)" value={brief} onChange={setBrief} multiline rows={3} placeholder="Brief context the student sees above the questions…" />
          <div style={{ marginTop: 8 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 0.08, color: "var(--ink-3)", textTransform: "uppercase", marginBottom: 10 }}>
              Questions
            </div>
            <FieldBuilder fields={fields} onChange={setFields} />
          </div>
        </Section>

        {/* 4. Details */}
        <Section number="04" title="Details">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <TextField label="Due date" value={dueAt} onChange={setDueAt} type="date" />
            <TextField label="Estimated minutes" value={minutes} onChange={setMinutes} type="number" />
          </div>
        </Section>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 8 }}>
          <GhostButton onClick={() => setRoute("admin-dashboard")}>Cancel</GhostButton>
          <PrimaryButton onClick={save} disabled={!canSave}>
            {mode === "edit" ? "Save changes" : "Publish to student"} <Icon name="arrowR" size={13} />
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

const Section = ({ number, title, children }) => (
  <div style={{ background: "var(--bg-elevated)", border: "0.5px solid var(--line)", borderRadius: "var(--r-lg)", padding: 26 }}>
    <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 18 }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: 0.08, color: "var(--ink-4)" }}>{number}</span>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--ink-1)" }}>{title}</div>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {children}
    </div>
  </div>
);

// ═════════════════════════════════════════════════════════════
// ADMIN GRADE HOMEWORK
// ═════════════════════════════════════════════════════════════

const AdminGradeHomework = ({ homeworkId, setRoute, setAdminTarget }) => {
  const { homework, profiles } = useAdminStore();
  const hw = homework.find((h) => h.id === homeworkId);

  const [grade, setGrade] = aState(hw?.grade ?? "");
  const [feedback, setFeedback] = aState(hw?.feedback ?? "");

  if (!hw) {
    return (
      <div style={{ padding: 56 }}>
        <GhostButton onClick={() => setRoute("admin-dashboard")}>← Back</GhostButton>
        <div style={{ marginTop: 40, textAlign: "center", color: "var(--ink-4)" }}>Homework not found.</div>
      </div>
    );
  }

  const student = profiles.find((p) => p.id === hw.student_id);

  const finalise = () => {
    actions.gradeHomework(hw.id, { grade: grade === "" ? null : Number(grade), feedback });
    setAdminTarget(hw.student_id);
    setRoute("admin-student");
  };

  return (
    <div data-screen-label="Admin · Grade homework" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{ padding: "20px 32px", borderBottom: "0.5px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, background: "var(--bg-window)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
          <GhostButton small onClick={() => setRoute("admin-dashboard")}>← Back</GhostButton>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 0.08, color: "var(--ink-3)", textTransform: "uppercase" }}>
              Grading · {student?.name}
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--ink-1)", paddingBottom: 2 }}>
              {hw.title}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <HwStatusPill status={hw.status} />
          {hw.submitted_at && (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)" }}>
              submitted {new Date(hw.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          )}
        </div>
      </div>

      {/* 3-col split */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1.2fr 1.3fr 1fr", minHeight: 0 }}>
        {/* Col 1: PDF */}
        <div style={{ borderRight: "0.5px solid var(--line)", padding: 22, overflow: "hidden" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 0.08, color: "var(--ink-3)", textTransform: "uppercase", marginBottom: 12 }}>
            Reference PDF
          </div>
          <PDFViewer dataUrl={hw.pdf_data_url} name={hw.pdf_name} height="calc(100vh - 160px)" />
        </div>

        {/* Col 2: answers */}
        <div style={{ borderRight: "0.5px solid var(--line)", padding: 22, overflowY: "auto" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 0.08, color: "var(--ink-3)", textTransform: "uppercase", marginBottom: 14 }}>
            Student's answers
          </div>
          {hw.brief && (
            <div style={{ background: "var(--c-lavender)", color: "var(--c-lavender-ink)", padding: "14px 16px", borderRadius: "var(--r-md)", fontSize: 13, lineHeight: 1.5, marginBottom: 18 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 0.08, textTransform: "uppercase", opacity: 0.7, display: "block", marginBottom: 4 }}>Brief</span>
              {hw.brief}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {hw.fields.map((field, idx) => (
              <AnswerBlock key={field.id} field={field} idx={idx} hw={hw} />
            ))}
          </div>
        </div>

        {/* Col 3: grade panel */}
        <div style={{ padding: 22, overflowY: "auto", background: "var(--bg-window)" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 0.08, color: "var(--ink-3)", textTransform: "uppercase", marginBottom: 14 }}>
            Final grade
          </div>
          <div style={{ background: "var(--bg-elevated)", padding: 18, borderRadius: "var(--r-md)", border: "0.5px solid var(--line)", display: "flex", flexDirection: "column", gap: 14 }}>
            <TextField label="Grade (out of 10)" value={grade} onChange={setGrade} type="number" placeholder="8.5" />
            <TextField label="Overall feedback" value={feedback} onChange={setFeedback} multiline rows={5} placeholder="What did the student do well? What should they work on?" />
            <PrimaryButton onClick={finalise}>
              {hw.status === "graded" ? "Update grade" : "Return to student"} <Icon name="arrowR" size={13} />
            </PrimaryButton>
          </div>

          {hw.comments.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 0.08, color: "var(--ink-3)", textTransform: "uppercase", marginBottom: 10 }}>
                Your inline comments ({hw.comments.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {hw.comments.map((c) => {
                  const fieldLabel = hw.fields.find((f) => f.id === c.field_id)?.label || "General";
                  return (
                    <div key={c.id} style={{ background: "var(--c-butter)", color: "var(--c-butter-ink)", padding: "10px 14px", borderRadius: "var(--r-md)", fontSize: 12 }}>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 0.08, textTransform: "uppercase", opacity: 0.7, marginBottom: 4 }}>
                        On: {fieldLabel.slice(0, 40)}{fieldLabel.length > 40 ? "…" : ""}
                      </div>
                      <div style={{ lineHeight: 1.45 }}>{c.body}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AnswerBlock = ({ field, idx, hw }) => {
  const [commenting, setCommenting] = aState(false);
  const [comment, setComment] = aState("");
  const answer = (hw.answers || {})[field.id];
  const commentsForField = (hw.comments || []).filter((c) => c.field_id === field.id);

  const post = () => {
    if (!comment.trim()) return;
    actions.addHomeworkComment(hw.id, field.id, comment.trim());
    setComment("");
    setCommenting(false);
  };

  return (
    <div style={{ background: "var(--bg-elevated)", borderRadius: "var(--r-md)", border: "0.5px solid var(--line)", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 0.06, color: "var(--ink-4)", textTransform: "uppercase" }}>
          Question {String(idx + 1).padStart(2, "0")}
        </div>
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "var(--ink-1)", lineHeight: 1.4, marginBottom: 10 }}>
        {field.label}
      </div>
      {answer ? (
        <div style={{ background: "var(--bg-window)", padding: "12px 14px", borderRadius: "var(--r-md)", fontSize: 14, lineHeight: 1.55, color: "var(--ink-1)", whiteSpace: "pre-wrap" }}>
          {answer}
        </div>
      ) : (
        <div style={{ fontStyle: "italic", color: "var(--ink-4)", fontSize: 13 }}>
          No answer.
        </div>
      )}

      {commentsForField.map((c) => (
        <div key={c.id} style={{ marginTop: 10, background: "var(--c-butter)", color: "var(--c-butter-ink)", padding: "10px 14px", borderRadius: "var(--r-md)", fontSize: 13, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
          <div style={{ flex: 1, lineHeight: 1.45 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 0.08, textTransform: "uppercase", opacity: 0.7, marginBottom: 4 }}>Your comment</div>
            {c.body}
          </div>
          <button
            onClick={() => actions.deleteHomeworkComment(hw.id, c.id)}
            aria-label="Delete"
            style={{ background: "transparent", border: 0, color: "var(--c-butter-ink)", cursor: "pointer", opacity: 0.6, transform: "rotate(45deg)" }}
          >
            <Icon name="plus" size={14} stroke={1.8} />
          </button>
        </div>
      ))}

      {commenting ? (
        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <input
            autoFocus
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") post(); if (e.key === "Escape") setCommenting(false); }}
            placeholder="Type a comment, Enter to post"
            style={{
              flex: 1, padding: "10px 12px", border: "1px solid var(--line-strong)",
              borderRadius: "var(--r-pill)", outline: 0,
              fontFamily: "var(--font-sans)", fontSize: 13, background: "var(--bg-window)",
            }}
          />
          <PrimaryButton small onClick={post} disabled={!comment.trim()}>Post</PrimaryButton>
        </div>
      ) : (
        <div style={{ marginTop: 10 }}>
          <button
            onClick={() => setCommenting(true)}
            style={{
              appearance: "none", background: "transparent",
              border: "1px dashed var(--line-strong)", color: "var(--ink-3)",
              padding: "6px 12px", borderRadius: 999,
              fontFamily: "var(--font-sans)", fontSize: 12, cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 6,
            }}
          >
            <Icon name="quote" size={11} /> Add inline comment
          </button>
        </div>
      )}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════
// ADMIN INBOX
// ═════════════════════════════════════════════════════════════

const AdminInbox = ({ setRoute, setAdminTarget }) => {
  const { homework, profiles } = useAdminStore();
  const submitted = homework.filter((h) => h.status === "submitted").sort((a, b) => (b.submitted_at || "").localeCompare(a.submitted_at || ""));

  return (
    <div data-screen-label="Admin · Inbox" style={{ padding: "44px 56px 56px", maxWidth: 980, margin: "0 auto" }}>
      <div style={{ marginBottom: 18 }}>
        <GhostButton small onClick={() => setRoute("admin-dashboard")}>← All students</GhostButton>
      </div>
      <AdminPageHeader
        eyebrow={`${submitted.length} to grade`}
        title="To"
        accent="grade."
        subtitle="Homework your students have submitted. Open one to review their answers."
      />
      {submitted.length === 0 ? (
        <div style={{ background: "var(--c-mint)", color: "var(--c-mint-ink)", padding: 32, borderRadius: "var(--r-lg)", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 28, paddingBottom: 6 }}>All caught up.</div>
          <div style={{ fontSize: 13, opacity: 0.8 }}>Nothing waiting for your review.</div>
        </div>
      ) : (
        <div style={{ background: "var(--bg-elevated)", borderRadius: "var(--r-lg)", border: "0.5px solid var(--line)", overflow: "hidden" }}>
          {submitted.map((h) => {
            const student = profiles.find((p) => p.id === h.student_id);
            return (
              <button
                key={h.id}
                onClick={() => { setAdminTarget(h.id); setRoute("admin-homework-grade"); }}
                style={{
                  appearance: "none", border: 0, width: "100%", textAlign: "left",
                  background: "transparent", cursor: "pointer",
                  padding: "18px 22px", borderTop: "0.5px solid var(--line)",
                  display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: 16, alignItems: "center",
                  transition: "background .15s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-window)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <Avatar name={student?.initials || "??"} size={36} tone={student?.avatarTone || "lavender"} />
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--ink-1)", paddingBottom: 2 }}>{h.title}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-4)", marginTop: 4 }}>
                    {student?.name || "—"} · submitted {h.submitted_at ? new Date(h.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                  </div>
                </div>
                <HwStatusPill status={h.status} />
                <Icon name="arrowR" size={16} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════
// ADMIN MATERIALS LIBRARY
// ═════════════════════════════════════════════════════════════

const AdminMaterials = ({ setRoute }) => {
  const { materials, students } = useAdminStore();
  const [showNew, setShowNew] = aState(false);
  const [scope, setScope] = aState("all");

  const filtered = materials.filter((m) => {
    if (scope === "global") return m.scope === "global";
    if (scope === "student") return m.scope === "student";
    return true;
  });

  return (
    <div data-screen-label="Admin · Materials" style={{ padding: "44px 56px 56px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: 18 }}>
        <GhostButton small onClick={() => setRoute("admin-dashboard")}>← All students</GhostButton>
      </div>
      <AdminPageHeader
        eyebrow={`${materials.length} items`}
        title="Materials"
        accent="library."
        subtitle="Everything you've shared with students. Global materials show up for everyone; student-scoped ones only for that person."
        right={
          <PrimaryButton onClick={() => setShowNew(true)}>
            <Icon name="plus" size={14} /> Upload material
          </PrimaryButton>
        }
      />

      <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
        <Chip active={scope === "all"} onClick={() => setScope("all")} count={materials.length}>All</Chip>
        <Chip active={scope === "global"} onClick={() => setScope("global")} count={materials.filter((m) => m.scope === "global").length}>Global</Chip>
        <Chip active={scope === "student"} onClick={() => setScope("student")} count={materials.filter((m) => m.scope === "student").length}>Per-student</Chip>
      </div>

      <div style={{ background: "var(--bg-elevated)", borderRadius: "var(--r-lg)", border: "0.5px solid var(--line)", overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--ink-4)", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: 0.04, textTransform: "uppercase" }}>
            No materials yet
          </div>
        ) : filtered.map((m) => (
          <div key={m.id} style={{ padding: "16px 22px", borderTop: "0.5px solid var(--line)", display: "grid", gridTemplateColumns: "auto 1fr 120px 120px auto", gap: 14, alignItems: "center" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `var(--c-${m.tone})`, color: `var(--c-${m.tone}-ink)`, display: "grid", placeItems: "center" }}>
              <Icon name={m.icon} size={14} />
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "var(--ink-1)", paddingBottom: 2 }}>{m.title}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-4)", marginTop: 2 }}>{m.unit || "—"}</div>
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)" }}>{m.kind}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)" }}>
              {m.scope === "global" ? "Everyone" : students.find((s) => s.id === m.student_id)?.name || "—"}
            </span>
            <GhostButton small danger onClick={() => { if (confirm("Delete this material?")) actions.deleteMaterial(m.id); }}>
              Remove
            </GhostButton>
          </div>
        ))}
      </div>

      {showNew && <NewMaterialModal onClose={() => setShowNew(false)} students={students} />}
    </div>
  );
};

const NewMaterialModal = ({ onClose, students }) => {
  const [kind, setKind] = aState("PDF");
  const [title, setTitle] = aState("");
  const [unit, setUnit] = aState("");
  const [scope, setScope] = aState("global");
  const [studentId, setStudentId] = aState(students[0]?.id || "");
  const [file, setFile] = aState({ dataUrl: null, name: null });
  const [externalUrl, setExternalUrl] = aState("");
  const [tone, setTone] = aState("lavender");

  const tones = ["rose", "peach", "butter", "lavender", "mint", "sky", "clay"];

  const canSave = title.trim() && (kind === "Link" ? externalUrl.trim() : file.dataUrl);

  const save = () => {
    actions.uploadMaterial({
      kind, title: title.trim(), unit, size_label: kind === "Link" ? "external" : (file.name ? `${Math.round((file.dataUrl.length * 0.75) / 1024)} KB` : ""),
      tone, icon: kind === "PDF" ? "paper" : kind === "Audio" ? "headset" : "link",
      file_data_url: kind === "Link" ? null : file.dataUrl,
      file_name: kind === "Link" ? null : file.name,
      external_url: kind === "Link" ? externalUrl.trim() : null,
      scope, studentId: scope === "student" ? studentId : null,
    });
    onClose();
  };

  return (
    <ModalShell onClose={onClose} title="Upload material" width={600}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <SelectField label="Kind" value={kind} onChange={setKind} options={[
          { value: "PDF", label: "PDF" }, { value: "Audio", label: "Audio file" }, { value: "Link", label: "External link" },
        ]} />
        <TextField label="Title" value={title} onChange={setTitle} placeholder="Present perfect — complete sheet" required />
        <TextField label="Unit / tag" value={unit} onChange={setUnit} placeholder="Grammar · B1" />

        {kind === "Link" ? (
          <TextField label="URL" value={externalUrl} onChange={setExternalUrl} placeholder="https://…" type="url" required />
        ) : (
          <FileDropzone
            accept={kind === "PDF" ? "application/pdf" : "audio/*"}
            onFile={(f) => setFile({ dataUrl: f.dataUrl, name: f.name })}
            currentName={file.name}
          />
        )}

        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 0.08, color: "var(--ink-3)", textTransform: "uppercase", marginBottom: 8 }}>
            Card colour
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {tones.map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                aria-label={t}
                style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: `var(--c-${t})`,
                  border: tone === t ? "2px solid var(--ink-1)" : "0.5px solid var(--line-strong)",
                  cursor: "pointer", padding: 0,
                }}
              />
            ))}
          </div>
        </div>

        <SelectField label="Visible to" value={scope} onChange={setScope} options={[
          { value: "global", label: "All students" },
          { value: "student", label: "One student only" },
        ]} />
        {scope === "student" && (
          <SelectField label="Student" value={studentId} onChange={setStudentId} options={students.map((s) => ({ value: s.id, label: s.name }))} />
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton onClick={save} disabled={!canSave}>Upload</PrimaryButton>
        </div>
      </div>
    </ModalShell>
  );
};

// ═════════════════════════════════════════════════════════════
// ADMIN SIDEBAR
// ═════════════════════════════════════════════════════════════

const AdminSidebar = ({ route, setRoute, initials = "NL" }) => {
  const { homework } = useAdminStore();
  const inboxCount = homework.filter((h) => h.status === "submitted").length;

  const items = [
    { id: "admin-dashboard", icon: "grid", label: "Students" },
    { id: "admin-inbox", icon: "bell", label: "Inbox", badge: inboxCount },
    { id: "admin-materials", icon: "folder", label: "Materials" },
  ];

  const isAdminRoute = (id) => route === id || (id === "admin-dashboard" && route === "admin-student");
  const isHwRoute = (id) =>
    (id === "admin-dashboard" && (route === "admin-homework-new" || route === "admin-homework-edit")) ||
    (id === "admin-inbox" && route === "admin-homework-grade");

  return (
    <aside
      style={{
        width: 76,
        background: "var(--bg-window)",
        borderRight: "0.5px solid var(--line)",
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "22px 0 18px", gap: 8,
      }}
    >
      <button
        onClick={() => setRoute("admin-dashboard")}
        title="Dashboard"
        style={{
          width: 40, height: 40, display: "grid", placeItems: "center",
          fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 28,
          color: "var(--ink-1)", marginBottom: 14,
          background: "transparent", border: 0, cursor: "pointer",
        }}
      >
        n
      </button>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        {items.map((it) => (
          <NavBtn
            key={it.id}
            icon={it.icon}
            label={it.label}
            active={isAdminRoute(it.id) || isHwRoute(it.id)}
            dot={it.badge > 0}
            onClick={() => setRoute(it.id)}
          />
        ))}
      </div>

      <NavBtn icon="cog" label="Sign out" onClick={() => actions.logout()} />
      <div style={{ marginTop: 6 }}>
        <Avatar name={initials} size={36} tone="peach" />
      </div>
    </aside>
  );
};

// ═════════════════════════════════════════════════════════════
// ADMIN APP SHELL
// ═════════════════════════════════════════════════════════════

const AdminApp = () => {
  const [route, setRoute] = aState("admin-dashboard");
  const [adminTarget, setAdminTarget] = aState(null);
  const session = useSession();

  let screen;
  if (route === "admin-dashboard") {
    screen = <AdminDashboard setRoute={setRoute} setAdminTarget={setAdminTarget} />;
  } else if (route === "admin-student") {
    screen = <AdminStudentDetail studentId={adminTarget} setRoute={setRoute} setAdminTarget={setAdminTarget} />;
  } else if (route === "admin-homework-new") {
    screen = <AdminHomeworkForm mode="new" target={adminTarget} setRoute={setRoute} setAdminTarget={setAdminTarget} />;
  } else if (route === "admin-homework-edit") {
    screen = <AdminHomeworkForm mode="edit" target={adminTarget} setRoute={setRoute} setAdminTarget={setAdminTarget} />;
  } else if (route === "admin-homework-grade") {
    screen = <AdminGradeHomework homeworkId={adminTarget} setRoute={setRoute} setAdminTarget={setAdminTarget} />;
  } else if (route === "admin-inbox") {
    screen = <AdminInbox setRoute={setRoute} setAdminTarget={setAdminTarget} />;
  } else if (route === "admin-materials") {
    screen = <AdminMaterials setRoute={setRoute} />;
  } else {
    screen = <AdminDashboard setRoute={setRoute} setAdminTarget={setAdminTarget} />;
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "76px 1fr",
        height: "100vh", width: "100vw",
        background: "var(--bg-window)", color: "var(--ink-1)",
      }}
    >
      <AdminSidebar route={route} setRoute={setRoute} initials={session.profile?.initials || "NL"} />
      <main style={{ overflow: "hidden", background: "var(--bg-window)", position: "relative" }}>
        <div style={{ height: "100%", overflowY: "auto" }}>{screen}</div>
      </main>
    </div>
  );
};

export { AdminApp, AdminSidebar, PDFViewer, FileDropzone }
