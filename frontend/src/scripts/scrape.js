import { authFetch } from '../auth.js';

export async function scrape(ncode, chapter) {
  if (!ncode) return;
  if (!chapter) return;
  try {
    await authFetch('/api/syosetu/scrape', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ncode: ncode, count: chapter })
    });
  } catch (e) {
    // ignore errors for individual chapters
  }
}
export async function scrapeAhead({ ncode, start, end }) {
  await authFetch('/api/syosetu/scrapeahead', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ncode, start, end })
  });
}
