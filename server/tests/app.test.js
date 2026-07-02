process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/app');

describe('API routes', () => {
  it('health returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('rejects missing query', async () => {
    const res = await request(app).post('/api/query').send({});
    expect(res.status).toBe(400);
  });

  it('answers a simple query', async () => {
    const res = await request(app).post('/api/query').send({ query: 'Is MSG safe for kids?', profile: { childAgeYears: 5 } });
    expect(res.status).toBe(200);
    expect(typeof res.body.answer).toBe('string');
    expect(res.body.answer.toLowerCase()).toContain('test stub');
    expect(Array.isArray(res.body.recommendations)).toBe(true);
    expect(Array.isArray(res.body.sources)).toBe(true);
  });
});
