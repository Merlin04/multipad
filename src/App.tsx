import { makeStyles } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import WindowChrome from './components/WindowChrome';
import { getModuleOptions, ModuleOption, moduleOptionToModule, ModuleProps } from './modules/modules';
import { useModule, useOpenPath } from './providers/EditorStateProvider';
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
  const [ lastSave, setLastSave ] = useState<Date | undefined>(undefined);
  const [ newToggle, setNewToggle ] = useState<boolean | undefined>(undefined);
  const { openPath, setOpenPath} = useOpenPath();
  const { module, setModule } = useModule();

  useEffect(() => {
    setModule(getModuleOptions(openPath ?? "file.txt").top ?? ModuleOption.Monaco);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLastSave(undefined);
    setNewToggle(undefined);
  }, [module])

  async function openFile() {
    const results: {
      cancelled: boolean,
      filePaths: string[]
    } = await dialog.showOpenDialog();
    if(results.cancelled) return;
    const file = results.filePaths[0];
    setOpenPath(file);
    setModule(getModuleOptions(file).top ?? ModuleOption.Monaco);
  }

  function saveFile() {
    setLastSave(new Date());
  }

  function newFile() {
    setNewToggle(!newToggle);
  }

  const Module = moduleOptionToModule(module ?? ModuleOption.Monaco);

  return (
    <div className={"App " + styles.app}>
      <WindowChrome saveFile={saveFile} newFile={newFile} openFile={openFile} />
      <Module lastSave={lastSave} newToggle={newToggle} />
    </div>
  );
}

export default App;
