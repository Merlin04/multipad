import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ModuleProps } from './modules';
import fs from 'fs';
import path from 'path';
import { ControlledEditor, monaco as monacoConfiguration } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { makeStyles } from '@material-ui/core';
const rootPath: string = window.require('electron-root-path').rootPath;

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
        const fileContents = props.openPath === undefined ? "" : fs.readFileSync(props.openPath, 'utf8');
        editorRef.current?.setModel(monaco.editor.createModel(
            fileContents,
            undefined,
            new monaco.Uri().with({ path: props.openPath ?? "file.txt" })
        ))
        setEditorContents(fileContents);
        console.log(editorRef.current);
    }, [props.openPath]);

    return (
        <ControlledEditor
            className={styles.editor}
            editorDidMount={handleEditorDidMount}
            onChange={editorChange}
            value={editorContents}
            language="javascript"
            height="100%"
        />
    );
}