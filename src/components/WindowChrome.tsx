import React, { useState } from 'react';
import { AppBar, Toolbar, IconButton, Typography, makeStyles, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, ListSubheader } from '@material-ui/core';
import {
    Menu as MenuIcon,
    Save as SaveIcon,
    InsertDriveFile as NewIcon,
    FolderOpen as OpenIcon,
    Minimize as MinimizeIcon,
    Maximize as MaximizeIcon,
    Close as CloseIcon } from '@material-ui/icons';
import path from 'path';
import { useModule, useOpenPath } from '../providers/EditorStateProvider';
import defer from 'lodash/defer';
import fs from 'fs';
import { getModuleOptions, getNameOfOption, ModuleOption } from '../modules/modules';
const { BrowserWindow, dialog } = window.require("electron").remote;

interface ChromeProps {
    saveFile: {(): void},
    newFile: {(): void},
    openFile: {(): void}
}

interface IMainButton {
    icon: React.ReactNode,
    text: string,
    action: {(): void}
}

const useStyles = makeStyles((theme) => ({
    windowChrome: {
        "-webkit-app-region": "drag"
    },
    button: {
        "-webkit-app-region": "no-drag"
    },
    menuButton: {
        marginRight: theme.spacing(2)
    },
    title: {
        flexGrow: 1
    },
    toolbar: {
        height: "2.5rem",
        paddingLeft: "16px"
    },
    sectionHeader: {
        fontSize: "1rem"
    },
    subheader: {
        fontSize: "0.8em",
        lineHeight: "1rem"
    },
    drawer: {
        maxWidth: "170px"
    },
    fileName: {
        wordBreak: "break-all",
        lineHeight: "1.2rem",
        marginTop: "8px",
        marginBottom: "8px"
    }
}));

export default function WindowChrome(props: ChromeProps) {
    const styles = useStyles();
    const { openPath, setOpenPath } = useOpenPath();
    const { setModule } = useModule();
    const [ drawerOpen, setDrawerIsOpen ] = useState(false);

    const mainButtons: IMainButton[] = [
        {
            icon: <SaveIcon/>,
            text: "Save",
            action: props.saveFile
        },
        {
            icon: <NewIcon/>,
            text: "New",
            action: props.newFile
        },
        {
            icon: <OpenIcon/>,
            text: "Open",
            action: props.openFile
        }
    ];    

    function minimize() {
        console.log(BrowserWindow);
        BrowserWindow.getFocusedWindow()?.minimize();
    }
    function maximize() {
        const w = BrowserWindow.getFocusedWindow();
        if(w.isMaximized()) {
            w.unmaximize();
        }
        else {
            w.maximize();
        }
    }
    function close() {
        BrowserWindow.getFocusedWindow()?.close();
    }

    function saveAs() {
        // This shouldn't vary between modules, all it does is copy the file and set the path to the new one
        if(openPath === undefined) {
            props.saveFile();
            return;
        }
        const result: string | undefined = dialog.showSaveDialogSync();
        if(result === undefined) return;
        fs.copyFile(openPath, result, (err) => {
            if(err) console.error(err);
            setOpenPath(result);
        })
    }

    function OptionButton({ option }: { option: ModuleOption }) {
        return (
            <ListItem button onClick={() => { setDrawerIsOpen(false); setModule(option); }}>
                <ListItemText>{getNameOfOption(option)}</ListItemText>
            </ListItem>
        );
    }

    const moduleOptions = getModuleOptions(openPath ?? "file.txt");

    return (
        <>
            <AppBar position="static" className={styles.windowChrome}>
                <Toolbar variant="dense">
                    <IconButton onClick={() => { setDrawerIsOpen(true); }} edge="start" className={styles.button + ' ' + styles.menuButton} color="inherit" aria-label="menu">
                    <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" className={styles.title}>{(openPath !== undefined ? path.basename(openPath) : "New file") + " - Multipad"}</Typography>
                    {mainButtons.map((item) => (
                        <IconButton onClick={item.action} className={styles.button} color="inherit">{item.icon}</IconButton>
                    ))}
                    <IconButton onClick={minimize} className={styles.button} color="inherit"><MinimizeIcon/></IconButton>
                    <IconButton onClick={maximize} className={styles.button} color="inherit"><MaximizeIcon/></IconButton>
                    <IconButton onClick={close} edge="end" className={styles.button} color="inherit"><CloseIcon/></IconButton>
                </Toolbar>
            </AppBar>
            <Drawer anchor="left" open={drawerOpen} onClose={() => { setDrawerIsOpen(false); }}>
                <List className={styles.drawer}>
                    <div className={styles.toolbar}>
                        <Typography variant="h6">Multipad</Typography>
                    </div>
                    <Divider />
                    <ListSubheader className={styles.fileName}>{openPath ?? "Not saved"}</ListSubheader>
                    <Divider />
                    {mainButtons.map((item) => (
                        <ListItem button onClick={() => { setDrawerIsOpen(false); defer(item.action); }}>
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText>{item.text}</ListItemText>
                        </ListItem>
                    ))}
                    <ListItem button onClick={() => { defer(saveAs); }}>
                        <ListItemIcon><SaveIcon/></ListItemIcon>
                        <ListItemText>Save as</ListItemText>
                    </ListItem>
                    <Divider />
                    <ListSubheader className={styles.sectionHeader}>Switch module</ListSubheader>
                    {moduleOptions.top !== undefined && (
                        <>
                            <ListSubheader className={styles.subheader}>Recommended</ListSubheader>
                            <OptionButton option={moduleOptions.top}/>
                        </>
                    )}
                    {moduleOptions.seconds && (
                        <>
                            <ListSubheader className={styles.subheader}>Other options</ListSubheader>
                            {moduleOptions.seconds.map((item) => (
                                <OptionButton key={item} option={item}/>
                            ))}
                        </>
                    )}
                    {moduleOptions.remaining && (
                        <>
                            <ListSubheader className={styles.subheader}>Not recommended</ListSubheader>
                            {moduleOptions.remaining.map((item) => (
                                <OptionButton key={item} option={item}/>
                            ))}
                        </>
                    )}
                </List>
            </Drawer>
        </>
    );
}