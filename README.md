# InkFlow

InkFlow is a web-based online publishing platform built with Angular. It lets authors write, draft, schedule, and publish articles, and lets readers browse, search, like, and get a personalized feed of content — built as part of the Angular Training.

## Live Demo

- **Deployed App:** https://ink-flow-fhg3.vercel.app/
- **GitHub Repository:** https://github.com/AryanLove123/InkFlow

## Signing In

InkFlow uses **Google Sign-In only** — there's no email/password login, so there are no dummy credentials to remember or copy-paste. Just click **Sign in with Google** on the login screen and continue with your own Google account.

Since there's no separate role system, any signed-in user can both read and write — the same account can browse as a reader and publish as an author.

> First-time sign-in takes you through a short **onboarding step** where you pick a few reading interests (Technology, Design, Travel, etc.) — these directly drive the personalized "For You" feed described below.

## Features Implemented

- **Google Authentication (Firebase)** — Sign-in is handled entirely through Firebase Authentication's Google provider. Firebase owns identity (uid, name, email, photo); the app's own user profile (preferences, drafts, liked articles) is a separate record keyed by that uid, so identity and app data are cleanly decoupled.
- **Onboarding & Interests** — On first login, users choose a set of categories they're interested in. This is stored on their profile and re-editable later from Settings.
- **Home Feed — Latest / Popular / Featured / For You** — Four distinct sorts, each backed by its own logic:
  - *Latest*: sorted by publish date.
  - *Popular*: a weighted score discounted by an exponential recency decay, so old high-view articles don't permanently dominate.
  - *Featured*: the same popularity score plus a flat recency bonus — an automated stand-in for "Editor's Pick," since there's no admin/editor role in this app.
  - *For You*: a deterministic recommendation score based on matching the user's chosen categories/tags, their past likes (by author and category), and a small popularity tiebreaker — no AI/ML involved, just explainable scoring.
- **Article Editor** — Rich text formatting (bold, italic, underline, headings, lists, links, images), categories, and tags.
- **Drafts & Autosave** — Drafts save automatically while typing (debounced) and can be resumed later from the Drafts page.
- **Scheduled Publishing** — Articles can be scheduled for a future date/time (see Assumptions section below for how this actually works without a backend).
- **Search & Explore** — Search across articles, authors, and tags, plus a dedicated Explore page and popular-tags browsing.
- **Author Directory & Profiles** — Browse all authors, view an author's bio and their published articles.
- **Article Details** — View count tracking, likes, and a "related articles" section computed from shared category/tags/author.
- **Pagination** — All list views (feed, search results) are paginated.
- **Performance** — Lazy-loaded feature routes, and a dedicated **Web Worker** that runs the popularity/featured/recommendation scoring off the main thread (with a safe fallback if a browser doesn't support Web Workers).
- **State Management** — Angular Signals + services as the primary state layer, with RxJS/BehaviorSubject used specifically for authentication state.
- **Custom SCSS Design System** — A dedicated visual identity (tokens, typography, layout) rather than default Angular Material styling.

## Assumptions & Known Limitations

- **No backend.** Firebase is used *only* for authentication. Everything else — articles, drafts, likes, preferences, view counts — is stored in the browser's `localStorage`. This means app data is per-browser/device, not synced across sessions on different machines.
- **Scheduling is checked on app load, not by a real server job.** Since there's no backend to run a cron job at the exact scheduled time, a scheduled article is stored with its target publish time and is automatically flipped to "published" the next time the app starts up (if that time has already passed). In a real deployment this would be a server-side scheduled task instead.
- **No admin/editor role.** "Featured" articles are chosen automatically via the popularity + recency formula described above, rather than manually curated by an editor.

## Tech Stack

- Angular (standalone components, Signals)
- Firebase Authentication (Google Sign-In)
- RxJS
- SCSS
- Web Workers
- `localStorage` as the persistence layer (no backend)

## Running the Project Locally

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended)
- Angular CLI:
  ```bash
  npm install -g @angular/cli
  ```

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/AryanLove123/InkFlow.git
   cd InkFlow
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   ng serve
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:4200
   ```

5. Click **Sign in with Google** and continue with your own Google account — no demo credentials needed.

> **Note:** The app seeds sample articles and authors into your browser's `localStorage` on first load, so there's content to browse immediately.

## Building for Production

```bash
ng build
```

Build artifacts will be output to the `dist/` directory.