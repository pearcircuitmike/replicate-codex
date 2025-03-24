/**
 * Format retrieved documents into a context string for the AI model
 */
export function formatRagContext(ragContext) {
  if (!ragContext) return "No extra context provided.";

  const { models = [], papers = [] } = ragContext;

  if (models.length === 0 && papers.length === 0)
    return "No extra context provided.";

  let formattedContext = "";

  // Format papers
  if (papers.length > 0) {
    formattedContext += "## RESEARCH PAPERS:\n\n";
    formattedContext += papers
      .map((paper, i) => {
        const authors = Array.isArray(paper.authors)
          ? paper.authors.join(", ")
          : paper.authors || "Unknown";

        const paperURL =
          paper.paperUrl ||
          `https://aimodels.fyi/papers/${paper.platform || "arxiv"}/${
            paper.slug || "N/A"
          }`;

        return `Paper ${i + 1}:
  Title: ${paper.title || "Untitled"}
  ${paper.thumbnail ? `Example image: ${paper.thumbnail}` : ""}
  Authors: ${authors}
  Abstract: ${paper.abstract || "No abstract."}
  ${
    paper.arxivCategories
      ? `Categories: ${paper.arxivCategories.join(", ")}`
      : ""
  }
  ${paper.arxivId ? `ArXiv ID: ${paper.arxivId}` : ""}
  ${paper.totalScore ? `Score: ${paper.totalScore}` : ""}
  ${
    paper.publishedDate
      ? `Published Date: ${new Date(paper.publishedDate).toLocaleDateString()}`
      : ""
  }
  URL: ${paperURL}`;
      })
      .join("\n\n");
  }

  // Format models
  if (models.length > 0) {
    if (formattedContext) formattedContext += "\n\n";
    formattedContext += "## AI MODELS:\n\n";
    formattedContext += models
      .map((model, i) => {
        const modelURL =
          model.modelUrl ||
          `https://aimodels.fyi/models/${model.platform || "unknown"}/${
            model.slug || "N/A"
          }`;

        return `Model ${i + 1}:
  Model Name: ${model.modelName || "Unknown"}
  ${model.example ? `Example image: ${model.example}` : ""}
  Creator: ${model.creator || "Unknown"}
  Description: ${model.description || "No description."}
  ${model.tags ? `Tags: ${model.tags}` : ""}
  ${model.totalScore ? `Score: ${model.totalScore}` : ""}
  ${
    model.lastUpdated
      ? `Last Updated: ${new Date(model.lastUpdated).toLocaleDateString()}`
      : ""
  }
  Platform: ${model.platform || "Unknown"}
  URL: ${modelURL}`;
      })
      .join("\n\n");
  }

  return formattedContext;
}

/**
 * Create the system prompt combining retrieved context and user query
 */
export function createSystemPrompt(contextString, userQuery) {
  return `You are an AI assistant with retrieved context from AImodels.fyi:
  
  ${contextString}
  
  User query: ${userQuery || "(not provided)"}
  
  Use only the above context to answer the user's question. If the context doesn't contain relevant information, say so. 
  You may suggest workflows that combine multiple models or papers to help solve the user's problem.
  Keep responses concise. Ask for clarification if needed. Link to URLs in the context rather than to external sites.
  Always mention example images when available.`;
}

/**
 * Truncate the context to fit within token limits
 */
export function truncateContext(context, maxLength = 6000) {
  if (!context) return context;

  if (typeof context === "string" && context.length > maxLength) {
    return context.substring(0, maxLength) + "... (truncated)";
  }

  return context;
}
