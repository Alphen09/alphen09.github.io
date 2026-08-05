require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// ==============================
// HOME
// ==============================

app.get("/", (req, res) => {
    res.json({
        app: "Alberto NFT Marketplace",
        network: "Pi Sandbox",
        status: "Backend Running"
    });
});

// ==============================
// DATABASE TEST
// ==============================

app.get("/database-test", async (req, res) => {

    try {

        const result = await pool.query("SELECT NOW()");

        res.json({
            success: true,
            message: "Database Connected",
            serverTime: result.rows[0].now
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Database Connection Failed",
            error: error.message
        });

    }

});

// ==============================
// APPROVE PAYMENT
// ==============================

app.post("/approve-payment", async (req, res) => {

    try {

        const { paymentId } = req.body;

        const response = await axios.post(
            `https://api.minepi.com/v2/payments/${paymentId}/approve`,
            {},
            {
                headers: {
                    Authorization: `Key ${process.env.PI_API_KEY}`
                }
            }
        );

        res.json(response.data);

    } catch (error) {

        console.error(error.response?.data || error.message);

        res.status(500).json({
            success: false,
            error: error.response?.data || error.message
        });

    }

});

// ==============================
// COMPLETE PAYMENT
// ==============================

app.post("/complete-payment", (req, res) => {

    console.log(req.body);

    res.json({
        success: true,
        message: "Payment Completed"
    });

});

// ==============================
// MINT NFT
// ==============================

app.post("/mint", (req, res) => {

    const {
        nftName,
        description,
        collection,
        category,
        royalty,
        price
    } = req.body;

    console.log("New NFT Minted");

    console.log({
        nftName,
        description,
        collection,
        category,
        royalty,
        price
    });

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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Backend running on port " + PORT);
});