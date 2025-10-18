import express from 'express';
import * as googleTTS from 'google-tts-api';

const app = express();
app.use(express.json());

const generateAudioHandler = async (req, res) => {
  try {
    const params = { ...req.query, ...req.body };
    const text = (params.text || '').toString().trim();
    const lang = (params.lang || 'en').toString();
    const slow = (params.slow || 'false').toString().toLowerCase() === 'true';

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
};

app.get('/', (req, res) => {
  res.status(200).json({ message: 'TTS API is running. Use /api/generate endpoint.' });
});

app.route('/api/generate')
  .get(generateAudioHandler)
  .post(generateAudioHandler);

export default app;
