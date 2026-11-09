# QuizForge — Frontend Design Specification

This document describes the **visual design, layout system, and interaction patterns** of the QuizForge web app so that anyone (human or AI) building new screens can match the existing look exactly.

- **Product:** QuizForge — a quiz/testing platform with timed quizzes, scored attempts, history, leaderboards, and an admin content editor.
- **Stack:** React 19 + Vite, React Router 7, Tailwind CSS v4 (`@tailwindcss/vite`, no config file — theme is defined in CSS), `lucide-react` icons, `clsx` for conditional classes.
- **Source of truth:** all styling lives inline as Tailwind utility classes in `src/App.tsx`; global base styles and the font token live in `src/index.css`.
- **No UI library, no component directory:** shared primitives (`Button`, `Card`, `Input`, `Badge`, `ProgressBar`, `StateBlock`, `Skeleton`, `Stat`) are small functions at the top of `src/App.tsx`. Reuse them instead of inventing new ones.

---

## 1. Design direction

**Modern, clean, friendly SaaS dashboard.** Soft neutral stone background, crisp white cards with hairline borders, and a single confident **violet** accent for brand, primary actions, and data highlights. Semantic colors (emerald / amber / rose) are used *only* for status and difficulty. Typography is heavy (black weight) for headings and numbers, with generous whitespace and rounded corners throughout. The vibe is polished and approachable — not corporate, not playful/illustrative.

Rules of thumb:

1. **White cards on stone** — content always sits on `rounded-2xl` white cards with `border-slate-200` and `shadow-sm`.
2. **One accent color** — violet. No gradients, no glassmorphism, no dark mode.
3. **Heavy headings, quiet body copy** — `font-black` headings, `text-slate-500/600` supporting text.
4. **Rounded but not pill-shaped** — `rounded-xl` for controls, `rounded-2xl` for containers; only badges are `rounded-full`.
5. **Icons are line icons** from `lucide-react`, 16–20px, violet for emphasis, slate for neutral.

---

## 2. Design tokens

### 2.1 Colors

Defined by Tailwind default palette; these are the ones actually in use.

| Role | Token / hex | Where used |
|---|---|---|
| Page background | `stone-50` — `#fafaf9` | `body`, `Shell`, Landing, auth pages, full-page loader |
| Primary text / headings | `slate-950` — `#020617` | `body` color, all headings |
| Primary accent | `violet-600` — `#7c3aed` | primary buttons, active nav, brand tile, icons, links, progress fill |
| Primary hover | `violet-700` | primary button hover, score numbers, links |
| Accent tint | `violet-50` | active nav bg, selected answer, highlight rows, info panel |
| Accent border | `violet-200` / `violet-300` / `violet-400` | hover borders, selected cards, input focus border |
| Accent ring | `violet-100` | `focus:ring-4` on inputs/buttons |
| Surface | `white` | cards, inputs, sidebar, header buttons |
| Hairline border | `slate-200` | card and input borders, dividers |
| Body/muted text | `slate-500` / `slate-600` / `slate-700` | descriptions, labels, table text |
| Subtle fill | `slate-50` / `slate-100` | table/chip backgrounds, hover fills, progress track, avatar-neutral chips |
| Success | `emerald-500/600/700`, bg `emerald-50/100`, border `emerald-200/300` | correct answers, success toasts, "easy" badge, high scores |
| Warning | `amber-500/700/800`, bg `amber-50/100`, border `amber-300` | "medium" badge, in-progress badge, time-up notice, 1st-place podium |
| Danger | `rose-500/600/700/800`, bg `rose-50`, border `rose-200/300` | errors, "hard" badge, delete actions, timer under 60s, low scores |
| Overlay | `slate-950/30` (drawer), `slate-950/40` (modal) | mobile nav scrim, submit-confirmation scrim |
| Dark accent surface | `slate-950` | landing "Live Test" preview card header |

### 2.2 Typography

