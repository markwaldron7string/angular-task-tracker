# Task Tracker

A small, single-page Angular application for tracking tasks - add them, check them off, edit them inline, and delete them. Tasks are split across three filtered views and persist in the browser, so they survive a refresh.

Built as a hands-on project for learning modern Angular (v22) from the ground up.

## Features

- **Add, complete, edit, and delete tasks** - completing is a checkbox toggle; editing happens inline on the row.
- **Three views** via routing - *All tasks*, *Active* (not yet done), and *Completed*.
- **Live counts** - a running "remaining" count and a summary that stay in sync automatically.
- **Persistence** - tasks are saved to the browser's `localStorage` and reload automatically on refresh.

## Tech stack

- [Angular](https://angular.dev) 22
- TypeScript
- Standalone components (no NgModules)
- Signals - `signal`, `computed`, and `effect`
- Angular Router

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org) (LTS version)
- Angular CLI: `npm install -g @angular/cli`

### Run it locally

```bash
# install dependencies (first time only)
npm install

# start the dev server and open the browser
ng serve --open
```

The app runs at `http://localhost:4200` and reloads automatically when you save a file.

### Build for production

```bash
ng build
```

The compiled output is written to the `dist/` folder.

## Project structure

```
src/app/
├── app.ts              # Root shell: nav bar + <router-outlet>
├── app.html
├── app.css             # .active-link style for the active nav link
├── app.routes.ts       # Route table: '' -> TaskList, 'completed', 'active'
├── app.config.ts       # App providers (provideRouter)
│
├── task-store.ts       # TaskStore service - single source of truth
│
├── task-list/          # "All tasks" page (add box + full list)
├── active/             # "Active" page (incomplete tasks only)
├── completed/          # "Completed" page (done tasks only)
│
├── task-item/          # Reusable row: checkbox, inline edit, delete
└── task-summary/       # Small reusable task-count summary
```

## How it works

**State lives in one place.** `TaskStore` is a service provided in `root`, meaning every component that injects it receives the same single instance. It holds the task list in a `signal`, and every page reads from it - so completing a task on one page instantly updates every other view.

**Filtered views are derived, not duplicated.** The Active and Completed pages don't keep their own lists. They read `computed` signals (`activeTasks`, `completedTasks`) that recalculate from the single source whenever the task list changes.

**Saving is automatic.** An `effect` in the store watches the task list and writes it to `localStorage` on every change, so persistence is wired in one place rather than scattered across every method.

**Components communicate explicitly.** Data flows down into `task-item` through `input()`s, and events (toggle, edit, remove) flow back up through `output()`s for the parent to handle.

### Resetting the data

Because tasks persist, clearing them sticks across refreshes. To restore the original starter tasks, open your browser dev tools → **Application → Local Storage** and delete the `tasks` key.

## Angular concepts demonstrated

This project was built to practice the core of modern Angular, including:

- Components, templates, and interpolation
- The binding family: `[property]`, `(event)`, and `[class.x]`
- The signal trio: `signal`, `computed`, and `effect`
- Control flow blocks: `@for`, `@empty`, and `@if` / `@else`
- Component communication with `input()` and `output()`
- Services and dependency injection via `inject()`
- Client-side routing with `routerLink` and `<router-outlet>`

---

*A personal learning project.*