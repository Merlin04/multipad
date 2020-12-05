import React, { useMemo } from 'react';
import { ModuleProps } from './modules';
import fs from 'fs';
import path from 'path';
import Editor, { monaco } from '@monaco-editor/react';
import 'monaco-editor';
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


monaco.config({
    paths: {
        vs: uriFromPath(
            path.join(rootPath, 'node_modules/monaco-editor/min/vs')
        )        
    }
});

export default function MonacoModule(props: ModuleProps) {
    const fileContents = useMemo(() => {
        if(props.openPath === undefined) return "";
        return fs.readFileSync(props.openPath, 'utf8');
    }, [props.openPath]);

    return (
        <Editor language="javascript" height="90vh" />
    );
}