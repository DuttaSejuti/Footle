# Footble ⚽

A mobile-first daily football player guessing game inspired by Wordle and football trivia.
Players deduce mystery footballers across five progressive clues in six attempts.

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Dark navy pitch theme `#0b1319` with vibrant grass accent `#10b981`)
- **Animations:** Custom CSS smooth reveal animations, pulse indicators, and `canvas-confetti` celebrations
- **Icons:** `lucide-react`
- **Data Persistence:** Local JSON store (`src/data/footballers.json`, `data/schedule.json`, `data/analytics.json`) with client-side localStorage fallback for anonymous user daily streak resilience.

---

## Core Gameplay & Scoring Rules

Each match presents 1 mystery footballer and 5 progressive clues across 6 substitution attempts:
1. **Clue 1: Nationality & Flag** (Guessing now = **6 points**)
2. **Clue 2: Tactical Position** (Goalkeeper, Defender, Midfielder, Forward) (Guessing now = **5 points**)
3. **Clue 3: Current / Last Club** (Active club, or last senior club if retired) (Guessing now = **4 points**)
4. **Clue 4: Career History** (Chronological sequence of unique previous clubs) (Guessing now = **3 points**)
5. **Clue 5: Photo Reveal** (Attributed portrait with source/license metadata, or Image-Free mode when no verified image exists) (Guessing now = **2 points**)
6. **Final attempt** (No new clue, but a correct guess still scores **1 point**)

- **Incorrect Guesses:** Do not deduct points, but do not automatically reveal the next clue.
- **Give Up:** Reveals mystery footballer and awards 0 points.
- **Modes:**
  - **Daily Challenge:** Deterministic UTC calendar date selection so every player worldwide gets the exact same mystery footballer on the same day. Answers are kept strictly server-side and never exposed to the client prior to game completion.
  - **Practice Mode:** Infinite randomized matches to test football knowledge anytime.

---

## Local Setup & Run

### 1. Requirements
- Node.js 18+ (tested on Node v20)
- npm 9+

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Core Tests
```bash
npm test
```
Validates scoring calculations, diacritic/accent normalization, answer matching, and deterministic date selection.

### 5. Production Build
```bash
npm run build
npm start
```

---

## Admin Portal & Player Scheduling

Access the Admin Portal at `/admin`.
- **Authentication:** Configured via the `ADMIN_SECRET` environment variable.
- **Features:**
  - View analytics (daily visitors, games completed, average scores, practice vs daily splits, share clicks).
  - Add and edit footballers.
  - Preview all 5 clues for any footballer.
  - Assign specific footballers to any calendar date in the daily schedule.
  - Toggle footballers between Active and Inactive.
  - Review image rights and licensing compliance before registering photo URLs.

---

## Image Rights & Personality Policy

To comply with licensing and image rights:
- Photos are strictly sourced from **Wikimedia Commons** with verified Creative Commons (CC-BY, CC-BY-SA) or Public Domain licenses.
- Every photo is paired with `imageAttribution: "Wikimedia Commons"`, `imageLicense: "Creative Commons / Public Domain"`, and `sourceUrl` linking directly to the Wikimedia / Wikipedia entry.
- For players without a verified free license photo, the game falls back to **Image-Free Mode** automatically, displaying their country flag and verified trivia without missing gameplay functionality. No copyrighted agency or Transfermarkt images are used.

---

## Database Migration & Scaling Instructions

The current MVP uses clean JSON file persistence in `./data` via `src/lib/server-storage.ts`.
To migrate to a cloud database (e.g., PostgreSQL / Supabase / Prisma / MongoDB):

1. **Schema Migration:**
   Create a table matching `Footballer`:
   ```sql
   CREATE TABLE footballers (
     id VARCHAR(64) PRIMARY KEY,
     full_name VARCHAR(128) NOT NULL,
     display_name VARCHAR(64) NOT NULL,
     alternative_names TEXT[] NOT NULL DEFAULT '{}',
     nationality VARCHAR(64) NOT NULL,
     country_code VARCHAR(8) NOT NULL,
     flag_emoji VARCHAR(16) NOT NULL,
     league VARCHAR(64),
     position VARCHAR(32) NOT NULL,
     current_club VARCHAR(64) NOT NULL,
     age INTEGER,
     birth_year INTEGER,
     is_retired BOOLEAN DEFAULT FALSE,
     previous_clubs TEXT[] NOT NULL DEFAULT '{}',
     image_url TEXT,
     image_attribution TEXT,
     image_license TEXT,
     source_url TEXT,
     difficulty VARCHAR(16) DEFAULT 'Easy',
     is_active BOOLEAN DEFAULT TRUE
   );

   CREATE TABLE daily_schedule (
     match_date DATE PRIMARY KEY,
     player_id VARCHAR(64) REFERENCES footballers(id)
   );

   CREATE TABLE analytics (
     id SERIAL PRIMARY KEY,
     metric_key VARCHAR(64) UNIQUE,
     metric_val BIGINT DEFAULT 0
   );
   ```
2. In `src/lib/server-storage.ts`, swap the `fs.readFileSync` calls with your ORM / SQL query (e.g. `prisma.footballer.findMany()`). All types remain identical.

---

## Vercel Deployment Instructions

1. Push repository to GitHub or GitLab.
2. In the [Vercel Dashboard](https://vercel.com):
   - Click **Add New Project** -> import the repo.
   - Framework preset: **Next.js**.
   - Build Command: `npm run build`
   - Output Directory: `.next`
3. **Environment Variables:**
   - Add `ADMIN_SECRET`: your secure password for the admin portal.
4. Click **Deploy**.
5. Once deployed, the app is live with automatic SSL and edge CDN caching.
