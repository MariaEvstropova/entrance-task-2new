var webpack = require('webpack');

module.exports = {
    entry: "./src/client.js",
    output: {
        path: __dirname + '/public/',
        filename: "bundle.js"
    },
    module: {
        loaders: [
            {
                test: /\.css$/,
                loader: "style-loader!css-loader",
                exclude: [/node_modules/, /public/]
            },
            {
                test: /\.jsx?$/,
                loader: "babel-loader",
                exclude: [/node_modules/, /public/],
                query:
                      {
                        presets:['es2015','react']
                      }
            }
        ]
    }
}
