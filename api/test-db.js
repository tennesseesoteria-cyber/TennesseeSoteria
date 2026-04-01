import pool from "./_db.js";

export default async function handler(req, res) {
  try {
    const result = await pool.query("SELECT NOW() AS current_time");
    return res.status(200).json({
      ok: true,
      time: result.rows[0].current_time
    });
  } catch (error) {
    console.error("test-db error", error);
    return res.status(500).json({
      ok: false,
      message: error.message,
      stack: error.stack
    });
  }
}