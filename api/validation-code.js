export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { code } = req.body;

  if (code !== process.env.DEMO_ACCESS_CODE) {
    return res.status(401).json({ message: "Invalid code" });
  }

  res.setHeader(
    "Set-Cookie",
    "demo_code_ok=true; Path=/; HttpOnly; SameSite=Lax"
  );

  return res.status(200).json({ ok: true });
}