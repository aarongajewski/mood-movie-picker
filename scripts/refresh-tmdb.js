#!/usr/bin/env node

const fs = require("node:fs/promises");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const moviesPath = path.join(root, "data", "movies.json");
const cachePath = path.join(root, "data", "tmdb-cache.json");
const posterDir = path.join(root, "data", "posters");
const envPath = path.join(root, ".env");

async function loadEnv() {
  try {
    const env = await fs.readFile(envPath, "utf8");
    for (const line of env.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+?)\s*$/);
      if (!match || process.env[match[1]]) continue;
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

function token() {
  return process.env.TMDB_TOKEN || process.env.TMDB_API_READ_ACCESS_TOKEN;
}

function remotePosterUrl(posterPath) {
  return posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : null;
}

async function writeLocalPoster(tmdbId, posterPath) {
  const remoteUrl = remotePosterUrl(posterPath);
  if (!remoteUrl) return null;

  await fs.mkdir(posterDir, { recursive: true });
  const filename = `${tmdbId}.jpg`;
  const filePath = path.join(posterDir, filename);

  try {
    const response = await fetch(remoteUrl);
    if (!response.ok) {
      throw new Error(`Poster ${response.status}`);
    }

    await fs.writeFile(filePath, Buffer.from(await response.arrayBuffer()));
    return `data/posters/${filename}`;
  } catch (error) {
    console.warn(`Poster download failed for ${tmdbId}: ${error.message}`);
    return null;
  }
}

async function fetchMovie(movie) {
  const response = await fetch(`https://api.themoviedb.org/3/movie/${movie.tmdbId}?language=en-US`, {
    headers: {
      accept: "application/json",
      authorization: `Bearer ${token()}`,
    },
  });

  if (!response.ok) {
    throw new Error(`TMDb ${response.status} for ${movie.title} (${movie.tmdbId})`);
  }

  const data = await response.json();
  const posterPath = data.poster_path || null;
  const remoteUrl = remotePosterUrl(posterPath);
  const localPosterUrl = await writeLocalPoster(movie.tmdbId, posterPath);

  return {
    tmdbId: movie.tmdbId,
    posterPath,
    posterUrl: localPosterUrl || remoteUrl,
    remotePosterUrl: remoteUrl,
    releaseDate: data.release_date || null,
    runtime: data.runtime || null,
    voteAverage: typeof data.vote_average === "number" ? Number(data.vote_average.toFixed(1)) : null,
    overview: data.overview || null,
  };
}

async function main() {
  await loadEnv();
  if (!token()) {
    throw new Error("Missing TMDB_TOKEN in environment or .env");
  }

  const movies = JSON.parse(await fs.readFile(moviesPath, "utf8"));
  const cache = [];
  for (const movie of movies) {
    cache.push(await fetchMovie(movie));
    console.log(`cached ${movie.title}`);
  }

  await fs.writeFile(cachePath, `${JSON.stringify(cache, null, 2)}\n`);
  console.log(`wrote ${path.relative(root, cachePath)}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
