# Workout Planner – Egzersiz Planlayıcı - Antrenman Programı Yönetimi

- Demo URL: https://gym.wxcodesign.com

**Workout Planner** (Egzersiz Planlayıcı - Antrenman Programı Yönetimi) is a web application built with **Next.js + Firebase** to track gym workouts and simplify program management for trainers. Users can view exercises by selecting a program and day (with set/rep info and YouTube demo videos) and mark exercises as completed. Coaches can log in via the admin panel using Firebase Auth to create, edit, and delete programs, days, and exercises.

The project is set up to be **safe to host on GitHub**: real secrets live only in local env files that are already ignored by Git.

---

## What this app does

- **Client-facing workout tracker**  
  - Landing page at `/` lets the user select a workout **program** and then navigate through its **days**.  
  - Each day shows a list of **exercises** with sets, reps and an optional YouTube demo video.  
  - The user can mark each exercise as **completed**; completion is stored **only in `localStorage`** per program, so no personal data is written to Firestore.

- **Admin panel for a coach/trainer**  
  - Admin UI lives under `/admin`.  
  - Email/password login is handled by **Firebase Auth**.  
  - After login, the admin can:
    - Create/edit/delete **programs** (icon, color, order, active flag, TR/EN name & description).
    - Create/edit/delete **days** for each program (day number, TR/EN title & subtitle).
    - Add/edit/delete **exercises** inside a day (TR/EN name and muscle group, sets, reps, YouTube video id, order).

- **Bilingual UI (TR / EN)**  
  - Text is managed through a small i18n layer in `src/lib/i18n.tsx`.  
  - The selected language is stored in `localStorage` under the key `gym-lang`.  
  - Header has a language toggle (`TR / EN`), and almost all user-facing strings are covered.

- **Flexible 5‑day style cycle**  
  - The default seed data defines a 5‑day cycle with different focuses (upper body, lower body, active recovery, etc.).  
  - The user can reset a single **day** or the entire **program**’s completion state from the UI.

---

## High-level flow

### Client side (`/`)

1. **Initial load**
   - `src/app/page.tsx` renders `ClientWorkoutView`, which dynamically imports `WorkoutView` on the client.
   - `WorkoutView` loads:
     - All **programs** from Firestore (`getAllPrograms`).
     - All **days** from Firestore (`getAllDays`), then counts how many days belong to each program.
   - If there is exactly **one** program, it is selected automatically; otherwise the user sees a program list.

2. **Selecting a program**
   - `ProgramSelector` displays cards for each program with:
     - Icon & color, **active/inactive** status, and number of days.
     - TR/EN name and description, depending on the current language.
   - Clicking a program loads its **days** via `getDaysByProgram(programId)`.
   - Completion state for that program is loaded from `localStorage` using a key of the form `gym-completions-<programId>`.

3. **Navigating days**
   - `DayTabs` renders tabs like “GÜN 1”, “GÜN 2”, etc., based on `DayProgram.dayNumber`.
   - Selecting a tab changes the **active day** in `WorkoutView`.

4. **Viewing and completing exercises**
   - `DayHeader` shows the day’s title/subtitle, completion counter (`completed/total`) and a progress bar.  
   - Exercises are rendered by `ExerciseCard`:
     - Shows muscle group, name, sets/reps and optional YouTube thumbnail / embedded player.
     - A button toggles completion for that exercise.  
   - Completion toggles update the `completions` object in state and persist to `localStorage`.

5. **Resetting progress**
   - **Reset day**: clears completion for the current day only.  
   - **Reset program**: resets all completions for the selected program after a confirmation modal.

6. **Legacy / seed-only mode**
   - If there are **days** in Firestore but **no programs**, the UI falls back to a “legacy” mode:
     - All days are loaded into a special pseudo-program with id `"__legacy__"`.
     - Completion is stored under `localStorage["gym-completions"]`.

### Admin side (`/admin`)

1. **Routing and loading**
   - `src/app/admin/page.tsx` renders `ClientAdminPanel`, which dynamically loads `AdminPanel` on the client.
   - `AdminPanel`:
     - Subscribes to Firebase Auth state (`onAuthStateChanged`) and shows `LoginForm` until a user is logged in.
     - Checks Firestore connectivity using a small `__connection_test__` document and shows a status indicator badge.

2. **Program management**
   - List of programs comes from `getAllPrograms` (ordered by `order`).  
   - The admin can:
     - Create a new program with:
       - `name_tr` / `name_en`, description fields, icon, color, order and `isActive` flag.
     - Edit an existing program (same fields as creation).
     - Toggle `isActive` on/off.
     - Delete a program:
       - This first deletes all its days (`deleteDaysByProgram`), then the program document itself (`deleteProgramDocument`).

3. **Day management**
   - Within a program, the admin sees its days (loaded via `getDaysByProgram`).  
   - For each day:
     - Create: day number, TR/EN title & subtitle, and link it to the program.  
     - Edit: change the above fields later.  
     - Delete: removes the Firestore document (`deleteDayDocument`).

