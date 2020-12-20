import { makeStyles } from '@material-ui/core';
import React, { useMemo } from 'react';
import WindowChrome from './components/WindowChrome';
import { ModuleOption, moduleOptionToModule } from './modules/modules';
import { useModule } from './providers/EditorStateProvider';

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
  const { module } = useModule();

  /*useEffect(() => {
    //setModule(getModuleOptions(openPath ?? "file.txt").top ?? ModuleOption.Monaco);
    // TODO: this should read the path from command line args and set it accordingly
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);*/

  const Module = useMemo(
    () => moduleOptionToModule(module ?? ModuleOption.Monaco),
    [module]
  );

  return (
    <div className={"App " + styles.app}>
      <WindowChrome />
      <Module />
    </div>
  );
}

export default App;
