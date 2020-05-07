/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const isDev = process.env.NODE_ENV !== 'production';

const config = {
    mode: isDev ? 'development' : 'production',
    entry: './src/client/scripts/main.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyPlugin([
            { from: 'src/client/css/style.css', to: 'css/' },
            { from: 'src/client/images/logo.png', to: 'images/' },
        ]),
        new HtmlWebpackPlugin({
            template: './public/index.html',
            // favicon: './public/gradyicon.png'
        }),
    ],
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        port: 3000,
        hot: true,
        proxy: {
            '/api': 'http://localhost:8080',

            '/socket.io': {
                target: 'http://localhost:8080',
                ws: true,
            },
        },
    },
    optimization: {
        minimize: !isDev,
    },
};

module.exports = config;
