# Plano técnico — Painel Admin (Natália) + Aluno

## Decisões já fechadas

| Decisão | Escolha |
|---|---|
| Modelo de homework | **PDF + campos de resposta** (lado a lado) |
| Autenticação | **Supabase Auth — email/senha** |
| Arquitetura do admin | **Mesma SPA, rota `/admin` protegida** |

Tudo abaixo parte dessas três decisões.

---

## 1. Arquitetura do sistema

```
                    ┌────────────────────────────┐
                    │     Plataforma Nana        │
                    │     (1 SPA, React 18)      │
                    └────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
       /                 /admin              /login
      (aluno)          (Natália)
            │                 │
            └────────┬────────┘
                     ▼
            ┌────────────────┐
            │  Supabase      │
            │                │
            │  • Auth        │ ← email/senha + RLS
            │  • Postgres    │ ← students, homework, materials, ...
            │  • Storage     │ ← /homework-files, /materials, /submissions
            │  • Realtime    │ ← (futuro: notificação de submissão)
            └────────────────┘
```

**Por que SPA única:**
- Reaproveita `tokens.css`, `chrome.jsx`, `Icon`, `Avatar`, etc.
- Um único build, um único deploy, um único domínio.
- O `route` no app já existe; basta adicionar `admin-*` routes guardadas por `role === 'admin'`.

**Onde mora cada coisa:**

| Camada | O que fica nela |
|---|---|
| **Browser (React SPA)** | Toda a UI, tanto admin quanto aluno. Lê/escreve direto no Supabase. |
| **Supabase Auth** | Login, sessão, reset de senha. JWT contém `user_id` + `role`. |
| **Supabase Postgres** | Modelo de dados (próxima seção). RLS força permissões. |
| **Supabase Storage** | Arquivos brutos: PDFs de homework, materiais, anexos de resposta. |
| **Supabase Realtime** *(opcional, fase 3)* | Push de "aluno respondeu" pro admin sem refresh. |

> **Não precisa de backend próprio.** Tudo o que o admin/aluno fazem pode ser feito via Supabase SDK direto. Se um dia precisar (ex: gerar PDF assinado, integrar Stripe), aí entra uma Edge Function — não antes.

---

## 2. Estrutura do banco de dados

Já temos as tabelas seed no schema. Aqui está a versão refinada para suportar o admin:

```sql
-- Perfis (role + dados do humano)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'student')),
  name text not null,
  email text not null,
  initials text generated always as (...) stored,
  avatar_url text,
  created_at timestamptz default now()
);

-- Aluno (1-pra-1 com profile quando role='student')
create table students (
  id uuid primary key references profiles(id) on delete cascade,
  target_lang text not null default 'English',
  level text not null default 'A1' check (level in ('A1','A2','B1','B2','C1','C2')),
  pct int not null default 0,
  xp int not null default 0,
  cohort text,                       -- "Turma A", "B1 quartas", etc.
  payment_status text not null default 'active'
      check (payment_status in ('active','overdue','blocked','trial')),
  is_active boolean not null default true,   -- bloqueio rápido sem deletar
  notes text,                        -- notas internas da Natália
  created_at timestamptz default now()
);

-- Materiais (compartilháveis ou individuais)
create table materials (
  id uuid primary key default gen_random_uuid(),
  uploaded_by uuid not null references profiles(id),
  scope text not null check (scope in ('global','student')),
  student_id uuid references students(id) on delete cascade,  -- null se global
  kind text not null check (kind in ('PDF','Audio','Link')),
  title text not null,
  unit text,
  size_label text,
  storage_path text,                 -- caminho no Supabase Storage
  external_url text,                 -- só pra kind='Link'
  tone text default 'lavender',
  created_at timestamptz default now()
);

-- Homework (template + atribuição num único registro pro MVP)
create table homework (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  created_by uuid not null references profiles(id),
  title text not null,
  brief text,
  pdf_path text,                     -- arquivo no Storage
  pdf_name text,                     -- nome original ("subjunctive.pdf")
  fields jsonb not null default '[]'::jsonb,
      -- ex: [{"id":"q1","label":"Question 1","type":"text"}]
  status text not null default 'assigned'
      check (status in ('assigned','in_progress','submitted','graded','returned')),
  due_at timestamptz,
  minutes int,
  grade numeric,                     -- preenchida na correção
  feedback text,                     -- comentário geral da Natália
  submitted_at timestamptz,
  graded_at timestamptz,
  created_at timestamptz default now()
);

-- Respostas do aluno (uma linha por campo)
create table homework_answers (
  homework_id uuid references homework(id) on delete cascade,
  field_id text not null,
  answer text,
  primary key (homework_id, field_id),
  updated_at timestamptz default now()
);

-- Comentários inline da Natália em cada resposta
create table homework_comments (
  id uuid primary key default gen_random_uuid(),
  homework_id uuid not null references homework(id) on delete cascade,
  field_id text,                     -- null = comentário geral
  author_id uuid not null references profiles(id),
  body text not null,
  created_at timestamptz default now()
);

-- Aulas/calendário (já existe)
-- Dicionário, flashcard_reviews (já existem)
```