4. **Exercise management**
   - Each day embeds an array field `exercises` on the `days` document.  
   - `ExerciseForm` lets the admin:
     - Set TR/EN names and muscle groups.
     - Set sets, reps (as a string, e.g. `"8-12"`), YouTube video id and order.
   - Operations:
     - **Add**: `addExerciseToDay` appends a new exercise with a generated `id` (`crypto.randomUUID()`).
     - **Update**: `updateExerciseInDay` updates a matching exercise in the array.
     - **Delete**: `deleteExerciseFromDay` removes an exercise from the array.

5. **Toasts & UX**
   - All admin actions show success/error toasts via `react-hot-toast`, using translated messages from `i18n`.

---

## Data model (Firestore)

- **Collection `programs`** (`PROGRAMS_COLLECTION`)
  - One document per training program.
  - Important fields:
    - `name` (base name, usually TR)
    - `name_tr`, `name_en`
    - `description`, `description_tr`, `description_en`
    - `icon`: one of `"dumbbell" | "home" | "stretch" | "heart" | "zap" | "target" | "flame" | "swords"`
    - `color`: one of `"red" | "blue" | "green" | "purple" | "orange" | "cyan" | "pink" | "yellow"`
    - `order`: number, used for sorting
    - `isActive`: boolean

- **Collection `days`** (`DAYS_COLLECTION`)
  - One document per day in a program.
  - Important fields:
    - `dayNumber`: day index (1, 2, 3, …).
    - `title`, `subtitle`
    - `title_tr`, `title_en`, `subtitle_tr`, `subtitle_en`
    - `programId`: reference to the parent program (`programs` document id).
    - `exercises`: array of embedded Exercise objects:
      - `id`: string
      - `name`, `muscleGroup`
      - `name_tr`, `name_en`, `muscleGroup_tr`, `muscleGroup_en`
      - `sets`: number
      - `reps`: string
      - `youtubeVideoId`: string
      - `order`: number

The seed script (`scripts/seed.ts`) currently writes a **set of 5 example days** directly into the `days` collection (without programs). You can later reorganize these into proper programs via the admin panel.

---

## Tech stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI**: React 19, Tailwind CSS 4
- **Icons**: `lucide-react`
- **Backend / data**: Firebase (Client SDK) and Firebase Admin (for seeding)
- **Styling / UX**:
  - Dark UI, glassmorphism-style cards, animated buttons, progress bars.
  - Client-only components for workout and admin views where needed.
- **Tooling**: ESLint, TypeScript, `tsx` for running scripts

---

## Environment variables

There are two env files:

- **`.env.local`**: **your real, private values** – this file should be ignored by Git and must NEVER be committed or copied to GitHub.
- **`.env.local.example`**: a safe example with placeholder values that **is meant to be committed**.

To run the app locally:

1. Copy the example file:

   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in the values in `.env.local`:

   - `NEXT_PUBLIC_FIREBASE_API_KEY` and other `NEXT_PUBLIC_...` keys from your Firebase **Web app** config.
   - `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` from your Firebase **Service Account** JSON.

   `FIREBASE_PRIVATE_KEY` must stay wrapped in quotes and use `\n` for newlines, like in the example file.

---

## Getting started (local development)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

- Create `.env.local` from the example as described above.
- Make sure Firebase:
  - Has **Firestore** enabled.
  - Has **Email/Password** authentication enabled (for the admin login).
  - Has at least one user you can use to log into `/admin`.

### 3. Run the dev server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## Database seeding

There is a seed script that writes initial workout day data to Firestore using the Firebase Admin SDK and the credentials in `.env.local`.

Run it with:

```bash
npm run seed
```

Notes:

- The script uses the `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` environment variables.
- It writes documents into the `days` collection only (no `programs`), which the client UI treats as a legacy/single-program mode.
- You can later create proper **programs** in the admin panel and re-assign or recreate days as needed.

---

## NPM scripts

- **`npm run dev`**: Start Next.js dev server.
- **`npm run build`**: Create production build.
- **`npm run start`**: Start the production server.
- **`npm run lint`**: Run ESLint.
- **`npm run seed`**: Seed Firestore with initial gym schedule data.

---

## Deployment

- The project is configured for **Vercel** deployment via `vercel.json`:
  - `"framework": "nextjs"`
  - `"regions": ["fra1"]` (Frankfurt region).
- `next.config.ts` allows loading YouTube thumbnails from `https://img.youtube.com`.
- For production:
  - Set the same environment variables in your Vercel project as you use locally (but **never** commit private values).
  - Ensure Firebase security rules are appropriate for your use case (e.g. restrict write access to authenticated users only).

---

## Security / secrets

- **Secrets**:
  - Real keys and private data must live only in `.env.local` (ignored by Git).
  - **Do not** paste real secret values into source files, the README, or commit messages.
- **Ignored files** (typical setup):
  - `node_modules`, `.next`, build output, `.vercel`, and all `.env*` files should be listed in `.gitignore`.

