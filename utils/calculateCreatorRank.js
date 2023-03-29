export default function calculateCreatorRank(allModels, creator) {
  if (!Array.isArray(allModels)) {
    return 0;
  }

  // Create an object with total runs for each creator
  const creatorRuns = allModels.reduce((acc, current) => {
    if (acc[current.creator]) {
      acc[current.creator] += current.runs;
    } else {
      acc[current.creator] = current.runs;
    }
    return acc;
  }, {});

  // Sort creators by their total runs in descending order
  const sortedCreators = Object.entries(creatorRuns).sort(
    (a, b) => b[1] - a[1]
  );

  let rank = 0;

  // Loop through the sorted array and find the given creator's position
  for (let i = 0; i < sortedCreators.length; i++) {
    if (sortedCreators[i][0] === creator.toLowerCase()) {
      rank = i + 1; // Add 1 since rank starts at 1
      break;
    }
  }

  return rank;
}