**Por que essa modelagem:**
- `profiles` separado de `students` é o padrão Supabase — `auth.users` não deve ser tocado direto.
- `homework_answers` numa tabela separada permite auto-save por campo (1 update pequeno em vez de reescrever o JSON inteiro).
- `homework.fields` em JSONB é flexível pro MVP. Se um dia virar form-builder complexo, vira tabela.
- `is_active` + `payment_status` dão dois eixos: bloquear por falta de pagamento ≠ desativar conta.

---

## 3. Sistema de permissões (RLS)

Toda tabela tem RLS ligado. Resumo das policies:

| Tabela | Aluno pode | Admin pode |
|---|---|---|
| `profiles` | Ler/editar o próprio | Ler todos, editar todos |
| `students` | Ler o próprio | CRUD em todos |
| `materials` | Ler `scope='global'` OU `student_id = self` | CRUD em todos |
| `homework` | Ler/atualizar `status` se `student_id = self` (só pra "submetido") | CRUD em todos |
| `homework_answers` | Ler/escrever os seus | Ler todas |
| `homework_comments` | Ler dos seus homework, escrever próprios | Ler/escrever todas |

**Implementação:** uma helper function `auth.is_admin()` que faz `select exists(... where role='admin')`, e RLS usa isso. Padrão Supabase, fácil de auditar.

---

## 4. Fluxo do usuário

### Admin (Natália)

```
Login → Dashboard (grid de alunos)
         │
         ├─→ Clica no aluno  → Detalhe do aluno
         │                       ├─ Editar dados básicos
         │                       ├─ Mudar status pagamento
         │                       ├─ Bloquear/desbloquear
         │                       ├─ Ver dicionário do aluno
         │                       └─ Ver/atribuir homework
         │
         ├─→ "Novo homework"  → Formulário
         │     ├─ Escolhe aluno
         │     ├─ Faz upload PDF (drag & drop)
         │     ├─ Adiciona campos de resposta (label + tipo)
         │     ├─ Define due date
         │     └─ Publica
         │
         ├─→ "Corrigir"       → Lista de submissões pendentes
         │                       └─ Abre → vê PDF + respostas → comenta → dá nota → devolve
         │
         └─→ Biblioteca de materiais  → Upload global ou por aluno
```

### Aluno (não muda quase nada do que já existe)

```
Login → Home (já existe)
         │
         ├─→ Dictionary       (já existe)
         ├─→ Homework
         │     └─ Lista de homework do aluno
         │           └─ Abre → tela split: PDF | campos de resposta
         │                       ├─ Preenche (auto-save)
         │                       └─ Submete → status muda pra "submitted"
         │     └─ Quando Natália devolve com nota: aparece nota + feedback inline
         ├─→ Materials        (já existe — agora carrega do Storage)
         ├─→ Flashcards       (já existe)
         └─→ Calendar         (já existe)
```

---

## 5. Painéis necessários

### Admin

