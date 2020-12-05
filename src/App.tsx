import { Typography } from '@material-ui/core';
import React, { useState } from 'react';
import WindowChrome from './components/WindowChrome';
import fs from 'fs';
import path from 'path';
import MonacoModule from './modules/MonacoModule';
const { dialog } = window.require("electron").remote;

function App() {
  const [ openPath, setOpenPath ] = useState(undefined as string | undefined);

  async function openFile() {
    const results: {
      cancelled: boolean,
      filePaths: string[]
    } = await dialog.showOpenDialog();
    if(results.cancelled) return;
    const file = results.filePaths[0];
    setOpenPath(file);
  }

  return (
    <div className="App">
      <WindowChrome openPath={openPath} openFile={openFile} />
      <MonacoModule openPath={openPath} />
    </div>
  );
}

export default App;
