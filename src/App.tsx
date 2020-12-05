import { Typography } from '@material-ui/core';
import React, { useState } from 'react';
import WindowChrome from './components/WindowChrome';
import fs from 'fs';
import path from 'path';
const { dialog } = window.require("electron").remote;

function App() {
  const [ openPath, setOpenPath ] = useState(undefined as string | undefined);
  const [ fileContents, setFileContents ] = useState(undefined as string | undefined);

  async function openFile() {
    const results: {
      cancelled: boolean,
      filePaths: string[]
    } = await dialog.showOpenDialog();
    if(results.cancelled) return;
    const file = results.filePaths[0];
    fs.readFile(file, 'utf8', (error, data) => {
      setOpenPath(file);
      setFileContents(data);
    });
  }

  return (
    <div className="App">
      <WindowChrome openPath={openPath} openFile={openFile} />
      <Typography variant="body1">{fileContents}</Typography>
    </div>
  );
}

export default App;