- **Family:** `Inter` → falls back to `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`. Set via `--font-sans` in `@theme` and repeated on `body`. **Inter is not loaded from a CDN or self-hosted** — no font `<link>` exists, so it renders only if installed locally; otherwise the system UI font is used. Keep that behavior consistent if adding text.
- **Weights used:** `font-black` (900) for headings and key numbers, `font-bold` (700) for emphasis and labels, `font-semibold` (600) for buttons/inputs, regular for body.
- **Case:** sentence case everywhere. Only small "eyebrow" labels are `uppercase` with `tracking-[0.18em]`.
- **Type scale in practice:**

| Role | Classes |
|---|---|
| Marketing hero (landing) | `text-5xl md:text-7xl font-black leading-tight tracking-tight` |
| Page title | `text-3xl font-black` |
| Quiz detail title | `text-4xl font-black` |
| Section / card heading | `text-xl font-black` |
| Card title (quiz) | `text-lg`–`text-xl font-black` |
| Stat number | `text-3xl font-black` (score in results: `text-5xl`) |
| Body copy | `text-sm`–`text-lg`, `text-slate-600`, `leading-6`/`leading-8` for longer copy |
| Eyebrow label | `text-sm font-bold uppercase tracking-[0.18em] text-violet-600` |
| Small meta | `text-sm text-slate-500`, `text-xs text-slate-500` |
| Form label | `text-sm font-semibold text-slate-700` |

### 2.3 Shape, border, shadow

| Element | Recipe |
|---|---|
| Card / panel / modal | `rounded-2xl border border-slate-200 bg-white shadow-sm` |
| Nested tile (quiz card stat boxes, review rows, answer rows) | `rounded-2xl` or `rounded-xl`, `border-slate-200` or `bg-slate-50` |
| Button | `rounded-xl` |
| Text input / select / textarea | `rounded-xl border border-slate-200` |
| Badge / pill | `rounded-full` |
| Icon tile (brand, avatar) | `rounded-2xl` / `rounded-3xl` |
| Nav item | `rounded-xl` |
| Progress track & bar | `rounded-full` |

Shadows are minimal: only `shadow-sm` on cards/primary buttons, `shadow-lg` on toasts. Depth comes from borders and background contrast, not shadows. There are **no gradients**.

### 2.4 Spacing & density

- Page container padding: `px-4 py-6` mobile, `lg:px-8` desktop.
- Card padding: `p-5` default; `p-6`/`p-7`/`p-8` for prominent or form cards.
- Vertical rhythm: `space-y-6` between page sections; `space-y-4` inside cards; `gap-3`/`gap-4` in grids; `mt-2`–`mt-8` for heading/paragraph offsets.
- Content widths:
  - `max-w-7xl` — list/table/admin screens (Quizzes, History, Leaderboard, Admin).
  - `max-w-5xl` — quiz-taking screen.
  - `max-w-4xl` — quiz detail.
  - `max-w-md` — auth card.
  - `w-72` (288px) — fixed desktop sidebar.
  - Dashboard, results and profile use `max-w-full`.

### 2.5 Motion

- Default transition: `transition` (~150ms) on colors, borders, and backgrounds.
- Buttons press down: `active:scale-[0.98]`.
- Loading: `animate-spin` on `Loader2`; `animate-pulse` on skeleton blocks.
- Progress bars animate width: `transition-all`.
- Smooth scrolling via `html { scroll-behavior: smooth; }` (used by "Review Answers" anchor).
- Nothing else animates; no entrance animations, no hover lifts, no transforms on cards.

---

## 3. Core components

Copy these recipes when building anything new.

### Button (`variant`: primary | secondary | ghost | danger)

```
inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5
text-sm font-semibold transition active:scale-[0.98]
disabled:cursor-not-allowed disabled:opacity-60
```

