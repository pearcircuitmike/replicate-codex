// pages/api/utils/notesService

import supabase from "./supabaseClient";
import DOMPurify from "dompurify";

export const fetchNotes = async (paperId) => {
  const { data, error } = await supabase
    .from("notes")
    .select(
      `
      *,
      public_profile_info!left (
        id,
        full_name,
        avatar_url,
        username
      )
    `
    )
    .eq("paper_id", paperId)
    .is("reply_to", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching notes:", error);
    return [];
  }

  const notesWithReplies = await Promise.all(
    data.map(async (note) => {
      const { data: replies, error: replyError } = await supabase
        .from("notes")
        .select(
          `
          *,
          public_profile_info!left (
            id,
            full_name,
            avatar_url,
            username
          )
        `
        )
        .eq("reply_to", note.id)
        .order("created_at", { ascending: true });

      if (replyError) {
        console.error("Error fetching replies:", replyError);
        return note;
      }

      return { ...note, replies };
    })
  );

  return notesWithReplies;
};

export const addNote = async (userId, paperId, noteText, replyToId = null) => {
  if (typeof noteText !== "string" || noteText.length > 5000) {
    throw new Error("Invalid note text");
  }

  const sanitizedText = DOMPurify.sanitize(noteText);

  const { data, error } = await supabase
    .from("notes")
    .insert([
      {
        user_id: userId,
        paper_id: paperId,
        note_text: sanitizedText,
        reply_to: replyToId,
      },
    ])
    .select(
      `
      *,
      public_profile_info!left (
        id,
        full_name,
        avatar_url,
        username
      )
    `
    )
    .single();

  if (error) {
    console.error("Error adding note:", error);
    return null;
  }

  return data;
};

export const editNote = async (noteId, newText, userId) => {
  if (typeof newText !== "string" || newText.length > 5000) {
    throw new Error("Invalid note text");
  }

  const sanitizedText = DOMPurify.sanitize(newText);

  const { data, error } = await supabase
    .from("notes")
    .update({ note_text: sanitizedText })
    .eq("id", noteId)
    .eq("user_id", userId)
    .select(
      `
      *,
      public_profile_info:user_id (
        id,
        full_name,
        avatar_url,
        username
      )
    `
    )
    .single();

  if (error) {
    console.error("Error editing note:", error);
    return null;
  }

  return data;
};

export const deleteNote = async (noteId, userId) => {
  const { data, error } = await supabase
    .from("notes")
    .update({ is_hidden: true })
    .eq("id", noteId)
    .eq("user_id", userId)
    .select(
      `
      *,
      public_profile_info!left (
        id,
        full_name,
        avatar_url,
        username
      )
    `
    )
    .single();

  if (error) {
    console.error("Error deleting note:", error);
    return null;
  }

  return data;
};
