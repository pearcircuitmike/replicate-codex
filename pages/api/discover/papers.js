import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method === "GET") {
    const {
      page = 1,
      pageSize = 10,
      searchValue,
      selectedCategories,
      startDate,
      endDate,
    } = req.query;

    try {
      let query = supabase
        .from("arxivPapersData")
        .select(
          "id, slug, totalScore, title, abstract, authors, thumbnail, publishedDate",
          { count: "exact" }
        );

      if (searchValue) {
        query = query.or(
          `title.ilike.%${searchValue}%,arxivId.ilike.%${searchValue}%`
        );
      }

      if (selectedCategories) {
        query = query.overlaps(
          "arxivCategories",
          selectedCategories.split(",")
        );
      }

      if (startDate && endDate) {
        query = query
          .gte("publishedDate", startDate)
          .lte("publishedDate", endDate);
      }

      const { data, error, count } = await query
        .order("totalScore", { ascending: false })
        .range(
          (parseInt(page) - 1) * parseInt(pageSize),
          parseInt(page) * parseInt(pageSize) - 1
        );

      if (error) throw error;

      res.status(200).json({
        data,
        totalCount: count,
        pageSize: parseInt(pageSize),
        currentPage: parseInt(page),
      });
    } catch (error) {
      console.error("Error in papers API:", error);
      res
        .status(500)
        .json({ error: "An error occurred while fetching papers" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