1. **Login** — `/login`
2. **Dashboard / Grid de alunos** — `/admin`
3. **Detalhe do aluno** — `/admin/students/:id`
4. **Novo/editar homework** — `/admin/homework/new`, `/admin/homework/:id/edit`
5. **Corrigir submissão** — `/admin/homework/:id/grade`
6. **Biblioteca de materiais (admin view)** — `/admin/materials`
7. **Submissões pendentes** — `/admin/inbox` (atalho)

### Aluno (já existem, só vão virar data-driven via Supabase)

1. Home `/`
2. Dictionary `/dictionary`
3. Homework `/homework` e `/homework/:id`
4. Materials `/materials`
5. Flashcards `/flashcards`
6. Calendar `/calendar`

---

## 6. Tecnologias recomendadas

| Camada | Escolha | Por quê |
|---|---|---|
| Frontend | React 18 + Babel standalone (mantém o atual) | Sem build step, já funciona |
| Roteamento | `react-router-dom` v6 (mínimo) ou rolar manual | Hoje é só `useState`. Quando passar de 6 rotas vale a pena |
| Auth | Supabase Auth | Email/senha, reset, sessão |
| DB | Supabase Postgres + RLS | Já provisionado |
| Storage | Supabase Storage | Já integrado com auth/RLS |
| Visualizador PDF | `pdf.js` via CDN (Mozilla) ou `react-pdf` | Padrão da web, leve |
| Drag-and-drop upload | `react-dropzone` | Pequeno, robusto |
| Tabelas (grid) | HTML `<table>` no MVP | Não traz lib pesada antes da hora |
| Dates | `date-fns` (CDN) | Só se a complexidade subir |

**Não recomendo ainda:** TipTap, Lexical, Yjs, Liveblocks. Tudo isso só faz sentido se for pro modelo "Google Docs". Como escolhemos PDF+campos, fica fora do MVP.

---

## 7. Como o homework editável funciona (PDF + campos)

### Fluxo técnico

**Admin (criar homework):**
1. Natália clica "Novo homework".
2. Escolhe o aluno num `<select>`.
3. Arrasta um PDF (ou DOCX) na zona de upload.
4. SDK do Supabase: `storage.from('homework-files').upload(...)` → retorna `path`.
5. Natália adiciona campos de resposta: `[{ id, label, type: 'text' | 'textarea' | 'multiple-choice' }]`.
6. Define `due_at`, `minutes`.
7. `insert into homework(...)` com o `pdf_path` e o array de `fields`.

**Aluno (fazer homework):**
1. Lista de homework do aluno é `select * from homework where student_id = me`.
2. Abre um item → carrega o PDF do Storage via signed URL.
3. Renderiza tela split: PDF.js à esquerda, campos à direita.
4. Cada campo tem auto-save (debounce 800ms) → `upsert into homework_answers`.
5. Botão "Submeter" → `update homework set status='submitted', submitted_at=now()`.

**Admin (corrigir):**
1. Inbox lista homework com `status='submitted'`.
2. Abre → mesma tela split, mas com 2 colunas extras: respostas do aluno + caixa de comentário por campo.
3. Comenta em qualquer resposta → `insert into homework_comments`.
4. Define nota + feedback geral → `update homework set grade, feedback, status='graded', graded_at=now()`.
5. Aluno vê o resultado.

### Por que isso é mais simples que Google Docs

| Aspecto | PDF + campos | Google Docs real |
|---|---|---|
| Conversão de DOCX | Não precisa | Mammoth.js, perde formatação |
| Conflitos de edição | Inexistentes (1 dono por vez) | Precisa CRDT (Yjs) |
| Histórico de edição | "Versão antes de submeter" + "versão após correção" | Operação por operação |
| Comentários inline | 1 comentário por campo | Posições de cursor / spans |
| Tempo de implementação | ~1 semana | ~3-4 semanas |
| Erros possíveis | "PDF não renderiza" | "Conflito de operação", "documento corrompido" |

---

## 8. Storage de arquivos

**Supabase Storage** com 3 buckets:

