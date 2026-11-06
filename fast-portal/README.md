# FAST — Faculty and Admin Scheduling Tool

Open `index.html` in a browser (internet needed once for the Tailwind CDN).

## Structure
```
index.html              page shell, loads everything in order
css/                    theme (colour tokens) · base · layout · components · login · responsive · print
js/tailwind.config.js   Tailwind config (colours map to css/theme.css variables)
js/core/                syllabus engine (mkPlan), constants, dates, timing engine, utils, state, scheduler, seed data, auth, login view, render
js/shared/              code used by both roles: timetable grid, announcement card, reports
js/teacher/             TEACHER side only: helpers.js, actions.js, pages.js
js/admin/               ADMIN side only: actions.js, timings.js, announcements.js, pages.js
js/main.js              starts the app
```

## Teacher side: choosing subjects and registering
- **Choose your subjects** (`subjView()` in js/teacher/helpers.js): shows how many subjects are free, a credit-hour meter, search, a department filter and an "Only available subjects" switch. The demo curriculum (`CUR` in js/core/constants.js) now has semesters up to 8 with many unassigned subjects.
- **Lecture picker**: a subject can have two or more lectures on the same day if the times are different. Only real clashes (teacher busy, same class busy, same time twice) are refused.
- **Apply with CV** (`regSelf()`, `cvPick()` in js/core/auth.js, screen `regView()`): landing page -> register + upload CV (PDF/DOC/DOCX, max 2 MB) -> application is `Pending` in `st.apps`. Admin opens **Teachers** (the old "Register New Teacher" form was removed; applications are the only way in), views the CV and Approves (`appDecide()` creates the teacher account) or Rejects (with a reason). Pending/rejected applicants who try to log in see a clear message; approved ones go straight to the teacher dashboard. Duplicate email / CNIC / name (teacher or open application) shows an "already registered" alert.

## Subjects & Syllabus (admin)
One page for the curriculum: add/edit/delete subjects and departments, set total lectures, paste the outline in ANY format. `aiPlan()` (js/admin/syllabus.js) asks AI to split it across the lectures (offline: even auto-split), then the teacher's timetable and Syllabus Tracker are generated. Timetable blocks show the next topic of each subject (`nextTp()` in js/core/syllabus.js).

## Lecture timings (admin → Timings (AI))
Lectures per day is no longer fixed at 4. The admin picks **scope** (Standing / This day / This week / This month), **lectures per day (1-8)** and either a start/end window (AI divides it equally, break after lecture n/2) or each lecture's time by hand. A rule is `{f,t,sc,st,en,br,n}` or `{...,sl:[{s,e}]}` (see `js/core/timing.js`). Priority when rules overlap: day > week > month > standing; the same scope -> newest wins. Dates no rule covers keep the latest week/month/standing timing until the admin changes it (only a day rule is a one-day exception). If a rule has fewer lectures per day than before, `aiFix()` (js/admin/timings.js) moves lectures into free slots and warns about any that cannot fit.

## Backend plan
- `docs/DATA_CONTRACT.md`: entities, fields, API list and what logic must move to the backend.
- `js/core/api.js`: the data layer. Pages will call `api.*` instead of reading `st`; later each function becomes a `fetch()`.

## Common changes
- **New teacher page**: add a key to `Object.assign(V.t, {...})` in `js/teacher/pages.js` (it appears in the sidebar by itself); put its handlers in `js/teacher/actions.js`.
- **New admin page**: same, in `js/admin/pages.js` + `js/admin/actions.js`.
- **Demo data** (subjects, teachers, requests): `js/core/constants.js` and `js/core/state.js`.
- **Colours / dark mode**: `css/theme.css`. **Sidebar and waves**: `css/layout.css`.
- **Sidebar icons and order**: `IC` (icons) and `NAV` (groups and order) in `js/core/render.js`. A page not listed in `NAV` still shows up under "More".

## Notes
- Scripts are plain (non-module) files so the project opens by double-click. Load order in `index.html` matters.
- Data is kept in memory and resets on refresh. Real use needs a backend; admin and teacher then become separate pages talking to the same API.
- AI features (announcements, report summary) call the Claude API; outside claude.ai they fall back to built-in templates.
