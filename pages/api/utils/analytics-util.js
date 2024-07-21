// pages/api/utils/analytics-util.js
import supabase from "./supabaseClient";
import { v4 as uuidv4 } from "uuid";

// Function to get or create a session ID
const getSessionId = () => {
  let sessionId = localStorage.getItem("sessionId");
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem("sessionId", sessionId);
  }
  return sessionId;
};

export async function trackEvent(eventType, eventData = {}) {
  try {
    const session = await supabase.auth.getSession();
    const user = session.data.session?.user;
    const sessionId = getSessionId();

    const { data, error } = await supabase.from("analytics_events").insert({
      user_id: user?.id || null,
      session_id: sessionId,
      event_type: eventType,
      event_data: eventData,
      is_authenticated: !!user,
    });

    if (error) {
      console.error("Error tracking event:", error);
    }
  } catch (error) {
    console.error("Error in trackEvent:", error);
  }
}
