// pages/api/fetch-model-by-id.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: "Missing id parameter" });
    }

    try {
      const { data, error } = await supabase
        .from("modelsData")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching model data:", error);
        return res.status(500).json({ error: "Internal server error" });
      }

      if (!data) {
        return res.status(404).json({ error: "Model not found" });
      }

      res.status(200).json(data);
    } catch (error) {
      console.error("Error fetching model data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