| Variant | Classes | Use |
|---|---|---|
| `primary` (default) | `bg-violet-600 text-white shadow-sm shadow-violet-200 hover:bg-violet-700` | main action, one per view |
| `secondary` | `border border-slate-200 bg-white text-slate-800 hover:bg-slate-50` | cancel, logout, alternate actions |
| `ghost` | `text-slate-700 hover:bg-slate-100` | low-emphasis inline actions |
| `danger` | `bg-rose-600 text-white hover:bg-rose-700` | delete quiz/question |

- Prop `loading` swaps the leading icon for `<Loader2 className="h-4 w-4 animate-spin" />` and disables the button.
- Icons inside buttons are `h-4 w-4` and precede the label.
- Large CTAs add `px-5 py-3` or `px-6 py-3`; full-width form buttons add `w-full py-3`.

### Card

```
rounded-2xl border border-slate-200 bg-white p-5 shadow-sm
```

Callers frequently override padding (`p-0`, `p-6 md:p-8`) or add `flex flex-col`, `overflow-hidden`, `border-2`, `id`.

### Input / labeled field

- Wrapper: `<label className="block">`.
- Label: `mb-2 block text-sm font-semibold text-slate-700`.
- Control: `w-full rounded-xl border bg-white px-3.5 py-3 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100`.
- Border: `border-slate-200` normally, `border-rose-300` on error.
- Error text: `mt-1.5 block text-xs font-medium text-rose-600`. Error is passed as a prop, not native validation styling.
- Selects/textarea follow the same border/radius/focus treatment (textarea adds `p-3`; selects use `px-3 py-3`, no ring on the filter selects).
- Password fields put an eye toggle at `absolute right-3 top-10 text-slate-500`.

### Badge (`tone`: slate | green | amber | rose | violet | transparent)

```
inline-flex rounded-full px-2.5 py-1 font-bold capitalize
font-size: text-[5px] md:text-[8px] lg:text-xs
```

| Tone | Classes |
|---|---|
| `violet` | `bg-violet-100 text-violet-700` — category, "Modern quiz platform" |
| `green` | `bg-emerald-100 text-emerald-700` — easy |
| `amber` | `bg-amber-100 text-amber-800` — medium, in progress |
| `rose` | `bg-rose-100 text-rose-700` — hard |
| `slate` | `bg-slate-100 text-slate-700` |
| `transparent` | `bg-transparent` (rare) |

Difficulty → tone mapping: `easy → green`, `medium → amber`, `hard → rose`, `mixed → violet`.

### ProgressBar

Track `h-2 overflow-hidden rounded-full bg-slate-100`; fill `h-full rounded-full transition-all` in `violet-600` (or `emerald-500`, `amber-500`, `rose-500`); width clamped 0–100% via inline `style`.

- Used for quiz progress, password strength (color switches emerald > 70, amber > 40, else rose).
- Distinct from the **results score ring**: `aspect-square rounded-full border-[14px] border-violet-100` with the percentage centered inside.

### Stat tile

```
Card >
  flex items-center justify-between → label (text-sm font-semibold text-slate-500) + icon (h-5 w-5 text-violet-600)
  mt-4 text-3xl font-black → value
```

Used in 4-up grids (`grid gap-4 md:grid-cols-4`) on Dashboard, Profile, Admin, and inside Quiz Details / Results.

### StateBlock (empty / error / not-found)

`Card` with `flex min-h-48 flex-col items-center justify-center text-center`; `text-lg font-black` title, `mt-2 max-w-md text-sm text-slate-500` message, `mt-4` action slot (usually a button/link).

### Skeleton

`animate-pulse rounded-xl bg-slate-200/80` sized by the caller (`h-16`, `h-40`, `h-56`, `h-96`). Used for quiz grids, tables, dashboards.

### Toast

- Container: `fixed right-4 top-4 z-[60] grid gap-2`.
- Item: `rounded-xl border px-4 py-3 text-sm font-bold shadow-lg`; success `border-emerald-200 bg-emerald-50 text-emerald-800`, error `border-rose-200 bg-rose-50 text-rose-800`.
- Auto-dismiss after 3.6s. No icon, no close button, no animation.

