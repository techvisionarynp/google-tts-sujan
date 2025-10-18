import express from 'express';
import * as googleTTS from 'google-tts-api';

const app = express();

app.get('/api/generate', async (req, res) => {
  try {
    const text = (req.query.text || '').toString().trim();
    const lang = (req.query.lang || 'en').toString();
    const slow = (req.query.slow || 'false').toString().toLowerCase() === 'true';

    if (!text) {
      return res.status(400).json({ error: 'Missing required parameter: text' });
    }

    const base64Audio = await googleTTS.getAudioBase64(text, {
      lang: lang,
      slow: slow,
      host: 'https://translate.google.com',
    });
    
    const audioBuffer = Buffer.from(base64Audio, 'base64');

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      audio: base64Audio,
      contentType: 'audio/mpeg',
      bytes: audioBuffer.length,
    });
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Internal Server Error';
    res.status(500).json({ error: errorMessage });
  }
});

export default app;
