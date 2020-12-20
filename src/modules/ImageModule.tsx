import { makeStyles } from '@material-ui/core';
import { useConfigureModule, useModule } from '../providers/EditorStateProvider';
import path from 'path';
import { useMemo } from 'react';

const useStyles = makeStyles((theme) => ({
    editor: {
        marginTop: "3px",
        "& img": {
            width: "100%"
        }
    }
}));

export default function ImageModule() {
    const styles = useStyles();
    const { openPath } = useModule();

    useConfigureModule(useMemo(() => ({
        showSave: false
    }), []));
        
    if(openPath === undefined) return <div></div>
    return (
        <div className={styles.editor}>
            <img src={path.join('file://', openPath)} alt={openPath}/>
        </div>
    );
}