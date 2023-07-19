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
  let query = supabase
    .from("combinedModelsData") // Always fetch from the combinedModelsData view
    .select("*", { count: "exact" });

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
    query = query.eq("platform", platform); // Add platform filter
  }

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

// in your modelsData.js
export async function fetchModelDataById(id, platform = null) {
  let table = "";

  if (platform) {
    switch (platform) {
      case "huggingFace":
        table = "huggingFaceModelsData";
        break;
      case "cerebrium":
        table = "cerebriumModelsData";
        break;
      case "deepInfra":
        table = "deepInfraModelsData";
        break;
      case "replicate":
      default:
        table = "replicateModelsData";
        break;
    }
  } else {
    table = "combinedModelsData";
  }

  try {
    const { data, error } = await supabase
      .from(table)
      .select(
        "id, lastUpdated, generatedSummary, generatedUseCase, creator, modelName, description, tags, example, modelUrl, runs, costToRun, githubUrl, licenseUrl, paperUrl, predictionHardware, avgCompletionTime, platform, demoSources"
      )
      .eq("id", id)
      .single();

    if (error) {
      throw error;
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

  // if ids are provided, filter only those rows
  if (ids && ids.length > 0) {
    query = query.in("id", ids);
  }

  const { count } = await query;

  const offset = (currentPage - 1) * pageSize;
  // if ids are not provided, use pagination
  if (!ids) {
    query = query.range(offset, offset + pageSize - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return { data: null, totalCount: 0 };
  }

  // if ids are provided, totalCount should be the length of ids
  return { data, totalCount: ids ? ids.length : count };
}

export const findSimilarModels = (model, modelsData, maxResults = 5) => {
  const modelTags = model.tags
    ? model.tags.split(",").map((tag) => tag.trim())
    : [];

  return modelsData
    .filter((otherModel) => {
      if (otherModel.id === model.id) return false;
      const otherModelTags = otherModel.tags
        ? otherModel.tags.split(",").map((tag) => tag.trim())
        : [];
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
