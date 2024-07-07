export const kebabToTitleCase = (str) => {
  if (str === null || str === undefined) {
    return "";
  }

  return str
    .split("-")
    .map((word) =>
      word === "ai" ? "AI" : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
};
