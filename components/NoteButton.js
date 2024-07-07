import React, { useState, useEffect } from "react";
import { Button } from "@chakra-ui/react";
import { FaComment } from "react-icons/fa";
import supabase from "../pages/api/utils/supabaseClient";

const NoteButton = ({ paperId, onClick, ...props }) => {
  const [noteCount, setNoteCount] = useState(0);

  useEffect(() => {
    const fetchNoteCount = async () => {
      const { count, error } = await supabase
        .from("notes")
        .select("*", { count: "exact", head: true })
        .eq("paper_id", paperId)
        .eq("is_hidden", false);

      if (error) {
        console.error("Error fetching note count:", error);
      } else {
        setNoteCount(count);
      }
    };

    fetchNoteCount();
  }, [paperId]);

  return (
    <Button
      onClick={onClick}
      leftIcon={<FaComment />}
      variant="outline"
      {...props}
    >
      {noteCount > 0 ? `Notes (${noteCount})` : "Notes"}
    </Button>
  );
};

export default NoteButton;
