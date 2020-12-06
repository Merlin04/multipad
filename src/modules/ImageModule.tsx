import React, { useEffect } from 'react';
import { ModuleOption, ModuleProps } from './modules';
import { makeStyles } from '@material-ui/core';
import { useModule, useOpenPath } from '../providers/EditorStateProvider';
import path from 'path';

const useStyles = makeStyles((theme) => ({
    editor: {
        marginTop: "3px",
        "& img": {
            width: "100%"
        }
    }
}));

export default function ImageModule(props: ModuleProps) {
    const styles = useStyles();
    const { openPath, setOpenPath } = useOpenPath();
    const { setModule } = useModule();

    useEffect(() => {
        if(props.newToggle === undefined) return;
        setOpenPath(undefined);
        setModule(ModuleOption.Monaco);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.newToggle])

    if(openPath === undefined) return <div></div>
    return (
        <div className={styles.editor}>
            <img src={path.join('file://', openPath)} alt={openPath}/>
        </div>
    );
}