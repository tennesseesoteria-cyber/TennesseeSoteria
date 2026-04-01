import pool from "./_db.js";

function getCookieValue(cookieHeader, key) {
  const cookies = (cookieHeader || "").split(";").map(v => v.trim());
  const found = cookies.find(v => v.startsWith(`${key}=`));
  return found ? decodeURIComponent(found.split("=").slice(1).join("=")) : null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const demoCodeOk = getCookieValue(req.headers.cookie, "demo_code_ok");
    const codeUsed = getCookieValue(req.headers.cookie, "demo_code_value");

    if (demoCodeOk !== "true" || !codeUsed) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const { companyName } = req.body || {};

    if (!companyName || companyName.trim().length < 2) {
      return res.status(400).json({ message: "Enter company name." });
    }

    const cleanedCompany = companyName.trim();

    await pool.query(
      `
      INSERT INTO demo_access_log (company_name, event_type, code_used)
      VALUES ($1, $2, $3)
      `,
      [cleanedCompany, "nda_accepted", codeUsed]
    );

    res.setHeader("Set-Cookie", [
      `demo_nda_ok=true; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=1800`,
      `demo_company=${encodeURIComponent(cleanedCompany)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=1800`
    ]);

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("accept-nda error", error);
    return res.status(500).json({ message: "Server error saving NDA." });
  }
}