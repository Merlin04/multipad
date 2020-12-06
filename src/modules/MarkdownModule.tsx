import React, { useEffect, useState } from 'react';
import { ModuleProps } from './modules';
import fs from 'fs';
import { makeStyles } from '@material-ui/core';
import { useOpenPath } from '../providers/EditorStateProvider';
import SimpleMDEEditor from 'react-simplemde-editor';
import "easymde/dist/easymde.min.css";
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

export default function MarkdownModule(props: ModuleProps) {
    const styles = useStyles();
    const { openPath, setOpenPath } = useOpenPath();
    const [ editorContents, setEditorContents ] = useState("");

    useEffect(() => {
        const fileContents = openPath === undefined ? "" : fs.readFileSync(openPath, 'utf8');
        setEditorContents(fileContents);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.newToggle])

    return (
        <SimpleMDEEditor className={styles.editor} onChange={setEditorContents} value={editorContents}/>
    )
}