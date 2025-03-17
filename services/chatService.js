/**
 * Service layer for chat-related API calls
 */
export const chatService = {
  /**
   * Fetch all chat sessions for a user
   */
  async getSessions(userId) {
    const res = await fetch(`/api/chat/sessions?user_id=${userId}`);
    if (!res.ok) throw new Error("Failed to fetch sessions");
    const data = await res.json();
    return data.sessions || [];
  },

  /**
   * Get a specific chat session with its messages
   */
  async getSession(sessionId, userId) {
    const res = await fetch(`/api/chat/sessions/${sessionId}`, {
      headers: { "x-user-id": userId },
    });
    if (!res.ok) throw new Error("Failed to load chat session");
    return await res.json();
  },

  /**
   * Create a new chat session
   */
  async createSession(userId, title = "New Chat") {
    const res = await fetch(`/api/chat/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, title }),
    });
    if (!res.ok) throw new Error("Failed to create session");
    return await res.json();
  },

  /**
   * Delete a chat session
   */
  async deleteSession(sessionId, userId) {
    const res = await fetch(`/api/chat/sessions/${sessionId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    });
    if (!res.ok) throw new Error("Failed to delete chat");
    return await res.json();
  },

  /**
   * Get usage count for free tier users
   */
  async getUsage(userId) {
    const res = await fetch(`/api/chat/rag-usage?user_id=${userId}`);
    if (!res.ok) throw new Error("Failed to fetch usage");
    return await res.json();
  },

  /**
   * Save a message to a chat session
   */
  async saveMessage(sessionId, userId, role, content, ragContext = null) {
    const res = await fetch(`/api/chat/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        role,
        content,
        user_id: userId,
        rag_context: ragContext,
      }),
    });
    if (!res.ok) throw new Error("Failed to save message");
    return await res.json();
  },

  /**
   * Update a session's last activity timestamp
   */
  async touchSession(sessionId, userId) {
    const res = await fetch(`/api/chat/sessions/${sessionId}/touch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    });
    if (!res.ok) throw new Error("Failed to update session timestamp");
    return await res.json();
  },

  /**
   * Retrieve context (models and papers) for RAG
   */
  async retrieveContext(query) {
    const [modelsRes, papersRes] = await Promise.all([
      fetch("/api/search/semantic-search-models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      }),
      fetch("/api/search/semantic-search-papers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      }),
    ]);

    if (!modelsRes.ok) throw new Error("Failed to retrieve models");
    if (!papersRes.ok) throw new Error("Failed to retrieve papers");

    const [modelsJson, papersJson] = await Promise.all([
      modelsRes.json(),
      papersRes.json(),
    ]);

    return {
      models: modelsJson.data || [],
      papers: papersJson.data || [],
    };
  },
};
