import React, { useCallback, useState } from 'react';
import fs from 'fs';
import { makeStyles } from '@material-ui/core';
import { useModule, useOnOpen, useOnSave } from '../providers/EditorStateProvider';
import SimpleMDEEditor from 'react-simplemde-editor';
import "easymde/dist/easymde.min.css";
import { genericEditorOnSaveCallback } from './modules';
const { dialog } = window.require("electron").remote;

const useStyles = makeStyles((theme) => ({
    editor: {
        marginTop: "3px",
        height: "100%",
        overflowY: "auto",
        "& .EasyMDEContainer": {
            height: "100%",
            display: "flex",
            flexDirection: "column",
            "& .guide": {
                display: "none"
            },
            // Once Chromium supports :has this will start working, for now it doesn't but it isn't that big of an issue
            "& i:has(+ .guide)": {
                display: "none"
            }
        },
        "& .CodeMirror": {
            height: "100%",
            borderRadius: 0
        },
        "& .editor-toolbar": {
            border: 0
        }
    }
}));

export default function MarkdownModule() {
    const styles = useStyles();
    const [ editorContents, setEditorContents ] = useState("");
    const { openPath } = useModule();

    useOnOpen(useCallback((newPath) => {
        const fileContents = newPath === undefined ? "" : fs.readFileSync(newPath, 'utf8');
        setEditorContents(fileContents);
    }, [setEditorContents]));

    useOnSave(useCallback(() => genericEditorOnSaveCallback(openPath, dialog, editorContents), [openPath, editorContents]));

    return (
        <SimpleMDEEditor className={styles.editor} onChange={setEditorContents} value={editorContents}/>
    )
}