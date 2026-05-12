# Mood Movie Picker

Pick the night. Skip the scroll.

A tiny static web app that recommends three movies based on your current
**vibe**, **energy level**, and **who's watching**. The recommendations are
curated locally for demo quality, then enriched from a committed TMDb metadata
cache so the browser never needs an API secret.

## Run it

Because the app loads local JSON files, serve the project from a local static
server:

```bash
python3 -m http.server 4173
```

Then open <http://127.0.0.1:4173/index.html>.

## What's in v1

- **Curated catalog:** `data/movies.json` contains real movie picks, matching
  fields, tags, and hand-written reasons.
- **Static metadata cache:** `data/tmdb-cache.json` contains safe public movie
  metadata used by the UI.
- **Three inputs:** vibe, energy, and watching context.
- **Lightweight scoring:** the app scores curated titles and always returns
  exactly three.
- **Result roles:** cards are labeled as `Safe pick`, `Conversation pick`, or
  `Wild card`.
- **Try 3 more:** rotates deterministically through more scored picks.
- **Shareable URLs:** selected filters and result set are encoded in the URL.

## Optional TMDb refresh

The app does not call TMDb from the browser. To refresh the static cache locally:

1. Create a `.env` file with a TMDb v4 read access token:

   ```bash
   TMDB_TOKEN=your_token_here
   ```

2. Run:

   ```bash
   node scripts/refresh-tmdb.js
   ```

3. Commit the updated `data/tmdb-cache.json`.

`.env` is already ignored by git.

## Data model

Each curated movie includes:

```json
{
  "tmdbId": 546554,
  "title": "Knives Out",
  "vibes": ["Fun", "Tense"],
  "energy": "Medium",
  "watchingWith": ["Family", "Friends", "Date night"],
  "tags": ["mystery", "ensemble", "clever"],
  "boost": 3,
  "reason": "Slick mystery structure with enough humor to keep it approachable."
}
```

## Validation

Useful checks:

```bash
python3 -m json.tool data/movies.json >/dev/null
python3 -m json.tool data/tmdb-cache.json >/dev/null
node --check scripts/refresh-tmdb.js
```

The browser smoke path is: select a vibe, energy, and watching context; submit;
click `Try 3 more`; reload the generated URL and confirm the same state returns.

## License

MIT
