import React, { useState, createContext, useContext } from 'react';
import { ModuleOption } from '../modules/modules';

export const OpenPathContext = createContext([undefined, (_: string | undefined) => {}] as [string | undefined, {(_ : string | undefined) : void}]);
export const ModuleContext = createContext([undefined as ModuleOption | undefined, (_: ModuleOption) => {}] as [ModuleOption | undefined, {(_: ModuleOption | undefined) : void}]);

interface EditorStateProviderProps {
    children : React.ReactNode
}

export function EditorStateProvider(props: EditorStateProviderProps) {
    const pathState = useState<string | undefined>(undefined);
    const moduleState = useState<ModuleOption | undefined>(undefined);

    return (
        <OpenPathContext.Provider value={pathState}>
            <ModuleContext.Provider value={moduleState}>
                { props.children }
            </ModuleContext.Provider>
        </OpenPathContext.Provider>
    ); 
}

export function useOpenPath() {
    const [openPath, setOpenPath] = useContext(OpenPathContext);
    return { openPath, setOpenPath };
}

export function useModule() {
    const [module, setModule] = useContext(ModuleContext);
    return { module, setModule };
}