import fs from 'fs/promises';
import path from 'path';
const { saveToIndexedDB } = await import('./cache.js');

const importers = {
  json: importJson,
  // epub: importEpub, // Placeholder for future epub support
};

async function importJson(fileOrPath, fromBrowser = false) {
  let data;
  if (fromBrowser) {
    data = JSON.parse(fileOrPath);
  } else {
    const content = await fs.readFile(fileOrPath, 'utf8');
    data = JSON.parse(content);
  }

  const { saveToIndexedDB } = await import('./cache.js');

  if (Array.isArray(data)) {
    if (data.length && data[0].allcount !== undefined) {
      console.log('Detected metadata list');
      for (const entry of data.slice(1)) {
        console.log(`Imported Title: ${entry.title}, ncode: ${entry.ncode}`);
        await saveToIndexedDB('NovelData', entry);
      }
    } else if (data.length && data[0].chapter !== undefined) {
      console.log('Detected chapter range');
      for (const ch of data) {
        if (ch.success && ch.data) {
          await saveToIndexedDB('chapters', { ...ch.data });
        }
      }
      console.log(`Imported ${data.length} chapters`);
    } else {
      console.log('Unknown array structure');
    }
  } else if (data.ncode && data.chapterNum) {
    console.log(`Single chapter: ${data.title} (${data.ncode} #${data.chapterNum})`);
    await saveToIndexedDB('chapters', { ...data });
  } else if (
    data.ncode &&
    data.title &&
    data.author &&
    typeof data.total_chapters !== 'undefined'
  ) {
    // Accepts your specified API value format
    console.log(`NovelData: ${data.title} (${data.ncode})`);
    await saveToIndexedDB('NovelData', { ...data });
  } else {
    console.log('Unknown JSON structure');
  }
}

export async function importFile(fileOrPath, fromBrowser = false) {
  const ext = (typeof fileOrPath === 'string' && !fromBrowser ? fileOrPath : 'file.json').split('.').pop().toLowerCase();
  const importer = importers[ext];
  if (!importer) {
    throw new Error(`No importer for extension: ${ext}`);
  }
  await importer(fileOrPath, fromBrowser);
}

