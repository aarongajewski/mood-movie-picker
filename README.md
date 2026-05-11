# Mood Movie Picker

Pick a mood. Get three movies. Two taps, no scrolling.

A tiny, single-page web app that recommends three movies based on your current
**vibe** (Cozy, Sad, Fun, Tense, Romantic) and **energy level** (Chill, Medium,
Hype). Designed to be the smallest possible useful version of itself: one HTML
file, no build step, no backend, no third-party APIs. The demo catalog is
hardcoded but uses real movies, years, runtimes, and tailored reasons so the
recommendations feel credible in a walkthrough.

## Run it

```bash
open index.html
```

…or serve it from any static host.

## Design tenets (v0)

- **No external APIs.** The movie catalog is a curated JavaScript array in
  `index.html`, with real titles and demo-ready recommendation copy.
- **No accounts, no database, no analytics.** Nothing leaves your browser.
- **No build step.** A single `index.html` with inline CSS and JS.
- **Always returns 3 picks.** No empty states.

## Stack

- One HTML file
- Vanilla JS + CSS
- Zero runtime dependencies

## How matching works

For a chosen `(vibe, energy)`:

1. Take all movies whose `vibes` include the chosen vibe **and** whose `energy`
   matches.
2. If fewer than 3, fill from movies that match the vibe only (any energy).
3. If still fewer than 3, fill from the rest of the catalog.

This guarantees exactly three deterministic picks for any input.

## Roadmap

See the [PRD](./PRD.md) for the full plan. Highlights:

1. Add a third question (e.g. *solo vs. with someone*).
2. Grow catalog to ~50 titles, move to `movies.json`.
3. Add a Shuffle to surface new picks on repeat runs.
4. Integrate TMDb for posters and metadata (first external API).
5. Replace the hardcoded catalog with a real movie metadata provider.

## License

MIT
