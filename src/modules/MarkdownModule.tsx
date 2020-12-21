import React, { useCallback, useState } from 'react';
import fs from 'fs';
import { makeStyles } from '@material-ui/core';
import { useModule, useOnMarshalIn, useOnMarshalOut, useOnOpen, useOnSave } from '../providers/EditorStateProvider';
import SimpleMDEEditor from 'react-simplemde-editor';
import "easymde/dist/easymde.min.css";
import { genericEditorOnSaveCallback } from './modules';
import { useDarkTheme } from '../providers/DarkThemeProvider';
const { dialog } = window.require("electron").remote;

const useStyles = makeStyles((theme) => ({
    editor: {
        marginTop: "3px",
        height: "100%",
        overflowY: "auto",
        "& .EasyMDEContainer": {
            height: "100%",
            display: "flex",
            flexDirection: "column"
        },
        "& .CodeMirror": {
            height: "100%",
            borderRadius: 0
        },
        "& .editor-toolbar": {
            border: 0
        }
    },
    editorDark: {
        "& .CodeMirror": {
            color: theme.palette.common.white,
            borderColor: theme.palette.background.paper,
            backgroundColor: "inherit"
        },
        "& .cm-s-easymde .CodeMirror-cursor": {
            borderColor: theme.palette.background.paper
        },
        "& .editor-toolbar > *": {
            color: theme.palette.common.white
        },
        "& .editor-toolbar > .active, .editor-toolbar > button:hover, .editor-preview pre, .cm-s-easymde .cm-comment": {
            backgroundColor: theme.palette.background.paper
        },
        "& .editor-preview": {
            backgroundColor: theme.palette.background.default
        }
    }
}));

export default function MarkdownModule() {
    const styles = useStyles();
    const [ editorContents, setEditorContents ] = useState("");
    const { openPath } = useModule();
    const [ isDark ] = useDarkTheme();

    useOnOpen(useCallback((newPath) => {
        const fileContents = newPath === undefined ? "" : fs.readFileSync(newPath, 'utf8');
        setEditorContents(fileContents);
    }, [setEditorContents]));

    useOnSave(useCallback(() => genericEditorOnSaveCallback(openPath, dialog, editorContents), [openPath, editorContents]));

    useOnMarshalIn(useCallback(setEditorContents, [setEditorContents]));
    useOnMarshalOut(useCallback(() => editorContents, [editorContents]));

    return (
        <SimpleMDEEditor className={styles.editor + (isDark ? " " + styles.editorDark : "")} onChange={setEditorContents} options={{
            hideIcons: ["guide"]
        }} value={editorContents}/>
    )
}