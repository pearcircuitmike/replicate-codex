// pages/api/community/[communityId]/highlights.js

import supabase from "../../utils/supabaseClient";
import { getDateRange } from "../../utils/dateUtils";

export default async function handler(req, res) {
  const { communityId } = req.query;
  const { timeRange } = req.query || {};

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 1) Which tasks does this community have?
    const { data: taskRows, error: taskErr } = await supabase
      .from("community_tasks")
      .select("task_id")
      .eq("community_id", communityId)
      .limit(1000);

    if (taskErr) throw taskErr;
    if (!taskRows || taskRows.length === 0) {
      return res.status(200).json([]);
    }

    const taskIds = taskRows.map((r) => r.task_id);

    // 2) Which papers overlap these tasks?
    let paperQuery = supabase
      .from("arxivPapersData")
      .select("id")
      .overlaps("task_ids", taskIds)
      .order("totalScore", { ascending: false })
      .limit(200);

    // If a timeRange is provided, filter by publishedDate
    if (timeRange) {
      const { startDate, endDate } = getDateRange(timeRange);
      if (startDate && endDate) {
        paperQuery = paperQuery
          .gte("publishedDate", startDate.toISOString())
          .lte("publishedDate", endDate.toISOString());
      }
    }

    const { data: relevantPapers, error: rpError } = await paperQuery;
    if (rpError) throw rpError;
    if (!relevantPapers || relevantPapers.length === 0) {
      return res.status(200).json([]);
    }

    const paperIds = relevantPapers.map((p) => p.id);

    // 3) Fetch highlights for these paper IDs
    const { data: rawHighlights, error: highlightsErr } = await supabase
      .from("highlights")
      .select(
        "id, paper_id, user_id, quote, prefix, suffix, context_snippet, created_at, text_position"
      )
      .in("paper_id", paperIds)
      .order("created_at", { ascending: false })
      .limit(200);

    if (highlightsErr) throw highlightsErr;
    if (!rawHighlights || rawHighlights.length === 0) {
      return res.status(200).json([]);
    }

    // 4) Gather user IDs and paper IDs
    const userIds = [...new Set(rawHighlights.map((h) => h.user_id))];
    const highlightPaperIds = [
      ...new Set(rawHighlights.map((h) => h.paper_id)),
    ];

    // 5) Fetch user profiles
    let profileMap = {};
    if (userIds.length > 0) {
      const { data: profileRows, error: profErr } = await supabase
        .from("public_profile_info")
        .select("id, full_name, avatar_url, username")
        .in("id", userIds);

      if (profErr) throw profErr;

      profileMap = {};
      (profileRows || []).forEach((p) => {
        profileMap[p.id] = {
          avatar_url: p.avatar_url || "",
          full_name: p.full_name || "Anonymous",
          username: p.username || "",
        };
      });
    }

    // 6) Fetch minimal paper info
    let paperMap = {};
    if (highlightPaperIds.length > 0) {
      const { data: paperRows, error: paperErr } = await supabase
        .from("arxivPapersData")
        .select("id, title, slug, platform")
        .in("id", highlightPaperIds);

      if (paperErr) throw paperErr;

      paperMap = {};
      (paperRows || []).forEach((paper) => {
        paperMap[paper.id] = {
          title: paper.title,
          slug: paper.slug,
          platform: paper.platform,
        };
      });
    }

    // 7) Merge userProfile + paper info into each highlight
    const mergedHighlights = rawHighlights.map((h) => ({
      ...h,
      userProfile: profileMap[h.user_id] || {
        avatar_url: "",
        full_name: "Anonymous",
        username: "",
      },
      arxivPapersData: paperMap[h.paper_id] || null,
    }));

    return res.status(200).json(mergedHighlights);
  } catch (error) {
    console.error("Error in GET community highlights:", error);
    return res.status(500).json({ error: error.message });
  }
}
