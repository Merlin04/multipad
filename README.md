# multipad
![Logo](logo.png)
### Notepad for the future - a swiss army knife file editor/viewer

**Note: Multipad is still being actively developed and may contain bugs. Don't use it on any important documents until I've been able to test everything, fix all of the bugs, and make a release version.**

Multipad is a multitool for editing and viewing files. It's a modern Notepad replacement, but its capabilities go far beyond those of Notepad.

Often, you need a text editor in between Notepad and an IDE like VS Code - Notepad doesn't have features like auto indentation or syntax highlighting, and for a while didn't even support Unix line endings. However, VS Code is way too heavy for just editing a single text file; it works better when editing an entire project. This is where Multipad comes in. It has just enough powerful features to make editing single files much easier, but not so much that it becomes overkill and too complex for the task.

## Features
- Intuitive modern Material UI
- Multiple "modules" (editors/viewers) that Multipad automatically switches between depending on the file type
- Modules:
- Code: Edit files with the Monaco editor that powers Visual Studio Code
- Markdown: Edit Markdown files with syntax shortcut buttons and a preview mode
- Image: View images (created as an example to show what the module system can do)
- Module-based architecture allows for very easy expansion

## Technologies
Multipad uses Electron, React, and Typescript to run the core app, as well as Material-UI as the UI framework. The Code module uses Monaco, an open source code editor originally written for VS Code. The Markdown module uses a slightly modified EasyMDE markdown editor.

## Building a module
Each of Multipad's modules is a standard React component (under `src/modules`), along with some other bits of code. As an example we'll go through the process of making a basic text editor module.

First, we'll create a file in `src/modules` with the name `TestModule.tsx` (it already exists, but you can follow along with a different module name) and these contents:
```tsx
import React from 'react';
import { makeStyles } from '@material-ui/core';
import { useModule } from '../providers/EditorStateProvider';

const useStyles = makeStyles((theme) => ({
    // Add styles here
}));

export default function TestModule() {
    const styles = useStyles();
    const { openPath } = useModule();
    
    return (
        <h1>Currently open file: {openPath}</h1>
    );
}
```

Multipad uses `Material-UI`, which comes with its own `makeStyles` styling system. Add CSS rules as a JavaScript object in the call to `makeStyles` like this:

```js
exampleClass: {
    color: "red"
}
```

Then you can add the style to an element like this:

```jsx
<div className={styles.exampleClass}>Example text</div>
```

After the call to `useStyles` we use the `useModule` hook. This is part of Multipad and it provides a lot of properties, some of which are app state and others are functions you can call to trigger actions in the app like saving and opening files. Most of these are used in other places in Multipad but one you will almost certainly use in your module is `openPath`, which is the path to the currently open file, or `undefined` if nothing is open. 

Right now, this module can't edit files, only display the file name, so we will use the `useConfigureModule` hook to tell Multipad this:

```tsx
// Edit the import
import { useConfigureModule, useModule } from '../providers/EditorStateProvider';

// After the call to useModule
useConfigureModule(useMemo(() => ({
    showSave: false
}), []));
```

Wrapping the configuration object in `useMemo` is necessary because if something in `useModule` uses something in your configuration it will cause the component to be stuck in a render loop. Multipad includes custom ESLint rules to warn you if you don't do this.

Now, you need to edit `src/modules/modules.ts`. First add a new item to the `ModuleOption` enum that is the name of your module:
```ts
export enum ModuleOption {
    [...]
    Test
}
```

Then, you need to modify the if statements in `getModuleOptions`. These are responsible for choosing the module for each file type. Currently this system is a bit cumbersome, once I start to add more modules I'll look into changing this. This test module will be a basic text editor, so it handle anything except for binary files (like images). We can add the module as a "second" option (which means it won't be the default, but will show up under "Other options" in the hamburger menu) to the handler for Markdown and unknown files and as "remaining" for image files:

```ts
export function getModuleOptions(filePath: string): GetModuleOptionsResults {
    const ext = path.extname(filePath);
    if([".md", ".markdown", ".mdown"].includes(ext)) {
        return {
            top: ModuleOption.Markdown,
            seconds: [
                ModuleOption.Monaco,
                ModuleOption.Test
            ],
            remaining: [
                ModuleOption.Image
            ]
        }
    }
    else if([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
        return {
            top: ModuleOption.Image,
            remaining: [
                ModuleOption.Monaco,
                ModuleOption.Markdown,
                ModuleOption.Test
            ]
        }
    }
    else {
        return {
            top: ModuleOption.Monaco,
            seconds: [
                ModuleOption.Markdown,
                ModuleOption.Test
            ],
            remaining: [
                ModuleOption.Image
            ]
        }
    }
}
```

We also need to configure the display name of the module in `getNameOfOption` by adding a `case` to the switch statement:

```ts
case ModuleOption.Test: {
    return "Test module";
}
```

Now, you should be able to test the module. If you haven't already, run `yarn` to install the dependencies, then run `yarn start` to run Multipad. If you open a file and switch to the "Test module" option in the hamburger menu, you should see the path of the open file. Also note that the save option is hidden when you are in your module; this is a result of your module configuration.

# TODO: finish tutorial