export const findCreatorModels = (model, modelsData) => {
  return modelsData.filter(
    (otherModel) =>
      otherModel.creator === model.creator && otherModel.id !== model.id
  );
};
