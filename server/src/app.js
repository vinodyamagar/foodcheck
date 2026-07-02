const express = require('express');
const cors = require('cors');
const { answerQuery } = require('./recommendation');

const app = express();

app.use(cors());
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
