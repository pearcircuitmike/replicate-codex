export default function calculateModelRank(allModels, modelId) {
  if (!Array.isArray(allModels)) {
    return 0;
  }

  // Sort models by their total runs in descending order
  const sortedModels = allModels.sort((a, b) => b.runs - a.runs);

  let rank = 0;

  // Loop through the sorted array and find the given model's position
  for (let i = 0; i < sortedModels.length; i++) {
    if (sortedModels[i].id === modelId) {
      rank = i + 1; // Add 1 since rank starts at 1
      break;
    }
  }

  return rank;
}
