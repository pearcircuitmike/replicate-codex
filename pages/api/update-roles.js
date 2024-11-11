import supabase from "./utils/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = req.headers.authorization?.split(" ")[1];
  const { roles } = req.body;

  if (!token) {
    return res.status(401).json({ error: "No authorization token provided" });
  }

  if (!roles || !Array.isArray(roles)) {
    return res.status(400).json({ error: "Invalid roles format" });
  }

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({
        roles,
        first_login: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      message: "Roles updated successfully",
      profile: data,
    });
  } catch (error) {
    console.error("Error updating roles:", error);
    res.status(500).json({ error: "Failed to update roles" });
  }
}
