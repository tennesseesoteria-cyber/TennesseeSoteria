import pool from "./_db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { code } = req.body || {};

    if (!code || !code.trim()) {
      return res.status(400).json({ message: "Enter an access code." });
    }

    const result = await pool.query(
      `
      SELECT code, expires_at
      FROM demo_codes
      WHERE code = $1
        AND is_active = true
      LIMIT 1
      `,
      [code.trim()]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ message: "Invalid code." });
    }

    const row = result.rows[0];
    const expiresAt = new Date(row.expires_at).getTime();

    if (Date.now() > expiresAt) {
      return res.status(401).json({ message: "This code has expired." });
    }

    res.setHeader("Set-Cookie", [
      `demo_code_ok=true; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=1800`,
      `demo_code_value=${encodeURIComponent(row.code)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=1800`
    ]);

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("validate-code error", error);
    return res.status(500).json({ message: "Server error validating code." });
  }
}