### FullLoader

`grid min-h-screen place-items-center bg-stone-50 text-violet-600` with `Loader2 h-8 w-8 animate-spin`.

### Modal / confirmation

`fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4`, inner `Card w-full max-w-md p-6`, `text-xl font-black` question, `text-sm leading-6 text-slate-600` explanation, actions right-aligned with `justify-end gap-3` (secondary cancel, primary confirm). Used for quiz submission confirmation; native `window.confirm` is used for admin deletes.

---

## 4. App shell & navigation

```
min-h-screen bg-stone-50 text-slate-950
├── aside  fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white/90 px-4 py-5 lg:block
│     Brand (mt-8 below)
│     nav  mt-8 space-y-1
├── header sticky top-0 z-30 border-b border-slate-200 bg-stone-50/90 px-4 py-3 backdrop-blur lg:ml-72
│     mobile menu button (lg:hidden) · "Signed in as / name" (hidden lg:block) · Logout (secondary)
├── mobile drawer  fixed inset-0 z-40 bg-slate-950/30 lg:hidden → panel h-full w-80 bg-white p-5
└── main  px-4 py-6 lg:ml-72 lg:px-8
```

- **Brand:** violet `h-10 w-10 rounded-2xl` tile with white `ShieldCheck` icon + `text-xl font-black` wordmark "QuizForge".
- **Nav items:** `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold`, icon `h-4 w-4`. Active: `bg-violet-50 text-violet-700`. Inactive: `text-slate-600 hover:bg-slate-50`. No left indicator bar, no underline.
- **Nav order:** Dashboard, Quizzes, History, Leaderboard, Profile, then **Admin** (only when `user.role === 'admin'`, same style, gear icon).
- **Header:** desktop shows `text-sm text-slate-500` "Signed in as" with `font-bold` name/email. Logout is always a secondary button with `LogOut` icon (label "Logout").
- **Mobile:** sidebar hidden; hamburger (`Menu`) opens a left drawer with brand + nav + close (`X`). Drawer items close the drawer on navigate.
- The shell is **not** used on Landing, Login, Signup, or NotFound.

### Authenticated page pattern

```
<Shell>
  <div className="mx-auto max-w-7xl space-y-6">
    <h1 className="text-3xl font-black">Page title</h1>
    <p className="mt-2 text-slate-500">One-line description</p>
    … sections as Cards …
  </div>
</Shell>
```

Dashboard and Admin add a violet uppercase eyebrow above the `h1`. Keep this order: eyebrow → title → subtitle → content.

---

## 5. Screen-by-screen anatomy

### 5.1 Landing (`/`)

- Transparent header, `max-w-7xl`, brand left; right: "Log in" (secondary) + "Start Testing" (primary).
- Two-column hero `lg:grid-cols-[1fr_0.9fr] lg:items-center`, `gap-10`, `pt-8 pb-16`.
  - Left: violet badge "Modern quiz platform" → `text-5xl md:text-7xl font-black leading-tight tracking-tight` headline → `text-lg leading-8 text-slate-600` paragraph → two CTAs.
  - Right: quiz preview card, `overflow-hidden p-0`. Top half is `bg-slate-950 p-5 text-white` with a "Live Test" label, amber "Medium" badge, and a bold question. Bottom half is `p-5 space-y-3` answer rows; the selected/correct one uses `border-emerald-300 bg-emerald-50 text-emerald-800`, the rest plain `border-slate-200`.
- Feature strip: `grid gap-4 md:grid-cols-4`, each a Card with a violet `text-2xl font-black` check glyph, then a `font-bold` label.

### 5.2 Auth (`/login`, `/signup`)

