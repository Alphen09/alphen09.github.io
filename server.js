require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        app: "Alberto NFT Marketplace",
        network: "Pi Sandbox",
        status: "Backend Running"
    });
});

app.post("/approve-payment", (req, res) => {
    console.log(req.body);

    res.json({
        success: true,
        message: "Payment Approved"
    });
});

app.post("/complete-payment", (req, res) => {
    console.log(req.body);

    res.json({
        success: true,
        message: "Payment Completed"
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Backend running on port " + PORT);
});