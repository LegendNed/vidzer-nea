module.exports = {
    pluginOptions: {
        electronBuilder: {
            builderOptions: {
                extraResources: [
                    {
                        from: "./src/static",
                        to: ""
                    }
                ]
            }
        }
    }
}