- `grid min-h-screen place-items-center bg-stone-50 px-4 py-10`.
- Single `Card w-full max-w-md p-7` containing brand, `text-3xl font-black` title ("Welcome back" / "Create your account"), muted subtitle, then `mt-7 space-y-4` form.
- Signup adds name field, password-strength `ProgressBar`, and confirm-password field with inline error.
- Inline form error: `rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700`.
- Full-width primary submit `py-3`. Footer switch link: `mt-5 text-center text-sm text-slate-500` with `font-bold text-violet-700` link.
- No split-screen imagery, no social login.

### 5.3 Dashboard (`/dashboard`)

- Violet eyebrow "Dashboard" + `text-3xl font-black` "Welcome back, {name}".
- 4-stat row: total quizzes taken, average score, best score, current rank (`#n` or "Unranked").
- Two-column split `lg:grid-cols-[1.4fr_0.8fr]`:
  - "Recommended Quizzes" card with a `md:grid-cols-3` grid of mini quiz cards: badge, `font-black` title, 2-line clamped `text-sm text-slate-500` description; hover `hover:border-violet-200 hover:bg-violet-50/40`.
  - "Leaderboard Preview" card with top 5 rank rows.
- Full-width "Recent Attempts" card (first 5) using the shared attempt list/table.

### 5.4 Quizzes (`/quizzes`)

- Title + subtitle, then a **filter bar card**: `grid gap-3 lg:grid-cols-[1fr_190px_170px_180px]` — search input with `Search` icon at `left-3 top-3` and `pl-10`, topic select, difficulty select, sort select.
- Results: `grid gap-4 md:grid-cols-2 xl:grid-cols-3` of quiz cards.
- Quiz card: difficulty badge + time (`{n} min` or "Untimed") in top row; `text-xl font-black` title; `flex-1 text-sm leading-6 text-slate-500` description; a 2-up `bg-slate-50` meta block (Questions / Best score with "New" when untaken); full-width primary "View quiz".
- States: skeleton grid, StateBlock for load error and empty filters.

### 5.5 Quiz detail (`/quizzes/:id`)

- `max-w-4xl`, one large `Card p-8`.
- Difficulty + category badges; `text-4xl font-black` title; `text-lg leading-8 text-slate-600` description.
- 3-up Stat row: Questions, Time limit, Total points.
- Violet info panel: `rounded-2xl bg-violet-50 p-5` with `font-black` "Are you ready?" and muted instructional copy.
- Primary "Start Quiz" `px-6 py-3` with loading state.

### 5.6 Taking a quiz (`/quiz/:id/take`)

- `max-w-5xl space-y-5`, three stacked cards.
- **Progress card:** quiz title + "Question n of N · x answered"; timer chip on the right (`rounded-xl px-4 py-2 font-black` with clock icon) that is `bg-slate-100 text-slate-700` normally and `bg-rose-100 text-rose-700` under 60s; violet progress bar; amber notice strip when submitting/timed out.
- **Question card (`p-6 md:p-8`):** `text-2xl font-black leading-9` question + difficulty badge on the right. Answers are full-width buttons, `rounded-2xl border p-4 text-left font-semibold`, each with a `h-7 w-7 rounded-full bg-slate-100` A/B/C/D marker. Selected: `border-violet-400 bg-violet-50 text-violet-800`. Default: white with `hover:border-violet-200 hover:bg-slate-50`. Focus: `focus:ring-4 focus:ring-violet-100`.
- **Navigator card:** number grid of `h-10 w-10 rounded-xl text-sm font-black` buttons — current `bg-violet-600 text-white`, answered `bg-emerald-100 text-emerald-700`, untouched `bg-slate-100 text-slate-500`. Below: Secondary "Previous" / Primary "Next", with "Submit Quiz" on the last question; submit error as a rose strip.
- Submit opens the modal (warns about unanswered count), scores, then navigates to results.

### 5.7 Results (`/results/:attemptId`)

