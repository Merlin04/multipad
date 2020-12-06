import { makeStyles } from '@material-ui/core';
import React, { useState } from 'react';
import WindowChrome from './components/WindowChrome';
import { chooseModule } from './modules/modules';
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

  const Module = chooseModule(openPath ?? "f.txt");

  return (
    <div className={"App " + styles.app}>
      <WindowChrome openPath={openPath} openFile={openFile} />
      <Module openPath={openPath} />
    </div>
  );
}

export default App;
