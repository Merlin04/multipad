import React, { useState } from 'react';
import { AppBar, Toolbar, IconButton, Typography, makeStyles, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider } from '@material-ui/core';
import {
    Menu as MenuIcon,
    Save as SaveIcon,
    InsertDriveFile as NewIcon,
    FolderOpen as OpenIcon,
    Minimize as MinimizeIcon,
    Maximize as MaximizeIcon,
    Close as CloseIcon } from '@material-ui/icons';
import path from 'path';
import { useOpenPath } from '../providers/OpenPathProvider';
import defer from 'lodash/defer';
const { BrowserWindow } = window.require("electron").remote;

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
    }
}));

export default function WindowChrome(props: ChromeProps) {
    const styles = useStyles();
    const { openPath } = useOpenPath();
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
                <List>
                    <div className={styles.toolbar}>
                        <Typography variant="h6">Multipad</Typography>
                    </div>
                    <Divider />
                    {mainButtons.map((item) => (
                        <ListItem button onClick={() => { setDrawerIsOpen(false); defer(item.action); }}>
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText>{item.text}</ListItemText>
                        </ListItem>
                    ))}
                </List>
            </Drawer>
        </>
    );
}