- Top card `grid gap-6 p-8 md:grid-cols-[220px_1fr]`.
  - Left: **score ring** — `grid aspect-square place-items-center rounded-full border-[14px] border-violet-100 bg-white`, inside `text-5xl font-black text-violet-700` percentage and a `font-bold text-slate-500` verdict ("Excellent" ≥90, "Great job" ≥75, "Good effort" ≥50, else "Keep practicing").
  - Right: badges (correct/total with tone by score: ≥80 green, ≥50 amber, else rose; difficulty; category), `text-3xl font-black` "Quiz complete: {title}", summary line, 4-up stats (Correct / Incorrect / Unanswered / Time taken), and actions: "Review Answers" (secondary, anchor to `#review`), "Try Again" (secondary), "Back to Quizzes" (primary).
- "Question review" card: each answer in `rounded-2xl border border-slate-200 p-4` with a green `Check` or rose `X`, question, "Your answer", green "Correct answer" line when wrong, and a `rounded-xl bg-slate-50 p-3` explanation block when present.

### 5.8 History (`/history`)

- Title, then one card containing the shared **attempt table**.
- Table (`w-full text-left`, `border-b` rows, `last:border-0`): Quiz, Date, Score, Correct, Answered, Missed, Time, action. Score column plain `pct`; action is a violet `font-bold` "Review" link or an amber "In progress" badge. Wrapped in `overflow-x-auto`.
- Empty state: StateBlock with "Browse quizzes" action.

### 5.9 Leaderboard (`/leaderboard`)

- Podium: `grid gap-4 md:grid-cols-3` nested cards; 1st place gets `border-2 border-amber-300 bg-amber-50`; big `text-3xl font-black` `#rank`, `text-xl font-black` name, `text-4xl font-black text-violet-700` best score, muted "n tests taken".
- Full ranking list of `RankRow`s: `grid grid-cols-[60px_1fr_90px_90px_90px] items-center gap-3 rounded-2xl px-4 py-3 text-sm` showing rank, name, best %, average %, tests. Every row is `bg-slate-50`; the current user's row is `bg-violet-50 text-violet-800 ring-1 ring-violet-200` and appends " (you)".

### 5.10 Profile (`/profile`)

- Identity card `p-8`: `h-20 w-20 rounded-3xl bg-violet-100 text-3xl font-black text-violet-700` avatar with the user's initial, name `text-3xl font-black`, muted email.
- Same 4-stat row as Dashboard, then "Recent activity" card with the attempt list.

### 5.11 Admin (`/admin`, admin role only)

- Violet eyebrow "Admin", title "Content management", subtitle, primary "New Quiz" with `Plus` icon on the right.
- 4 stats: Quizzes, Questions, Answers, Visible attempts.
- Two-column editor `xl:grid-cols-[360px_1fr]`:
  - **Quiz library** card: list of `rounded-2xl border p-3` buttons; selected `border-violet-300 bg-violet-50`, hover `bg-slate-50`; title + difficulty badge; `text-xs text-slate-500` "{category} · n questions".
  - **Editor** (stacked cards): quiz fields in `md:grid-cols-2` (title, category, difficulty, time limit) plus description textarea; save/delete row with inline emerald success / rose error text. Then question editor: question + difficulty + points, answer rows `md:grid-cols-[40px_1fr_120px_44px]` (letter tile, text input, "Correct" radio, trash), "Add Answer" secondary, explanation textarea, Save. Then read-only question list with Edit/Delete.
- Destructive actions use native `window.confirm`.

---

## 6. Responsive behavior

Tailwind defaults: `sm 640`, `md 768`, `lg 1024`, `xl 1280`.

- **< 1024px:** sidebar hidden, hamburger header, drawer navigation; all content full width with `px-4`.
- **≥ 1024px:** 288px fixed sidebar + sticky header offset by `ml-72`; content `px-8`.
- Grid collapses: 4-up stat rows → 1 column (then 4 at `md`); quiz grid → 1 → 2 (`md`) → 3 (`xl`); dashboard split → stacked → 1.4/0.8 (`lg`); quiz detail stats → stacked → 3 (`md`); results card → stacked → `220px 1fr` (`md`); admin editor → stacked → `360px 1fr` (`xl`).
- Tables scroll horizontally rather than restack.
- Mobile drawer is `w-80`; header CTA and logout remain visible.

