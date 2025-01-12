import OpenAI from "openai";
import { PassThrough } from "stream";

/**
 * Splits a long string into smaller chunks, each up to maxLen chars.
 */
function chunkText(str, maxLen = 3000) {
  const chunks = [];
  let start = 0;
  while (start < str.length) {
    const end = Math.min(start + maxLen, str.length);
    chunks.push(str.slice(start, end));
    start = end;
  }
  return chunks;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text = "" } = req.body || {};
  if (!text.trim()) {
    return res.status(400).json({ error: "No text provided" });
  }

  try {
    // 1) Split into smaller chunks (3000 chars each).
    const MAX_LEN = 3000;
    const textChunks = chunkText(text, MAX_LEN);

    // 2) Prepare for streaming response
    res.writeHead(200, {
      "Content-Type": "audio/mpeg",
      // Some hosts with HTTP/2 or HTTP/3 won't let you set chunked manually,
      // but Next often handles it automatically if there's no Content-Length.
      "Cache-Control": "no-cache",
    });

    // 3) PassThrough merges chunked data from OpenAI and pipes to the client
    const passThrough = new PassThrough();
    passThrough.pipe(res);

    // 4) For each chunk, call OpenAI TTS in streaming mode
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    for (const chunk of textChunks) {
      const response = await openai.audio.speech.create({
        model: "tts-1-hd", // or "tts-1-hd" for higher quality
        voice: "alloy", // or "nova", "ash", "onyx", etc.
        input: chunk,
        responseFormat: "mp3",
        stream: true,
      });

      // response.body is a Node.js Readable stream
      const ttsStream = response.body;

      // Pipe the chunk's audio to passThrough
      // but don't end passThrough after each chunk
      await new Promise((resolve, reject) => {
        ttsStream.pipe(passThrough, { end: false });
        ttsStream.on("end", resolve);
        ttsStream.on("error", reject);
      });
    }

    // 5) After all chunks, end passThrough
    passThrough.end();
  } catch (error) {
    console.error("Error in TTS API route:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to generate speech." });
    } else {
      res.end();
    }
  }
}
