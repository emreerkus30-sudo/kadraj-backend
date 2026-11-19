require('dotenv').config();
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Tarayıcıdan gelen istekler için CORS izni
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.post('/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Lütfen bir prompt (açıklama) girin." });
    }

    console.log("Görsel üretiliyor, prompt:", prompt);

    const encodedPrompt = encodeURIComponent(prompt);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true`;

    const response = await fetch(pollinationsUrl);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Görsel servisi hatası:", response.status, errorText);
      return res.status(response.status).json({
        error: "Görsel üretimi başarısız oldu.",
        details: errorText
      });
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");
    const contentType = response.headers.get("content-type") || "image/jpeg";
    const imageUrl = `data:${contentType};base64,${base64Image}`;

    res.json({ imageUrl, prompt });
  } catch (error) {
    console.error("Hata oluştu:", error);
    res.status(500).json({ error: "Görsel üretilirken bir hata oluştu." });
  }
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
