
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const preprocessor = {
    loader: 'webpack-preprocessor-loader',
    options: {
        debug: false,
        directives: {
            secret: false,
        },
        params: {
            target: 'releace',    // debug, releace
            platform: 'telegram',   // none, yandex, inplay, telegram
        },
        verbose: false,
    },
};

module.exports = {

    entry: './src/Main.ts',
    mode: 'production',    // production development
    output: {
        path: path.resolve(__dirname, 'dst'),
        filename: 'bundle.js'
    },
    resolve: {
        extensions: ['.ts', '.js'],
        fallback: {
            fs: false,
            path: false
        }
    },
    module: {
        rules: [
            { test: /\.ts$/, use: 'ts-loader', exclude: /node_modules/ },
            { test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: 'html-loader',
                        options: {
                            sources: false
                        }
                    },
                    preprocessor
                ]
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.ts$/,
                use: [
                    preprocessor
                ]
            },
        ]
    },

    optimization: {
        minimizer: [
            `...`,
            new CssMinimizerPlugin(),
        ],
        splitChunks: false,
        runtimeChunk: false,
    },

    plugins: [
        new MiniCssExtractPlugin(),
        new HtmlWebpackPlugin({
            title: 'webpack.production.js',
            template: path.resolve(__dirname, './src/index.html'), // шаблон
            filename: 'index.html', // Название выходного файла
            hash: true,             // Добавление уникального параметра для отчистки кэша
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: 'src/image/**/*', // путь к исходным изображениям
                    to: 'image/[name][ext]', // путь в выходной директории
                }
            ]
        })
        /*new BundleAnalyzerPlugin(),*/
    ],
}