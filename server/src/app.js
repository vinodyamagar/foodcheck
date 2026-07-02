const express = require('express');
const cors = require('cors');
const compression = require('compression');
const { answerQuery } = require('./recommendation');

const app = express();

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

const allowed = process.env.CORS_ORIGIN;
app.use(cors({ origin: allowed || '*' }));
app.use(compression());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/query', async (req, res) => {
  try {
    const { query, profile } = req.body || {};
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ message: 'query is required' });
    }
    const trimmed = query.trim();
    if (!trimmed) {
      return res.status(400).json({ message: 'query is empty' });
    }
    if (trimmed.length > 500) {
      return res.status(400).json({ message: 'query too long (max 500 chars)' });
    }

    const result = await answerQuery(trimmed, profile || {});
    res.json(result);
  } catch (err) {
    console.error('Error handling /api/query', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = app;

