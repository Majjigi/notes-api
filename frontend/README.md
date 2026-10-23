# Notes — Frontend

The Angular 21 app for Notes: a two-pane notes editor with autosave, search, light/dark themes and
its own small design system ("Paper & Ink").

## Run it

The backend must be running first (see [../backend/README.md](../backend/README.md)), on
http://localhost:8000.

```bash
npm install
npm start          # http://localhost:4200
```

| URL                                  | What you see                                   |
| ------------------------------------ | ---------------------------------------------- |
| http://localhost:4200/notes          | Note list + "pick a note" screen               |
| http://localhost:4200/notes/3        | Note 3 open in the editor                      |
| http://localhost:4200/design-system  | Living style guide of every token & component  |

## Features

- **Autosave** — changes are saved 0.6 s after you stop typing (the badge shows *Saving… → Saved*).
  Switching notes or closing the tab saves immediately. `Ctrl+S` saves right away.
- **Search** — `/` or `Ctrl+K` jumps to the search box; results come from the API's `?search=`.
- **Delete** with a confirmation dialog, then a toast.
- **Themes** — the sun/moon/monitor button cycles light → dark → follow your OS. Remembered per browser.
- **Phones** — below 768 px wide the app shows either the list or the open note, with a back button.
- **Friendly errors** — if the backend is down, the sidebar says so and offers *Try again*.

## How it talks to the backend

| Endpoint                       | Called from                      | When                              |
| ------------------------------ | -------------------------------- | --------------------------------- |
| `GET /api/notes/list`          | `NotesApiService.list()`         | App start, and while searching    |
| `GET /api/notes/get/{id}`      | `NotesApiService.get()`          | Opening a note by URL directly    |
| `POST /api/notes/create`       | `NotesApiService.create()`       | "New note" button                 |
| `PATCH /api/notes/update/{id}` | `NotesApiService.update()`       | Autosave                          |
| `DELETE /api/notes/delete/{id}`| `NotesApiService.delete()`       | Trash button → confirm            |

The API address comes from `src/environments/` (`http://localhost:8000/api` in development).

## Project structure

The app is organized **by type**. Every component lives in its own folder with three files:
the logic (`.component.ts`), the template (`.component.html`) and the styles (`.component.scss`).

```
src/
├── index.html                    # fonts + a tiny script that applies the saved theme before load
├── styles.scss                   # loads the design system below
├── styles/                       # global design system
│   ├── _tokens.scss              #   colors, type, spacing, radii, shadows, motion (light + dark)
│   ├── _base.scss                #   reset and defaults for plain HTML
│   └── _components.scss          #   .btn, .input, .card, .badge, .kbd, .skeleton, .empty-state
└── app/
    ├── app.component.{ts,html,scss}  # root component: <router-outlet> + toasts + dialog
    ├── app.config.ts             # HttpClient + router setup
    ├── app.routes.ts             # /notes, /notes/:id, /design-system
    │
    ├── components/               # everything you see on screen
    │   ├── notes-layout/         #   sidebar (brand, search, note list) + outlet
    │   ├── note-editor/          #   the editor with autosave
    │   ├── note-empty/           #   "pick a note" screen
    │   ├── design-system/        #   the /design-system style guide page
    │   ├── confirm-dialog/       #   the "are you sure?" dialog
    │   ├── toaster/              #   pop-up messages
    │   └── icon/                 #   <app-icon name="trash" />
    │       ├── icon.component.ts
    │       ├── icon.component.html
    │       └── icon.component.scss
    │
    ├── services/                 # logic and data, no UI
    │   ├── notes-api.service.ts  #   one method per backend endpoint
    │   ├── notes-store.service.ts#   the list of notes + loading/error state (signals)
    │   ├── theme.service.ts      #   light / dark / system
    │   ├── toast.service.ts      #   queue of pop-up messages
    │   ├── confirm.service.ts    #   ask a yes/no question, get a Promise<boolean>
    │   └── clock.service.ts      #   ticking "now" for "5 min ago" labels
    │
    ├── models/
    │   └── note.model.ts         # TypeScript shapes matching the backend models
    │
    └── pipes/
        └── relative-time.pipe.ts # "Just now", "5 min ago", "Yesterday"
```

Unit tests sit next to the file they test (`notes-api.service.spec.ts`, ...).

**Adding something new** — the CLI is configured to follow this layout:

```bash
npx ng generate component components/note-card   # → note-card.component.ts/.html/.scss + NoteCardComponent
npx ng generate service services/settings         # → settings.service.ts + SettingsService
```

## The design system

Tokens come in two layers, defined in [src/styles/_tokens.scss](src/styles/_tokens.scss):

1. **Palette** — raw colors with no meaning: `--paper-0 … --paper-950` (warm neutrals) and
   `--ink-50 … --ink-900` (indigo accent).
2. **Semantic** — what a color is *for*: `--color-bg`, `--color-text`, `--color-accent`,
   `--color-danger` …

Components only use semantic tokens. Dark mode re-points the semantic tokens at different palette
colors, so no component needs dark-mode code of its own.

Fonts: **Instrument Serif** for display headings, **Inter** for everything else.

Component classes follow BEM naming (`.block`, `.block__part`, `.block--variant`):

```html
<button class="btn btn--primary btn--sm">Save</button>
<span class="badge badge--success">Saved</span>
<input class="input" placeholder="Title" />
```

Open http://localhost:4200/design-system to see them all, in both themes.

## Tests

```bash
npm test           # Vitest, watches for changes
npx ng test --watch=false   # run once
```

## Build

```bash
npm run build      # output in dist/notes-frontend
```

The production build calls the API at `/api` on the same host (see `src/environments/environment.ts`).
