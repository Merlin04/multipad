import React from 'react';
import { AppBar, Toolbar, IconButton, Button, Typography, makeStyles } from '@material-ui/core';
import { Menu as MenuIcon, Minimize as MinimizeIcon, Maximize as MaximizeIcon, Close as CloseIcon } from '@material-ui/icons';
const { BrowserWindow } = window.require("electron").remote;

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
    }
}));

export default function WindowChrome() {
    const styles = useStyles();

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
        <AppBar position="static" className={styles.windowChrome}>
            <Toolbar variant="dense">
                <IconButton edge="start" className={styles.button + ' ' + styles.menuButton} color="inherit" aria-label="menu">
                <MenuIcon />
                </IconButton>
                <Typography variant="h6" className={styles.title}>
                Multipad
                </Typography>
                <IconButton onClick={minimize} className={styles.button} color="inherit"><MinimizeIcon/></IconButton>
                <IconButton onClick={maximize} className={styles.button} color="inherit"><MaximizeIcon/></IconButton>
                <IconButton onClick={close} edge="end" className={styles.button} color="inherit"><CloseIcon/></IconButton>
            </Toolbar>
        </AppBar>
    );
}