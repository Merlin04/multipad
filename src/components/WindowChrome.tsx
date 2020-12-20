import React, { useState } from 'react';
import { AppBar, Toolbar, IconButton, Typography, makeStyles, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, ListSubheader } from '@material-ui/core';
import {
    Menu as MenuIcon,
    Save as SaveIcon,
    InsertDriveFile as NewIcon,
    FolderOpen as OpenIcon,
    Minimize as MinimizeIcon,
    Maximize as MaximizeIcon,
    Close as CloseIcon,
    Brightness4 as DarkIcon,
    BrightnessHigh as LightIcon } from '@material-ui/icons';
import path from 'path';
import { useModule } from '../providers/EditorStateProvider';
import { useDarkTheme } from '../providers/DarkThemeProvider';
import defer from 'lodash/defer';
import { getModuleOptions, getNameOfOption, ModuleOption } from '../modules/modules';
const { BrowserWindow, dialog } = window.require("electron").remote;

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

export default function WindowChrome() {
    const styles = useStyles();
    const { openPath, moduleConfig, save, saveAs, newFile, open, setModule } = useModule();
    const [ isDark, setIsDark ] = useDarkTheme();
    const [ drawerOpen, setDrawerIsOpen ] = useState(false);

    let mainButtons: IMainButton[] = [
        {
            icon: <NewIcon/>,
            text: "New",
            action: newFile
        },
        {
            icon: <OpenIcon/>,
            text: "Open",
            action: () => {
                const results: string[] | undefined = dialog.showOpenDialogSync();
                if(results === undefined) return;
                const file = results[0];
                open(file);
            }
        }
    ];
    if(moduleConfig.showSave) {
        mainButtons.unshift({
            icon: <SaveIcon/>,
            text: "Save",
            action: save
        });
    }

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

    function OptionButton({ option }: { option: ModuleOption }) {
        return (
            <ListItem button onClick={() => { setDrawerIsOpen(false); setModule(option); }}>
                <ListItemText>{getNameOfOption(option)}</ListItemText>
            </ListItem>
        );
    }

    // Options as in choices, not configuration. Configuration is in moduleConfig
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
                        <IconButton key={item.text} onClick={item.action} className={styles.button} color="inherit">{item.icon}</IconButton>
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
                        <ListItem key={item.text} button onClick={() => { setDrawerIsOpen(false); defer(item.action); }}>
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText>{item.text}</ListItemText>
                        </ListItem>
                    ))}
                    {(moduleConfig.showSave || openPath !== undefined) && (
                        <ListItem button onClick={() => { defer(saveAs); }}>
                            <ListItemIcon><SaveIcon/></ListItemIcon>
                            <ListItemText>Save as</ListItemText>
                        </ListItem>
                    )}
                    <Divider />
                    <ListItem button onClick={() => { setIsDark(!isDark); }}>
                        <ListItemIcon>{ isDark ? <LightIcon/> : <DarkIcon /> }</ListItemIcon>
                        <ListItemText>Theme</ListItemText>
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