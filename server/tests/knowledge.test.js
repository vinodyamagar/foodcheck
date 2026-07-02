const path = require('path');
const { loadKnowledge, searchKnowledge } = require('../src/knowledge');

describe('knowledge search', () => {
  test('returns results for E211 query', () => {
    const results = searchKnowledge('sodium benzoate E211 in drinks', { limit: 5 });
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    const first = results[0];
    expect(JSON.stringify(first).toLowerCase()).toMatch(/e211|benzoate/);
  });

  test('respects limit parameter', () => {
    const results = searchKnowledge('sugar sodium colours', { limit: 3 });
    expect(results.length).toBeLessThanOrEqual(3);
  });
});
