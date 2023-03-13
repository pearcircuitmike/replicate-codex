export default function calculateCreatorRank(data, creator) {
  if (!Array.isArray(data)) {
    return 0;
  }

  // Sort array in descending order based on runs
  const sortedData = data.sort((a, b) => b.runs - a.runs);

  let rank = 0;
  // Loop through sorted array and find the given creator's position
  for (let i = 0; i < sortedData.length; i++) {
    if (sortedData[i].creator === creator) {
      rank = i + 1; // Add 1 since rank starts at 1
      break;
    }
  }

  return rank;
}
