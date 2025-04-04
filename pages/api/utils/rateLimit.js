// pages/api/utils/rateLimit.js
import supabase from "./supabaseClient";

// Rate limit configuration
const RATE_LIMITS = {
  MESSAGES_PER_MINUTE: 3, // Very low for testing
  MESSAGES_PER_HOUR: 20,
  MESSAGES_PER_DAY: 50,
};

/**
 * Check if a user has exceeded rate limits
 * @param {string} userId - User ID to check
 * @returns {Promise<{allowed: boolean, reason: string|null, resetTime: Date|null}>}
 */
export async function checkRateLimit(userId) {
  if (!userId) {
    return { allowed: false, reason: "User ID required", resetTime: null };
  }

  try {
    // Get timestamp for time windows
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // First, get all sessions for this user
    const { data: sessions, error: sessionsError } = await supabase
      .from("chat_sessions")
      .select("id")
      .eq("user_id", userId);

    if (sessionsError) throw sessionsError;

    if (!sessions || sessions.length === 0) {
      // No sessions means no messages, allowed
      return { allowed: true, reason: null, resetTime: null };
    }

    // Extract session IDs
    const sessionIds = sessions.map((s) => s.id);

    // Check minute limit first (most restrictive)
    const { data: minuteMessages, error: minuteError } = await supabase
      .from("chat_messages")
      .select("id, created_at")
      .in("session_id", sessionIds)
      .eq("role", "user")
      .gte("created_at", oneMinuteAgo.toISOString());

    if (minuteError) throw minuteError;

    if (
      minuteMessages &&
      minuteMessages.length >= RATE_LIMITS.MESSAGES_PER_MINUTE
    ) {
      // Calculate reset time (1 minute from oldest message in window)
      const sortedMessages = [...minuteMessages].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      const oldestMessage = sortedMessages[0];
      const resetTime = new Date(
        new Date(oldestMessage.created_at).getTime() + 60 * 1000
      );

      return {
        allowed: false,
        reason: `Rate limit exceeded: ${RATE_LIMITS.MESSAGES_PER_MINUTE} messages per minute`,
        resetTime,
      };
    }

    // Check hour limit
    const { data: hourMessages, error: hourError } = await supabase
      .from("chat_messages")
      .select("id")
      .in("session_id", sessionIds)
      .eq("role", "user")
      .gte("created_at", oneHourAgo.toISOString());

    if (hourError) throw hourError;

    if (hourMessages && hourMessages.length >= RATE_LIMITS.MESSAGES_PER_HOUR) {
      return {
        allowed: false,
        reason: `Rate limit exceeded: ${RATE_LIMITS.MESSAGES_PER_HOUR} messages per hour`,
        resetTime: new Date(oneHourAgo.getTime() + 60 * 60 * 1000),
      };
    }

    // Check day limit
    const { data: dayMessages, error: dayError } = await supabase
      .from("chat_messages")
      .select("id")
      .in("session_id", sessionIds)
      .eq("role", "user")
      .gte("created_at", oneDayAgo.toISOString());

    if (dayError) throw dayError;

    if (dayMessages && dayMessages.length >= RATE_LIMITS.MESSAGES_PER_DAY) {
      return {
        allowed: false,
        reason: `Rate limit exceeded: ${RATE_LIMITS.MESSAGES_PER_DAY} messages per day`,
        resetTime: new Date(oneDayAgo.getTime() + 24 * 60 * 60 * 1000),
      };
    }

    // All checks passed
    return { allowed: true, reason: null, resetTime: null };
  } catch (error) {
    console.error("Error checking rate limit:", error);
    // Fail safe: if we can't check the rate limit, don't allow the request
    return {
      allowed: false,
      reason: "Error checking rate limit",
      resetTime: null,
    };
  }
}

/**
 * Get user's current usage statistics
 * @param {string} userId - User ID to check
 * @returns {Promise<{minuteCount: number, hourCount: number, dayCount: number}>}
 */
export async function getUserUsage(userId) {
  if (!userId) {
    return { minuteCount: 0, hourCount: 0, dayCount: 0, limits: RATE_LIMITS };
  }

  try {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // First, get all sessions for this user
    const { data: sessions, error: sessionsError } = await supabase
      .from("chat_sessions")
      .select("id")
      .eq("user_id", userId);

    if (sessionsError) throw sessionsError;

    if (!sessions || sessions.length === 0) {
      return { minuteCount: 0, hourCount: 0, dayCount: 0, limits: RATE_LIMITS };
    }

    // Extract session IDs
    const sessionIds = sessions.map((s) => s.id);

    // Get counts for each time window with separate queries
    const [minuteResult, hourResult, dayResult] = await Promise.all([
      supabase
        .from("chat_messages")
        .select("id", { count: "exact" })
        .in("session_id", sessionIds)
        .eq("role", "user")
        .gte("created_at", oneMinuteAgo.toISOString()),

      supabase
        .from("chat_messages")
        .select("id", { count: "exact" })
        .in("session_id", sessionIds)
        .eq("role", "user")
        .gte("created_at", oneHourAgo.toISOString()),

      supabase
        .from("chat_messages")
        .select("id", { count: "exact" })
        .in("session_id", sessionIds)
        .eq("role", "user")
        .gte("created_at", oneDayAgo.toISOString()),
    ]);

    return {
      minuteCount: minuteResult.count || 0,
      hourCount: hourResult.count || 0,
      dayCount: dayResult.count || 0,
      limits: RATE_LIMITS,
    };
  } catch (error) {
    console.error("Error getting user usage:", error);
    return { minuteCount: 0, hourCount: 0, dayCount: 0, limits: RATE_LIMITS };
  }
}
