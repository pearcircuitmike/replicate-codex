export default async function handler(req, res) {
  if (req.query.secret !== process.env.MY_SECRET_TOKEN) {
    return res.status(401).json({ message: "Invalid token" });
  }
  const path = req.query.path;
  if (!path) {
    return res.status(400).json({ message: "Missing path" });
  }
  try {
    await res.revalidate(path);
    return res.json({ revalidated: true });
  } catch (err) {
    console.error("Error revalidating:", err);
    return res.status(500).send("Error revalidating");
  }
}
