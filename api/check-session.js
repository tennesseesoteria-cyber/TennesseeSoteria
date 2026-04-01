export default function handler(req, res) {
  const cookies = req.headers.cookie || "";

  const hasCode = cookies.includes("demo_code_ok=true");
  const hasNda = cookies.includes("demo_nda_ok=true");

  if (!hasCode || !hasNda) {
    return res.status(401).json({ authorized: false });
  }

  return res.status(200).json({
    authorized: true,
    embedHtml: process.env.DEMO_VIDEO_EMBED
  });
}