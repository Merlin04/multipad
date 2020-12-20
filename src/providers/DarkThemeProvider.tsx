import { createMuiTheme, ThemeProvider } from '@material-ui/core';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ModuleOption } from '../modules/modules';
import { ContextProps, ProviderProps, useModule } from './EditorStateProvider';

const DarkThemeContext = createContext({} as ContextProps<boolean>);

const DARK_BACKGROUND = "#121212";
const LIGHT_BACKGROUND = "#ffffff"

export default function DarkThemeProvider({ children }: ProviderProps) {
    const [ isDark, setIsDark ] = useState(false);
    const { module } = useModule();

    useEffect(() => {
        // Monaco has a different dark theme
        document.body.style.backgroundColor = isDark ? (module === ModuleOption.Monaco ? "#202124" : DARK_BACKGROUND) : LIGHT_BACKGROUND;
    }, [isDark, module]);

    const theme = useMemo(() => createMuiTheme({
        palette: {
            type: isDark ? 'dark' : 'light',
            background: {
                default: isDark ? DARK_BACKGROUND : LIGHT_BACKGROUND
            }
        }
    }), [isDark]);

    return (
        <DarkThemeContext.Provider value={[isDark, setIsDark]}>
            <ThemeProvider theme={theme}>
                { children }
            </ThemeProvider>
        </DarkThemeContext.Provider>
    )
}

export const useDarkTheme = () => useContext(DarkThemeContext);