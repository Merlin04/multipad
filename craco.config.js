const MonacoEditorWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
    webpack: {
        configure: {
            target: "electron-renderer",
        },
        plugins: [
            new MonacoEditorWebpackPlugin()
        ]
    },
    eslint: {
        plugins: ["multipad"],
        rules: {
            "multipad/usecallback-with-module-hook": 1,
            "multipad/usememo-with-useconfiguremodule": 1
        }
    },
    plugins: [
        {
            plugin: {
                overrideCracoConfig: ({ cracoConfig }) => {
                    if (typeof cracoConfig.eslint.enable !== "undefined") {
                        cracoConfig.disableEslint = !cracoConfig.eslint.enable;
                    }
                    delete cracoConfig.eslint;
                    return cracoConfig;
                },
                overrideWebpackConfig: ({ webpackConfig, cracoConfig }) => {
                    if (
                        typeof cracoConfig.disableEslint !== "undefined" &&
                        cracoConfig.disableEslint === true
                    ) {
                        webpackConfig.plugins = webpackConfig.plugins.filter(
                            (instance) => instance.constructor.name !== "ESLintWebpackPlugin"
                        );
                    }
                    return webpackConfig;
                },
            },
        },
    ],
};
