require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   DATABASE
========================= */

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

/* =========================
   PI PLATFORM API
========================= */

const PI_API_KEY = process.env.PI_API_KEY?.trim();

const PI_API_BASE = "https://api.minepi.com/v2";

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
   PI API KEY TEST
========================= */

app.get("/pi-test", (req, res) => {
  res.json({
    success: true,
    piApiKeyLoaded: !!PI_API_KEY,
    network: "Pi Sandbox"
  });
});

/* =========================
   DATABASE TEST
========================= */

app.get("/database-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      success: true,
      message: "Database Connected",
      serverTime: result.rows[0].now
    });

  } catch (error) {
    console.error("DATABASE ERROR:", error.message);

    res.status(500).json({
      success: false,
      message: "Database Connection Failed",
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
      console.error("PI_API_KEY is missing.");

      return res.status(500).json({
        success: false,
        message: "PI_API_KEY is missing."
      });
    }

    console.log("=================================");
    console.log("PI PAYMENT APPROVAL");
    console.log("Payment ID:", paymentId);
    console.log("NFT:", nftName || "N/A");
    console.log("Buyer:", buyer || "N/A");
    console.log("Price:", price || "N/A");
    console.log("=================================");

    /*
      IMPORTANT:
      Payment ID belongs in the URL.

      POST:
      https://api.minepi.com/v2/payments/{paymentId}/approve
    */

    const response = await axios.post(
      `${PI_API_BASE}/payments/${encodeURIComponent(paymentId)}/approve`,
      null,
      {
        headers: {
          Authorization: `Key ${PI_API_KEY}`
        },
        timeout: 15000
      }
    );

    console.log(
      "PI APPROVAL RESPONSE:",
      response.data
    );

    return res.json({
      success: true,
      status: "approved",
      payment: response.data
    });

  } catch (error) {
    console.error(
      "PI APPROVAL ERROR:",
      error.response?.data || error.message
    );

    return res.status(
      error.response?.status || 500
    ).json({
      success: false,
      message: "Pi payment approval failed.",
      error: error.response?.data || error.message
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

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: "Payment ID is required."
      });
    }

    if (!txid) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID is required."
      });
    }

    if (!PI_API_KEY) {
      console.error("PI_API_KEY is missing.");

      return res.status(500).json({
        success: false,
        message: "PI_API_KEY is missing."
      });
    }

    console.log("=================================");
    console.log("PI PAYMENT COMPLETION");
    console.log("Payment ID:", paymentId);
    console.log("TXID:", txid);
    console.log("NFT:", nftName || "N/A");
    console.log("Buyer:", buyer || "N/A");
    console.log("Price:", price || "N/A");
    console.log("=================================");

    /*
      IMPORTANT:
      Payment ID belongs in the URL.
      TXID belongs in the request body.

      POST:
      https://api.minepi.com/v2/payments/{paymentId}/complete
    */

    const response = await axios.post(
      `${PI_API_BASE}/payments/${encodeURIComponent(paymentId)}/complete`,
      {
        txid: txid
      },
      {
        headers: {
          Authorization: `Key ${PI_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 15000
      }
    );

    console.log(
      "PI COMPLETION RESPONSE:",
      response.data
    );

    /*
      IMPORTANT:
      Only return success after Pi API
      actually confirms completion.
    */

    return res.json({
      success: true,
      status: "completed",
      payment: response.data
    });

  } catch (error) {
    console.error(
      "PI COMPLETION ERROR:",
      error.response?.data || error.message
    );

    return res.status(
      error.response?.status || 500
    ).json({
      success: false,
      message: "Pi payment completion failed.",
      error: error.response?.data || error.message
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

  console.log("NFT MINT:", nftName);

  res.json({
    success: true,
    message: "NFT Minted Successfully!",
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
   404 HANDLER
========================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Backend route not found.",
    path: req.originalUrl
  });
});

/* =========================
   SERVER
========================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `Alberto NFT Backend running on port ${PORT}`
  );

  console.log(
    "Pi API:",
    PI_API_BASE
  );

  console.log(
    "PI_API_KEY loaded:",
    !!PI_API_KEY
  );
});