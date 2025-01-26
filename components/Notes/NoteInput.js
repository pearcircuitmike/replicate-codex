import React, { useState, useEffect } from "react";
import { Textarea, Button, VStack } from "@chakra-ui/react";
import { trackEvent } from "@/pages/api/utils/analytics-util";
const NoteInput = ({
  onAddNote,
  isDisabled,
  replyToId = null,
  initialValue = "",
}) => {
  const [noteText, setNoteText] = useState(initialValue);

  useEffect(() => {
    setNoteText(initialValue);
  }, [initialValue]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (noteText.trim()) {
      trackEvent("add_note", {
        is_reply: !!replyToId,
        reply_to_id: replyToId,
        is_edit: !!initialValue,
        note_text: noteText,
      });

      onAddNote(noteText.trim(), replyToId);
      if (!replyToId) {
        setNoteText("");
      }
    }
  };

  return (
    <VStack align="stretch">
      <Textarea
        value={noteText}
        onChange={(e) => setNoteText(e.target.value)}
        onKeyDown={handleKeyDown}
        fontSize="sm"
        placeholder={replyToId ? "Write a reply..." : "Add a new comment..."}
        rows={3}
      />
      <Button size="sm" colorScheme="blue" onClick={handleSubmit}>
        {replyToId ? "Post Reply" : initialValue ? "Save Edit" : "Add Comment"}
      </Button>
    </VStack>
  );
};

export default NoteInput;
