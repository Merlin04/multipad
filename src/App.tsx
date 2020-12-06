import { makeStyles } from '@material-ui/core';
import React, { useState } from 'react';
import WindowChrome from './components/WindowChrome';
import { chooseModule } from './modules/modules';
import { useOpenPath } from './providers/OpenPathProvider';
const { dialog } = window.require("electron").remote;

const useStyles = makeStyles((theme) => ({
  app: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    position: "relative"
  }
}));

function App() {
  const styles = useStyles();
  const [ lastSave, setLastSave ] = useState(undefined as Date | undefined);
  const [ newToggle, setNewToggle ] = useState(undefined as boolean | undefined);
  const { openPath, setOpenPath} = useOpenPath();

  async function openFile() {
    const results: {
      cancelled: boolean,
      filePaths: string[]
    } = await dialog.showOpenDialog();
    if(results.cancelled) return;
    const file = results.filePaths[0];
    setOpenPath(file);
  }

  const Module = chooseModule(openPath ?? "file.txt");

  function saveFile() {
    setLastSave(new Date());
  }

  function newFile() {
    setNewToggle(!newToggle);
  }

  return (
    <div className={"App " + styles.app}>
      <WindowChrome saveFile={saveFile} newFile={newFile} openFile={openFile} />
      <Module lastSave={lastSave} newToggle={newToggle} />
    </div>
  );
}

export default App;
