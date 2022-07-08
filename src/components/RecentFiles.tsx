import React from "react";
import { observer } from "mobx-react";
import useRecentFiles from "../hooks/useRecentFiles";
import Card from "./Card";

interface RecentFilesProps {
  onOpen: (_dir: FileSystemDirectoryHandle) => void;
}

const RecentFiles: React.FC<RecentFilesProps> = ({ onOpen }) => {
  const { recentFiles, saveToRecentFiles, removeFromRecentFiles } =
    useRecentFiles();

  return (
    <>
      <h3 className="mt-4 h-padding">Letzte Dateien</h3>
      <ul className="grid mt-4 h-padding">
        {recentFiles.map((recentFile) => (
          <Card
            key={recentFile.file.name}
            onClick={() => {
              onOpen(recentFile.file);
              saveToRecentFiles(recentFile.file);
            }}
          >
            <div className="card-title">
              {recentFile.file.name}
              <button
                type="button"
                className="icon pull-right"
                onClick={(e) => {
                  removeFromRecentFiles(recentFile.file);
                  e.stopPropagation();
                }}
              >
                ✕
              </button>
            </div>
            <div className="mt-2">
              Zuletzt geöffnet: {recentFile.lastOpened.toLocaleString()}
            </div>
          </Card>
        ))}
      </ul>
    </>
  );
};

export default observer(RecentFiles);
