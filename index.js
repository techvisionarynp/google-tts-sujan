import express from 'express';
import * as googleTTS from 'google-tts-api';
import fetch from 'node-fetch';

const app = express();

app.get('/', async (req, res) => {
  try {
    const text = (req.query.text || '').toString().trim();
    const lang = (req.query.lang || 'en').toString();
    const slow = (req.query.slow || 'false').toString().toLowerCase() === 'true';
    if (!text) return res.status(400).json({ error: 'Missing required parameter: text' });
    const audioSegments = googleTTS.getAllAudioUrls(text, { lang, slow, host: 'https://translate.google.com', splitPunct: ',.?!' });
    const buffers = [];
    for (const segment of audioSegments) {
      const audioRes = await fetch(segment.url);
      if (!audioRes.ok) throw new Error(`Failed to fetch audio: ${audioRes.status}`);
      const arrayBuffer = await audioRes.arrayBuffer();
      buffers.push(Buffer.from(arrayBuffer));
    }
    const combinedBuffer = Buffer.concat(buffers);
    const base64Audio = combinedBuffer.toString('base64');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ audio: base64Audio, contentType: 'audio/mpeg', bytes: combinedBuffer.length });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

export default app;