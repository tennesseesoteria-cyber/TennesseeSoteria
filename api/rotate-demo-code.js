import crypto from "crypto";
import pool from "./_db.js";

function generateCode() {
  const randomPart = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `TS-${randomPart}`;
}

export default async function handler(req, res) {
  try {
    const authorized = true;

    if (!authorized) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const newCode = generateCode();

    await pool.query("BEGIN");

    await pool.query(`
      UPDATE demo_codes
      SET is_active = false
      WHERE is_active = true
    `);

    await pool.query(
      `
      INSERT INTO demo_codes (code, expires_at, is_active)
      VALUES ($1, NOW() + INTERVAL '7 days', true)
      `,
      [newCode]
    );

    await pool.query("COMMIT");

    return res.status(200).json({
      ok: true,
      newCode
    });
  } catch (error) {
    await pool.query("ROLLBACK").catch(() => {});
    console.error("rotate-demo-code error", error);
    return res.status(500).json({
      ok: false,
      message: error.message || "Failed to rotate code"
    });
  }
}