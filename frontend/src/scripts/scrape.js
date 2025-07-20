import { authFetch } from '../auth.js';
import { saveChapterToIndexedDB } from './cache.js';

export async function scrape(ncode, chapter) {
  if (!ncode) return;
  if (!chapter) return;
  try {
    const res = await authFetch('/api/syosetu/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ncode: ncode, chapter: chapter })
    });
    if (!res.ok) {
      console.error('Failed to scrape chapter:', await res.text());
      return;
    }
    const ch = await res.json();
    if (ch.success && ch.data) {
      await saveChapterToIndexedDB(ncode, Number(ch.chapter), ch.data);
    }
  } catch (e) {scrape
    console.error('Scrape error:', e);
  }
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
        await saveChapterToIndexedDB(ncode, Number(ch.chapter), ch.data);
      }
    }
  }
  return result;
}