| Bucket | Conteúdo | Visibilidade |
|---|---|---|
| `homework-files` | PDFs originais que a Natália sobe | Privado, signed URL |
| `submissions` | (opcional) anexos do aluno se ele quiser anexar | Privado, signed URL |
| `materials` | Materiais da biblioteca | Privado, signed URL (ou público pros globais) |

**Política:** signed URLs com expiração curta (5-15 min). O frontend pede uma URL nova quando vai exibir. Isso evita vazamento se alguém compartilhar o link errado.

**Convenção de paths:** `homework-files/{student_id}/{homework_id}/{filename}` — facilita auditoria e deleção em cascata.

---

## 9. UX/UI — telas críticas do admin

### Grid de alunos (a tela principal da Natália)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Plataforma Nana — Admin                              [+ Novo aluno]   │
├─────────────────────────────────────────────────────────────────────────┤
│  [Buscar...]       Filtros: [Turma ▾]  [Status ▾]  [Pendência ▾]       │
├─────────────────────────────────────────────────────────────────────────┤
│ Aluno              Turma     Status      Homework atual         Ações   │
├─────────────────────────────────────────────────────────────────────────┤
│ ● Laura Mendes     B1 qua    🟢 Active   📝 Submitted · pend.   [✎] [⋯]│
│ ● Pedro Alves      A2 ter    🟡 Overdue  ➕ Atribuir            [✎] [⋯]│
│ ● Marina Costa     B2 sex    🟢 Active   ✓ Graded               [✎] [⋯]│
│ ○ João Santos      —         🔴 Blocked  —                      [✎] [⋯]│
└─────────────────────────────────────────────────────────────────────────┘
```

**Princípios:**
- A coluna "Homework atual" é um **call-to-action** — clique = ação (atribuir, corrigir, ver).
- Indicadores coloridos no nome (bolinha) replicam o vocabulário visual do app do aluno (rose/peach/mint).
- "..." abre menu: Editar, Bloquear, Mudar status pagamento, Deletar.
- Linha clicável → detalhe do aluno.

### Criar homework

Tela única, 3 passos verticalmente:

```
1. Para quem?      [○ Laura · ○ Pedro · ○ Marina ...]
2. Sobe o PDF      [ drag & drop area ]   ← preview aparece quando upa
3. Campos de resposta
   [+ Adicionar campo]
   ┌─────────────────────────────────────────┐
   │ Campo 1 · "Question 1" · texto curto   │ [✕]
   │ Campo 2 · "Translate" · texto longo    │ [✕]
   └─────────────────────────────────────────┘
4. Detalhes        Due: [____]  Tempo estimado: [__] min
   
   [Salvar rascunho]      [Publicar pro aluno]
