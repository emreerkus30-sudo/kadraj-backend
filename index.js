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

    if (!process.env.HF_API_KEY) {
      return res.status(500).json({ error: "HF_API_KEY ortam değişkeni tanımlı değil." });
    }

    console.log("Hugging Face üzerinden görsel üretiliyor, prompt:", prompt);

    const modelId = "stabilityai/stable-diffusion-xl-base-1.0";
    const response = await fetch(
      `https://router.huggingface.co/hf-inference/models/${modelId}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
          "Accept": "image/png"
        },
        body: JSON.stringify({ inputs: prompt })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Hugging Face API hatası:", response.status, errorText);
      return res.status(response.status).json({
        error: "Hugging Face görsel üretimi başarısız oldu.",
        details: errorText
      });
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");
    const contentType = response.headers.get("content-type") || "image/png";
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
