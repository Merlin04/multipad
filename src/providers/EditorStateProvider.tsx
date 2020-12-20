import React, { useState, createContext, useContext, useEffect } from 'react';
import { getModuleOptions, ModuleOption } from '../modules/modules';
import fs from 'fs';
const { dialog } = window.require("electron").remote;

// setState can accept a parameter of type T or a function which returns a value of type T
type StateHookValues<T> = [T, {(_: (T | {(): T})): void}];
export type ContextProps<T> = [T, {(_: T): void}];
type Callback = {(): void};
type SaveCallback = {(): string | void};
type OpenCallback = {(path: string | undefined): void};
type BeforeModuleSwitchCallback = {(): string};
type AfterModuleSwitchCallback = {(data: string): void};

const DEFAULT_MODULE_CONFIG = {
    showSave: true
};

//#region Contexts

export const OpenPathContext = createContext([undefined, {}] as ContextProps<string | undefined>);
export const ModuleContext = createContext([ModuleOption.Monaco, {}] as ContextProps<ModuleOption>);

const ModuleConfigContext = createContext({} as ContextProps<ModuleConfig>);
const OnSaveContext = createContext({} as ContextProps<SaveCallback | undefined>);
const OnOpenContext = createContext({} as ContextProps<OpenCallback | undefined>);
const OnNewContext = createContext({} as ContextProps<Callback | undefined>);
const OnBeforeModuleSwitchContext = createContext({} as ContextProps<BeforeModuleSwitchCallback | undefined>);
const OnAfterModuleSwitchContext = createContext({} as ContextProps<AfterModuleSwitchCallback | undefined>);

//#endregion
//#region Flags
// These are regular variables as opposed to contexts so that changing them doesn't rerender the components which access them
// They indicate to a useOn function that it should do something else when it is run
// If I used context it would run itself when the value changes, which I don't want

// useOnOpen: run the open function
let OpenFlag: undefined | string = undefined;

//#endregion

interface MultipleContextsProps {
    contexts: React.ReactNode[],
    children: React.ReactNode
}

export const MultipleContexts = ({ contexts, children }: MultipleContextsProps) =>
    [
        // @ts-ignore
        { ...contexts[0], props: { ...contexts[0].props, children } },
        ...contexts.slice(1),
    ].reduce((acc, cur) => ({ ...cur, props: { ...cur.props, children: acc } }));

// Needs to be used on all useState<T> where T is a function type
function functionStateWrapper<T>(state: StateHookValues<T>): [T, {(_: T): void}] {
    return [
        state[0],
        (newValue: T) => {
            state[1](() => newValue);
        }
    ]
}

export interface ProviderProps {
    children?: React.ReactNode
}

export function EditorStateProvider(props: ProviderProps) {
    const pathState = useState<string | undefined>(undefined);
    const moduleState = useState<ModuleOption>(ModuleOption.Monaco);
    const moduleConfigState = useState<ModuleConfig>(DEFAULT_MODULE_CONFIG);

    const onSaveState = functionStateWrapper<SaveCallback | undefined>(useState<SaveCallback | undefined>(undefined));
    const onOpenState = functionStateWrapper<OpenCallback | undefined>(useState<OpenCallback | undefined>(undefined));
    const onNewState = functionStateWrapper<Callback | undefined>(useState<Callback | undefined>(undefined));
    const onBeforeModuleSwitchState = functionStateWrapper<BeforeModuleSwitchCallback | undefined>(
        useState<BeforeModuleSwitchCallback | undefined>(undefined));
    const onAfterModuleSwitchState = functionStateWrapper<AfterModuleSwitchCallback | undefined>(
        useState<AfterModuleSwitchCallback | undefined>(undefined));

    return (
        <MultipleContexts contexts={[
            <OpenPathContext.Provider value={pathState}/>,
            <ModuleContext.Provider value={moduleState}/>,
            <ModuleConfigContext.Provider value={moduleConfigState}/>,
            <OnSaveContext.Provider value={onSaveState}/>,
            <OnOpenContext.Provider value={onOpenState}/>,
            <OnNewContext.Provider value={onNewState}/>,
            <OnBeforeModuleSwitchContext.Provider value={onBeforeModuleSwitchState}/>,
            <OnAfterModuleSwitchContext.Provider value={onAfterModuleSwitchState}/>
        ]}>
            { props.children }
        </MultipleContexts>
    );
}

interface ModuleConfig {
    showSave: boolean
}

//#region Module hooks

function useGenericModuleHook<T extends {(...args: any[]): any}>(callback: T, context: React.Context<ContextProps<T | undefined>>){
    // react.dependencylist
    const [, setCallback] = useContext(context);
    // Memoize the callback so we only set the state and cause rerenders when the callback has actually changed
    // TODO: possibly add module to this, not sure
    // const memoizedCallback = useCallback(callback, deps);
    useEffect(() => {
        setCallback(callback);
    });
}