---

## 7. Content & tone in the UI

- Copy is short, direct, and product-focused, in **sentence case** and mostly second person ("Test your knowledge…", "Start a quiz to build your history").
- Empty states name the problem, then offer one action ("You haven't taken any quizzes yet." → "Browse quizzes").
- Numbers always use the `%` helper (rounded, no decimals) and dates use `Intl.DateTimeFormat` short month + day + year + hour/minute; durations show `m:ss`; in-progress attempts show "In progress".
- No emoji. Iconography carries meaning (Check/X/Clock/Trophy).

---

## 8. Accessibility & interaction notes

- Interactive elements are real `<button>`, `<a>`, `NavLink`, or `<label>`-wrapped inputs.
- Every input has a visible text label (no placeholder-only fields, except filter search).
- Focus is indicated with a 4px violet ring (`focus:ring-4 focus:ring-violet-100`) plus a violet border; icon-only buttons rely on `aria-label` (mobile menu, drawer close, password toggle, remove answer).
- Disabled states use `disabled:opacity-60` + `cursor-not-allowed`; loading buttons disable themselves.
- Color is never the only signal for correctness: review rows pair green/rose with Check/X icons, and difficulty badges carry text.
- Not implemented: skip link, reduced-motion handling, and `aria-live` on toasts. Keep the current scope unless asked to add them.

---

## 9. Known quirks (preserve unless explicitly asked to fix)

These exist in the current UI. Match them when extending screens; do not silently "clean them up" in a design-only change.

1. **Badge text is tiny until `lg`** because of `text-[5px] md:text-[8px] lg:text-xs` (the last class wins at ≥1024px). The attempt table has the same pattern (`text-[5px] md:text-sm`).
2. **Profile wrapper sets `text-xl`** on the page container, which cascades into the identity card's name/email sizing.
3. **Dashboard, Results, and Profile use `max-w-full`** (unbounded on ultrawide screens) while the rest use `max-w-7xl`.
4. **NotFound renders without `Shell` and without page padding/background** — it's a bare `StateBlock` card.
5. **Two different link/button patterns coexist** for actions: sometimes `<Link><Button/></Link>` (nested interactive elements) and sometimes a styled link. Follow the surrounding screen rather than refactoring.
6. **Fonts:** Inter is declared but not loaded; the app falls back to the system UI font.
7. **No dark mode, no theme switching, no CSS variables beyond `--font-sans`.**

---

## 10. Building a new screen — checklist

1. Authenticated page? Wrap in `<Shell>`; public page? Use `min-h-screen bg-stone-50`.
2. Container: `mx-auto max-w-7xl space-y-6` (or `max-w-4xl`/`max-w-5xl` for focused flows).
3. Header block: optional violet uppercase eyebrow → `text-3xl font-black` title → `text-slate-500` subtitle.
4. Group content in `Card`s; use a `grid gap-3/4` for metrics (`md:grid-cols-4`), `gap-4/6` between cards.
5. Reuse `Button`, `Input`, `Badge`, `ProgressBar`, `StateBlock`, `Skeleton`, `Stat`; do not add a new UI dependency.
6. Cover all four states: loading (skeleton), error (StateBlock), empty (StateBlock + action), success.
7. Primary action violet; secondary white with `border-slate-200`; destructive rose. Only one primary per view.
8. Icons from `lucide-react` at `h-4 w-4` (inline) or `h-5 w-5` (standalone), violet when emphasizing.
9. Responsive: 1 column on mobile, expand at `md`/`lg`/`xl` as in §6; keep `px-4 lg:px-8` page padding.
10. Copy: sentence case, concise, `text-sm text-slate-500` for supporting text.
