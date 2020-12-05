import { Typography } from '@material-ui/core';
import React from 'react';
import WindowChrome from './components/WindowChrome';

function App() {
  return (
    <div className="App">
      <WindowChrome />
      <Typography variant="h1">Hello Material-UI and Electron!</Typography>
    </div>
  );
}

export default App;
