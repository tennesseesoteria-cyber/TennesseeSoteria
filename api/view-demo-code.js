import pool from "./_db.js";

export default async function handler(req, res) {
  try {
    const secret = req.query.secret;

    if (secret !== process.env.VIEW_CODE_SECRET) {
      return res.status(401).send("Unauthorized");
    }

    const result = await pool.query(`
      SELECT code, expires_at, created_at
      FROM demo_codes
      WHERE is_active = true
      ORDER BY created_at DESC
      LIMIT 1
    `);

    if (result.rowCount === 0) {
      return res.status(404).send("No active code found");
    }

    const row = result.rows[0];

    return res.status(200).send(`
      <html>
        <body style="font-family: Arial; padding: 40px; background: #050816; color: white;">
          <h1>Current Demo Code</h1>
          <p><strong>Code:</strong> ${row.code}</p>
          <p><strong>Expires:</strong> ${row.expires_at}</p>
          <p><strong>Created:</strong> ${row.created_at}</p>
        </body>
      </html>
    `);
  } catch (error) {
    return res.status(500).send(error.message);
  }
}