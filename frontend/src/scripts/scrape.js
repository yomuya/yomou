import { authFetch } from '../auth.js';
import { saveToIndexedDB } from './cache.js';

export async function scrape(ncode, chapter) {
  if (!ncode) return;
  if (!chapter) return;
  const res = await authFetch(`/api/syosetu/scrape`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ncode, chapter })
  });
  if (!res.ok) {
    console.error('Failed to scrape chapter:', await res.text());
    return;
  }
  const ch = await res.json();
  if (ch && ch.ncode && ch.chapterNum) {
    await saveToIndexedDB('chapters', { ncode, chapterNum: Number(ch.chapterNum), ...ch });
    return ch;
  }
  return ch;
}

export async function scrapeAhead({ ncode, start, end }) {
  const res = await authFetch(`/api/syosetu/scrapeahead`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ncode, start, end })
  });
  if (!res.ok) {
    throw new Error('Failed to scrape chapters');
  }
  const result = await res.json();
  if (result.success && Array.isArray(result.results)) {
    for (const ch of result.results) {
      if (ch.success && ch.data) {
        await saveToIndexedDB('chapters', { ncode, chapterNum: Number(ch.chapterNum), ...ch });
      }
    }
  }
  return result;
}


