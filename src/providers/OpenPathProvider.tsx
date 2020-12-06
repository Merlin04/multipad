import React, { useState, createContext, useContext } from 'react';

export const OpenPathContext = createContext([undefined, (_: string | undefined) => {}] as [string | undefined, {(_ : string | undefined) : void}]);

interface OpenPathProviderProps {
    children : React.ReactNode
}

export function OpenPathProvider(props: OpenPathProviderProps) {
    const pathState = useState(undefined as string | undefined);
    return (
        <OpenPathContext.Provider value={pathState}>
            { props.children }
        </OpenPathContext.Provider>
    ); 
}

export function useOpenPath() {
    const [openPath, setOpenPath] = useContext(OpenPathContext);
    return { openPath, setOpenPath };
}