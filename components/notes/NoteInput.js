import React, { useState, useEffect } from "react";
import { Textarea, Button, VStack } from "@chakra-ui/react";

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
        placeholder={replyToId ? "Write a reply..." : "Add a new note..."}
        rows={3}
      />
      <Button size="sm" colorScheme="blue" onClick={handleSubmit}>
        {replyToId ? "Post Reply" : initialValue ? "Save Edit" : "Add Note"}
      </Button>
    </VStack>
  );
};

export default NoteInput;
