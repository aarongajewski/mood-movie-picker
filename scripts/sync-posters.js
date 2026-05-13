#!/usr/bin/env node

const fs = require("node:fs/promises");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const cachePath = path.join(root, "data", "tmdb-cache.json");
const posterDir = path.join(root, "data", "posters");

function remotePosterUrl(entry) {
  if (entry.remotePosterUrl) return entry.remotePosterUrl;
  if (entry.posterPath) return `https://image.tmdb.org/t/p/w500${entry.posterPath}`;
  return entry.posterUrl && /^https?:/i.test(entry.posterUrl) ? entry.posterUrl : null;
}

async function fetchPosterBytes(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Poster ${response.status}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

async function main() {
  const cache = JSON.parse(await fs.readFile(cachePath, "utf8"));
  await fs.mkdir(posterDir, { recursive: true });

  let downloaded = 0;
  for (const entry of cache) {
    const remoteUrl = remotePosterUrl(entry);
    if (!remoteUrl) continue;

    const filename = `${entry.tmdbId}.jpg`;
    const filePath = path.join(posterDir, filename);

    try {
      await fs.writeFile(filePath, await fetchPosterBytes(remoteUrl));
      entry.remotePosterUrl = remoteUrl;
      entry.posterUrl = `data/posters/${filename}`;
      downloaded += 1;
      console.log(`downloaded ${entry.tmdbId}`);
    } catch (error) {
      entry.remotePosterUrl = remoteUrl;
      entry.posterUrl = remoteUrl;
      console.warn(`remote fallback for ${entry.tmdbId}: ${error.message}`);
    }
  }

  await fs.writeFile(cachePath, `${JSON.stringify(cache, null, 2)}\n`);
  console.log(`updated cache for ${cache.length} movies; downloaded ${downloaded} local posters`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
