# AGENTS.md

## Cursor Cloud specific instructions

### Overview

Mood Movie Picker is a zero-dependency static web app (single `index.html` + JSON data files). No build step, no package manager, no framework.

### Running the app

Serve from the repo root with any static HTTP server. The app uses `fetch()` for local JSON, so `file://` protocol will not work.

```bash
python3 -m http.server 4173
```

Then open http://127.0.0.1:4173/index.html.

### Validation / "tests"

There is no test framework. The validation checks are:

```bash
python3 -m json.tool data/movies.json >/dev/null
python3 -m json.tool data/tmdb-cache.json >/dev/null
node --check scripts/refresh-tmdb.js
```

### Gotchas

- There is no `package.json` and no `node_modules`. Do not run `npm install` or similar.
- The optional `scripts/refresh-tmdb.js` requires a `TMDB_TOKEN` env var (or `.env` file) and network access to the TMDb API. It is not needed for normal development — the cache is committed.
- The app must be served over HTTP (not opened as a local file) because it uses `fetch()` to load `data/*.json`.
