const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const isProd = process.argv.indexOf('--mode=production') >= 0;

process.env.NODE_ENV = isProd ? "production" : "development";

module.exports = {
    mode: isProd ? 'production' : 'development',
    context: path.resolve(__dirname, './'),
    node: {
        fs: 'empty', child_process: 'empty'
    },
    entry: './src/index.js',
    output: {
        filename: 'js/[name].bundle.[hash:8].js',
        path: path.resolve(__dirname, './server/build/public')
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/, exclude: /node_modules/, use: {
                    loader: "babel-loader"
                }
            },
            { test: /\.less$/, use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader'] },
            { test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] },
            { test: /\.(woff2?|eot|ttf|otf|png|svg|jpg)(\?.*)?$/, loader: 'url-loader', options: { limit: 80000 } }
        ]
    },
    externals: {
        G6: 'G6'
    },
    devServer: {
        contentBase: path.join(__dirname, 'build'),
        compress: false,
        hot: true,
        open: true,
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://[::1]:8000',
                secure: false,
                changeOrigin: true
            }
        }
    },
    devtool: isProd ? false : 'source-map',
    resolve: {
        extensions: ['.js', '.css', 'less'],
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    },
    plugins: [
        new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
        new HtmlWebpackPlugin({ inject: true, template: './index.html', filename: 'index.html' }),
        new CopyWebpackPlugin({ patterns: ['./public'] }),
        new MiniCssExtractPlugin({ filename: '[name].css',})
    ],
    watch: !isProd,
    optimization: {
        minimize: isProd,
        minimizer: [
            new CssMinimizerPlugin(),
        ],
    },
}

