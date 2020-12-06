# multipad
![Logo](logo.png)
### Notepad for the future - a swiss army knife file editor/viewer

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