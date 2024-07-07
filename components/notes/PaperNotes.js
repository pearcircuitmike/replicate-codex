import React, { useState, useEffect } from "react";
import {
  VStack,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { useAuth } from "../../context/AuthContext";
import AuthForm from "../AuthForm";
import NoteInput from "./NoteInput";
import NoteList from "./NoteList";
import NotesSkeleton from "./NotesSkeleton";
import {
  fetchNotes,
  addNote,
  editNote,
  deleteNote,
} from "../../pages/api/utils/notesService";

const PaperNotes = ({ paperId }) => {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    loadNotes();
  }, [paperId]);

  const loadNotes = async () => {
    setIsLoading(true);
    const fetchedNotes = await fetchNotes(paperId);
    setNotes(fetchedNotes);
    setIsLoading(false);
  };

  const handleAddNote = async (noteText, replyToId = null) => {
    if (!user) {
      onOpen();
      return;
    }

    const newNote = await addNote(user.id, paperId, noteText, replyToId);
    if (newNote) {
      if (replyToId) {
        setNotes(
          notes.map((note) =>
            note.id === replyToId
              ? { ...note, replies: [...(note.replies || []), newNote] }
              : note
          )
        );
      } else {
        setNotes([newNote, ...notes]);
      }
      toast({
        title: "Note added successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEditNote = async (noteId, newText) => {
    if (!user) {
      toast({
        title: "Error editing note",
        description: "You must be logged in to edit notes.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const updatedNote = await editNote(noteId, newText, user.id);
    if (updatedNote) {
      setNotes(updateNoteInList(notes, updatedNote));
      toast({
        title: "Note edited successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Error editing note",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!user) {
      toast({
        title: "Error deleting note",
        description: "You must be logged in to delete notes.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const deletedNote = await deleteNote(noteId, user.id);
    if (deletedNote) {
      setNotes(updateNoteInList(notes, { ...deletedNote, is_hidden: true }));
      toast({
        title: "Note deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Error deleting note",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const updateNoteInList = (noteList, updatedNote) => {
    return noteList.map((note) =>
      note.id === updatedNote.id
        ? { ...note, ...updatedNote }
        : note.replies
        ? { ...note, replies: updateNoteInList(note.replies, updatedNote) }
        : note
    );
  };

  return (
    <>
      <VStack spacing={4} align="stretch">
        <NoteInput onAddNote={handleAddNote} isDisabled={!user} />
        {isLoading ? (
          <NotesSkeleton />
        ) : (
          <NoteList
            notes={notes}
            currentUser={user}
            onEditNote={handleEditNote}
            onDeleteNote={handleDeleteNote}
            onReplyNote={handleAddNote}
          />
        )}
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent p={2}>
          <ModalHeader>Create an account for full access</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <AuthForm />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default PaperNotes;
