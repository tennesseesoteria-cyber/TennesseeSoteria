export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { companyName } = req.body;

  if (!companyName || companyName.length < 2) {
    return res.status(400).json({ message: "Enter company name" });
  }

  res.setHeader(
    "Set-Cookie",
    "demo_nda_ok=true; Path=/; HttpOnly; SameSite=Lax"
  );

  return res.status(200).json({ ok: true });
}