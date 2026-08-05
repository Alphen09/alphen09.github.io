require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// HOME
app.get("/", (req, res) => {
  res.json({ app: "Alberto NFT Marketplace", network: "Pi Sandbox", status: "Backend Running" });
});

// DATABASE TEST
app.get("/database-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ success: true, message: "Database Connected", serverTime: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// APPROVE PAYMENT
app.post('/approve', async (req, res) => {
  const { paymentId } = req.body;
  console.log("APPROVED:", paymentId);
  res.status(200).json({ status: 'approved' });
});

// COMPLETE PAYMENT
app.post("/complete", async (req, res) => {
  const { paymentId, txid } = req.body;
  console.log("COMPLETED:", paymentId, txid);
  res.status(200).json({ status: 'completed' });
});

// MINT NFT
app.post("/mint", (req, res) => {
  const { nftName, description, collection, category, royalty, price } = req.body;
  console.log("New NFT Minted:", nftName);
  res.json({ success: true, message: "NFT Minted Successfully!", nft: { nftName, description, collection, category, royalty, price } });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Backend running on port " + PORT);
});