// components/DashboardSidebar.js
import React, { useEffect, useState } from "react";
import {
  Box,
  VStack,
  Flex,
  Text,
  IconButton,
  useDisclosure,
} from "@chakra-ui/react";
import { FaEdit } from "react-icons/fa";
import { useRouter } from "next/router";
import supabase from "../pages/api/utils/supabaseClient";
import { useAuth } from "../context/AuthContext";
import FolderModal from "./FolderModal";

const DashboardSidebar = () => {
  const { user } = useAuth();
  const [folders, setFolders] = useState([]);
  const [editingFolder, setEditingFolder] = useState(null);
  const [folderName, setFolderName] = useState("");
  const [folderColor, setFolderColor] = useState("#000000");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchFolders();
    }
  }, [user]);

  const fetchFolders = async () => {
    try {
      const { data, error } = await supabase
        .from("folders")
        .select("*")
        .eq("user_id", user.id)
        .order("name");

      if (error) throw error;

      setFolders(data || []);
    } catch (error) {
      console.error("Error fetching folders:", error);
    }
  };

  const handleEditFolder = (folder) => {
    setEditingFolder(folder);
    setFolderName(folder.name);
    setFolderColor(folder.color || "#000000");
    onOpen();
  };

  const handleSaveFolder = async () => {
    if (!folderName.trim()) return;

    try {
      const { data, error } = await supabase
        .from("folders")
        .update({
          name: folderName.trim(),
          color: folderColor,
        })
        .eq("id", editingFolder.id)
        .eq("user_id", user.id)
        .select();

      if (error || !data) {
        throw new Error("Folder update failed");
      }

      setFolders(folders.map((f) => (f.id === editingFolder.id ? data[0] : f)));
      setEditingFolder(null);
      setFolderName("");
      setFolderColor("#000000");
      onClose();
    } catch (error) {
      console.error("Error updating folder:", error);
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      <Text fontWeight="bold" px={4}>
        Folders
      </Text>
      {folders.map((folder) => (
        <Flex
          key={folder.id}
          align="center"
          px={4}
          py={2}
          bg={router.query.folderId === folder.id ? "blue.50" : "transparent"}
          cursor="pointer"
          onClick={() =>
            router.push(`/dashboard/library?folderId=${folder.id}`)
          }
        >
          <Box
            width="12px"
            height="12px"
            borderRadius="50%"
            bg={folder.color || "gray.500"}
            mr={2}
          />
          <Text flex="1">{folder.name}</Text>
          <IconButton
            icon={<FaEdit />}
            size="sm"
            variant="ghost"
            aria-label="Edit Folder"
            onClick={(e) => {
              e.stopPropagation();
              handleEditFolder(folder);
            }}
          />
        </Flex>
      ))}
      <FolderModal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setEditingFolder(null);
        }}
        folderName={folderName}
        setFolderName={setFolderName}
        folderColor={folderColor}
        setFolderColor={setFolderColor}
        onSave={handleSaveFolder}
        mode="edit"
      />
    </VStack>
  );
};

export default DashboardSidebar;
