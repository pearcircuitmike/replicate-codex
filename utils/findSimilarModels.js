// utils/findSimilarModels.js
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