```

### Tela de correção (split 3 colunas)

```
┌──────────────┬──────────────────┬────────────────┐
│ PDF original │ Resposta do aluno│ Comentários da │
│              │                  │ Natália + nota │
│ [pdf.js]     │ Q1: I have...    │                │
│              │   "good!"        │ [✓ marcar ok]  │
│              │                  │                │
│              │ Q2: He goed...   │ [comentar]     │
│              │   ←ressalta erro │                │
│              │                  │                │
│              │                  │ Nota final: [ ]│
│              │                  │ [Devolver]     │
└──────────────┴──────────────────┴────────────────┘
```

---

## 10. Ideias para simplificar a operação da Natália

1. **Templates de homework reutilizáveis** — Natália cria 1 vez, atribui pra N alunos com 1 clique. Adicionar tabela `homework_templates` na fase 2.
2. **"Bulk assign"** — selecionar 5 alunos no grid e atribuir o mesmo homework de uma vez.
3. **Estado vazio inteligente** — quando não há submissões pendentes, mostrar "Tudo em dia. Última correção: há 2h."
4. **Atalhos de teclado na correção** — `j/k` pra navegar campos, `Cmd+Enter` pra devolver.
5. **Email automático** ao aluno quando o homework é devolvido com nota (Supabase Edge Function + Resend) — só na fase 3.
6. **Importar lista de alunos via CSV** — cola 10 emails, sistema cria contas e manda senha temporária.

---

## 11. MVP vs futuro

### MVP (~4 semanas part-time)

- [x] Login/senha
- [x] Grid de alunos com CRUD
- [x] Atribuir homework (PDF + campos)
- [x] Aluno responde inline + auto-save
- [x] Aluno submete
- [x] Natália corrige (comentários inline + nota geral)
- [x] Aluno vê correção
- [x] Bloquear/desbloquear aluno
- [x] Upload de materiais globais
- [x] Mudar status de pagamento

### Pós-MVP (v2)

- Templates de homework + bulk assign
- Materiais individualizados por aluno
- Notificações por email
- Histórico de notas e gráfico de progresso pra Natália
- "Esta semana" — visão semanal de aulas + homework
- Annotation no PDF (riscar, sublinhar)
- Importar transcrição de aula → gera dicionário automaticamente (a feature AHA do doc original)

### v3+

- Comunidade entre alunos
- Conversação em grupo (upsell)
- AI conversation pra tirar dúvidas
- Pronúncia
- Phrasal verb of the day **(já existe ✓)**
- Member-get-member

---

## 12. Riscos técnicos (e como mitigar)

| Risco | Severidade | Mitigação |
|---|---|---|
| PDF muito grande não renderiza | Média | Limitar upload a 10MB; comprimir; fallback "Baixar PDF" |
| Auto-save perde resposta longa | Alta | Salvar em `localStorage` antes de mandar pro Supabase; debounce baixo (300ms) |
| Aluno apaga resposta sem querer | Média | Mostrar "última alteração há X minutos" + permitir desfazer com Ctrl+Z (textarea já faz) |
| RLS mal configurado vaza dados | **Crítica** | Suite de testes que tenta acessar como `student_a` o homework de `student_b`; tem que dar `[]` |
| DOCX não converte bem | Baixa (escopo é PDF) | Aceitar só PDF no MVP; mostrar erro claro se subir DOCX |
| Signed URLs expiram durante a sessão | Baixa | Renovar 1min antes de expirar; retry automático |
| Storage cobra além do esperado | Baixa | Plano free do Supabase = 1GB. Aviso quando passar de 80% |

---

## 13. Roadmap por fases

### Fase 0 — Fundação (1 semana)

- Migrar do `localStorage` pro Supabase (já tem tabelas).
- Implementar Auth (login, logout, reset senha).
- Adicionar `profiles` + role check.
- Proteger rota `/admin` por role.
- Carregar a UI atual do aluno via Supabase (em vez do seed local).

**Difícil:** RLS. É chato testar bem mas crítico.

### Fase 1 — Admin CRUD de alunos (1 semana)

- Tela `/admin` com grid.
- Criar/editar aluno (modal ou tela dedicada).
- Bloquear/desbloquear.
- Mudar status de pagamento.

**Fácil-médio.** Tudo é CRUD básico.

### Fase 2 — Homework editável (1.5 semanas)

- Tela `/admin/homework/new` (upload + form-builder simples).
- Bucket `homework-files` no Storage.
- Tela do aluno: split PDF + campos.
- Auto-save de respostas.
- Submissão.
- Tela `/admin/homework/:id/grade` com comentários inline + nota.

**Difícil-médio.** PDF.js + integração com Storage + 3 telas inter-relacionadas.

### Fase 3 — Materiais e polish (3-4 dias)

- Upload de materiais (admin).
- Materiais individuais por aluno.
- Estado vazio bonito em todas as telas.
- Notificações in-app simples (badge no sidebar quando volta corrigido).

**Fácil.**

### Fase 4 — Refinamentos operacionais (1 semana)

- Bulk assign de homework.
- Templates.
- Import de alunos via CSV.
- Dashboard com métricas pra Natália (pendências, alunos sem atividade há X dias).

---

## 14. Complexidade de cada módulo

| Módulo | Complexidade | Tempo (part-time) |
|---|---|---|
| Auth + roles + RLS | ★★★☆☆ | 3-4 dias |
| Grid de alunos + CRUD | ★★☆☆☆ | 3 dias |
| Upload de arquivos (Storage) | ★★☆☆☆ | 1 dia |
| Visualizador PDF (pdf.js) | ★★★☆☆ | 2 dias |
| Form-builder simples (admin) | ★★★☆☆ | 2 dias |
| Tela split PDF+resposta do aluno | ★★★☆☆ | 2 dias |
| Auto-save robusto | ★★★☆☆ | 1 dia |
| Tela de correção | ★★★☆☆ | 2-3 dias |
| Comentários inline | ★★★☆☆ | 1 dia |
| Bloquear/status de pagamento | ★☆☆☆☆ | 0.5 dia |
| Materiais (lista, upload, fav já existe) | ★★☆☆☆ | 1-2 dias |

**Total estimado MVP: ~4 semanas part-time** (ou 2 semanas full-time).

**Mais difícil tecnicamente:** RLS (precisa testar bem) e tela split com auto-save robusto (estados intermediários, perda de conexão).

---

## 15. Recomendações pra evitar complexidade

1. **Não fazer "Google Docs" no MVP.** O caminho PDF+campos resolve 90% do problema com 20% do trabalho.
2. **Não introduzir `react-router` agora se a rota atual funciona.** Adicionar quando passar de 6-7 telas.
3. **Não construir um form-builder genérico.** Só 2-3 tipos de campo (texto curto, texto longo, múltipla escolha). Mais que isso não vai ser usado.
4. **Não permitir DOCX no upload do MVP.** Aceita só PDF. DOCX vira fase 4.
5. **Não montar painel de métricas/analytics no MVP.** Natália precisa primeiro do CRUD funcionando, não de gráficos.
6. **Adiar email automático.** Notificação in-app (badge) resolve por enquanto.
7. **Não criar app mobile separado.** Layout responsivo no mesmo SPA cobre os alunos no celular.

---

## 16. Ordem ideal de implementação (passo a passo)

```
1. Migrações Supabase (tabelas profiles, students refinada, homework,
   homework_answers, homework_comments, RLS policies)
