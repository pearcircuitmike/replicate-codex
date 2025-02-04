// components/Notes/NoteList.js

import React from "react";
import { VStack } from "@chakra-ui/react";
import Note from "./Note";

const NoteList = ({
  notes,
  currentUser,
  onEditNote,
  onDeleteNote,
  onReplyNote,
}) => {
  return (
    <VStack spacing={4} align="stretch">
      {notes.map((note) => (
        <Note
          key={note.id}
          note={note}
          currentUser={currentUser}
          onEditNote={onEditNote}
          onDeleteNote={onDeleteNote}
          onReplyNote={onReplyNote}
        />
      ))}
    </VStack>
  );
};

export default NoteList;
