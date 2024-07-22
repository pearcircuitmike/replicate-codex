import supabase from "./supabaseClient";
import { v4 as uuidv4 } from "uuid";

// Function to get or create a session ID
const getSessionId = () => {
  try {
    let sessionId = localStorage.getItem("sessionId");
    if (!sessionId) {
      sessionId = uuidv4();
      localStorage.setItem("sessionId", sessionId);
    }
    console.log("Session ID:", sessionId); // Debugging: Log the session ID
    return sessionId;
  } catch (error) {
    console.error("Error accessing localStorage:", error);
    return null;
  }
};

export async function trackEvent(eventType, eventData = {}) {
  try {
    const session = await supabase.auth.getSession();
    const user = session.data.session?.user;
    const sessionId = getSessionId();

    if (!sessionId) {
      console.error("Session ID is null. Event not tracked.");
      return;
    }

    const { data, error } = await supabase.from("analytics_events").insert({
      user_id: user?.id || null,
      session_id: sessionId,
      event_type: eventType,
      event_data: eventData,
      is_authenticated: !!user,
    });

    if (error) {
      console.error("Error tracking event:", error);
    } else {
      console.log("Event tracked successfully:", { eventType, eventData });
    }
  } catch (error) {
    console.error("Error in trackEvent:", error);
  }
}
