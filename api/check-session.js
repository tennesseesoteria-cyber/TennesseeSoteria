import pool from "./_db.js";

function getCookieValue(cookieHeader, key) {
  const cookies = (cookieHeader || "").split(";").map(v => v.trim());
  const found = cookies.find(v => v.startsWith(`${key}=`));
  return found ? decodeURIComponent(found.split("=").slice(1).join("=")) : null;
}

export default async function handler(req, res) {
  try {
    const demoCodeOk = getCookieValue(req.headers.cookie, "demo_code_ok");
    const ndaOk = getCookieValue(req.headers.cookie, "demo_nda_ok");
    const companyName = getCookieValue(req.headers.cookie, "demo_company");
    const codeUsed = getCookieValue(req.headers.cookie, "demo_code_value");

    if (demoCodeOk !== "true" || ndaOk !== "true" || !companyName) {
      return res.status(401).json({ authorized: false });
    }

    await pool.query(
      `
      INSERT INTO demo_access_log (company_name, event_type, code_used)
      VALUES ($1, $2, $3)
      `,
      [companyName, "video_viewed", codeUsed]
    );

    return res.status(200).json({
      authorized: true,
      embedHtml: process.env.DEMO_VIDEO_EMBED
    });
  } catch (error) {
    console.error("check-session error", error);
    return res.status(500).json({ authorized: false });
  }
}