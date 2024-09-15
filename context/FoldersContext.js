// context/FoldersContext.js

import React, { createContext, useContext } from "react";

const FoldersContext = createContext();

export const useFolders = () => {
  return useContext(FoldersContext);
};

export const FoldersProvider = ({
  children,
  fetchFolders,
  updateFolderCount,
  folders,
}) => {
  return (
    <FoldersContext.Provider
      value={{ fetchFolders, updateFolderCount, folders }}
    >
      {children}
    </FoldersContext.Provider>
  );
};
