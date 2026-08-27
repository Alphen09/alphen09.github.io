require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(express.json());

/* ============================================================
   DATABASE
============================================================ */

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

/* ============================================================
   PI PLATFORM API
============================================================ */

const PI_API_KEY = process.env.PI_API_KEY?.trim();

const PI_API_BASE = "https://api.minepi.com/v2";

/* ============================================================
   DATABASE INITIALIZATION
============================================================ */

async function initializeDatabase() {
  try {

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        reputation_score INTEGER NOT NULL DEFAULT 500,
        rating NUMERIC(3,2) NOT NULL DEFAULT 5.00,
        reviews INTEGER NOT NULL DEFAULT 0,
        successful_sales INTEGER NOT NULL DEFAULT 0,
        successful_purchases INTEGER NOT NULL DEFAULT 0,
        trusted BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS nfts (
        id SERIAL PRIMARY KEY,
        nft_name TEXT NOT NULL,
        description TEXT,
        collection TEXT,
        category TEXT,
        rarity TEXT,
        image TEXT,
        royalty NUMERIC DEFAULT 0,
        price NUMERIC NOT NULL DEFAULT 0,
        creator TEXT,
        owner TEXT,
        status TEXT NOT NULL DEFAULT 'listed',
        payment_id TEXT,
        txid TEXT,
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        payment_id TEXT UNIQUE NOT NULL,
        txid TEXT,
        nft_id INTEGER REFERENCES nfts(id),
        nft_name TEXT,
        buyer TEXT,
        seller TEXT,
        price NUMERIC,
        transaction_type TEXT NOT NULL DEFAULT 'PET_PURCHASE',
        status TEXT NOT NULL DEFAULT 'completed',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        reviewer TEXT NOT NULL,
        reviewed_user TEXT NOT NULL,
        transaction_id INTEGER REFERENCES transactions(id),
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (reviewer, transaction_id)
      );
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_nfts_status
      ON nfts(status);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_nfts_owner
      ON nfts(owner);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_nfts_creator
      ON nfts(creator);
    `);

    console.log("=================================");
    console.log("DATABASE INITIALIZED");
    console.log("Shared NFT system: READY");
    console.log("Reputation system: READY");
    console.log("Transaction system: READY");
    console.log("=================================");

  } catch (error) {

    console.error(
      "DATABASE INITIALIZATION ERROR:",
      error.message
    );

  }
}

/* ============================================================
   HOME
============================================================ */

app.get("/", (req, res) => {

  res.json({
    app: "Alberto NFT Marketplace",
    network: "Pi Sandbox",
    status: "Backend Running",
    systems: {
      sharedNFT: true,
      ownership: true,
      reputation: true,
      transactions: true
    }
  });

});

/* ============================================================
   PI API KEY TEST
============================================================ */

app.get("/pi-test", (req, res) => {

  res.json({
    success: true,
    piApiKeyLoaded: !!PI_API_KEY,
    network: "Pi Sandbox"
  });

});

/* ============================================================
   DATABASE TEST
============================================================ */

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

    console.error(
      "DATABASE ERROR:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Database Connection Failed",
      error: error.message
    });

  }

});

/* ============================================================
   CREATE / UPDATE USER
============================================================ */

app.post("/users/register", async (req, res) => {

  try {

    const username =
      String(req.body.username || "")
        .trim();

    if (!username) {

      return res.status(400).json({
        success: false,
        message: "Pi username is required."
      });

    }

    const result =
      await pool.query(
        `
        INSERT INTO users (username)
        VALUES ($1)
        ON CONFLICT (username)
        DO UPDATE SET updated_at = NOW()
        RETURNING *
        `,
        [username]
      );

    res.json({
      success: true,
      user: result.rows[0]
    });

  } catch (error) {

    console.error(
      "USER REGISTER ERROR:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Unable to register user."
    });

  }

});

/* ============================================================
   GET REPUTATION
============================================================ */

app.get("/reputation/:username", async (req, res) => {

  try {

    const username =
      String(req.params.username || "")
        .trim();

    const result =
      await pool.query(
        `
        SELECT
          username,
          reputation_score,
          rating,
          reviews,
          successful_sales,
          successful_purchases,
          trusted,
          created_at,
          updated_at
        FROM users
        WHERE username = $1
        `,
        [username]
      );

    if (result.rows.length === 0) {

      return res.json({
        success: true,
        reputation: {
          username,
          reputation_score: 500,
          rating: 5.00,
          reviews: 0,
          successful_sales: 0,
          successful_purchases: 0,
          trusted: false
        }
      });

    }

    res.json({
      success: true,
      reputation: result.rows[0]
    });

  } catch (error) {

    console.error(
      "REPUTATION ERROR:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Unable to load reputation."
    });

  }

});

/* ============================================================
   GET SHARED NFT MARKETPLACE
============================================================ */

app.get("/nfts", async (req, res) => {

  try {

    const result =
      await pool.query(
        `
        SELECT
          id,
          nft_name,
          description,
          collection,
          category,
          rarity,
          image,
          royalty,
          price,
          creator,
          owner,
          status,
          payment_id,
          txid,
          metadata,
          created_at,
          updated_at
        FROM nfts
        WHERE status = 'listed'
        ORDER BY created_at DESC
        `
      );

    res.json({
      success: true,
      count: result.rows.length,
      nfts: result.rows
    });

  } catch (error) {

    console.error(
      "GET NFT ERROR:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Unable to load marketplace NFTs."
    });

  }

});

/* ============================================================
   GET ALL NFTS
============================================================ */

app.get("/nfts/all", async (req, res) => {

  try {

    const result =
      await pool.query(
        `
        SELECT *
        FROM nfts
        ORDER BY created_at DESC
        `
      );

    res.json({
      success: true,
      count: result.rows.length,
      nfts: result.rows
    });

  } catch (error) {

    console.error(
      "GET ALL NFT ERROR:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Unable to load NFTs."
    });

  }

});

/* ============================================================
   GET USER OWNED PETS
============================================================ */

app.get("/users/:username/pets", async (req, res) => {

  try {

    const username =
      String(req.params.username || "")
        .trim();

    const result =
      await pool.query(
        `
        SELECT *
        FROM nfts
        WHERE owner = $1
        ORDER BY created_at DESC
        `,
        [username]
      );

    res.json({
      success: true,
      username,
      count: result.rows.length,
      pets: result.rows
    });

  } catch (error) {

    console.error(
      "GET USER PETS ERROR:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Unable to load owned pets."
    });

  }

});

/* ============================================================
   MINT NFT
============================================================ */

app.post("/mint", async (req, res) => {

  try {

    const {
      nftName,
      description,
      collection,
      category,
      rarity,
      image,
      royalty,
      price,
      creator
    } = req.body;

    if (!nftName) {

      return res.status(400).json({
        success: false,
        message: "NFT name is required."
      });

    }

    const safeCreator =
      String(creator || "")
        .trim();

    if (!safeCreator) {

      return res.status(400).json({
        success: false,
        message: "Creator Pi username is required."
      });

    }

    await pool.query(
      `
      INSERT INTO users (username)
      VALUES ($1)
      ON CONFLICT (username)
      DO UPDATE SET updated_at = NOW()
      `,
      [safeCreator]
    );

    const result =
      await pool.query(
        `
        INSERT INTO nfts (
          nft_name,
          description,
          collection,
          category,
          rarity,
          image,
          royalty,
          price,
          creator,
          owner,
          status
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          $9,
          'listed'
        )
        RETURNING *
        `,
        [
          nftName,
          description || "",
          collection || "Alberto Pets",
          category || "pet",
          rarity || "Common",
          image || "",
          Number(royalty || 0),
          Number(price || 0),
          safeCreator
        ]
      );

    console.log(
      "NFT MINTED AND SAVED:",
      result.rows[0]
    );

    res.json({
      success: true,
      message: "NFT Minted and Added to Shared Marketplace!",
      nft: result.rows[0]
    });

  } catch (error) {

    console.error(
      "NFT MINT ERROR:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "NFT mint failed.",
      error: error.message
    });

  }

});

/* ============================================================
   APPROVE PI PAYMENT
============================================================ */

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

      console.error(
        "PI_API_KEY is missing."
      );

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

    const response =
      await axios.post(
        `${PI_API_BASE}/payments/${encodeURIComponent(paymentId)}/approve`,
        null,
        {
          headers: {
            Authorization:
              `Key ${PI_API_KEY}`
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
      error.response?.data ||
      error.message
    );

    return res.status(
      error.response?.status || 500
    ).json({
      success: false,
      message: "Pi payment approval failed.",
      error:
        error.response?.data ||
        error.message
    });

  }

});

/* ============================================================
   COMPLETE PI PAYMENT + SHARED OWNERSHIP
============================================================ */

app.post("/complete-payment", async (req, res) => {

  const client =
    await pool.connect();

  try {

    const {
      paymentId,
      txid,
      nftName,
      buyer,
      price,
      petData
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

    if (!buyer) {

      return res.status(400).json({
        success: false,
        message: "Buyer username is required."
      });

    }

    if (!PI_API_KEY) {

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
    console.log("Buyer:", buyer);
    console.log("Price:", price || "N/A");
    console.log("=================================");

    /*
      First verify completion with Pi.
    */

    const response =
      await axios.post(
        `${PI_API_BASE}/payments/${encodeURIComponent(paymentId)}/complete`,
        {
          txid
        },
        {
          headers: {
            Authorization:
              `Key ${PI_API_KEY}`,
            "Content-Type":
              "application/json"
          },
          timeout: 15000
        }
      );

    console.log(
      "PI COMPLETION RESPONSE:",
      response.data
    );

    /*
      Only after Pi confirms completion
      do we update shared ownership.
    */

    await client.query("BEGIN");

    await client.query(
      `
      INSERT INTO users (username)
      VALUES ($1)
      ON CONFLICT (username)
      DO UPDATE SET updated_at = NOW()
      `,
      [buyer]
    );

    /*
      Try to find an existing listed NFT.
      This allows the shared marketplace listing
      to become owned by the buyer.
    */

    let nftResult =
      await client.query(
        `
        SELECT *
        FROM nfts
        WHERE nft_name = $1
          AND status = 'listed'
        ORDER BY created_at ASC
        LIMIT 1
        FOR UPDATE
        `,
        [nftName]
      );

    let nft;

    if (nftResult.rows.length > 0) {

      nft = nftResult.rows[0];

      await client.query(
        `
        UPDATE nfts
        SET
          owner = $1,
          status = 'owned',
          payment_id = $2,
          txid = $3,
          updated_at = NOW()
        WHERE id = $4
        `,
        [
          buyer,
          paymentId,
          txid,
          nft.id
        ]
      );

    } else {

      /*
        If the NFT was not created through /mint,
        create a shared ownership record from
        the supplied pet data.
      */

      const pet =
        petData || {};

      const created =
        await client.query(
          `
          INSERT INTO nfts (
            nft_name,
            description,
            collection,
            category,
            rarity,
            image,
            royalty,
            price,
            creator,
            owner,
            status,
            payment_id,
            txid,
            metadata
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9,
            $10,
            'owned',
            $11,
            $12,
            $13
          )
          RETURNING *
          `,
          [
            nftName,
            "",
            "Alberto Pets",
            "pet",
            pet.rarity || "",
            pet.image || "",
            0,
            Number(price || 0),
            pet.creator || "Alberto",
            buyer,
            paymentId,
            txid,
            JSON.stringify(pet)
          ]
        );

      nft = created.rows[0];

    }

    /*
      Prevent duplicate transaction records.
    */

    const transactionResult =
      await client.query(
        `
        INSERT INTO transactions (
          payment_id,
          txid,
          nft_id,
          nft_name,
          buyer,
          seller,
          price,
          transaction_type,
          status
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          'PET_PURCHASE',
          'completed'
        )
        ON CONFLICT (payment_id)
        DO UPDATE SET
          txid = EXCLUDED.txid,
          status = 'completed'
        RETURNING *
        `,
        [
          paymentId,
          txid,
          nft.id,
          nftName,
          buyer,
          nft.creator || null,
          Number(price || 0)
        ]
      );

    /*
      Update buyer reputation.
    */

    await client.query(
      `
      INSERT INTO users (username)
      VALUES ($1)
      ON CONFLICT (username)
      DO NOTHING
      `,
      [buyer]
    );

    await client.query(
      `
      UPDATE users
      SET
        successful_purchases =
          successful_purchases + 1,
        reputation_score =
          LEAST(1000, reputation_score + 5),
        updated_at = NOW()
      WHERE username = $1
      `,
      [buyer]
    );

    /*
      Update seller reputation if known.
    */

    if (nft.creator) {

      await client.query(
        `
        INSERT INTO users (username)
        VALUES ($1)
        ON CONFLICT (username)
        DO NOTHING
        `,
        [nft.creator]
      );

      await client.query(
        `
        UPDATE users
        SET
          successful_sales =
            successful_sales + 1,
          reputation_score =
            LEAST(1000, reputation_score + 10),
          updated_at = NOW()
        WHERE username = $1
        `,
        [nft.creator]
      );

    }

    await client.query("COMMIT");

    return res.json({
      success: true,
      status: "completed",
      payment: response.data,
      nft: {
        id: nft.id,
        name: nftName,
        owner: buyer,
        status: "owned"
      },
      transaction:
        transactionResult.rows[0]
    });

  } catch (error) {

    try {
      await client.query("ROLLBACK");
    } catch (_) {}

    console.error(
      "PI COMPLETION ERROR:",
      error.response?.data ||
      error.message
    );

    return res.status(
      error.response?.status || 500
    ).json({
      success: false,
      message: "Pi payment completion failed.",
      error:
        error.response?.data ||
        error.message
    });

  } finally {

    client.release();

  }

});

/* ============================================================
   SUBMIT REPUTATION REVIEW
============================================================ */

app.post("/reputation/review", async (req, res) => {

  const client =
    await pool.connect();

  try {

    const {
      reviewer,
      reviewedUser,
      paymentId,
      rating,
      comment
    } = req.body;

    if (!reviewer || !reviewedUser) {

      return res.status(400).json({
        success: false,
        message:
          "Reviewer and reviewed user are required."
      });

    }

    const safeRating =
      Number(rating);

    if (
      !Number.isInteger(safeRating) ||
      safeRating < 1 ||
      safeRating > 5
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Rating must be between 1 and 5."
      });

    }

    if (!paymentId) {

      return res.status(400).json({
        success: false,
        message:
          "Transaction payment ID is required."
      });

    }

    await client.query("BEGIN");

    const transaction =
      await client.query(
        `
        SELECT *
        FROM transactions
        WHERE payment_id = $1
          AND status = 'completed'
        LIMIT 1
        `,
        [paymentId]
      );

    if (transaction.rows.length === 0) {

      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message:
          "Completed transaction not found."
      });

    }

    const tx =
      transaction.rows[0];

    if (
      tx.buyer !== reviewer &&
      tx.seller !== reviewer
    ) {

      await client.query("ROLLBACK");

      return res.status(403).json({
        success: false,
        message:
          "Only a participant in the transaction can leave a review."
      });

    }

    const review =
      await client.query(
        `
        INSERT INTO reviews (
          reviewer,
          reviewed_user,
          transaction_id,
          rating,
          comment
        )
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (reviewer, transaction_id)
        DO NOTHING
        RETURNING *
        `,
        [
          reviewer,
          reviewedUser,
          tx.id,
          safeRating,
          String(comment || "").trim()
        ]
      );

    if (review.rows.length === 0) {

      await client.query("ROLLBACK");

      return res.status(409).json({
        success: false,
        message:
          "You already reviewed this transaction."
      });

    }

    /*
      Recalculate reputation rating.
    */

    const stats =
      await client.query(
        `
        SELECT
          AVG(rating)::numeric(3,2) AS average_rating,
          COUNT(*) AS review_count
        FROM reviews
        WHERE reviewed_user = $1
        `,
        [reviewedUser]
      );

    const average =
      Number(
        stats.rows[0].average_rating || 5
      );

    const reviewCount =
      Number(
        stats.rows[0].review_count || 0
      );

    /*
      Score:
      500 base
      + rating contribution
      + transaction success contribution
      capped between 0 and 1000.
    */

    const userResult =
      await client.query(
        `
        SELECT
          successful_sales,
          successful_purchases
        FROM users
        WHERE username = $1
        `,
        [reviewedUser]
      );

    const user =
      userResult.rows[0] || {
        successful_sales: 0,
        successful_purchases: 0
      };

    const successfulTransactions =
      Number(user.successful_sales || 0) +
      Number(user.successful_purchases || 0);

    const score =
      Math.max(
        0,
        Math.min(
          1000,
          Math.round(
            400 +
            average * 80 +
            Math.min(
              successfulTransactions * 5,
              200
            )
          )
        )
      );

    const trusted =
      score >= 800 &&
      reviewCount >= 5;

    await client.query(
      `
      INSERT INTO users (username)
      VALUES ($1)
      ON CONFLICT (username)
      DO NOTHING
      `,
      [reviewedUser]
    );

    await client.query(
      `
      UPDATE users
      SET
        reputation_score = $1,
        rating = $2,
        reviews = $3,
        trusted = $4,
        updated_at = NOW()
      WHERE username = $5
      `,
      [
        score,
        average,
        reviewCount,
        trusted,
        reviewedUser
      ]
    );

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "Reputation review submitted.",
      reputation: {
        username: reviewedUser,
        reputation_score: score,
        rating: average,
        reviews: reviewCount,
        trusted
      }
    });

  } catch (error) {

    try {
      await client.query("ROLLBACK");
    } catch (_) {}

    console.error(
      "REPUTATION REVIEW ERROR:",
      error.message
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to submit reputation review."
    });

  } finally {

    client.release();

  }

});

/* ============================================================
   404 HANDLER
============================================================ */

app.use((req, res) => {

  res.status(404).json({
    success: false,
    message: "Backend route not found.",
    path: req.originalUrl
  });

});

/* ============================================================
   SERVER
============================================================ */

const PORT =
  process.env.PORT || 3000;

initializeDatabase()
  .finally(() => {

    app.listen(
      PORT,
      () => {

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

        console.log(
          "DATABASE_URL loaded:",
          !!process.env.DATABASE_URL
        );

      }
    );

  });