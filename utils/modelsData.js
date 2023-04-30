import supabase from "./supabaseClient";

// Utility function to fetch data from a specific table
export async function fetchDataFromTable({
  tableName,
  tags = [],
  searchValue = "",
  sorts = [],
  pageSize = 10,
  currentPage = 1,
}) {
  let query = supabase.from(tableName).select("*", { count: "exact" });

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

  const { data, error, count } = await query;

  if (error) {
    console.error(error);
    return { data: [], totalCount: 0 };
  }

  // Ensure that data is an array
  const dataArray = Array.isArray(data) ? data : [data].filter(Boolean);
  // Ensure that totalCount is a number
  const totalCountNumber = typeof count === "number" ? count : 0;

  return { data: dataArray, totalCount: totalCountNumber };
}

export async function fetchAllDataFromTable(tableName) {
  // Fetch all data from the specified table
  const { data, error } = await supabase.from(tableName).select("*");

  // Handle errors
  if (error) {
    console.error(`Error fetching all data from table "${tableName}":`, error);
    return [];
  }

  // Ensure that data is an array
  const dataArray = Array.isArray(data) ? data : [data].filter(Boolean);

  return dataArray;
}

export async function fetchModelDataById(id, tableName) {
  const { data, error } = await supabase
    .from(tableName)
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching model data:", error);
    return null;
  }

  return data;
}

export async function fetchFilteredData({
  tableName,
  tags = [],
  searchValue = "",
  sorts = [],
  pageSize = 10,
  currentPage = 1,
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

  const { count } = await query;

  const offset = (currentPage - 1) * pageSize;
  query = query.range(offset, offset + pageSize - 1);

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return { data: null, totalCount: 0 };
  }

  return { data, totalCount: count };
}

export const findSimilarModels = (model, modelsData, maxResults = 5) => {
  const modelTags = model.tags.split(",").map((tag) => tag.trim());

  return modelsData
    .filter((otherModel) => {
      if (otherModel.id === model.id) return false;
      const otherModelTags = otherModel.tags
        .split(",")
        .map((tag) => tag.trim());
      return otherModelTags.some((tag) => modelTags.includes(tag));
    })
    .slice(0, maxResults);
};

export const findCreatorModels = (model, modelsData) => {
  return modelsData.filter(
    (otherModel) =>
      otherModel.creator === model.creator && otherModel.id !== model.id
  );
};
