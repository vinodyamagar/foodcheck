const { searchKnowledge } = require('./knowledge');

function sanitize(text) {
  return String(text || '').replace(/[\r\n\t]+/g, ' ').trim();
}

function buildPrompt(query, facts, profile) {
  const disclaimer = 'Note: This is general information for parents in India about packaged foods. Avoid medical claims; when in doubt, consult a pediatrician or check FSSAI guidance.';
  const bullets = facts.map((f, i) => `- ${f.title}: ${f.summary}`).join('\n');
  const profileLine = profile && profile.childAgeYears != null ? `Child age: ${profile.childAgeYears} years.` : '';
  return [
    'You are a helpful assistant giving cautious, practical advice about packaged food safety in India.',
    disclaimer,
    profileLine,
    'Grounded facts:',
    bullets,
    '',
    `User question: ${query}`,
    'Write a concise answer (3-6 sentences) referencing the facts. Finish with 2-4 actionable tips for parents. Keep tone cautious and neutral. Use plain English.'
  ].filter(Boolean).join('\n');
}

function distillRecommendations(facts, profile) {
  const recs = [];
  for (const f of facts) {
    if (!f) continue;
    const r = f.recommendation;
    if (Array.isArray(r)) recs.push(...r);
    else if (r) recs.push(r);
  }
  // Simple profile-specific tweaks
  if (profile && typeof profile.childAgeYears === 'number') {
    const age = profile.childAgeYears;
    if (age < 6) {
      recs.push('Limit high-sodium and spicy snacks for young children.');
      recs.push('Avoid energy drinks for children.');
    }
  }
  // de-duplicate
  return Array.from(new Set(recs)).slice(0, 8);
}

function collectSources(facts) {
  const srcs = [];
  for (const f of facts) {
    for (const s of f.sources || []) {
      if (typeof s === 'string') srcs.push({ url: s, title: f.title });
      else if (s && s.url) srcs.push(s);
    }
  }
  // unique by url
  const seen = new Set();
  return srcs.filter(s => {
    if (seen.has(s.url)) return false;
    seen.add(s.url);
    return true;
  }).slice(0, 10);
}

async function answerQuery(rawQuery, profile = {}) {
  const query = sanitize(rawQuery).slice(0, 500);
  const facts = searchKnowledge(query, { limit: 5 });
  const prompt = buildPrompt(query, facts, profile);

  let answer;
  if (process.env.NODE_ENV === 'test') {
    answer = 'Test stub answer based on facts and prompt.';
  } else {
    try {
      const { generateAdvice } = require('./gpt');
      answer = await generateAdvice(prompt, { max_new_tokens: 120, temperature: 0.7 });
    } catch (e) {
      // graceful fallback
      const lineFacts = facts.map(f => f.title).join(', ');
      answer = `Based on available guidance (${lineFacts}), choose simpler ingredient lists, avoid artificial colours and preservatives for children, and check labels for sodium and sugar.`;
    }
  }

  const recommendations = distillRecommendations(facts, profile);
  const sources = collectSources(facts);
  return { answer, recommendations, sources };
}

module.exports = { answerQuery, buildPrompt, distillRecommendations };