2. Auth UI (login, logout, sessão) + carregar profile no boot da SPA
3. Route guard /admin vs /
4. Migração do store atual: localStorage → Supabase pro lado do aluno
   (mantém o mesmo UX já construído)
5. Tela de grid do admin (read-only primeiro, depois editar)
6. CRUD de alunos
7. Bucket Storage + upload de PDF
8. Tela "Novo homework" com upload e form-builder
9. Tela do aluno: split PDF + respostas + auto-save + submeter
10. Tela de correção
11. Polish: estados vazios, mensagens de erro, mobile
12. Refinamentos da Fase 4
```

---

## 17. Stack final recomendada

```
Frontend:
  • React 18 (CDN)
  • Babel standalone (mantém o setup atual sem build)
  • pdf.js (CDN)
  • Supabase JS SDK (CDN: @supabase/supabase-js@2)
  • react-dropzone (CDN, fase 2)

Backend:
  • Supabase Auth
  • Supabase Postgres + RLS
  • Supabase Storage
  • Supabase Edge Functions (só se precisar de cron/email — fase 3+)

Deploy:
  • GitHub Pages, Netlify, ou Vercel (qualquer um — é tudo estático)
  • Domínio próprio quando sair do MVP
```

---

## Resumo executivo

**O quê:** Painel admin pra Natália gerenciar alunos + criar homework PDF+campos onde o aluno responde inline e ela corrige inline.

**Stack:** React no front, Supabase pra tudo no back (Auth + DB + Storage). Sem servidor próprio.

**Diferencial vs Google Docs:** Não tentamos editar o PDF — usamos o PDF como referência e capturamos a resposta em campos estruturados. 5x mais rápido de construir, e na prática a Natália consegue ver/corrigir mais limpo.

**Caminho crítico:** Auth+RLS (fase 0) → Grid+CRUD (fase 1) → Homework PDF+respostas (fase 2). 4 semanas part-time pro MVP utilizável.

**Maior risco:** RLS mal feita vaza dados entre alunos. Tem solução conhecida (testes automatizados) mas precisa ser levada a sério antes de subir pra produção.
