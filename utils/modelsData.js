import supabase from "./supabaseClient";

// Utility function to fetch data from a specific table
export async function fetchDataFromTable({
  platform = null,
  tags = [],
  searchValue = "",
  sorts = [],
  pageSize = 10,
  currentPage = 1,
} = {}) {
  let query = supabase.from("modelsData").select("*", { count: "exact" });

  if (tags.length > 0) {
    query = query.or(tags.map((tag) => `tags.ilike.%${tag}%`).join(","));
  }

  if (searchValue) {
    query = query.or(
      `modelName.ilike.%${searchValue}%,creator.ilike.%${searchValue}%,description.ilike.%${searchValue}%`
    );
  }

  sorts.forEach(({ column, direction }) => {
    query = query.order(column, { ascending: direction === "asc" });
  });

  const offset = (currentPage - 1) * pageSize;
  query = query.range(offset, offset + pageSize - 1);

  if (platform !== null) {
    query = query.eq("platform", platform);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error(error);
    return { data: [], totalCount: 0 };
  }

  const dataArray = Array.isArray(data) ? data : [data].filter(Boolean);
  const totalCountNumber = typeof count === "number" ? count : 0;

  return { data: dataArray, totalCount: totalCountNumber };
}

export async function fetchAllDataFromTable({
  tableName,
  pageSize = 1000,
  currentPage = 1,
}) {
  const offset = (currentPage - 1) * pageSize;

  const { data, error } = await supabase
    .from(tableName)
    .select("id, creator,  totalScore, modelName, runs, tags, platform")
    .order("runs", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) {
    console.error(`Error fetching all data from table "${tableName}":`, error);
    return [];
  }

  const dataArray = Array.isArray(data) ? data : [data].filter(Boolean);

  return dataArray;
}

export async function fetchModelDataBySlug(slug) {
  try {
    const { data, error } = await supabase
      .from("modelsData")
      .select(
        "id, lastUpdated, generatedSummary, totalScore, creator, embedding, modelName, description, tags, example, modelUrl, totalScore, githubUrl, licenseUrl, paperUrl,  platform"
      )
      .eq("slug", slug)
      .single();

    if (error) {
      console.error(`Error fetching model data: ${error.message}`);
      return null;
    }

    return data;
  } catch (err) {
    console.error(`Error fetching model data: ${err.message}`);
    return null;
  }
}

export async function fetchFilteredData({
  tableName,
  tags = [],
  searchValue = "",
  sorts = [],
  pageSize = 10,
  currentPage = 1,
  ids = null,
}) {
  let query = supabase.from(tableName).select("*", { count: "exact" });

  if (tags.length > 0) {
    query = query.or(tags.map((tag) => `tags.contains.${tag}`).join(","));
  }

  if (searchValue) {
    query = query.ilike("name", `%${searchValue}%`);
  }

  sorts.forEach(({ field, direction }) => {
    query = query.order(field, { ascending: direction === "asc" });
  });

  if (ids && ids.length > 0) {
    query = query.in("id", ids);
  }

  const { count } = await query;

  const offset = (currentPage - 1) * pageSize;
  if (!ids) {
    query = query.range(offset, offset + pageSize - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return { data: null, totalCount: 0 };
  }

  return { data, totalCount: ids ? ids.length : count };
}

export async function findRelatedModels(model, maxResults = 4) {
  if (!model || !model.tags) {
    return [];
  }

  const { data, error } = await supabase
    .from("modelsData")
    .select("id, modelName, creator,  totalScore, runs, platform, description")
    .ilike("tags", `%${model.tags}%`)
    .neq("id", model.id)
    .order("runs", { ascending: false })
    .limit(maxResults);

  if (error) {
    console.error(`Error fetching similar models: ${error.message}`);
    return [];
  }

  const similarModels = Array.isArray(data) ? data : [data].filter(Boolean);

  return similarModels;
}
