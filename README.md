# IELTS 90-Day Mastery Platform

A full-stack, responsive single-page web app that guides students from foundation-level English
to an IELTS Band 8.0+ through a day-by-day 90-day curriculum: **6 phases, 90 days, 449 study tasks**.

**Stack:** React 18 (Vite, React Router) · Node.js + Express · MongoDB (Mongoose) · JWT auth

## Features

- Account sign-up / sign-in (bcrypt-hashed passwords, JWT sessions)
- **Dashboard**: current day, overall progress ring, band-ladder of the 6 phases, streak, hours studied, progress by skill
- **Roadmap**: all 90 days grouped by phase, with completion state and today highlighted
- **Day view**: five tasks per day (Listening, Reading, Writing, Speaking, Vocabulary & Grammar) with full instructions, time estimates, and "mark all done"
- **Score tracker**: log mock/practice band scores; overall band is auto-calculated (average rounded to the nearest 0.5) and charted against your target
- **Settings**: target band, course start date, reset progress
- Progress is saved per user in MongoDB; optimistic UI updates with rollback on failure
- Responsive: sidebar on desktop, bottom tab bar on mobile; keyboard-accessible; respects reduced motion

## The curriculum

| Phase | Days | Target band | Focus |
|------:|------|-------------|-------|
| 1 Foundation | 1–15 | 4.5 – 5.0 | Test format, core grammar & vocabulary, study habit |
| 2 Skill Building | 16–30 | 5.0 – 5.5 | Every question type, guided untimed practice |
| 3 Strategy | 31–45 | 5.5 – 6.0 | Timing, prediction, paraphrasing, essay planning |
| 4 Intensive Practice | 46–60 | 6.0 – 6.5 | Exam conditions and an error log |
| 5 Advanced Refinement | 61–75 | 6.5 – 7.5 | Range, accuracy, fluency |
| 6 Mock Tests & Mastery | 76–90 | 7.5 – 8.0+ | Four full mock tests, weak-spot repair, test-day prep |

Day 1 is a diagnostic day, Days 15/30/45/60/75 end with a phase review, Days 78/81/84/87 are full mock
tests, and Day 90 (4 tasks) is a light wrap-up. 89 days x 5 tasks + 4 = **449 tasks**.
The content is generated in `server/src/data/curriculum.js` (edit it to customise the plan).
Check the totals any time (no database needed): `npm run verify`.

## Requirements

- Node.js 18.11 or newer
- MongoDB (local install, MongoDB Atlas, or the included Docker Compose file)

## Quick start

```bash
# 1. Install everything
npm run install:all

# 2. Start MongoDB (skip if you already have one running or use Atlas)
docker compose up -d

# 3. Configure the API (a dev-ready server/.env is included; edit if needed)
#    server/.env  ->  MONGODB_URI, JWT_SECRET, PORT, CLIENT_ORIGIN

# 4. Run API (http://localhost:5000) and web app (http://localhost:5173) together
npm run dev
```

Open **http://localhost:5173**, create an account, and start Day 1.
The API seeds the 449 tasks automatically on every start (safe to repeat; student progress is never touched).
You can also seed manually with `npm run seed`.

## Production

```bash
npm run build      # builds client/dist
npm start          # Express serves the API and the built React app on one port
```

Set `NODE_ENV=production`, a strong `JWT_SECRET`, and your `MONGODB_URI` (e.g. Atlas) in the environment.
If you host the client separately, set `VITE_API_URL` at build time and `CLIENT_ORIGIN` on the API.

## Project structure

```
ielts-mastery/
├── package.json            root scripts (dev, build, start, seed, verify)
├── docker-compose.yml      optional local MongoDB
├── server/
│   ├── .env.example
│   └── src/
│       ├── index.js        Express app + startup
│       ├── config.js  db.js  seed.js
│       ├── data/curriculum.js   phases + 449-task generator
│       ├── models/         User, Task, Progress, Score
│       ├── middleware/auth.js   JWT check
│       └── routes/         auth, curriculum, progress, scores
└── client/
    └── src/
        ├── App.jsx  main.jsx  api.js  utils.js  styles.css
        ├── context/        AuthContext, DataContext (curriculum + progress state)
        ├── components/     Layout, BandLadder, ProgressRing, TaskItem
        └── pages/          Auth, Dashboard, Roadmap, Day, Scores, Settings
```

## API reference

All routes except `/api/auth/register`, `/api/auth/login`, `/api/curriculum` and `/api/health` need
`Authorization: Bearer <token>`.

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/auth/register` | Create account `{name, email, password, startDate?}` |
| POST | `/api/auth/login` | Sign in `{email, password}` |
| GET / PUT | `/api/auth/me` | Read / update profile `{name, targetBand, startDate}` |
| GET | `/api/curriculum` | Phases and all 449 tasks |
| GET | `/api/progress` | Completed tasks for the user |
| PUT | `/api/progress/task/:number` | Set one task done `{done: true/false}` |
| PUT | `/api/progress/day/:day` | Set a whole day done / not done |
| DELETE | `/api/progress` | Reset all progress |
| GET / POST | `/api/scores` | List / add band scores |
| DELETE | `/api/scores/:id` | Delete a score |

## Notes

- Tasks are identified by a stable `number` (1–449), so re-seeding or editing task text never loses progress.
- `server/.env` contains development defaults only. Change `JWT_SECRET` before deploying.
