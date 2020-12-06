import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ModuleProps } from './modules';
import fs from 'fs';
import path from 'path';
import { ControlledEditor, monaco as monacoConfiguration } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { makeStyles } from '@material-ui/core';
import { useOpenPath } from '../providers/OpenPathProvider';
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

console.log(rootPath);


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

export default function MonacoModule(props: ModuleProps) {
    const styles = useStyles();
    const { openPath, setOpenPath } = useOpenPath();
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
    const [ editorContents, setEditorContents ] = useState("");

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

    useEffect(() => {
        monaco.editor.getModels().forEach(model => model.dispose());
        const fileContents = openPath === undefined ? "" : fs.readFileSync(openPath, 'utf8');
        editorRef.current?.setModel(monaco.editor.createModel(
            fileContents,
            undefined,
            new monaco.Uri().with({ path: openPath ?? "file.txt" })
        ))
        setEditorContents(fileContents);
        console.log(editorRef.current);
    }, [openPath]);

    useEffect(() => {
        if(props.lastSave === undefined) return;
        let savePath = openPath;
        if(savePath === undefined) {
            const result: string | undefined = dialog.showSaveDialogSync();
            if(result === undefined) return;
            setOpenPath(result);
            savePath = result;
        }
        fs.writeFileSync(savePath, editorContents);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.lastSave]);

    useEffect(() => {
        if(props.newToggle === undefined) return;
        setOpenPath(undefined);
    }, [props.newToggle])

    return (
        <ControlledEditor
            className={styles.editor}
            editorDidMount={handleEditorDidMount}
            onChange={editorChange}
            value={editorContents}
            height="100%"
        />
    );
}