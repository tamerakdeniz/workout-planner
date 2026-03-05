# workout-planner

A small **Next.js + Firebase** app for managing a gym training schedule (days, exercises, YouTube demo links, etc.).

The project is set up to be **safe to host on GitHub**: real secrets live only in local env files that are already ignored by Git.

### Tech stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI**: React 19, Tailwind CSS 4
- **Backend / data**: Firebase (Client SDK) and Firebase Admin (for seeding)
- **Tooling**: ESLint, TypeScript, `tsx` for running scripts

### Getting started

- **1. Install dependencies**

```bash
npm install
```

- **2. Environment variables**

There are two env files:

- **`.env.local`**: **your real, private values** – this file is already in `.gitignore` and should NEVER be committed or copied to GitHub.
- **`.env.local.example`**: a safe example with placeholder values that **is meant to be committed**.

To run the app locally:

1. Copy the example file:

   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in the values in `.env.local`:

   - `NEXT_PUBLIC_FIREBASE_API_KEY` and other `NEXT_PUBLIC_...` keys from your Firebase **Web app** config
   - `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` from your Firebase **Service Account** JSON

   `FIREBASE_PRIVATE_KEY` must stay wrapped in quotes and use `\n` for newlines, like in the example file.

- **3. Run the dev server**

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### Database seeding

There is a seed script that writes initial workout data to Firestore using the Firebase Admin SDK and the credentials in `.env.local`.

Run it with:

```bash
npm run seed
```

Make sure your `.env.local` has valid admin credentials before running this.

### NPM scripts

- **`npm run dev`**: Start Next.js dev server
- **`npm run build`**: Create production build
- **`npm run start`**: Start the production server
- **`npm run lint`**: Run ESLint
- **`npm run seed`**: Seed Firestore with initial gym schedule data

### GitHub / security notes

- **Secrets**:
  - Real keys and private data live only in `.env.local` (ignored by Git).
  - **Do not** paste real secret values into source files, the README, or commit messages.
- **Ignored files**:
  - `node_modules`, `.next`, build output, `.vercel`, and all `.env*` files are already covered by `.gitignore`.

### Git usage

This repository is already connected to GitHub. After making changes locally:

```bash
git add .
git commit -m "Your message"
git push
```
