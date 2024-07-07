import React, { useState, useEffect } from "react";
import {
  Box,
  Text,
  Flex,
  Avatar,
  IconButton,
  HStack,
  Button,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon, ChatIcon } from "@chakra-ui/icons";
import { formatDistanceToNow } from "date-fns";
import NoteInput from "./NoteInput";

const Note = ({
  note,
  currentUser,
  onEditNote,
  onDeleteNote,
  onReplyNote,
  isReply = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [editedText, setEditedText] = useState(note.note_text);

  useEffect(() => {
    setEditedText(note.note_text);
  }, [note.note_text]);

  const handleEdit = (newText) => {
    onEditNote(note.id, newText);
    setIsEditing(false);
  };

  return (
    <Box p={3} borderWidth={1} borderRadius="md" mt={isReply ? 2 : 0}>
      {note.is_hidden ? (
        <Text color="gray.500" fontStyle="italic">
          This comment has been removed
        </Text>
      ) : (
        <>
          <Flex align="center" justify="space-between" mb={2}>
            <Flex align="center">
              <Avatar
                size="sm"
                src={note.public_profile_info.avatar_url}
                mr={2}
              />
              <Box>
                <Text fontWeight="bold">
                  {note.public_profile_info.full_name}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {formatDistanceToNow(new Date(note.created_at), {
                    addSuffix: true,
                  })}
                </Text>
              </Box>
            </Flex>
            {currentUser && currentUser.id === note.user_id && (
              <HStack>
                <IconButton
                  icon={<EditIcon />}
                  aria-label="Edit note"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                />
                <IconButton
                  icon={<DeleteIcon />}
                  aria-label="Delete note"
                  size="sm"
                  onClick={() => onDeleteNote(note.id)}
                />
              </HStack>
            )}
          </Flex>
          {isEditing ? (
            <NoteInput
              initialValue={editedText}
              onAddNote={handleEdit}
              isDisabled={false}
            />
          ) : (
            <Text whiteSpace="pre-wrap">{note.note_text}</Text>
          )}
        </>
      )}
      {!isReply && (
        <Button
          leftIcon={<ChatIcon />}
          size="sm"
          variant="outline"
          mt={2}
          onClick={() => setIsReplying(!isReplying)}
        >
          Reply
        </Button>
      )}
      {isReplying && (
        <Box mt={2}>
          <NoteInput
            onAddNote={(text) => onReplyNote(text, note.id)}
            isDisabled={!currentUser}
            replyToId={note.id}
          />
        </Box>
      )}
      {note.replies && note.replies.length > 0 && (
        <Box pl={4} mt={2}>
          {note.replies.map((reply) => (
            <Note
              key={reply.id}
              note={reply}
              currentUser={currentUser}
              onEditNote={onEditNote}
              onDeleteNote={onDeleteNote}
              onReplyNote={onReplyNote}
              isReply={true}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Note;
