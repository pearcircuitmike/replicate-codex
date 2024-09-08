import React from "react";
import { Select } from "@chakra-ui/react";

const FolderSelect = ({ folders, selectedFolderId, onChange }) => {
  return (
    <Select value={selectedFolderId} onChange={(e) => onChange(e.target.value)}>
      {folders.map((folder) => (
        <option key={folder.id} value={folder.id}>
          {folder.name}
        </option>
      ))}
    </Select>
  );
};

export default FolderSelect;
