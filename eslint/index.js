module.exports = {
    rules: {
        "usecallback-with-module-hook": {
            create: (context) => ({
                CallExpression(node) {
                    if(["useOnSave", "useOnOpen", "useOnNew", "useOnBeforeModuleSwitch", "useOnAfterModuleSwitch"].includes(node.callee.name) && node.arguments[0]?.callee?.name !== "useCallback") {
                        context.report(node, 'Wrap module callbacks in useCallback to avoid rerender loop');
                    }
                }
            })
        },
        "usememo-with-useconfiguremodule": {
            create: (context) => ({
                CallExpression(node) {
                    if(node.callee.name === "useConfigureModule" && node.arguments[0]?.callee?.name !== "useMemo") {
                        context.report(node, 'Wrap module configuration in useMemo to avoid rerender loop');
                    }
                }
            })
        }
    }
};