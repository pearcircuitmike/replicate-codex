import supabase from "./utils/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { field, value } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Missing authorization token" });
  }

  if (!["weekly", "daily", "monthly", "none"].includes(value)) {
    return res.status(400).json({ error: "Invalid preference" });
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
      .from("digest_subscriptions")
      .update({ [field]: value })
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      message: "Preference updated successfully",
      preferences: data,
    });
  } catch (error) {
    console.error("Error updating preference:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating preference" });
  }
}
