const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const INSTANCE_ID = process.env.INSTANCE_ID;
const TOKEN = process.env.TOKEN;
const WHATSAPP_API = `https://api.ultramsg.com/${INSTANCE_ID}/messages/chat`;

const NOMOR_PENERIMA = "+62895328255992"; // pakai format internasional

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Server aktif!");
});

app.get("/ping", (req, res) => {
  res.send("pong dari server");
});

app.post("/infus-alert", async (req, res) => {
  console.log("Request body: ", req.body);
  const pesan = req.body.pesan || "🚨 Infus tidak menetes!";

  try {
    await axios.post(
      WHATSAPP_API,
      {
        to: NOMOR_PENERIMA,
        body: pesan,
        priority: 10,
      },
      {
        params: { token: TOKEN },
        headers: { "Content-Type": "application/json" },
      }
    );

    console.log("✅ Pesan WhatsApp terkirim.");
    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Gagal kirim WA:", err.message);
    res.sendStatus(500);
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});

