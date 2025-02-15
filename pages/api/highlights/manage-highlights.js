// /pages/api/highlights/manage-highlights.js
import supabase from "@/pages/api/utils/supabaseClient";

export default async function handler(req, res) {
  // Only require user_id for POST and DELETE operations
  if ((req.method === "POST" || req.method === "DELETE") && !req.body.user_id) {
    return res.status(401).json({ error: "Authentication required" });
  }

  switch (req.method) {
    case "GET":
      try {
        const { paper_id } = req.query;
        if (!paper_id) {
          return res.status(400).json({ error: "paper_id is required" });
        }

        const { data, error } = await supabase
          .from("highlights")
          .select(
            `
            *,
            user_profile:public_profile_info!highlights_user_id_fkey (
              id,
              full_name,
              avatar_url,
              username
            )
          `
          )
          .eq("paper_id", paper_id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        return res.status(200).json(data.filter((hl) => hl && hl.id));
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }

    case "POST":
      try {
        const highlight = req.body;
        const { data, error } = await supabase
          .from("highlights")
          .insert(highlight)
          .select(
            `
            *,
            user_profile:public_profile_info!highlights_user_id_fkey (
              id,
              full_name,
              avatar_url,
              username
            )
          `
          )
          .single();

        if (error) throw error;
        return res.status(200).json(data);
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }

    case "DELETE":
      try {
        const { highlight_id, user_id } = req.body;
        const { error } = await supabase
          .from("highlights")
          .delete()
          .eq("id", highlight_id)
          .eq("user_id", user_id);

        if (error) throw error;
        return res.status(200).json({ success: true });
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }

    default:
      res.setHeader("Allow", ["GET", "POST", "DELETE"]);
      return res
        .status(405)
        .json({ error: `Method ${req.method} Not Allowed` });
  }
}

// Updated functions in PaperDetailsPage.jsx
const fetchHighlights = async () => {
  try {
    if (!paper?.id) return;

    const response = await axios.get("/api/highlights/manage-highlights", {
      params: { paper_id: paper.id },
    });
    setHighlights(response.data);
  } catch (error) {
    console.error("Error fetching highlights:", error);
    toast({
      title: "Error fetching highlights",
      description: error.message,
      status: "error",
      duration: 5000,
      isClosable: true,
    });
  }
};

const handleNewHighlight = async (anchor) => {
  if (!user) {
    toast({
      title: "Authentication required",
      description: "Please sign in to create highlights",
      status: "warning",
      duration: 5000,
      isClosable: true,
    });
    return;
  }

  try {
    const newHighlight = {
      user_id: user.id,
      paper_id: paper.id,
      quote: anchor.exact,
      prefix: anchor.prefix,
      suffix: anchor.suffix,
      text_position: anchor.text_position,
      context_snippet: `${anchor.prefix}${anchor.exact}${anchor.suffix}`.slice(
        0,
        500
      ),
    };

    const response = await axios.post(
      "/api/highlights/manage-highlights",
      newHighlight
    );
    setHighlights((prev) => [response.data, ...prev]);
    toast({
      title: "Highlight created",
      status: "success",
      duration: 2000,
    });
  } catch (error) {
    console.error("Error creating highlight:", error);
    toast({
      title: "Error creating highlight",
      description: error.message,
      status: "error",
      duration: 5000,
      isClosable: true,
    });
  }
};

const handleHighlightRemove = async (highlightId) => {
  if (!user) return;

  try {
    await axios.delete("/api/highlights/manage-highlights", {
      data: {
        highlight_id: highlightId,
        user_id: user.id,
      },
    });
    setHighlights((prev) => prev.filter((h) => h.id !== highlightId));
    setSelectedHighlightId(null);
    toast({
      title: "Highlight removed",
      status: "success",
      duration: 2000,
    });
  } catch (error) {
    console.error("Error removing highlight:", error);
    toast({
      title: "Error removing highlight",
      description: error.message,
      status: "error",
      duration: 5000,
      isClosable: true,
    });
  }
};
