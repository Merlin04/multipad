import React, { useCallback, useEffect, useRef, useState } from 'react';
import fs from 'fs';
import path from 'path';
import { ControlledEditor, monaco as monacoConfiguration } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { makeStyles } from '@material-ui/core';
import { useModule, useOnMarshalIn, useOnMarshalOut, useOnOpen, useOnSave } from '../providers/EditorStateProvider';
import { genericEditorOnSaveCallback } from './modules';
import { useDarkTheme } from '../providers/DarkThemeProvider';
const rootPath: string = window.require('electron-root-path').rootPath;
const { dialog } = window.require("electron").remote;

function ensureFirstBackSlash(str: string) {
    return str.length > 0 && str.charAt(0) !== '/'
        ? '/' + str
        : str;
}

function uriFromPath(_path: string) {
    const pathName = path.resolve(_path).replace(/\\/g, '/');
    return encodeURI('file://' + ensureFirstBackSlash(pathName));
}

monacoConfiguration.config({
    paths: {
        vs: uriFromPath(
            path.join(rootPath, 'node_modules/monaco-editor/min/vs')
        )        
    }
});

const useStyles = makeStyles((theme) => ({
    editor: {
        marginTop: "3px",
        position: "absolute",
        height: "100%"
    }
}));

export default function MonacoModule() {
    const styles = useStyles();
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
    const [ editorContents, setEditorContents ] = useState("");
    const { openPath } = useModule();
    const [ isDark ] = useDarkTheme();

    function handleEditorDidMount(_: any, editor: any) {
        editorRef.current = editor;
    }

    function editorChange(event: any, value: string | undefined) {
        setEditorContents(value ?? "");
    }

    useEffect(() => {
        window.addEventListener("resize", () => {
            editorRef.current?.layout();
        });
    }, []);

    useOnOpen(useCallback((newPath) => {
        monaco.editor.getModels().forEach(model => model.dispose());
        const fileContents = newPath === undefined ? "" : fs.readFileSync(newPath, 'utf8');
        editorRef.current?.setModel(monaco.editor.createModel(
            fileContents,
            undefined,
            new monaco.Uri().with({ path: newPath ?? "file.txt" })
        ))
        setEditorContents(fileContents);
    }, []));

    useOnSave(useCallback(() => genericEditorOnSaveCallback(openPath, dialog, editorContents), [openPath, editorContents]));

    useOnMarshalIn(useCallback((data) => {
        monaco.editor.getModels().forEach(model => model.dispose());
        editorRef.current?.setModel(monaco.editor.createModel(
            data,
            undefined,
            new monaco.Uri().with({ path: openPath ?? "file.txt" })
        ))
        setEditorContents(data);
    }, [openPath]));

    useOnMarshalOut(useCallback(() => editorContents, [editorContents]))

    return (
        <ControlledEditor
            className={styles.editor}
            theme={isDark ? "dark" : "light"}
            editorDidMount={handleEditorDidMount}
            onChange={editorChange}
            value={editorContents}
            height="100%"
        />
    );
}