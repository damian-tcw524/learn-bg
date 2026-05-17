# LearnBG

LearnBG is a Vue 3 + TypeScript study app for learning Bulgarian. It combines structured lessons, flashcards, quizzes, grammar practice, listening drills, and a progress view in a single browser-based dashboard.

The app uses Vite, Vue Router, and local lesson data stored in `public/data`. It also registers a service worker and web manifest so it can be installed as a PWA.

## What’s included

- Lesson roadmap with topic pages loaded from `public/data/roadmap.json`
- Lesson renderer for content files in `public/data/lessons/`
- Flashcards with topic filtering and stats tracking
- Quick quiz, grammar lab, listening drills, and progress tracker routes
- Hash-based routing, which works cleanly on static hosting such as GitHub Pages

## Routes

- `/` - home dashboard
- `/lesson/:id` - lesson viewer
- `/flashcards` - flashcard trainer
- `/flashcards/stats` - flashcard performance stats
- `/quiz` - quick quiz
- `/grammar-lab` - grammar practice
- `/listening` - listening drills
- `/progress` - progress tracker

## Project Structure

- `src/` - Vue app, routing, and UI components
- `public/data/` - roadmap, flashcards, and lesson JSON content
- `public/sw.js` - service worker
- `public/manifest.json` - PWA manifest

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Deployment

The project includes a deploy script for GitHub Pages:

```bash
npm run deploy
```

That script builds the app and publishes the `dist/` output with `gh-pages`.

## Content Notes

Lessons are data-driven JSON files. The lesson format is documented in `public/data/lessons/LESSON_FORMAT.md`, and it now includes reusable blocks such as tables, lists, cards, quizzes, rules, and tabbed sub-sections. The current roadmap includes topics such as the Cyrillic alphabet, family vocabulary, verbs, present tense, noun gender, question words, dinner-table phrases, and cafe ordering.
