// src/store.js
let videosCache = null;

export async function obtenerVideos() {
  if (videosCache) return videosCache;
  const res = await fetch('/youtube-data.json');
  videosCache = await res.json();
  return videosCache;
}