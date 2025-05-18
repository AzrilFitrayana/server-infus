const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const fs = require("fs");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Ambil jadwal dan substitusi nomor dari environment
const jadwal = JSON.parse(fs.readFileSync("jadwal.json", "utf-8"));
const jadwalDenganNomor = jadwal.map(item => ({
  ...item,
  nomor: process.env[item.nomor_env] || null
}));

const INSTANCE_ID = process.env.INSTANCE_ID;
const TOKEN = process.env.TOKEN;
const WHATSAPP_API = `https://api.ultramsg.com/${INSTANCE_ID}/messages/chat`;

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Server aktif!");
});

app.get("/ping", (req, res) => {
  res.send("pong dari server");
});

// Endpoint untuk kirim pesan ke semua nomor dalam jadwal
app.post("/infus-alert", async (req, res) => {
  const pesan = req.body.pesan || "🚨 Infus tidak menetes!";
  let statusLog = [];

  for (const orang of jadwalDenganNomor) {
    if (!orang.nomor) {
      statusLog.push(`❌ Nomor untuk ${orang.nama} tidak ditemukan.`);
      continue;
    }

    try {
      await axios.post(
        WHATSAPP_API,
        {
          to: orang.nomor,
          body: pesan,
          priority: 10,
        },
        {
          params: { token: TOKEN },
          headers: { "Content-Type": "application/json" },
        }
      );
      statusLog.push(`✅ Pesan terkirim ke ${orang.nama}`);
    } catch (err) {
      statusLog.push(`❌ Gagal kirim ke ${orang.nama}: ${err.message}`);
    }
  }

  res.status(200).json({ status: statusLog });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
