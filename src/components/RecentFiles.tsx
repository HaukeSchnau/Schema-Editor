import React from "react";
import { observer } from "mobx-react";
import useRecentFiles from "../hooks/useRecentFiles";

interface RecentFilesProps {
  onOpen: (_dir: FileSystemDirectoryHandle) => void;
}

const RecentFiles: React.FC<RecentFilesProps> = ({ onOpen }) => {
  const { recentFiles, saveToRecentFiles } = useRecentFiles();

  return (
    <>
      <h3 className="mt-4">Letzte Dateien</h3>
      <ul>
        {recentFiles.map((recentFile) => (
          <button
            key={recentFile.name + recentFile.kind}
            className="link"
            type="button"
            onClick={() => {
              onOpen(recentFile);
              saveToRecentFiles(recentFile);
            }}
          >
            {recentFile.name}
          </button>
        ))}
      </ul>
    </>
  );
};

export default observer(RecentFiles);
