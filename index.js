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

    console.log("Örnek görsel hazırlanıyor, prompt:", prompt);

    // Geçici test amaçlı örnek görsel URL'si (yerine kendi görsel URL'ni yazabilirsin)
    const imageUrl = "https://picsum.photos/1024/1024";

    res.json({ imageUrl, prompt });
  } catch (error) {
    console.error("Hata oluştu:", error);
    res.status(500).json({ error: "Görsel üretilirken bir hata oluştu." });
  }
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});