export function useConfigureModule(config: ModuleConfig) {
    const [, setModuleConfig] = useContext(ModuleConfigContext);
    useEffect(() => {
        setModuleConfig(config);
    });
}

export function useOnSave(callback: SaveCallback) {
    useGenericModuleHook(callback, OnSaveContext);
}

export function useOnOpen(callback: OpenCallback) {
    useGenericModuleHook(callback, OnOpenContext);
    // If I don't use useEffect it will set the state before the useState call has completed correctly
    // (from experimentation it seems to set the value to the initial one through the parameter twice)
    useEffect(() => {
        if(OpenFlag !== undefined) {
            callback(OpenFlag);
            OpenFlag = undefined;
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}

export function useOnNew(callback: Callback) {
    useGenericModuleHook(callback, OnNewContext);
}

// Called before module switch to keep any unsaved data
export function useOnBeforeModuleSwitch(callback: BeforeModuleSwitchCallback) {
    useGenericModuleHook(callback, OnBeforeModuleSwitchContext);
}

// Called after module switch to load unsaved data from previous module
export function useOnAfterModuleSwitch(callback: AfterModuleSwitchCallback) {
    useGenericModuleHook(callback, OnAfterModuleSwitchContext);
}

//#endregion

// Used in a non-module component to get information about the current module, call functions like save/open/new, and change the module
export function useModule() {
    const [module, contextSetModule] = useContext(ModuleContext);
    const [moduleConfig, setModuleConfig] = useContext(ModuleConfigContext);
    const [contextSave, contextSetSave] = useContext(OnSaveContext);
    const [contextOpen, contextSetOpen] = useContext(OnOpenContext);
    const [contextNew, contextSetNew] = useContext(OnNewContext);
    const [openPath, setOpenPath] = useContext(OpenPathContext);
    const [beforeModuleSwitch, contextSetBeforeModuleSwitch] = useContext(OnBeforeModuleSwitchContext);
    const [, contextSetAfterModuleSwitch] = useContext(OnAfterModuleSwitchContext);

    const setModuleAndConfig = (option: ModuleOption) => {
        // Set the module config to defaults so if the module doesn't call useConfigureModule it won't use the previous module's config
        setModuleConfig({
            showSave: true
        });
        // Reset all of the callbacks
        contextSetSave(undefined);
        contextSetOpen(undefined);
        contextSetNew(undefined);
        contextSetBeforeModuleSwitch(undefined);
        contextSetAfterModuleSwitch(undefined);

        // Clear all of the flags
        OpenFlag = undefined;

        // Switch the module
        contextSetModule(option);
    };

    const save = () => {
        if(contextSave === undefined) return;
        const newPath = contextSave();
        if(newPath !== undefined) {
            setOpenPath(newPath);
        }
    };

    const open = (newPath: string | undefined) => {
        let openFlagSet = false;
        if(newPath !== undefined) {
            const newModule = getModuleOptions(newPath).top ?? ModuleOption.Monaco;
            if(newModule !== module) {
                setModuleAndConfig(getModuleOptions(newPath).top ?? ModuleOption.Monaco);
                OpenFlag = newPath;
                openFlagSet = true;
            }
        }
        if(contextOpen !== undefined && !openFlagSet) contextOpen(newPath);
        setOpenPath(newPath);
    };

    return {
        module,
        moduleConfig,
        openPath,
        // Separate functions allow for control over what happens on these events
        save,
        saveAs: () => {
            // This shouldn't vary between modules, all it does is copy the file and set the path to the new one
            if(openPath === undefined) {
                if(moduleConfig.showSave) {
                    save();
                }
                else {
                    throw new Error("Attempted to saveAs when the module cannot save and the openPath is undefined");
                }
                return;
            }
            const result: string | undefined = dialog.showSaveDialogSync();
            if(result === undefined) return;
            fs.copyFile(openPath, result, (err) => {
                if(err) console.error(err);
                setOpenPath(result);
            })
        },
        open,
        // Can't be "new" because that would conflict with the new keyword
        newFile: () => {
            if(contextNew !== undefined) contextNew();
            if(!moduleConfig.showSave) {
                // Can't create a new file in a module that can only view
                setModuleAndConfig(ModuleOption.Monaco);
            }
            open(undefined);
        },
        setModule: (option: ModuleOption) => {
            // const data = beforeModuleSwitch === undefined ? undefined : beforeModuleSwitch();
            setModuleAndConfig(option);
            // TODO: load data into new module
            // This will require setting some sort of flag that is read back when useOnAfterModuleSwitch is called
        }
    };
}