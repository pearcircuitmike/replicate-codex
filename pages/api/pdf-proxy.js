// pages/api/pdf-proxy.js

// NOTE: This route is only needed on local dev due to CORS - it is not needed in production.
export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "URL parameter is required" });
  }

  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();

    // Set appropriate headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Length", arrayBuffer.byteLength);

    // Convert ArrayBuffer to Buffer for Node.js
    const buffer = Buffer.from(arrayBuffer);
    res.send(buffer);
  } catch (error) {
    console.error("Error proxying PDF:", error);
    res.status(500).json({ error: "Failed to fetch PDF" });
  }
}
