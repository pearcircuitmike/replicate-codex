// pages/api/chat/usage.js
import { getUserUsage, checkRateLimit } from "../utils/rateLimit";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const userId = req.headers["x-user-id"];
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized - Missing user ID" });
  }

  try {
    // Get usage stats
    const usage = await getUserUsage(userId);

    // Also check if currently rate limited
    const rateLimitCheck = await checkRateLimit(userId);

    return res.status(200).json({
      usage,
      allowed: rateLimitCheck.allowed,
      reason: rateLimitCheck.reason,
      resetTime: rateLimitCheck.resetTime?.toISOString(),
    });
  } catch (error) {
    console.error("Error getting user usage:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
