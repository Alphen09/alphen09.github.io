app.get("/database-test", async (req, res) => {
  try {
    console.log("DATABASE TEST START");
    console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);

    const result = await pool.query("SELECT NOW()");

    console.log("DATABASE TEST SUCCESS");

    res.json({
      success: true,
      message: "Database Connected",
      serverTime: result.rows[0].now
    });

  } catch (error) {
    console.error("DATABASE TEST FAILED");
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
      errorType: error?.name || "UnknownError",
      errorCode: error?.code || "NO_CODE",
      errorMessage: error?.message || "No error message returned"
    });
  }
});