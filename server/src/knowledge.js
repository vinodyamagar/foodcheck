const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../data/safety_knowledge.json');
let CACHE = null;

function loadKnowledge() {
  if (CACHE) return CACHE;
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  const data = JSON.parse(raw);
  CACHE = data;
  return data;
}

function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9+\- ]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function scoreEntry(queryTokens, entry) {
  const fields = [entry.title, entry.summary, ...(entry.tags || [])].join(' ');
  const tokens = new Set(tokenize(fields));
  let score = 0;
  for (const t of queryTokens) {
    if (tokens.has(t)) score += 2; // direct token overlap
  }
  // Boost for E-codes and India-specific terms in tags
  const boostTags = new Set([...(entry.tags || []).map(t => t.toLowerCase())]);
  const boosts = ['e211', 'e621', 'msg', 'fssai', 'sodium', 'sugar', 'colour', 'color', 'artificial', 'benzoate', 'tartrazine', 'e102', 'e110', 'e122', 'noodles', 'energy drinks', 'infant'];
  for (const b of boosts) {
    if (boostTags.has(b)) score += 1.5;
  }
  return score;
}

function searchKnowledge(query, opts = {}) {
  const limit = Math.max(1, Math.min(50, opts.limit || 5));
  const data = loadKnowledge();
  const qTokens = tokenize(query);
  const scored = data.map(entry => ({ entry, score: scoreEntry(qTokens, entry) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(x => x.entry);
  return scored;
}

module.exports = { loadKnowledge, searchKnowledge };
