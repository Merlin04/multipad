import path from 'path';
import MonacoModule from './MonacoModule';

export interface ModuleProps {
    openPath: string | undefined
}

export function chooseModule(filePath: string) {
    const ext = path.extname(filePath);
    return MonacoModule;
    /*if(ext === "txt") {
    }*/
}