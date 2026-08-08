require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

/* =========================
   PI API
========================= */

const PI_API_KEY = process.env.PI_API_KEY;

const PI_API_BASE =
  "https://api.testnet.minepi.com";

/* =========================
   HOME
========================= */

app.get("/", (req, res) => {

  res.json({
    app: "Alberto NFT Marketplace",
    network: "Pi Sandbox",
    status: "Backend Running"
  });

});

/* =========================
   DATABASE TEST
========================= */

app.get("/database-test", async (req, res) => {

  try {

    const result =
      await pool.query("SELECT NOW()");

    res.json({
      success: true,
      message: "Database Connected",
      serverTime: result.rows[0].now
    });

  } catch (error) {

    console.error("DATABASE ERROR:", error);

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

});
/* =========================
   APPROVE PI PAYMENT
========================= */

app.post("/approve-payment", async (req, res) => {

  try {

    const {
      paymentId,
      nftName,
      buyer,
      price
    } = req.body;

    if (!paymentId) {

      return res.status(400).json({
        success: false,
        message: "Payment ID is required."
      });

    }

    if (!PI_API_KEY) {

      return res.status(500).json({
        success: false,
        message: "PI_API_KEY is missing."
      });

    }

    console.log("APPROVE PAYMENT:", paymentId);
    console.log("NFT:", nftName);
    console.log("Buyer:", buyer);
    console.log("Price:", price);

    const response = await axios.post(
      `${PI_API_BASE}/payments/${paymentId}/approve`,
      {},
      {
        headers: {
          Authorization: `Key ${PI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log(
      "PI APPROVAL RESPONSE:",
      response.data
    );

    res.json({
      success: true,
      status: "approved",
      payment: response.data
    });

  } catch (error) {

    console.error(
      "PI APPROVAL ERROR:",
      error.response?.data ||
      error.message
    );

    res.status(
      error.response?.status || 500
    ).json({

      success: false,

      message:
        "Pi payment approval failed.",

      error:
        error.response?.data ||
        error.message

    });

  }

});
/* =========================
   COMPLETE PI PAYMENT
========================= */

app.post("/complete-payment", async (req, res) => {

  try {

    const {
      paymentId,
      txid,
      nftName,
      buyer,
      price
    } = req.body;

    if (!paymentId || !txid) {

      return res.status(400).json({
        success: false,
        message: "Payment ID and transaction ID are required."
      });

    }

    if (!PI_API_KEY) {

      return res.status(500).json({
        success: false,
        message: "PI_API_KEY is missing."
      });

    }

    console.log("COMPLETE PAYMENT:", paymentId);
    console.log("TXID:", txid);
    console.log("NFT:", nftName);
    console.log("Buyer:", buyer);
    console.log("Price:", price);

    const response = await axios.post(
      `${PI_API_BASE}/payments/${paymentId}/complete`,
      {
        txid: txid
      },
      {
        headers: {
          Authorization: `Key ${PI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log(
      "PI COMPLETION RESPONSE:",
      response.data
    );

    res.json({
      success: true,
      status: "completed",
      payment: response.data
    });

  } catch (error) {

    console.error(
      "PI COMPLETION ERROR:",
      error.response?.data ||
      error.message
    );

    res.status(
      error.response?.status || 500
    ).json({

      success: false,

      message:
        "Pi payment completion failed.",

      error:
        error.response?.data ||
        error.message

    });

  }

});


/* =========================
   NFT MINT
========================= */

app.post("/mint", (req, res) => {

  const {
    nftName,
    description,
    collection,
    category,
    royalty,
    price
  } = req.body;

  console.log(
    "NFT Minted:",
    nftName
  );

  res.json({

    success: true,

    message:
      "NFT Minted Successfully!",

    nft: {
      nftName,
      description,
      collection,
      category,
      royalty,
      price
    }

  });

});


/* =========================
   START SERVER
========================= */

const PORT =
  process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(
    "Backend running on port " + PORT
  );

});